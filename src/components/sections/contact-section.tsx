"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type LeadInterest,
  type LeadProduct,
  belarusPhonePattern,
  formatBelarusPhone,
  getPhoneCaretPosition,
  getPhoneDigits,
  leadInterests,
  leadProducts,
  isLeadProduct,
} from "@/lib/lead";

type SubmissionStatus =
  | { kind: "success" | "error"; message: string }
  | null;

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function subscribeToProductSearch(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getProductFromSearch(): LeadProduct | null {
  const product = new URLSearchParams(window.location.search).get("product");
  return isLeadProduct(product) ? product : null;
}

export function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const submitLock = useRef(false);
  const pendingPhoneCaret = useRef<number | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>(null);
  const productFromUrl = useSyncExternalStore(
    subscribeToProductSearch,
    getProductFromSearch,
    () => null,
  );
  const [productOverride, setProductOverride] = useState<
    LeadProduct | null | undefined
  >(undefined);
  const [interestOverride, setInterestOverride] =
    useState<LeadInterest | null>(null);
  const selectedProduct =
    productOverride === undefined ? productFromUrl : productOverride;
  const selectedInterest =
    interestOverride ??
    (selectedProduct === "subscription" ? "subscription" : "order");

  const isPhoneValid = belarusPhonePattern.test(phone);
  const hasPhoneError = phoneTouched && !isPhoneValid;

  function clearSelectedProduct() {
    setProductOverride(null);
    setInterestOverride(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("product");
    window.history.replaceState(null, "", url);
  }

  useLayoutEffect(() => {
    const caretPosition = pendingPhoneCaret.current;
    const input = phoneRef.current;

    if (caretPosition !== null && input && document.activeElement === input) {
      input.setSelectionRange(caretPosition, caretPosition);
    }

    pendingPhoneCaret.current = null;
  }, [phone]);

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    const selectionStart = event.currentTarget.selectionStart ?? value.length;
    const digitsBeforeCaret = value
      .slice(0, selectionStart)
      .replace(/\D/g, "").length;
    const allDigits = value.replace(/\D/g, "");
    const hasCountryPrefix = allDigits.startsWith("375");
    const hasTrunkPrefix = allDigits.startsWith("80") && allDigits.length > 9;
    const strippedPrefixLength = hasCountryPrefix
      ? 3
      : hasTrunkPrefix
        ? 2
        : 0;
    const nextPhone = formatBelarusPhone(value);
    const phoneDigits = getPhoneDigits(value);

    pendingPhoneCaret.current = phoneDigits.length
      ? getPhoneCaretPosition(
          nextPhone,
          Math.max(
            0,
            digitsBeforeCaret - strippedPrefixLength + 3,
          ),
        )
      : 0;

    setPhone(nextPhone);
    setPhoneTouched(true);
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current) {
      return;
    }

    setPhoneTouched(true);

    if (!isPhoneValid) {
      setStatus({
        kind: "error",
        message:
          "Проверьте номер: нужен белорусский мобильный, например +375 (29) 123-45-67.",
      });
      phoneRef.current?.focus();
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const lead = {
      name: String(formData.get("name") ?? ""),
      phone,
      interest: String(formData.get("interest") ?? ""),
      product: selectedProduct,
      comment: String(formData.get("comment") ?? ""),
    };

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        setStatus({
          kind: "error",
          message: isErrorResponse(result)
            ? result.error
            : "Не удалось отправить заявку. Попробуйте ещё раз.",
        });
        return;
      }

      setStatus({
        kind: "success",
        message:
          "Заявка отправлена. Мы свяжемся с вами, чтобы уточнить детали.",
      });
      form.reset();
      setPhone("");
      setPhoneTouched(false);
      clearSelectedProduct();
    } catch {
      setStatus({
        kind: "error",
        message:
          "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.",
      });
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="contact-title"
      className="contact-section"
      id="contacts"
    >
      <div className="contact-inner">
        <div className="contact-intro">
          <p className="contact-eyebrow">Заказ · Подписка · Вопрос</p>
          <h2 id="contact-title">Заказать свежий кофе или задать вопрос</h2>
          <p className="contact-description">
            Заполните форму, и мы перезвоним, чтобы уточнить детали. Оплата при
            получении или после подтверждения — на сайте ничего платить не нужно.
          </p>
          <div className="contact-address">
            <span aria-hidden="true">📍</span>
            <p>
              Обжарочная мастерская «Кварта»
              <br />
              Минск, ул. Короля, 9
            </p>
          </div>
        </div>

        <form
          className="lead-form"
          onSubmit={handleSubmit}
          ref={formRef}
        >
          <div className="form-fields">
            <label className="form-field">
              <span>Имя</span>
              <input
                autoComplete="name"
                maxLength={100}
                name="name"
                placeholder="Как к вам обращаться"
                required
              />
            </label>

            <label className="form-field">
              <span>Телефон</span>
              <input
                aria-describedby={
                  hasPhoneError ? "phone-hint phone-error" : "phone-hint"
                }
                aria-invalid={hasPhoneError}
                autoComplete="tel"
                inputMode="tel"
                maxLength={19}
                name="phone"
                onBlur={() => setPhoneTouched(true)}
                onChange={handlePhoneChange}
                pattern={belarusPhonePattern.source}
                placeholder="+375 (__) ___-__-__"
                ref={phoneRef}
                required
                title="Введите белорусский мобильный номер, например +375 (29) 123-45-67"
                type="tel"
                value={phone}
              />
              <span className="field-hint" id="phone-hint">
                Белорусский мобильный: +375 (29), (25), (33) или (44)
              </span>
              {hasPhoneError && (
                <span className="field-error" id="phone-error">
                  Проверьте номер и заполните все цифры: +375 (29) 123-45-67
                </span>
              )}
            </label>
          </div>

          <fieldset className="interest-field">
            <legend>Что вас интересует?</legend>
            {selectedProduct && (
              <div className="selected-product">
                <p>
                  Вы выбрали:{" "}
                  <strong>
                    {
                      leadProducts.find(
                        (product) => product.value === selectedProduct,
                      )?.label
                    }
                  </strong>
                </p>
                <button
                  onClick={clearSelectedProduct}
                  type="button"
                >
                  Убрать выбор
                </button>
              </div>
            )}
            <div className="interest-options">
              {leadInterests.map((interest) => (
                <label className="interest-option" key={interest.value}>
                  <input
                    checked={selectedInterest === interest.value}
                    name="interest"
                    onChange={() => setInterestOverride(interest.value)}
                    required
                    type="radio"
                    value={interest.value}
                  />
                  <span>{interest.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="form-field form-comment">
            <span>
              Комментарий <span className="optional-label">необязательно</span>
            </span>
            <textarea
              maxLength={1000}
              name="comment"
              placeholder="Например, какой помол нужен и когда вам удобно принять звонок"
              rows={3}
            />
          </label>

          <div className="form-submit-row">
            <button
              className="form-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Отправляем…" : "Отправить заявку"}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
            {status && (
              <p
                aria-live="polite"
                className={`form-status form-status-${status.kind}`}
                role={status.kind === "error" ? "alert" : "status"}
              >
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
