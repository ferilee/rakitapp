import { defineAction } from "@agent-native/core/action";
import { uploadFile } from "@agent-native/core/file-upload";
import { z } from "zod";

import { assertOperator } from "../server/lib/catalog.js";

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Cover harus berupa data URL gambar base64.");
  const mimeType = match[1].toLowerCase();
  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error("Gunakan cover PNG, JPG, WEBP, GIF, atau AVIF.");
  }
  const bytes = new Uint8Array(Buffer.from(match[2], "base64"));
  if (bytes.byteLength > MAX_COVER_BYTES) {
    throw new Error("Ukuran cover maksimal 5 MB.");
  }
  return { bytes, mimeType };
}

export default defineAction({
  description:
    "Upload a RakitApp catalog cover to the configured file provider and return its hosted URL.",
  schema: z.object({
    data: z.string().min(20).max(8_000_000),
    filename: z.string().trim().min(1).max(160),
  }),
  maxBodyBytes: 8_500_000,
  needsApproval: true,
  agentTool: false,
  publicAgent: {
    expose: false,
    readOnly: false,
    requiresAuth: true,
    title: "Upload a RakitApp catalog cover",
  },
  run: async ({ data, filename }, ctx) => {
    assertOperator(ctx?.userEmail);
    const { bytes, mimeType } = parseDataUrl(data);
    const result = await uploadFile({
      data: bytes,
      filename,
      mimeType,
      ownerEmail: ctx?.userEmail,
    });
    if (!result) {
      throw new Error(
        "Penyimpanan cover belum terhubung. Hubungkan Builder.io atau provider file di Settings.",
      );
    }
    return { url: result.url, id: result.id, provider: result.provider };
  },
});
