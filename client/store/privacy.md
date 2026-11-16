# TrackMode privacy disclosures (draft)

Based on the code as of 2026-11-15. Review with whoever is legally responsible for the app before submitting.

## What the app actually collects

| Data | Where it comes from | Stored | Purpose |
|---|---|---|---|
| Email, full name | Sign-up, or Google Sign-In | Server database | Account, sign-in, password reset email |
| Google account ID | Google Sign-In (optional) | Server database | Sign-in |
| Nutrition log: foods, amounts, meals, dates | User entries | Server database | App functionality |
| Body data: weight, waist and hip measurements, gender, birth date, height, activity, goal | User entries | Server database | Targets and progress |
| Progress photos and food photos | Camera or photo library, only when the user adds one | Server file storage, private to the user | App functionality |
| Pantry products, recipes, saved meals, product submissions to the catalog | User entries | Server database | App functionality |
| Scanned barcodes | Camera | Sent to the TrackMode server; the server looks them up at Open Food Facts and, if configured, USDA. Only the barcode is sent to those services | Product lookup |
| Subscription and payment status | PayPlus checkout | Server database (plan, status, dates, amount). Card details are entered on the PayPlus page and never reach TrackMode | Billing |
| In-app activity events (for example "meal item added", "statistics viewed") | First-party analytics in the app | Server database, linked to the user ID | Product analytics |
| Language, theme, shopping region, reminder times | Settings | Device and server | App functionality |

Not collected: location, contacts, advertising identifiers, browsing history, crash reports, microphone audio (blocked in the Android manifest). There are no third-party analytics, advertising or tracking SDKs. Reminders are local notifications; no push token is created.

Third parties that receive data: Google (Sign-In only, when the user chooses it), PayPlus (payment page), the SMTP provider (password-reset email address), Open Food Facts and USDA (barcode number only), and the hosting provider of the API and database.

Encryption in transit: release builds call only https://api.peakmode.app.

Deletion: Settings → Account & Security → Delete account removes the account, all database rows linked to it and all stored photos (verified on 2026-11-15 against a production build). A web deletion page is still required for Google Play.

## App Store: App Privacy ("nutrition label")

Tracking: **No.** No App Tracking Transparency prompt is needed.

Data linked to the user, none used for tracking:

| Apple category | Data type | Purposes |
|---|---|---|
| Contact Info | Name, Email Address | App Functionality |
| Health & Fitness | Health (weight, body measurements, nutrition log) | App Functionality |
| User Content | Photos or Videos | App Functionality |
| User Content | Other User Content (products, recipes, saved meals, catalog submissions) | App Functionality |
| Identifiers | User ID | App Functionality |
| Purchases | Purchase History | App Functionality |
| Usage Data | Product Interaction | Analytics |

Data not linked to the user: none. Data not collected: Location, Contacts, Browsing History, Search History (searches are not stored), Diagnostics, Sensitive Info, Financial Info (card data stays with PayPlus), Other Data.

## Google Play: Data safety

- Does the app collect or share user data? **Collects: yes. Shares: no.** Transfers to service providers that process data on TrackMode's behalf don't count as sharing.
- Is all data encrypted in transit? **Yes.**
- Can users request deletion? **Yes:** in the app, and at https://peakmode.app/delete-account.

| Play category | Data type | Collected | Optional | Purposes |
|---|---|---|---|---|
| Personal info | Name | Yes | Required | Account management |
| Personal info | Email address | Yes | Required | Account management, app functionality |
| Personal info | User IDs | Yes | Required | Account management |
| Health and fitness | Health info | Yes | Required for core use | App functionality |
| Photos and videos | Photos | Yes | Optional | App functionality |
| App activity | App interactions | Yes | Required | Analytics |
| App activity | Other user-generated content | Yes | Required | App functionality |
| Financial info | Purchase history | Yes | Optional | App functionality |

## Required pages to publish on peakmode.app

1. **/privacy:** a privacy policy covering the table above, retention ("kept until you delete your account"), a contact email, and the data controller's name and country.
2. **/delete-account:** how to delete in the app (Settings → Account & Security → Delete account), plus an email address for requesting deletion without the app. It must state what is deleted (everything listed above) and that nothing is kept.
3. **/support:** a contact email and short FAQ.
4. **/terms:** linked from the About screen.
