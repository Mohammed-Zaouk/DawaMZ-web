import styles from "../../styles/legal-styles/About.module.css"
import { useLanguage } from "../../context/language/useLanguage";
import logo from "../../assets/logo.png";

const currentYear = new Date().getFullYear();

const translations = {
  ar: {
    appName: "DawaMZ",
    version: "الإصدار 1.0.0",
    aboutTitle: "ما هو DawaMZ؟",
    aboutContent:
      "DawaMZ هو تطبيقك الموثوق للعثور على الصيدليات في جميع أنحاء المغرب. نساعدك في تحديد موقع الصيدليات المناوبة، والصيدليات الليلية، والصيدليات القريبة منك بسهولة وسرعة.",
    featuresTitle: "المميزات",
    features: [
      "البحث عن الصيدليات حسب المنطقة والمدينة",
      "عرض الصيدليات المفتوحة حالياً",
      "الحصول على الاتجاهات إلى أقرب صيدلية",
      "واجهة بسيطة وسهلة الاستخدام",
      "دعم ثلاث لغات: العربية، الفرنسية، والإنجليزية",
      "مجاني تماماً بدون إعلانات",
    ],
    missionTitle: "مهمتنا",
    missionContent:
      "نهدف إلى تسهيل الوصول إلى الخدمات الصحية في المغرب من خلال توفير معلومات دقيقة وسهلة الوصول عن الصيدليات.",
    freeTitle: "مجاني 100٪",
    freeContent:
      "الموقع مجاني تماماً بدون إعلانات أو أي تكاليف. نؤمن بأن الوصول إلى معلومات الصيدليات يجب أن يكون متاحاً للجميع.",
    dataTitle: "خصوصيتك مهمة",
    dataContent:
      "نحن نحترم خصوصيتك. لا نحفظ أو نشارك معلوماتك الشخصية.",
    copyright: `© ${currentYear} DawaMZ. جميع الحقوق محفوظة.`,
  },
  fr: {
    appName: "DawaMZ",
    version: "Version 1.0.0",
    aboutTitle: "Qu'est-ce que DawaMZ ?",
    aboutContent:
      "DawaMZ est votre application de confiance pour trouver des pharmacies partout au Maroc. Nous vous aidons à localiser les pharmacies de garde, les pharmacies de nuit et les pharmacies près de vous facilement et rapidement.",
    featuresTitle: "Fonctionnalités",
    features: [
      "Recherche de pharmacies par région et ville",
      "Affichage des pharmacies ouvertes actuellement",
      "Obtenir un itinéraire vers la pharmacie la plus proche",
      "Interface simple et facile à utiliser",
      "Support de trois langues : arabe, français et anglais",
      "Entièrement gratuit sans publicités",
    ],
    missionTitle: "Notre mission",
    missionContent:
      "Nous visons à faciliter l'accès aux services de santé au Maroc en fournissant des informations précises et facilement accessibles sur les pharmacies.",
    freeTitle: "100 % gratuit",
    freeContent:
      "Le site est entièrement gratuit sans publicités ni frais. Nous croyons que l'accès aux informations sur les pharmacies devrait être disponible pour tous.",
    dataTitle: "Votre vie privée compte",
    dataContent:
      "Nous respectons votre vie privée. Nous ne sauvegardons ni ne partageons vos informations personnelles.",
    copyright: `© ${currentYear} DawaMZ. Tous droits réservés.`,
  },
  en: {
    appName: "DawaMZ",
    version: "Version 1.0.0",
    aboutTitle: "What is DawaMZ?",
    aboutContent:
      "DawaMZ is your trusted platform for finding pharmacies across Morocco. We help you locate on-call pharmacies, night pharmacies, and pharmacies near you easily and quickly.",
    featuresTitle: "Features",
    features: [
      "Search pharmacies by region and city",
      "View pharmacies open right now",
      "Get directions to the nearest pharmacy",
      "Simple and easy-to-use interface",
      "Support for three languages: Arabic, French, and English",
      "Completely free with no ads",
    ],
    missionTitle: "Our Mission",
    missionContent:
      "We aim to make accessing healthcare services in Morocco easier by providing accurate and easily accessible pharmacy information.",
    freeTitle: "100% Free",
    freeContent:
      "The platform is completely free with no ads or costs. We believe access to pharmacy information should be available to everyone.",
    dataTitle: "Your Privacy Matters",
    dataContent:
      "We respect your privacy. We do not save or share your personal information.",
    copyright: `© ${currentYear} DawaMZ. All rights reserved.`,
  },
};

type Lang = keyof typeof translations;

const sections = (text: typeof translations.en) => [
  {
    icon: "ion-md-information-circle",
    title: text.aboutTitle,
    content: text.aboutContent,
    color: "#1A73E8",
    bg: "rgba(26,115,232,0.08)",
  },
  {
    icon: "ion-md-heart",
    title: text.missionTitle,
    content: text.missionContent,
    color: "#E53935",
    bg: "rgba(229,57,53,0.08)",
  },
  {
    icon: "ion-md-gift",
    title: text.freeTitle,
    content: text.freeContent,
    color: "#43A047",
    bg: "rgba(67,160,71,0.08)",
  },
  {
    icon: "ion-md-lock",
    title: text.dataTitle,
    content: text.dataContent,
    color: "#8E24AA",
    bg: "rgba(142,36,170,0.08)",
  },
];

export default function About() {
  const { language, isRTL } = useLanguage();
  const text = translations[language as Lang] ?? translations.en;

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>

      {/* Logo hero */}
      <section className={styles.hero}>
        <img src={logo} alt="DawaMZ" className={styles.heroLogo} />
        <h1 className={styles.heroName}>{text.appName}</h1>
        <span className={styles.heroVersion}>{text.version}</span>
      </section>

      {/* Info sections */}
      {sections(text).map((s) => (
        <section key={s.title} className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionIcon} style={{ background: s.bg }}>
              <i className={s.icon} style={{ color: s.color }} />
            </div>
            <h2 className={styles.sectionTitle}>{s.title}</h2>
          </div>
          <p className={styles.sectionContent}>{s.content}</p>
        </section>
      ))}

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.sectionTitleRow}>
          <div className={styles.sectionIcon} style={{ background: "rgba(251,188,5,0.1)" }}>
            <i className="ion-md-star" style={{ color: "#FBC005" }} />
          </div>
          <h2 className={styles.sectionTitle}>{text.featuresTitle}</h2>
        </div>
        <div className={styles.featuresCard}>
          {text.features.map((f, i) => (
            <div key={i} className={styles.featureRow}>
              <i className="ion-md-checkmark-circle" style={{ color: "#1A73E8" }} />
              <span className={styles.featureText}>{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Copyright */}
      <p className={styles.copyright}>{text.copyright}</p>

    </div>
  );
}