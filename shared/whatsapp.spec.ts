import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from "./whatsapp.js";

describe("WhatsApp consultation link", () => {
  it("provides the agreed consultation template", () => {
    expect(DEFAULT_WHATSAPP_MESSAGE).toContain("Halo RakitApp!");
    expect(DEFAULT_WHATSAPP_MESSAGE).toContain("[nama]");
    expect(DEFAULT_WHATSAPP_MESSAGE).toContain("[sekolah]");
    expect(DEFAULT_WHATSAPP_MESSAGE).toContain("[tulis singkat");
  });

  it("normalizes the optional recipient number and encodes the message", () => {
    const url = buildWhatsAppUrl(
      "Halo RakitApp!\nSaya guru.",
      "+62 812-3456-789",
    );

    expect(url).toBe(
      "https://wa.me/628123456789?text=Halo%20RakitApp!%0ASaya%20guru.",
    );
  });

  it("keeps a generic WhatsApp destination when no number is configured", () => {
    expect(buildWhatsAppUrl("Halo RakitApp!")).toBe(
      "https://wa.me/?text=Halo%20RakitApp!",
    );
  });
});
