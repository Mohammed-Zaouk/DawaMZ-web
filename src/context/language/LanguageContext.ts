import { createContext } from "react";

export type Language = "ar" | "fr" | "en";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  isRTL: true,
});