import styles from "../../styles/legal-styles/Terms.module.css"
import { useLanguage } from "../../context/language/useLanguage";

const translations = {
  ar: {
    title: "شروط الخدمة",
    lastUpdated: "آخر تحديث: 9 مارس 2026",
    intro: "باستخدامك لموقع DawaMZ، فإنك توافق على الالتزام بهذه الشروط.",
    sections: [
      {
        title: "1. قبول الشروط",
        content: "باستخدام الموقع، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق، يرجى عدم استخدام الموقع.",
      },
      {
        title: "2. استخدام الموقع",
        content: "يمكنك استخدام DawaMZ لـ:\n\n• العثور على الصيدليات في المغرب\n• عرض معلومات الصيدليات (الموقع، ساعات العمل، رقم الهاتف)\n• الحصول على الاتجاهات إلى الصيدليات\n\nيجب عليك:\n• استخدام الموقع بشكل قانوني وأخلاقي\n• عدم استخدام الموقع لأغراض ضارة أو غير قانونية",
      },
      {
        title: "3. معلومات الصيدليات",
        content: "نبذل قصارى جهدنا لتوفير معلومات دقيقة ومحدثة عن الصيدليات. ومع ذلك:\n\n• لا نضمن دقة المعلومات بنسبة 100٪\n• قد تتغير ساعات العمل أو معلومات الاتصال\n• يرجى التحقق مباشرة مع الصيدلية قبل الزيارة",
      },
      {
        title: "4. المسؤولية",
        content: "DawaMZ ليست مسؤولة عن:\n\n• دقة معلومات الصيدليات\n• توفر الأدوية في الصيدليات\n• جودة الخدمة المقدمة من الصيدليات\n• أي أضرار ناتجة عن استخدام الموقع\n\nالموقع يوفر معلومات فقط ولا يقدم نصائح طبية.",
      },
      {
        title: "5. حقوق الملكية الفكرية",
        content: "جميع حقوق الموقع، بما في ذلك التصميم والشعار والمحتوى، محفوظة لـ DawaMZ.",
      },
      {
        title: "6. الموقع مجاني",
        content: "الموقع مجاني تماماً بدون:\n• إعلانات\n• رسوم اشتراك\n• أي تكاليف",
      },
      {
        title: "7. التغييرات على الخدمة",
        content: "نحتفظ بالحق في:\n• تعديل أو إيقاف ميزات الموقع\n• تحديث هذه الشروط في أي وقت\n• إنهاء الخدمة دون إشعار مسبق",
      },
      {
        title: "8. القانون الساري",
        content: "تخضع هذه الشروط لقوانين المملكة المغربية.",
      },
      {
        title: "9. الاتصال",
        content: "للأسئلة حول هذه الشروط، يمكنك التواصل معنا عبر صفحة التواصل.",
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour : 9 mars 2026",
    intro: "En utilisant le site DawaMZ, vous acceptez de respecter ces conditions.",
    sections: [
      {
        title: "1. Acceptation des conditions",
        content: "En utilisant le site, vous acceptez ces termes et conditions. Si vous n'êtes pas d'accord, veuillez ne pas utiliser le site.",
      },
      {
        title: "2. Utilisation du site",
        content: "Vous pouvez utiliser DawaMZ pour :\n\n• Trouver des pharmacies au Maroc\n• Afficher les informations sur les pharmacies (emplacement, horaires, téléphone)\n• Obtenir des itinéraires vers les pharmacies\n\nVous devez :\n• Utiliser le site de manière légale et éthique\n• Ne pas utiliser le site à des fins nuisibles ou illégales",
      },
      {
        title: "3. Informations sur les pharmacies",
        content: "Nous faisons de notre mieux pour fournir des informations exactes et à jour. Cependant :\n\n• Nous ne garantissons pas une exactitude à 100 %\n• Les horaires ou coordonnées peuvent changer\n• Veuillez vérifier directement auprès de la pharmacie avant de visiter",
      },
      {
        title: "4. Responsabilité",
        content: "DawaMZ n'est pas responsable de :\n\n• L'exactitude des informations sur les pharmacies\n• La disponibilité des médicaments\n• La qualité du service fourni par les pharmacies\n• Tout dommage résultant de l'utilisation du site\n\nLe site fournit des informations uniquement et ne donne pas de conseils médicaux.",
      },
      {
        title: "5. Droits de propriété intellectuelle",
        content: "Tous les droits du site, y compris la conception, le logo et le contenu, sont réservés à DawaMZ.",
      },
      {
        title: "6. Le site est gratuit",
        content: "Le site est entièrement gratuit sans :\n• Publicités\n• Frais d'abonnement\n• Aucun coût",
      },
      {
        title: "7. Modifications du service",
        content: "Nous nous réservons le droit de :\n• Modifier ou arrêter les fonctionnalités du site\n• Mettre à jour ces conditions à tout moment\n• Arrêter le service sans préavis",
      },
      {
        title: "8. Loi applicable",
        content: "Ces conditions sont régies par les lois du Royaume du Maroc.",
      },
      {
        title: "9. Contact",
        content: "Pour toute question concernant ces conditions, vous pouvez nous contacter via la page de contact.",
      },
    ],
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: March 9, 2026",
    intro: "By using the DawaMZ website, you agree to comply with these terms.",
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By using the site, you accept these terms and conditions. If you do not agree, please do not use the site.",
      },
      {
        title: "2. Use of the Site",
        content: "You can use DawaMZ to:\n\n• Find pharmacies in Morocco\n• View pharmacy information (location, hours, phone)\n• Get directions to pharmacies\n\nYou must:\n• Use the site legally and ethically\n• Not use the site for harmful or illegal purposes",
      },
      {
        title: "3. Pharmacy Information",
        content: "We do our best to provide accurate and up-to-date information. However:\n\n• We do not guarantee 100% accuracy\n• Hours or contact information may change\n• Please verify directly with the pharmacy before visiting",
      },
      {
        title: "4. Liability",
        content: "DawaMZ is not responsible for:\n\n• Accuracy of pharmacy information\n• Availability of medications\n• Quality of service provided by pharmacies\n• Any damages resulting from use of the site\n\nThe site provides information only and does not offer medical advice.",
      },
      {
        title: "5. Intellectual Property Rights",
        content: "All rights to the site, including design, logo, and content, are reserved by DawaMZ.",
      },
      {
        title: "6. The Site is Free",
        content: "The site is completely free with no:\n• Advertisements\n• Subscription fees\n• Any costs",
      },
      {
        title: "7. Changes to the Service",
        content: "We reserve the right to:\n• Modify or discontinue site features\n• Update these terms at any time\n• Terminate the service without prior notice",
      },
      {
        title: "8. Governing Law",
        content: "These terms are governed by the laws of the Kingdom of Morocco.",
      },
      {
        title: "9. Contact",
        content: "For questions about these terms, you can contact us via the contact page.",
      },
    ],
  },
};

type Lang = keyof typeof translations;

export default function Terms() {
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