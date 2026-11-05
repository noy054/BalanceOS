import { Platform } from "react-native";

export const UPLOAD_HEADERS = { "Content-Type": "multipart/form-data" };

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
  return "image/jpeg";
}

export async function imageForm(field: string, uri: string, baseName: string): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await fetch(uri).then((response) => response.blob());
    form.append(field, blob, baseName);
  } else {
    const type = guessMimeType(uri);
    const file = { uri, name: `${baseName}.${type.split("/")[1]}`, type };
    form.append(field, file as unknown as Blob);
  }
  return form;
}

export function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image"));
    reader.readAsDataURL(blob);
  });
}
