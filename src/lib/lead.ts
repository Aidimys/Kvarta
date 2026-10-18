export const leadInterests = [
  { value: "subscription", label: "Подписка" },
  { value: "order", label: "Разовый заказ" },
  { value: "question", label: "Нужен совет бариста / вопрос" },
] as const;

export type LeadInterest = (typeof leadInterests)[number]["value"];

export const leadProducts = [
  { value: "ethiopia", label: "Эфиопия Иргачеффе" },
  { value: "colombia", label: "Колумбия Уила" },
  { value: "brazil", label: "Бразилия Серрадо" },
  { value: "drip", label: "Дрип-пакеты, ассорти" },
  { value: "subscription", label: "Подписка на кофе" },
] as const;

export type LeadProduct = (typeof leadProducts)[number]["value"];

export const belarusPhonePattern =
  /^\+375\s?\(?(29|25|33|44)\)?\s?\d{3}[\-]?\d{2}[\-]?\d{2}$/;

export function isLeadInterest(value: unknown): value is LeadInterest {
  return (
    typeof value === "string" &&
    leadInterests.some((interest) => interest.value === value)
  );
}

export function isLeadProduct(value: unknown): value is LeadProduct {
  return (
    typeof value === "string" &&
    leadProducts.some((product) => product.value === value)
  );
}

export function getPhoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("375")) {
    digits = digits.slice(3);
  }

  if (digits.startsWith("80") && digits.length > 9) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 9);
}

export function formatBelarusPhone(value: string) {
  const digits = getPhoneDigits(value);

  if (!digits) {
    return "";
  }

  const operator = digits.slice(0, 2);
  let formatted = `+375 (${operator}`;

  if (digits.length >= 2) {
    formatted += ")";
  }

  const subscriber = digits.slice(2);

  if (subscriber) {
    formatted += ` ${subscriber.slice(0, 3)}`;
  }

  if (subscriber.length > 3) {
    formatted += `-${subscriber.slice(3, 5)}`;
  }

  if (subscriber.length > 5) {
    formatted += `-${subscriber.slice(5, 7)}`;
  }

  return formatted;
}

export function getPhoneCaretPosition(value: string, digitCount: number) {
  if (digitCount <= 0) {
    return 0;
  }

  let digitsSeen = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) {
      digitsSeen += 1;
      if (digitsSeen === digitCount) {
        return index + 1;
      }
    }
  }

  return value.length;
}
