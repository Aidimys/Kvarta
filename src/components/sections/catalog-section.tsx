import Image from "next/image";

const products = [
  {
    name: "Эфиопия Иргачеффе",
    origin: "Эфиопия · Иргачеффе",
    image: "/products/ethiopia.jpg",
    imageAlt: "Кофе заваривают через пуровер в обжарочной мастерской",
    weight: "250 г",
    price: "32",
    profile: ["Цветочный", "Бергамот"],
    description: "Светлая обжарка",
    style: "ethiopia",
  },
  {
    name: "Колумбия Уила",
    origin: "Колумбия · Уила",
    image: "/products/colombia.jpg",
    imageAlt: "Обжаренные кофейные зёрна в банке и россыпью",
    weight: "250 г",
    price: "29",
    profile: ["Карамель", "Красное яблоко"],
    description: "Сочная сладость на каждый день",
    style: "colombia",
  },
  {
    name: "Бразилия Серрадо",
    origin: "Бразилия · Серрадо",
    image: "/products/brazil.jpg",
    imageAlt: "Чашка свежесваренного кофе с нежной молочной пеной",
    weight: "250 г",
    price: "26",
    profile: ["Орех", "Шоколад"],
    description: "Особенно хорош под эспрессо",
    style: "brazil",
  },
  {
    name: "Дрип-пакеты, ассорти",
    origin: "Любимый кофе без кофемашины",
    image: "/products/drip-packs.jpg",
    imageAlt: "Зёрна и молотый кофе для свежего заваривания",
    weight: "10 упаковок",
    price: "18",
    profile: ["Удобно в офис", "В поездку"],
    description: "Заварите чашку, где бы вы ни были",
    style: "drip",
  },
  {
    name: "Подписка на кофе",
    origin: "Хит · пусть кофе не заканчивается",
    image: "/products/subscription.jpg",
    imageAlt: "Несколько чашек кофе, которыми делятся за одним столом",
    weight: "2 пачки × 250 г",
    price: "54",
    priceUnit: "/ месяц",
    profile: ["Раз в месяц", "Доставка всегда бесплатно"],
    description: "2 пачки по 250 г раз в месяц. Доставка бесплатная всегда.",
    note: "Идеально, чтобы кофе никогда не заканчивался.",
    style: "subscription",
  },
];

export function CatalogSection() {
  return (
    <section
      aria-labelledby="catalog-title"
      className="catalog-section"
      id="catalog"
    >
      <div className="catalog-inner">
        <div className="catalog-heading">
          <div>
            <p className="catalog-eyebrow">Кофе недели · Свежая обжарка</p>
            <h2 id="catalog-title">Свежая обжарка этой недели</h2>
          </div>
          <p className="catalog-intro">
            Выбрали зерно под разное настроение — от цветочной Эфиопии до
            шоколадной Бразилии.
          </p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article
              aria-label={product.name}
              className={`product-card product-card-${product.style}`}
              key={product.name}
            >
              <div className="product-art">
                <Image
                  alt={product.imageAlt}
                  className="product-photo"
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 33vw"
                  src={product.image}
                />
                <span className="product-origin">{product.origin}</span>
                <span className="product-art-caption">Обжарено в Минске</span>
              </div>

              <div className="product-content">
                <div className="product-title-row">
                  <h3>{product.name}</h3>
                  {product.style === "subscription" && (
                    <span className="product-hit">Хит</span>
                  )}
                </div>

                <ul
                  aria-label="Вкусовые дескрипторы"
                  className="product-flavors"
                >
                  {product.profile.map((flavor) => (
                    <li key={flavor}>{flavor}</li>
                  ))}
                </ul>

                <p className="product-description">{product.description}</p>
                {product.note && <p className="product-note">{product.note}</p>}

                <div className="product-purchase">
                  <div className="product-price">
                    <span className="price-amount">{product.price}</span>
                    <span className="price-unit">
                      BYN{product.priceUnit ? ` ${product.priceUnit}` : ""}
                    </span>
                    <span className="product-weight">{product.weight}</span>
                  </div>
                  <button
                    aria-label={`Хочу этот — ${product.name}`}
                    className="product-action"
                    type="button"
                  >
                    Хочу этот <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
