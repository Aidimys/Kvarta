const subscriptionSteps = [
  {
    number: "01",
    title: "Оставляете заявку",
    description: "Сообщаете нам, что хотите оформить подписку на кофе.",
  },
  {
    number: "02",
    title: "Выбираем кофе вместе",
    description:
      "Менеджер связывается с вами в мессенджере или по телефону, уточняет вкусовые предпочтения — кислое или плотное — и удобное время.",
  },
  {
    number: "03",
    title: "Получаете свежий кофе",
    description:
      "Каждый месяц к вам приезжают две свежие пачки. Мы сами напомним, когда будет обжарка. Доставка по Минску бесплатная.",
  },
];

export function SubscriptionSection() {
  return (
    <section
      aria-labelledby="subscription-title"
      className="subscription-section"
      id="subscription"
    >
      <div className="subscription-inner">
        <div className="subscription-heading">
          <p className="subscription-eyebrow">Подписка · Кофе приезжает сам</p>
          <h2 id="subscription-title">Кофе без головной боли</h2>
          <p>
            Всего три шага — и дома всегда есть свежий кофе, который вам
            нравится.
          </p>
        </div>

        <ol className="subscription-steps">
          {subscriptionSteps.map((step) => (
            <li className="subscription-step" key={step.number}>
              <span aria-hidden="true" className="step-number">
                {step.number}
              </span>
              <div className="step-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <a className="subscription-cta" href="#contacts">
          Оставить заявку <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
