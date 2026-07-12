import { Types } from "mongoose";

/** Builds a `FormData` object the way a real `<form action={formAction}>` submit would, matching `crud-actions.ts`'s `rawFromFormData` expectations (multi-value fields via repeated `append`, booleans as `"on"`). */
export function toFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) formData.append(key, String(item));
    } else if (typeof value === "boolean") {
      if (value) formData.append(key, "on");
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

export function fakeObjectId(): string {
  return new Types.ObjectId().toString();
}
