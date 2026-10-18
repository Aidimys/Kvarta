"use client";

import { useEffect, useState } from "react";

const navigation = [
  { href: "#about", label: "Мастерская" },
  { href: "#catalog", label: "Кофе" },
  { href: "#subscription", label: "Подписка" },
  { href: "#delivery", label: "Доставка" },
  { href: "#contacts", label: "Контакты" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-controls="mobile-navigation"
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <button
        aria-label="Закрыть меню"
        className={`mobile-menu-backdrop${menuOpen ? " is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
        type="button"
      />
      <aside
        aria-hidden={!menuOpen}
        aria-label="Мобильная навигация"
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        id="mobile-navigation"
      >
        <div className="mobile-menu-heading">
          <span className="brand-name">КВАРТА</span>
          <button
            aria-label="Закрыть меню"
            className="mobile-menu-close"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
            type="button"
          >
            ×
          </button>
        </div>
        <nav aria-label="Основная навигация">
          {navigation.map((item) => (
            <a
              className="mobile-nav-link"
              href={item.href}
              key={item.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
            >
              {item.label}
            </a>
          ))}
          <a
            className="mobile-menu-cta"
            href="#catalog"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          >
            Выбрать кофе
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </aside>
    </header>
  );
}
