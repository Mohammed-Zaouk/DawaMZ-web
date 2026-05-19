import styles from "../../styles/legal-styles/Contact.module.css";
import { useLanguage } from "../../context/language/useLanguage";

const translations = {
  ar: {
    pageTitle: "تواصل معنا",
    pageSubtitle:
      "نحن هنا للمساعدة، لا تتردد في التواصل معنا عبر أي من القنوات التالية.",
    sectionContact: "قنوات التواصل",
    sectionSocial: "تابعنا",
    email: "البريد الإلكتروني",
    emailDesc: "contact@dawamz.com",
    whatsapp: "واتساب",
    whatsappDesc: "+212 659 911 786",
    instagram: "إنستغرام",
    instagramDesc: "@dawa.mz",
    facebook: "فيسبوك",
    facebookDesc: "DawaMZ",
    responseTime: "نرد عادةً خلال 24 ساعة",
  },
  fr: {
    pageTitle: "Contactez-nous",
    pageSubtitle:
      "Nous sommes là pour vous aider. N'hésitez pas à nous contacter via l'un des canaux suivants.",
    sectionContact: "Canaux de contact",
    sectionSocial: "Suivez-nous",
    email: "E-mail",
    emailDesc: "contact@dawamz.com",
    whatsapp: "WhatsApp",
    whatsappDesc: "+212 659 911 786",
    instagram: "Instagram",
    instagramDesc: "@dawa.mz",
    facebook: "Facebook",
    facebookDesc: "DawaMZ",
    responseTime: "Nous répondons généralement sous 24 heures",
  },
  en: {
    pageTitle: "Contact Us",
    pageSubtitle:
      "We're here to help. Feel free to reach out through any of the channels below.",
    sectionContact: "Contact Channels",
    sectionSocial: "Follow Us",
    email: "Email",
    emailDesc: "contact@dawamz.com",
    whatsapp: "WhatsApp",
    whatsappDesc: "+212 659 911 786",
    instagram: "Instagram",
    instagramDesc: "@dawa.mz",
    facebook: "Facebook",
    facebookDesc: "DawaMZ",
    responseTime: "We usually respond within 24 hours",
  },
};

type Lang = keyof typeof translations;

const contactItems = (text: typeof translations.en) => [
  {
    icon: "ion-md-mail",
    label: text.email,
    desc: text.emailDesc,
    href: "mailto:contact@dawamz.com",
    color: "#1A73E8",
    bg: "rgba(26,115,232,0.08)",
  },
  {
    icon: "ion-logo-whatsapp",
    label: text.whatsapp,
    desc: text.whatsappDesc,
    href: "https://wa.me/212659911786",
    color: "#25D366",
    bg: "rgba(37,211,102,0.08)",
  },
];

const socialItems = (text: typeof translations.en) => [
  {
    icon: "ion-logo-instagram",
    label: text.instagram,
    desc: text.instagramDesc,
    href: "https://www.instagram.com/dawa.mz/",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
  },
  {
    icon: "ion-logo-facebook",
    label: text.facebook,
    desc: text.facebookDesc,
    href: "https://www.facebook.com/people/DawaMZ/61589490633245/",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.08)",
  },
];

export default function Contact() {
  const { language, isRTL } = useLanguage();
  const text = translations[language as Lang] ?? translations.en;

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <i className="ion-md-chatbubbles" />
        </div>
        <h1 className={styles.heroTitle}>{text.pageTitle}</h1>
        <p className={styles.heroSubtitle}>{text.pageSubtitle}</p>
      </section>

      {/* Contact channels */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>{text.sectionContact}</h2>
          <span className={styles.sectionLine} />
        </div>

        <div className={styles.cards}>
          {contactItems(text).map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <div className={styles.cardIcon} style={{ background: item.bg }}>
                <i className={item.icon} style={{ color: item.color }} />
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{item.label}</span>
                <span className={styles.cardDesc}>{item.desc}</span>
              </div>
              <i
                className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`}
              />
            </a>
          ))}
        </div>

        <p className={styles.responseNote}>
          <i className="ion-md-time" />
          {text.responseTime}
        </p>
      </section>

      {/* Social */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>{text.sectionSocial}</h2>
          <span className={styles.sectionLine} />
        </div>

        <div className={styles.cards}>
          {socialItems(text).map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <div className={styles.cardIcon} style={{ background: item.bg }}>
                <i className={item.icon} style={{ color: item.color }} />
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{item.label}</span>
                <span className={styles.cardDesc}>{item.desc}</span>
              </div>
              <i
                className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`}
              />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
