import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from "@shared/whatsapp";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const whatsappNumber = import.meta.env.VITE_RAKITAPP_WHATSAPP_NUMBER ?? "";

interface WhatsAppConsultationButtonProps {
  message?: string;
  label?: string;
  className?: string;
}

export function WhatsAppConsultationButton({
  message = DEFAULT_WHATSAPP_MESSAGE,
  label = "Konsultasi Gratis via WhatsApp",
  className = "",
}: WhatsAppConsultationButtonProps) {
  return (
    <a
      href={buildWhatsAppUrl(message, whatsappNumber)}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200/70 hover:bg-emerald-400/20 ${className}`}
    >
      <IconBrandWhatsapp className="size-4" />
      {label}
    </a>
  );
}

export function WhatsAppFloatingButton() {
  return (
    <a
      href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE, whatsappNumber)}
      target="_blank"
      rel="noreferrer"
      aria-label="Konsultasi Gratis via WhatsApp"
      title="Konsultasi Gratis via WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full border border-emerald-200/60 bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b16]"
    >
      <IconBrandWhatsapp className="size-7" />
    </a>
  );
}
