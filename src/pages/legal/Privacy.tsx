import styles from "../../styles/legal-styles/Privacy.module.css"
import { useLanguage } from "../../context/language/useLanguage";

const translations = {
  ar: {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث: 9 مارس 2026",
    intro: "نحن في DawaMZ نحترم خصوصيتك. هذه السياسة توضح كيفية جمع واستخدام بياناتك.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        content: "نقوم بجمع المعلومات التالية:\n\n• الموقع الجغرافي: نستخدم موقعك فقط للعثور على الصيدليات القريبة منك. لا نحفظ أو نشارك موقعك.\n\n• تفضيلات اللغة: لعرض الموقع باللغة التي تختارها.\n\n• بيانات الاستخدام: معلومات حول كيفية استخدامك للموقع لتحسين الخدمة.",
      },
      {
        title: "2. كيف نستخدم معلوماتك",
        content: "نستخدم معلوماتك فقط لـ:\n\n• عرض الصيدليات القريبة من موقعك الحالي\n• تذكر تفضيلاتك في اللغة\n• تحسين أداء الموقع وإصلاح الأخطاء",
      },
      {
        title: "3. مشاركة المعلومات",
        content: "نحن لا نبيع أو نشارك أو ننقل معلوماتك الشخصية إلى أطراف ثالثة بأي شكل من الأشكال.\n\nموقعك الجغرافي يُستخدم محلياً على جهازك فقط ولا يُرسل إلى خوادمنا.",
      },
      {
        title: "4. تخزين البيانات",
        content: "• تفضيلات اللغة تُحفظ محلياً على جهازك فقط\n• لا نحفظ موقعك الجغرافي\n• لا نجمع معلومات شخصية تعريفية",
      },
      {
        title: "5. حقوقك",
        content: "يمكنك:\n\n• مغادرة الموقع في أي وقت لإنهاء الجلسة\n• تعطيل خدمات الموقع من إعدادات متصفحك\n• تغيير تفضيلات اللغة في أي وقت",
      },
      {
        title: "6. أمان البيانات",
        content: "جميع البيانات المخزنة محلياً على جهازك محمية بواسطة متصفحك.",
      },
      {
        title: "7. الموقع مجاني تماماً",
        content: "الموقع مجاني 100٪ بدون إعلانات أو أي تكاليف.",
      },
      {
        title: "8. التغييرات على هذه السياسة",
        content: "قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إخطارك بأي تغييرات مهمة.",
      },
      {
        title: "9. الاتصال بنا",
        content: "إذا كان لديك أسئلة حول هذه السياسة، يمكنك التواصل معنا عبر صفحة التواصل.",
      },
    ],
  },
  fr: {
    title: "Politique de confidentialité",
    lastUpdated: "Dernière mise à jour : 9 mars 2026",
    intro: "Chez DawaMZ, nous respectons votre vie privée. Cette politique explique comment nous collectons et utilisons vos données.",
    sections: [
      {
        title: "1. Informations que nous collectons",
        content: "Nous collectons les informations suivantes :\n\n• Localisation géographique : Nous utilisons votre position uniquement pour trouver les pharmacies près de vous. Nous ne sauvegardons ni ne partageons votre position.\n\n• Préférences linguistiques : Pour afficher le site dans la langue de votre choix.\n\n• Données d'utilisation : Informations sur la façon dont vous utilisez le site pour améliorer le service.",
      },
      {
        title: "2. Comment nous utilisons vos informations",
        content: "Nous utilisons vos informations uniquement pour :\n\n• Afficher les pharmacies près de votre position actuelle\n• Mémoriser vos préférences linguistiques\n• Améliorer les performances du site et corriger les bugs",
      },
      {
        title: "3. Partage d'informations",
        content: "Nous ne vendons, ne partageons ni ne transférons vos informations personnelles à des tiers de quelque manière que ce soit.\n\nVotre localisation est utilisée localement sur votre appareil uniquement et n'est pas envoyée à nos serveurs.",
      },
      {
        title: "4. Stockage des données",
        content: "• Les préférences linguistiques sont enregistrées localement sur votre appareil uniquement\n• Nous ne sauvegardons pas votre localisation\n• Nous ne collectons aucune information personnellement identifiable",
      },
      {
        title: "5. Vos droits",
        content: "Vous pouvez :\n\n• Quitter le site à tout moment pour terminer la session\n• Désactiver les services de localisation depuis les paramètres de votre navigateur\n• Modifier vos préférences linguistiques à tout moment",
      },
      {
        title: "6. Sécurité des données",
        content: "Toutes les données stockées localement sur votre appareil sont protégées par votre navigateur.",
      },
      {
        title: "7. Le site est entièrement gratuit",
        content: "Le site est 100 % gratuit sans publicités ni frais.",
      },
      {
        title: "8. Modifications de cette politique",
        content: "Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Vous serez informé de tout changement important.",
      },
      {
        title: "9. Nous contacter",
        content: "Si vous avez des questions concernant cette politique, vous pouvez nous contacter via la page de contact.",
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 9, 2026",
    intro: "At DawaMZ, we respect your privacy. This policy explains how we collect and use your data.",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We collect the following information:\n\n• Geographic Location: We use your location only to find pharmacies near you. We do not save or share your location.\n\n• Language Preferences: To display the site in your chosen language.\n\n• Usage Data: Information about how you use the site to improve the service.",
      },
      {
        title: "2. How We Use Your Information",
        content: "We use your information only to:\n\n• Display pharmacies near your current location\n• Remember your language preferences\n• Improve site performance and fix bugs",
      },
      {
        title: "3. Information Sharing",
        content: "We do not sell, share, or transfer your personal information to third parties in any way.\n\nYour location is used locally on your device only and is not sent to our servers.",
      },
      {
        title: "4. Data Storage",
        content: "• Language preferences are saved locally on your device only\n• We do not save your location\n• We do not collect personally identifiable information",
      },
      {
        title: "5. Your Rights",
        content: "You can:\n\n• Leave the site at any time to end the session\n• Disable location services from your browser settings\n• Change language preferences at any time",
      },
      {
        title: "6. Data Security",
        content: "All data stored locally on your device is protected by your browser.",
      },
      {
        title: "7. The Site is Completely Free",
        content: "The site is 100% free with no ads or costs.",
      },
      {
        title: "8. Changes to This Policy",
        content: "We may update this privacy policy from time to time. You will be notified of any significant changes.",
      },
      {
        title: "9. Contact Us",
        content: "If you have questions about this policy, you can contact us via the contact page.",
      },
    ],
  },
};

type Lang = keyof typeof translations;

export default function Privacy() {
  const { language, isRTL } = useLanguage();
  const text = translations[language as Lang] ?? translations.en;

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>

      <h1 className={styles.title}>{text.title}</h1>
      <p className={styles.lastUpdated}>{text.lastUpdated}</p>

      <p className={`${styles.intro} ${isRTL ? styles.introRtl : styles.introLtr}`}>
        {text.intro}
      </p>

      {text.sections.map((s, i) => (
        <div key={i} className={styles.section}>
          <h2 className={styles.sectionTitle}>{s.title}</h2>
          <p className={styles.sectionContent}>{s.content}</p>
        </div>
      ))}

    </div>
  );
}