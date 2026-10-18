import Image from "next/image";

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="hero-section" id="top">
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <span aria-hidden="true" className="eyebrow-dot" />
          Маленькая обжарочная в Минске
        </p>

        <h1 id="hero-title">
          Обжариваем
          <br />
          по четвергам.
          <br />
          <span>В пятницу зерно</span>
          <br />
          <span>уже у вас в чашке.</span>
        </h1>

        <p className="hero-description">
          Маленькая мастерская в Минске. Никакого складского лежания — только
          свежий кофе партиями по 5 кг с доставкой на 1–3 день после обжарки.
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#catalog">
            Выбрать кофе
          </a>
          <a className="button button-secondary" href="#subscription">
            Оформить подписку
          </a>
        </div>

        <ul aria-label="Условия" className="hero-notes">
          <li>Обжарка каждую неделю</li>
          <li>Доставка по Минску от 50 BYN бесплатно</li>
        </ul>
      </div>

      <div className="hero-visual">
        <Image
          alt="Свежие кофейные зерна в барабане обжарочной машины"
          className="hero-image"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 48vw"
          src="/coffee-roastery.jpg"
        />
        <div aria-hidden="true" className="image-shade" />
        <p className="photo-caption">
          <span>Свежая обжарка</span>
          Маленькие партии · 5 кг
        </p>
      </div>
    </section>
  );
}
