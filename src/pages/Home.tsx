import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/language/useLanguage";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";
import styles from "../styles/pages-style/Home.module.css";

type Region = {
  id: string;
  slug: string;
  name: string;
  name_ar: string;
  name_en: string;
  image: string;
};

const translations = {
  ar: {
    heroTitle: "ابحث عن الصيدلية الأقرب إليك",
    heroSubtitle: "اعثر بسهولة على الصيدليات المفتوحة، صيدليات المناوبة، وصيدليات الليل القريبة منك.",
    heroTagline: "صيدليات مفتوحة · مناوبة · ليلية",
    autoTitle: "البحث التلقائي",
    autoDesc: "يحدد موقعك تلقائياً ويعرض الصيدليات القريبة",
    autoBadge: "تلقائي",
    manualTitle: "البحث اليدوي",
    manualDesc: "تصفح حسب المنطقة والمدينة",
    selectRegion: "اختر منطقتك",
  },
  fr: {
    heroTitle: "Trouvez la pharmacie ouverte la plus proche",
    heroSubtitle: "Trouvez facilement les pharmacies ouvertes, de garde et de nuit près de chez vous.",
    heroTagline: "Ouvertes · De garde · De nuit",
    autoTitle: "Localisation automatique",
    autoDesc: "Détecte votre position et affiche les pharmacies proches",
    autoBadge: "Auto",
    manualTitle: "Recherche manuelle",
    manualDesc: "Parcourir par région et ville",
    selectRegion: "Sélectionnez votre région",
  },
  en: {
    heroTitle: "Find the nearest open pharmacy",
    heroSubtitle: "Easily find open, on-call, and night pharmacies near you — anytime.",
    heroTagline: "Open · On-call · Night shifts",
    autoTitle: "Auto locate",
    autoDesc: "Detects your location and shows nearby pharmacies",
    autoBadge: "Auto",
    manualTitle: "Manual search",
    manualDesc: "Browse by region and city",
    selectRegion: "Select your region",
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegions, setShowRegions] = useState(false);
  const [closing, setClosing] = useState(false);
  const regionsRef = useRef<HTMLElement>(null);

  const text = translations[language] ?? translations.en;

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase.from("regions").select("*");
      if (!error && data) setRegions(data);
      setLoading(false);
    };
    fetchRegions();
  }, []);

  const getRegionName = (region: Region) => {
    if (language === "ar") return region.name_ar;
    if (language === "en") return region.name_en;
    return region.name;
  };

  const handleManualClick = () => {
    if (showRegions) {
      setClosing(true);
      setTimeout(() => {
        setShowRegions(false);
        setClosing(false);
      }, 280);
    } else {
      setShowRegions(true);
      setTimeout(() => {
        regionsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>

      {/* Hero */}
      <section className={styles.hero}>

        <img src={logo} alt="DawaMZ" className={styles.heroLogo} />

        <div className={styles.heroTextBlock}>
          <h1 className={styles.heroTitle}>{text.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{text.heroSubtitle}</p>
          <p className={styles.heroTagline}>{text.heroTagline}</p>
        </div>

        <div className={styles.optionCards}>

          {/* Auto */}
          <button className={styles.optionCard}>
            <div className={styles.optionLeft}>
              <div className={styles.optionIconWrap}>
                <i className="ion-ios-navigate" />
              </div>
              <div className={styles.optionText}>
                <div className={styles.optionTitleRow}>
                  <span className={styles.optionTitle}>{text.autoTitle}</span>
                  <span className={styles.autoBadge}>
                    <span className={styles.autoDot} />
                    {text.autoBadge}
                  </span>
                </div>
                <span className={styles.optionDesc}>{text.autoDesc}</span>
              </div>
            </div>
            <i className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.optionArrow}`} />
          </button>

          <div className={styles.optionDivider} />

          {/* Manual */}
          <button
            className={`${styles.optionCard} ${showRegions ? styles.optionCardActive : ""}`}
            onClick={handleManualClick}
          >
            <div className={styles.optionLeft}>
              <div className={`${styles.optionIconWrap} ${styles.optionIconManual}`}>
                <i className="ion-ios-map" />
              </div>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{text.manualTitle}</span>
                <span className={styles.optionDesc}>{text.manualDesc}</span>
              </div>
            </div>
            <i className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.optionArrow} ${showRegions ? styles.optionArrowActive : ""}`} />
          </button>

        </div>
      </section>

      {/* Regions */}
      {(showRegions || closing) && (
        <section
          ref={regionsRef}
          id="regions"
          className={`${styles.regionsSection} ${closing ? styles.regionsSectionOut : ""}`}
        >
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLine} />
            <h2 className={styles.sectionTitle}>{text.selectRegion}</h2>
            <span className={styles.sectionLine} />
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : (
            <div className={styles.grid}>
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={styles.regionCard}
                  onClick={() => navigate(`/${region.slug}`)}
                >
                  <div
                    className={styles.cardBg}
                    style={{ backgroundImage: `url(${region.image})` }}
                  />
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardAccent} />
                  <div className={styles.cardContent}>
                    <span className={styles.cardIconWrap}>
                      <i className="ion-ios-pin" />
                    </span>
                    <span className={styles.cardName}>
                      {getRegionName(region)}
                    </span>
                    <i className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}