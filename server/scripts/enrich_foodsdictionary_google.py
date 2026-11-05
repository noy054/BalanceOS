import argparse
import hashlib
import io
import json
import re
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit

import requests
from PIL import Image
from selenium import webdriver
from selenium.common.exceptions import (
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


Image.MAX_IMAGE_PIXELS = 40_000_000


def now():
    return datetime.now(timezone.utc).isoformat()


def read_json(path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temporary.replace(path)


def log(data):
    print(json.dumps(data, ensure_ascii=False), flush=True)


def normalize(value):
    value = unicodedata.normalize("NFKC", str(value or "")).lower()
    return " ".join(re.findall(r"[^\W_]+", value, re.UNICODE))


def fingerprint(product):
    identity = {
        "sourceUrl": product.get("sourceUrl"),
        "sourceKey": product.get("sourceKey"),
        "name": product.get("name"),
        "manufacturer": product.get("manufacturer"),
    }
    encoded = json.dumps(
        identity,
        sort_keys=True,
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def public_url(value):
    try:
        parsed = urlsplit(value or "")
        host = (parsed.hostname or "").lower()

        return (
            parsed.scheme == "https"
            and "." in host
            and not parsed.username
            and not parsed.password
            and host != "localhost"
            and not host.endswith((".localhost", ".local", ".internal"))
            and not re.fullmatch(r"[\d.]+", host)
            and ":" not in host
        )
    except (ValueError, TypeError):
        return False


def google_host(host):
    host = (host or "").lower()
    return (
        host == "google.com"
        or host.endswith(".google.com")
        or host == "google.co.il"
        or host.endswith(".google.co.il")
    )


def source_url(value):
    if not public_url(value):
        return None

    parsed = urlsplit(value)

    if google_host(parsed.hostname):
        params = parse_qs(parsed.query)
        for field in ("imgrefurl", "url", "q"):
            target = params.get(field, [""])[0]
            if public_url(target) and not google_host(
                urlsplit(target).hostname
            ):
                return target
        return None

    return value


def blocked(driver):
    body = driver.find_element(By.TAG_NAME, "body").text.lower()
    phrases = (
        "unusual traffic",
        "automated queries",
        "verify you are human",
        "תנועה חריגה",
        "אינך רובוט",
        "שאינך רובוט",
    )

    if "/sorry/" in driver.current_url:
        return True

    if any(phrase in body for phrase in phrases):
        return True

    frames = driver.find_elements(
        By.CSS_SELECTOR,
        "iframe[src*='recaptcha'], iframe[src*='hcaptcha']",
    )

    return any(frame.is_displayed() for frame in frames)


def check_block(driver):
    if not blocked(driver):
        return

    print(
        "\nGoogle requested human verification.\n"
        "Complete it manually in the Chrome window opened by this script.\n"
        "Wait until image search results appear.",
        flush=True,
    )

    input("Then press Enter here, or Ctrl+C to stop: ")

    if blocked(driver):
        raise RuntimeError(
            "Google verification is still active. Stopping."
        )


def inspect_image(session, url, min_size):
    if not public_url(url):
        return None

    try:
        with session.get(
            url,
            stream=True,
            timeout=(10, 15),
            allow_redirects=False,
        ) as response:
            if response.status_code != 200:
                return None

            content_type = response.headers.get(
                "Content-Type", ""
            ).lower()

            if not content_type.startswith("image/"):
                return None

            declared_size = response.headers.get("Content-Length")
            if declared_size and int(declared_size) > 12 * 1024 * 1024:
                return None

            data = bytearray()
            started = time.monotonic()

            for chunk in response.iter_content(65536):
                data.extend(chunk)

                if len(data) > 12 * 1024 * 1024:
                    return None

                if time.monotonic() - started > 25:
                    return None

        with Image.open(io.BytesIO(data)) as image:
            width, height = image.size

            if width * height > 40_000_000:
                return None

            if min(width, height) < min_size:
                return None

            image.verify()

        return {
            "width": width,
            "height": height,
            "bytes": len(data),
            "contentType": content_type.split(";")[0],
        }

    except Exception:
        return None


def visible_image_links(driver):
    return driver.execute_script("""
        return Array.from(document.images)
            .filter(img => {
                const box = img.getBoundingClientRect();
                return box.width >= 180 &&
                    box.height >= 180 &&
                    box.bottom > 0 &&
                    box.top < innerHeight &&
                    box.right > 0 &&
                    box.left < innerWidth;
            })
            .map(img => {
                const links = [];
                let node = img;

                for (let depth = 0; node && depth < 5; depth++) {
                    if (node.tagName === 'A' && node.href) {
                        links.push(node.href);
                    }

                    if (depth >= 2) {
                        node.querySelectorAll('a[href]').forEach(a => {
                            if (links.length < 25) links.push(a.href);
                        });
                    }

                    node = node.parentElement;
                }

                return {
                    imageUrl: img.currentSrc || img.src || '',
                    title: img.alt || '',
                    links: Array.from(new Set(links))
                };
            });
    """)


def thumbnail_elements(driver):
    found = []

    for image in driver.find_elements(By.CSS_SELECTOR, "img"):
        try:
            src = image.get_attribute("src") or ""
            alt = image.get_attribute("alt") or ""
            size = image.size

            if not image.is_displayed():
                continue

            if size["width"] < 90 or size["height"] < 70:
                continue

            if "logo" in alt.lower():
                continue

            if not src:
                continue

            found.append(image)

        except StaleElementReferenceException:
            continue

    return found


def search_images(driver, session, product, args):
    name = str(product.get("name") or "").strip()
    manufacturer = str(product.get("manufacturer") or "").strip()
    query = name

    if manufacturer and normalize(manufacturer) not in normalize(name):
        query += " " + manufacturer

    search_url = "https://www.google.com/search?" + urlencode({
        "q": query,
        "udm": "2",
        "hl": "he",
    })

    driver.get(search_url)

    WebDriverWait(driver, 20).until(
        lambda current: current.find_elements(By.TAG_NAME, "body")
    )

    time.sleep(2)
    check_block(driver)

    try:
        WebDriverWait(driver, 12).until(
            lambda current: len(
                current.find_elements(By.CSS_SELECTOR, "img")
            ) >= 3
        )
    except TimeoutException:
        check_block(driver)

    candidates = []
    seen = set()
    inspected = 0

    def add_candidate(image_url, page_url, title):
        nonlocal inspected

        page_url = source_url(page_url)

        if not page_url or not public_url(image_url):
            return

        image_host = (urlsplit(image_url).hostname or "").lower()

        if (
            google_host(image_host)
            or image_host.endswith(".gstatic.com")
        ):
            return

        if image_url in seen:
            return

        if inspected >= 30:
            return

        seen.add(image_url)
        inspected += 1

        metrics = inspect_image(session, image_url, args.min_size)

        if not metrics:
            return

        required = set(normalize(name).split())
        found = set(normalize(title).split())
        coverage = len(required & found) / max(len(required), 1)

        candidates.append({
            "imageUrl": image_url,
            "sourcePage": page_url,
            "title": title,
            "nameCoverage": round(coverage, 3),
            "associationVerified": False,
            **metrics,
        })

    def collect_explicit_links():
        for link in driver.find_elements(
            By.CSS_SELECTOR,
            "a[href*='imgurl=']",
        )[:30]:
            try:
                href = link.get_attribute("href") or ""
                params = parse_qs(urlsplit(href).query)

                add_candidate(
                    params.get("imgurl", [""])[0],
                    params.get("imgrefurl", [""])[0],
                    link.get_attribute("aria-label") or link.text or name,
                )

                if len(candidates) >= args.images:
                    break

            except StaleElementReferenceException:
                continue

    collect_explicit_links()

    if len(candidates) < args.images:
        for index in range(args.results):
            check_block(driver)

            try:
                thumbnails = thumbnail_elements(driver)

                if index >= len(thumbnails):
                    break

                thumbnail = thumbnails[index]
                title = thumbnail.get_attribute("alt") or ""

                driver.execute_script(
                    "arguments[0].scrollIntoView({block:'center'});",
                    thumbnail,
                )
                thumbnail.click()

                time.sleep(1.5)
                check_block(driver)
                collect_explicit_links()

                for item in visible_image_links(driver):
                    links = item.get("links", [])
                    page_url = next(
                        (
                            parsed
                            for link in links
                            if (parsed := source_url(link))
                        ),
                        None,
                    )

                    if page_url:
                        add_candidate(
                            item.get("imageUrl", ""),
                            page_url,
                            item.get("title") or title,
                        )

                    if len(candidates) >= args.images:
                        break

                if len(candidates) >= args.images:
                    break

            except (
                StaleElementReferenceException,
                WebDriverException,
            ):
                continue

    candidates.sort(
        key=lambda item: (
            item["nameCoverage"],
            min(item["width"], item["height"]),
        ),
        reverse=True,
    )

    return {
        "query": query,
        "searchUrl": search_url,
        "searchedAt": now(),
        "status": (
            "REVIEW_REQUIRED"
            if candidates
            else "NO_CANDIDATES"
        ),
        "requiresReview": True,
        "candidates": candidates[:args.images],
    }


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--input",
        default="import-results/foodsdictionary/products.json",
    )
    parser.add_argument(
        "--output",
        default="import-results/foodsdictionary/google-direct",
    )
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--images", type=int, default=5)
    parser.add_argument("--results", type=int, default=15)
    parser.add_argument("--min-size", type=int, default=300)
    parser.add_argument("--delay", type=float, default=5)
    parser.add_argument("--retry-empty", action="store_true")

    args = parser.parse_args()

    if (
        args.limit < 1
        or args.images < 1
        or args.results < 1
        or args.min_size < 1
        or args.delay < 0
    ):
        raise ValueError("Invalid numeric argument")

    input_path = Path(args.input).resolve()
    output = Path(args.output).resolve()

    if not input_path.is_file():
        raise FileNotFoundError(
            f"Input file not found: {input_path}"
        )

    payload = read_json(input_path)

    if isinstance(payload, list):
        products = payload
    elif (
        isinstance(payload, dict)
        and isinstance(payload.get("products"), list)
    ):
        products = payload["products"]
    else:
        raise ValueError(
            "Input must be an array or contain a products array"
        )

    if not all(isinstance(product, dict) for product in products):
        raise ValueError("Every product must be an object")

    output.mkdir(parents=True, exist_ok=True)
    state_path = output / "state.json"
    state = read_json(state_path, {"results": {}})

    if not isinstance(state.get("results"), dict):
        raise ValueError("Invalid state.json structure")

    results = state["results"]

    def persist():
        state["updatedAt"] = now()
        save_json(state_path, state)

        merged = []

        for product in products:
            item = dict(product)
            result = results.get(fingerprint(product))

            if not product.get("imageUrl") and result:
                item["imageSearch"] = result
                item["imageAssociationVerified"] = False

            merged.append(item)

        data = (
            {"products": merged}
            if isinstance(payload, list)
            else {**payload, "products": merged}
        )

        data["imageSearchUpdatedAt"] = now()
        save_json(output / "products-enriched.json", data)

    pending = []
    queued = set()

    for product in products:
        if product.get("imageUrl") or not product.get("name"):
            continue

        key = fingerprint(product)

        if key in queued:
            continue

        previous = results.get(key)

        if previous and not (
            args.retry_empty
            and previous.get("status") == "NO_CANDIDATES"
        ):
            continue

        queued.add(key)
        pending.append((key, product))

    log({
        "inputProducts": len(products),
        "missingImages": sum(
            not product.get("imageUrl")
            for product in products
        ),
        "pendingUniqueSearches": len(pending),
        "limitThisRun": args.limit,
        "imagesPerProduct": args.images,
        "databaseWrites": 0,
    })

    persist()

    if not pending:
        print("No pending products.", flush=True)
        return

    driver = None
    processed = 0

    try:
        print("Opening Chrome...", flush=True)

        options = webdriver.ChromeOptions()
        options.add_argument("--start-maximized")

        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(45)

        with requests.Session() as session:
            for key, product in pending[:args.limit]:
                log({
                    "status": "SEARCHING",
                    "name": product["name"],
                })

                result = search_images(
                    driver,
                    session,
                    product,
                    args,
                )

                results[key] = result
                processed += 1
                persist()

                log({
                    "processedThisRun": processed,
                    "name": product["name"],
                    "status": result["status"],
                    "candidates": len(result["candidates"]),
                })

                time.sleep(args.delay)

    finally:
        persist()

        if driver:
            try:
                driver.quit()
            except WebDriverException:
                pass

        log({
            "processedThisRun": processed,
            "savedSearches": len(results),
            "databaseWrites": 0,
            "output": str(
                output / "products-enriched.json"
            ),
        })


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nStopped. Progress saved.", flush=True)
    except Exception:
        import traceback
        traceback.print_exc()
        raise SystemExit(1)