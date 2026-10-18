const freshnessDetails = [
  {
    icon: "🕒",
    title: "Партии по 5 кг",
    description: "Никакого потокового масс-маркета.",
  },
  {
    icon: "🚀",
    title: "1–3 дня",
    description: "От печи до вашей чашки.",
  },
  {
    icon: "📍",
    title: "Забрать самим",
    description: "Самовывоз с ул. Короля, 9.",
  },
];

export function AboutSection() {
  return (
    <section aria-labelledby="about-title" className="about-section" id="about">
      <div className="about-inner">
        <div className="about-intro">
          <div className="about-heading">
            <p className="about-eyebrow">О нас</p>
            <h2 id="about-title">
              Почему свежий кофе — это совсем другой вкус
            </h2>
          </div>

          <blockquote className="about-story">
            <p>
              Мы — Аня и Дмитрий. Раньше работали бариста, а с 2019 года
              обжариваем кофе для дома и офиса. Кофе — продукт скоропортящийся.
              Через месяц после обжарки улетучивается та самая ягодная кислинка
              и тонкий бергамот.
            </p>
            <p>
              Мы не держим огромных складов: обжариваем под заказ по четвергам,
              чтобы в пятницу развезти свежие пачки по всему Минску.
            </p>
          </blockquote>
        </div>

        <ul aria-label="Как мы сохраняем свежесть" className="freshness-list">
          {freshnessDetails.map((detail) => (
            <li className="freshness-item" key={detail.title}>
              <span aria-hidden="true" className="freshness-icon">
                {detail.icon}
              </span>
              <div>
                <h3>{detail.title}</h3>
                <p>{detail.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
