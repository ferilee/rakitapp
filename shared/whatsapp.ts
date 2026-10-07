export const DEFAULT_WHATSAPP_MESSAGE = [
  "Halo RakitApp! Saya [nama], guru di [sekolah].",
  'Saya punya masalah/ide begini: [tulis singkat, misal: "absensi kelas masih manual pakai kertas"].',
  "Kira-kira bisa dibuatkan aplikasi? Terima kasih.",
].join("\n");

export function buildWhatsAppUrl(message: string, phoneNumber = "") {
  const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");
  const destination = normalizedPhoneNumber
    ? `https://wa.me/${normalizedPhoneNumber}`
    : "https://wa.me/";
  return `${destination}?text=${encodeURIComponent(message)}`;
}
