import {
  isLeadInterest,
  isLeadProduct,
  belarusPhonePattern,
} from "@/lib/lead";
import { saveLead, type NewLead } from "@/lib/lead-store";

const maxRequestBytes = 10_000;
const maxNameLength = 100;
const maxCommentLength = 1_000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readLimitedBody(request: Request, maxBytes: number) {
  const reader = request.body?.getReader();

  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let body = "";
  let byteLength = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      return body + decoder.decode();
    }

    byteLength += value.byteLength;

    if (byteLength > maxBytes) {
      await reader.cancel();
      return null;
    }

    body += decoder.decode(value, { stream: true });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      { error: "Отправьте заявку в формате JSON." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return Response.json(
      { error: "Слишком большой размер заявки." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    const rawBody = await readLimitedBody(request, maxRequestBytes);
    if (rawBody === null) {
      return Response.json(
        { error: "Слишком большой размер заявки." },
        { status: 413 },
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error: "Не удалось прочитать заявку. Проверьте данные и попробуйте ещё раз." },
      { status: 400 },
    );
  }

  if (!isObject(body)) {
    return Response.json(
      { error: "Проверьте заполнение формы." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const comment =
    typeof body.comment === "string" ? body.comment.trim() : undefined;

  if (!name || name.length > maxNameLength) {
    return Response.json(
      { error: "Укажите имя длиной не более 100 символов." },
      { status: 400 },
    );
  }

  if (!belarusPhonePattern.test(phone)) {
    return Response.json(
      {
        error:
          "Проверьте номер: нужен белорусский мобильный в формате +375 (29) 123-45-67.",
      },
      { status: 400 },
    );
  }

  if (!isLeadInterest(body.interest)) {
    return Response.json(
      { error: "Выберите, что вас интересует." },
      { status: 400 },
    );
  }

  const product = body.product === undefined ? null : body.product;
  if (product !== null && !isLeadProduct(product)) {
    return Response.json(
      { error: "Выбранный товар не найден. Выберите позицию из каталога." },
      { status: 400 },
    );
  }

  if (
    (body.comment !== undefined && typeof body.comment !== "string") ||
    (comment !== undefined && comment.length > maxCommentLength)
  ) {
    return Response.json(
      { error: "Комментарий должен быть не длиннее 1000 символов." },
      { status: 400 },
    );
  }

  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const clientIp =
    forwardedFor?.at(-1) ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  const lead: NewLead = {
    name,
    phone,
    interest: body.interest,
    product,
    comment: comment || null,
  };

  try {
    const result = saveLead(lead, clientIp);

    if (!result.saved) {
      return Response.json(
        {
          error:
            "Заявка с этим номером уже отправлена. Попробуйте ещё раз через 10 минут.",
          retryAfterSeconds: result.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }

    return Response.json(
      { message: "Заявка отправлена. Мы свяжемся с вами, чтобы уточнить детали." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save incoming coffee lead:", error);
    return Response.json(
      { error: "Не удалось сохранить заявку. Попробуйте ещё раз позже." },
      { status: 500 },
    );
  }
}
