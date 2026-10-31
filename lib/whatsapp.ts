export function normalizePhone(phone: string): string {
  let number = phone.replace(/\D/g, "");

  // Format Indonesia: 0812... menjadi 62812...
  if (number.startsWith("0")) {
    number = "62" + number.slice(1);
  } else if (number.startsWith("8")) {
    number = "62" + number;
  }

  return number;
}

export function getWhatsAppLink(
  phone: string,
  name: string,
  interest?: string,
): string {
  const number = normalizePhone(phone);

  const message = interest
    ? `Halo ${name}, kami ingin menindaklanjuti ketertarikan Anda terhadap ${interest}. Apakah ada yang bisa kami bantu?`
    : `Halo ${name}, kami ingin menindaklanjuti ketertarikan Anda terhadap membership kami. Apakah ada yang bisa kami bantu?`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
