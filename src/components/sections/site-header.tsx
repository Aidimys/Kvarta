const navigation = [
  { href: "#about", label: "Мастерская" },
  { href: "#catalog", label: "Кофе" },
  { href: "#subscription", label: "Подписка" },
  { href: "#delivery", label: "Доставка" },
  { href: "#contacts", label: "Контакты" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="Кварта — на главную">
          <svg
            aria-hidden="true"
            className="brand-mark"
            viewBox="0 0 36 36"
            fill="none"
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

        <nav aria-label="Основная навигация" className="site-nav">
          {navigation.map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="header-cta" href="#catalog">
          Выбрать кофе
        </a>
      </div>
    </header>
  );
}
