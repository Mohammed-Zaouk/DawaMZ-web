import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/language/useLanguage";
import { supabase } from "../services/supabase";
import { isOpenNow } from "../utils/isOpen";
import type { Schedule } from "../utils/isOpen";
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

type PharmacyRow = {
  city_id: string;
  open: boolean;
  is_on_call: boolean;
  is_night_pharmacy: boolean;
  duty_start: string | null;
  duty_end: string | null;
  schedule: Schedule | null;
};

type CityStats = {
  total: number;
  openCount: number;
};

const translations = {
  ar: {
    selectCity: "اختر مدينتك",
    citiesIn: "مدن منطقة",
    back: "رجوع",
    loading: "جاري التحميل...",
    notFound: "المنطقة غير موجودة",
    noCities: "لا توجد مدن في هذه المنطقة",
    open: "مفتوحة",
    pharmacies: "صيدلية",
  },
  fr: {
    selectCity: "Choisissez votre ville",
    citiesIn: "Villes de la région",
    back: "Retour",
    loading: "Chargement...",
    notFound: "Région introuvable",
    noCities: "Aucune ville dans cette région",
    open: "ouvertes",
    pharmacies: "pharmacies",
  },
  en: {
    selectCity: "Select your city",
    citiesIn: "Cities in",
    back: "Back",
    loading: "Loading...",
    notFound: "Region not found",
    noCities: "No cities in this region",
    open: "open",
    pharmacies: "pharmacies",
  },
};

export default function Cities() {
  const { regionSlug } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();

  const [region, setRegion] = useState<Region | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, CityStats>>({});
  const [loading, setLoading] = useState(true);

  const text = translations[language] ?? translations.en;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

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

      const { data: citiesData } = await supabase
        .from("cities")
        .select("*")
        .eq("region_id", regionData.id)
        .order("name", { ascending: true });

      const cityList = citiesData ?? [];
      setCities(cityList);

      if (cityList.length > 0) {
        const cityIds = cityList.map((c) => c.id);
        const { data: pharmacies } = await supabase
          .from("pharmacies")
          .select(
            "city_id, open, is_on_call, is_night_pharmacy, duty_start, duty_end, schedule",
          )
          .in("city_id", cityIds);

        const map: Record<string, CityStats> = {};
        for (const p of pharmacies ?? ([] as PharmacyRow[])) {
          if (!map[p.city_id]) map[p.city_id] = { total: 0, openCount: 0 };
          map[p.city_id].total += 1;
          const open =
            p.open !== false &&
            isOpenNow(
              p.schedule,
              p.is_on_call ?? false,
              p.duty_start ?? "",
              p.duty_end ?? "",
              p.is_night_pharmacy ?? false,
            );
          if (open) map[p.city_id].openCount += 1;
        }
        setStatsMap(map);
      }

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
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
            <span>{text.back}</span>
          </button>
          <div className={styles.bannerText}>
            <p className={styles.bannerLabel}>{text.citiesIn}</p>
            <h1 className={styles.bannerTitle}>{getRegionName(region)}</h1>
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
            {cities.map((city) => {
              const stats = statsMap[city.id] ?? { total: 0, openCount: 0 };
              return (
                <div
                  key={city.id}
                  className={styles.cityCard}
                  onClick={() => navigate(`/${regionSlug}/${city.slug}`)}
                >
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
                    <span className={styles.cardName}>{getCityName(city)}</span>

                    {/* Stats */}
                    {stats && (
                      <div className={styles.cardStats}>
                        <span className={styles.statTotal}>
                          <i className="ion-ios-medkit" />
                          {stats.total}
                        </span>
                        <span className={styles.statDivider}>·</span>
                        <span
                          className={styles.statOpen}
                          style={{
                            color: stats.openCount > 0 ? "#22c55e" : "#ef4444",
                          }}
                        >
                          <span
                            className={styles.statDot}
                            style={{
                              background:
                                stats.openCount > 0 ? "#22c55e" : "#ef4444",
                            }}
                          />
                          {stats.openCount} {text.open}
                        </span>
                      </div>
                    )}

                    <i
                      className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
