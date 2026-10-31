import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

type WhatsAppButtonProps = {
  phone: string;
  name: string;
  interest?: string;
};

export default function WhatsAppButton({
  phone,
  name,
  interest,
}: WhatsAppButtonProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  const isValidPhone =
    cleanPhone.length >= 9 && cleanPhone.length <= 15;

  if (!isValidPhone) {
    return (
      <button
        type="button"
        disabled
        className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-400"
      >
        <MessageCircle size={16} />
        Nomor tidak valid
      </button>
    );
  }

  return (
    <a
      href={getWhatsAppLink(phone, name, interest)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
    >
      <MessageCircle size={16} />
      WhatsApp
    </a>
  );
}
