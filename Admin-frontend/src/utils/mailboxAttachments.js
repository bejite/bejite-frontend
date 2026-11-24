/**
 * Read browser File objects into API attachment payloads (base64).
 * Mirrors backend limits: 3 files, 2 MB each, 5 MB total.
 */
const MAX_FILES = 3;
const MAX_BYTES_PER_FILE = 2 * 1024 * 1024;
const MAX_BYTES_TOTAL = 5 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function filesToMailboxAttachments(files = []) {
  const list = Array.isArray(files) ? files.filter(Boolean) : [];
  if (list.length > MAX_FILES) {
    throw new Error(`You can attach at most ${MAX_FILES} files.`);
  }

  let total = 0;
  const attachments = [];

  for (const file of list) {
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("Invalid attachment file.");
    }
    if (file.size > MAX_BYTES_PER_FILE) {
      throw new Error(`"${file.name || "File"}" must be under 2 MB.`);
    }
    total += file.size;
    if (total > MAX_BYTES_TOTAL) {
      throw new Error("Attachments together must be under 5 MB.");
    }

    const contentBase64 = await readFileAsBase64(file);
    attachments.push({
      name: file.name || "attachment",
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      type: file.type || (file.name || "").split(".").pop() || "",
      contentBase64,
    });
  }

  return attachments;
}
