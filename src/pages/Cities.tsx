import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/language/useLanguage";
import { supabase } from "../services/supabase";
import styles from "../styles/pages-style/Cities.module.css";

type Region = {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  image: string;
  slug: string;
};

type City = {
  id: string;
  name: string;
  name_ar: string;
  image: string;
  region_id: string;
  slug: string;
};

const translations = {
  ar: {
    selectCity: "اختر مدينتك",
    citiesIn: "مدن منطقة",
    back: "رجوع",
    loading: "جاري التحميل...",
    notFound: "المنطقة غير موجودة",
    noCities: "لا توجد مدن في هذه المنطقة",
  },
  fr: {
    selectCity: "Choisissez votre ville",
    citiesIn: "Villes de la région",
    back: "Retour",
    loading: "Chargement...",
    notFound: "Région introuvable",
    noCities: "Aucune ville dans cette région",
  },
  en: {
    selectCity: "Select your city",
    citiesIn: "Cities in",
    back: "Back",
    loading: "Loading...",
    notFound: "Region not found",
    noCities: "No cities in this region",
  },
};

export default function Cities() {
  const { regionSlug } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();

  const [region, setRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const text = translations[language] ?? translations.en;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      // fetch region by slug
      const { data: regionData } = await supabase
        .from("regions")
        .select("*")
        .eq("slug", regionSlug)
        .single();

      if (!regionData) {
        setLoading(false);
        return;
      }

      setRegion(regionData);

      // fetch cities for this region
      const { data: citiesData } = await supabase
        .from("cities")
        .select("*")
        .eq("region_id", regionData.id)
        .order("name", { ascending: true });

      setCities(citiesData ?? []);
      setLoading(false);
    };

    fetch();
  }, [regionSlug]);

  const getRegionName = (r: Region) => {
    if (language === "ar") return r.name_ar;
    if (language === "en") return r.name_en;
    return r.name;
  };

  const getCityName = (c: City) => {
    if (language === "ar") return c.name_ar;
    return c.name;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (!region) {
    return (
      <div className={styles.notFound} dir={isRTL ? "rtl" : "ltr"}>
        <i className="ion-ios-map" />
        <p>{text.notFound}</p>
      </div>
    );
  }

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>

      {/* Region hero banner */}
      <div className={styles.regionBanner}>
        <div
          className={styles.bannerBg}
          style={{ backgroundImage: `url(${region.image})` }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
          >
            <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
            <span>{text.back}</span>
          </button>
          <div className={styles.bannerText}>
            <p className={styles.bannerLabel}>
              {text.citiesIn}
            </p>
            <h1 className={styles.bannerTitle}>
              {getRegionName(region)}
            </h1>
          </div>
        </div>
      </div>

      {/* Cities section */}
      <section className={styles.citiesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>{text.selectCity}</h2>
          <span className={styles.sectionLine} />
        </div>

        {cities.length === 0 ? (
          <div className={styles.empty}>
            <i className="ion-ios-locate" />
            <p>{text.noCities}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {cities.map((city) => (
              <div
                key={city.id}
                className={styles.cityCard}
                onClick={() => navigate(`/${regionSlug}/${city.slug}`)}
              >
                {/* City image bg */}
                {city.image && (
                  <div
                    className={styles.cardBg}
                    style={{ backgroundImage: `url(${city.image})` }}
                  />
                )}
                <div className={styles.cardOverlay} />
                <div className={styles.cardAccent} />
                <div className={styles.cardContent}>
                  <span className={styles.cardIconWrap}>
                    <i className="ion-ios-pin" />
                  </span>
                  <span className={styles.cardName}>
                    {getCityName(city)}
                  </span>
                  <i className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}