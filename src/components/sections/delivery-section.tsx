export function DeliverySection() {
  return (
    <section
      aria-labelledby="delivery-title"
      className="delivery-section"
      id="delivery"
    >
      <div className="delivery-inner">
        <div className="delivery-heading">
          <p className="delivery-eyebrow">Доставка и самовывоз</p>
          <h2 id="delivery-title">Как получить заказ</h2>
        </div>

        <div className="delivery-options">
          <article className="delivery-option">
            <span aria-hidden="true" className="delivery-icon">
              🚚
            </span>
            <div className="delivery-copy">
              <h3>Доставка по Минску</h3>
              <p>Развозим по пятницам.</p>
              <p>
                При заказе от 50 BYN — <strong>бесплатно</strong>, иначе по
                тарифам курьера.
              </p>
            </div>
          </article>

          <article className="delivery-option">
            <span aria-hidden="true" className="delivery-icon">
              🏃
            </span>
            <div className="delivery-copy">
              <h3>Самовывоз</h3>
              <p>Минск, ул. Короля, 9.</p>
              <p>Можно забрать заказ самостоятельно.</p>
              <p className="workshop-hours">
                <span>Часы работы мастерской</span>
                Пн–Пт с 8:00 до 20:00
                <br />
                Сб–Вс с 10:00 до 18:00
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
