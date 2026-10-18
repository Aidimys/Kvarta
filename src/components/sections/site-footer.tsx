const footerNavigation = [
  { href: "#catalog", label: "Кофе" },
  { href: "#subscription", label: "Подписка" },
  { href: "#delivery", label: "Доставка и самовывоз" },
  { href: "#about", label: "О мастерской" },
  { href: "#contacts", label: "Контакты" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/kvarta.roastery/",
    label: "Instagram",
  },
  { href: "https://t.me/kvarta_roastery", label: "Telegram" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a className="brand footer-logo" href="#top">
            <svg
              aria-hidden="true"
              className="brand-mark"
              fill="none"
              viewBox="0 0 36 36"
            >
              <path
                d="M18 2.5 33.5 11.25v13.5L18 33.5 2.5 24.75v-13.5L18 2.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 23V13m0 5 9-5m-9 5 9 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            <span className="brand-name">КВАРТА</span>
          </a>
          <p>ИП / Название: Обжарочная мастерская «Кварта»</p>
          <p>Минск, ул. Короля, 9</p>
        </div>

        <nav aria-label="Меню в подвале" className="footer-nav">
          <h2>Меню</h2>
          {footerNavigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <nav aria-label="Социальные сети" className="footer-socials">
          <h2>Мы на связи</h2>
          {socialLinks.map((item) => (
            <a
              href={item.href}
              key={item.href}
              rel="noreferrer"
              target="_blank"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <p>Свежая обжарка каждую неделю в Минске</p>
        <a href="#top">Наверх ↑</a>
      </div>
    </footer>
  );
}
