import { Link } from "react-router-dom";
import { useLanguage } from "../context/language/useLanguage";
import logo from "../assets/logo.png";
import styles from "../styles/components-style/Footer.module.css";

const translations = {
  ar: {
    tagline: "ابحث عن الصيدليات المفتوحة القريبة منك، في أي وقت.",
    links: "روابط",
    legal: "قانوني",
    follow: "تابعنا",
    home: "الرئيسية",
    about: "حول",
    contact: "تواصل",
    privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام",
    copy: `© ${new Date().getFullYear()} DawaMZ. جميع الحقوق محفوظة.`,
  },
  fr: {
    tagline: "Trouvez les pharmacies ouvertes près de vous, à tout moment.",
    links: "Liens",
    legal: "Légal",
    follow: "Suivez-nous",
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    copy: `© ${new Date().getFullYear()} DawaMZ. Tous droits réservés.`,
  },
  en: {
    tagline: "Find open pharmacies near you, anytime.",
    links: "Links",
    legal: "Legal",
    follow: "Follow us",
    home: "Home",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    copy: `© ${new Date().getFullYear()} DawaMZ. All rights reserved.`,
  },
};

type Lang = keyof typeof translations;

const socials = [
  {
    icon: "ion-logo-instagram",
    href: "https://www.instagram.com/dawa.mz/",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.1)",
    label: "Instagram",
  },
  {
    icon: "ion-logo-facebook",
    href: "https://www.facebook.com/people/DawaMZ/61589490633245/",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.1)",
    label: "Facebook",
  },
  {
    icon: "ion-logo-whatsapp",
    href: "https://wa.me/212659911786",
    color: "#25D366",
    bg: "rgba(37,211,102,0.1)",
    label: "WhatsApp",
  },
];

export default function Footer() {
  const { language, isRTL } = useLanguage();
  const text = translations[language as Lang] ?? translations.en;

  return (
    <footer className={styles.footer} dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Top ── */}
      <div className={styles.top}>
        {/* Brand */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brand} dir="ltr">
            <img src={logo} alt="DawaMZ" className={styles.logo} />
            <span className={styles.brandText}>
              Dawa<span className={styles.accent}>MZ</span>
            </span>
          </Link>
          <p className={styles.tagline}>{text.tagline}</p>
          <div className={styles.socials}>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                style={{ background: s.bg, color: s.color }}
                aria-label={s.label}
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div className={styles.cols}>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>{text.links}</h3>
            <Link to="/" className={styles.colLink}>
              {text.home}
            </Link>
            <Link to="/about" className={styles.colLink}>
              {text.about}
            </Link>
            <Link to="/contact" className={styles.colLink}>
              {text.contact}
            </Link>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>{text.legal}</h3>
            <Link to="/privacy" className={styles.colLink}>
              {text.privacy}
            </Link>
            <Link to="/terms" className={styles.colLink}>
              {text.terms}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Bottom ── */}
      <div className={styles.bottom}>
        <p className={styles.copy}>{text.copy}</p>
        <div className={styles.bottomLinks}>
          <Link to="/privacy" className={styles.bottomLink}>
            {text.privacy}
          </Link>
          <Link to="/terms" className={styles.bottomLink}>
            {text.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
