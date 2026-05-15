import type { Language } from "./LanguageContext";

const translations = {
  ar: {
    home: "الرئيسية",
    about: "حول",
    contact: "تواصل",
    tagline: "اعثر على صيدلية مفتوحة بالقرب منك",
    autoLocate: "تحديد موقعي",
    browseManual: "تصفح يدوياً",
    selectRegion: "اختر منطقتك",
    allRights: "جميع الحقوق محفوظة",
  },
  fr: {
    home: "Accueil",
    about: "À propos",
    contact: "Contact",
    tagline: "Trouvez une pharmacie ouverte près de vous",
    autoLocate: "Me localiser",
    browseManual: "Parcourir manuellement",
    selectRegion: "Choisissez votre région",
    allRights: "Tous droits réservés",
  },
  en: {
    home: "Home",
    about: "About",
    contact: "Contact",
    tagline: "Find an open pharmacy near you",
    autoLocate: "Auto locate",
    browseManual: "Browse manually",
    selectRegion: "Select your region",
    allRights: "All rights reserved",
  },
};

export const t = (language: Language) => translations[language];