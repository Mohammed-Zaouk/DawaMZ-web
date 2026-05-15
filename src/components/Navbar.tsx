import { Link } from "react-router-dom";
import { useTheme } from "../context/theme/useTheme";
import { useLanguage } from "../context/language/useLanguage";
import { t } from "../context/language/translations";
import logo from "../assets/logo.png";
import styles from "../styles/components-style/Navbar.module.css";
import type { Language } from "../context/language/LanguageContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL } = useLanguage();
  const isDark = theme === "dark";
  const text = t(language);
  const langs: Language[] = ["ar", "fr", "en"];

  const [menuOpen, setMenuOpen] = useState(false);
  const [langLoading, setLangLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLangChange = (lang: Language) => {
    if (lang === language || langLoading) return;
    setLanguage(lang);
    setLangLoading(true);
    setTimeout(() => {
      setLangLoading(false);
    }, 1200);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {langLoading && (
        <div className={styles.langOverlay}>
          <div className={styles.langOverlayBar}>
            <div className={styles.langOverlayFill} />
          </div>
        </div>
      )}

      <nav className={styles.nav} dir={isRTL ? "rtl" : "ltr"}>
        {/* Logo */}
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="Dawamz logo" className={styles.logo} />
          <span className={styles.brandText}>
            Dawa<span className={styles.accent}>mz</span>
          </span>
        </Link>

        {/* Right side */}
        <div className={styles.right}>
          {/* Nav links */}
          <div className={styles.links}>
            <Link to="/" className={styles.link}>
              <i className="ion-md-home" />
              <span>{text.home}</span>
            </Link>
            <Link to="/about" className={styles.link}>
              <i className="ion-md-information-circle" />
              <span>{text.about}</span>
            </Link>
            <Link to="/contact" className={styles.link}>
              <i className="ion-md-mail" />
              <span>{text.contact}</span>
            </Link>
          </div>

          {/* Settings menu */}
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              className={`${styles.menuBtn} ${menuOpen ? styles.menuBtnOpen : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Settings"
            >
              <span className={styles.menuBar} />
              <span className={styles.menuBar} />
              <span className={styles.menuBar} />
            </button>

            <div
              className={`${styles.dropdown} ${menuOpen ? styles.dropdownOpen : ""}`}
            >
              {/* Theme row */}
              <div className={styles.dropdownRow}>
                <span className={styles.dropdownLabel}>
                  <i className={isDark ? "ion-md-moon" : "ion-md-sunny"} />
                  {isDark ? "Dark" : "Light"}
                </span>
                <button
                  onClick={toggleTheme}
                  className={styles.themeToggle}
                  aria-label="Toggle theme"
                >
                  <span
                    className={`${styles.switchTrack} ${isDark ? styles.switchTrackDark : ""}`}
                  >
                    <span
                      className={`${styles.switchThumb} ${isDark ? styles.switchThumbDark : ""}`}
                    />
                  </span>
                </button>
              </div>

              <div className={styles.divider} />

              {/* Language row */}
              <div className={styles.dropdownRow}>
                <span className={styles.dropdownLabel}>
                  <i className="ion-md-globe" />
                  Language
                </span>
              </div>

              <div className={styles.langGroup}>
                {langs.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangChange(lang)}
                    disabled={langLoading}
                    className={`${styles.langBtn} ${language === lang ? styles.langBtnActive : ""}`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}