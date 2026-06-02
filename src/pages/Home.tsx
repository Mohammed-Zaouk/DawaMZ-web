import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/language/useLanguage";
import { supabaseClient } from "../services/supabase";
import { isOpenNow } from "../utils/isOpen";
import { getUserLocation } from "../utils/location/getLocation";
import { calculateDistance } from "../utils/location/calculateDistance";
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

type Pharmacy = {
  id: string;
  slug: string;
  name: string;
  name_ar: string;
  latitude: number;
  longitude: number;
  is_on_call: boolean;
  is_night_pharmacy: boolean;
  duty_start: string | null;
  duty_end: string | null;
  schedule: unknown;
  city_id: string;
};

type PharmacyWithDist = Pharmacy & { dist: number };

const translations = {
  ar: {
    heroTitle: "ابحث عن الصيدلية الأقرب إليك",
    heroSubtitle:
      "اعثر بسهولة على الصيدليات المفتوحة، صيدليات المناوبة، وصيدليات الليل القريبة منك.",
    heroTagline: "صيدليات مفتوحة · مناوبة · ليلية",
    autoTitle: "البحث التلقائي",
    autoDesc: "يحدد موقعك تلقائياً ويعرض الصيدليات القريبة",
    autoBadge: "تلقائي",
    manualTitle: "البحث اليدوي",
    manualDesc: "تصفح حسب المنطقة والمدينة",
    selectRegion: "اختر منطقتك",
    locating: "جاري تحديد موقعك...",
    locationDenied: "لم يتم السماح بالوصول إلى الموقع",
    noPharmacyFound: "لم يتم العثور على صيدلية مفتوحة قريبة",
    foundPharmacy: (name: string, dist: string) =>
      `أقرب صيدلية: ${name} · ${dist}`,
    viewDetails: "عرض التفاصيل",
  },
  fr: {
    heroTitle: "Trouvez la pharmacie ouverte la plus proche",
    heroSubtitle:
      "Trouvez facilement les pharmacies ouvertes, de garde et de nuit près de chez vous.",
    heroTagline: "Ouvertes · De garde · De nuit",
    autoTitle: "Localisation automatique",
    autoDesc: "Détecte votre position et affiche les pharmacies proches",
    autoBadge: "Auto",
    manualTitle: "Recherche manuelle",
    manualDesc: "Parcourir par région et ville",
    selectRegion: "Sélectionnez votre région",
    locating: "Localisation en cours...",
    locationDenied: "Accès à la localisation refusé",
    noPharmacyFound: "Aucune pharmacie ouverte trouvée à proximité",
    foundPharmacy: (name: string, dist: string) =>
      `Plus proche: ${name} · ${dist}`,
    viewDetails: "Voir détails",
  },
  en: {
    heroTitle: "Find the nearest open pharmacy",
    heroSubtitle:
      "Easily find open, on-call, and night pharmacies near you — anytime.",
    heroTagline: "Open · On-call · Night shifts",
    autoTitle: "Auto locate",
    autoDesc: "Detects your location and shows nearby pharmacies",
    autoBadge: "Auto",
    manualTitle: "Manual search",
    manualDesc: "Browse by region and city",
    selectRegion: "Select your region",
    locating: "Locating you...",
    locationDenied: "Location access was denied",
    noPharmacyFound: "No open pharmacy found nearby",
    foundPharmacy: (name: string, dist: string) => `Nearest: ${name} · ${dist}`,
    viewDetails: "View details",
  },
};

type AutoState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "denied" }
  | { status: "not_found" }
  | {
      status: "found";
      pharmacy: Pharmacy;
      regionSlug: string;
      citySlug: string;
      distance: string;
      cityImage: string | null;
    };

export default function Home() {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegions, setShowRegions] = useState(false);
  const [closing, setClosing] = useState(false);
  const [autoState, setAutoState] = useState<AutoState>({ status: "idle" });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const regionsRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const langKey =
    (Object.keys(translations) as Array<keyof typeof translations>).find(
      (k) => language === k || language?.startsWith(k),
    ) ?? "en";
  const text = translations[langKey];

  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabaseClient.from("regions").select("*");
      if (!error && data) setRegions(data);
      setLoading(false);
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getRegionName = (region: Region) => {
    if (language === "ar") return region.name_ar;
    if (language === "en") return region.name_en;
    return region.name;
  };

  const getPharmacyName = (p: Pharmacy) =>
    language === "ar" ? p.name_ar : p.name;

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

  const handleAutoClick = async () => {
    setAutoState({ status: "locating" });

    const loc = await getUserLocation();
    if (!loc) {
      setAutoState({ status: "denied" });
      return;
    }

    const { data: allPharmacies } = await supabaseClient
      .from("pharmacies")
      .select(
        "id, slug, name, name_ar, latitude, longitude, is_on_call, is_night_pharmacy, duty_start, duty_end, schedule, city_id",
      );

    if (!allPharmacies || allPharmacies.length === 0) {
      setAutoState({ status: "not_found" });
      return;
    }

    const openWithDistance = (allPharmacies as Pharmacy[])
      .filter((p: Pharmacy) =>
        isOpenNow(
          p.schedule as Parameters<typeof isOpenNow>[0],
          p.is_on_call ?? false,
          p.duty_start ?? "",
          p.duty_end ?? "",
          p.is_night_pharmacy ?? false,
        ),
      )
      .map((p: Pharmacy) => ({
        ...p,
        dist: calculateDistance(
          loc.latitude,
          loc.longitude,
          p.latitude,
          p.longitude,
        ),
      }))
      .sort((a: PharmacyWithDist, b: PharmacyWithDist) => a.dist - b.dist);

    if (openWithDistance.length === 0) {
      setAutoState({ status: "not_found" });
      return;
    }

    const nearest = openWithDistance[0] as PharmacyWithDist;

    const { data: cityData } = await supabaseClient
      .from("cities")
      .select("id, slug, region_id, image")
      .eq("id", nearest.city_id)
      .single();

    if (!cityData) {
      setAutoState({ status: "not_found" });
      return;
    }

    const { data: regionData } = await supabaseClient
      .from("regions")
      .select("slug")
      .eq("id", cityData.region_id)
      .single();

    if (!regionData) {
      setAutoState({ status: "not_found" });
      return;
    }

    const distStr =
      nearest.dist < 1
        ? `${Math.round(nearest.dist * 1000)} m`
        : `${nearest.dist.toFixed(1)} km`;

    setAutoState({
      status: "found",
      pharmacy: nearest,
      regionSlug: regionData.slug,
      citySlug: cityData.slug,
      distance: distStr,
      cityImage: cityData.image ?? null,
    });

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      <section className={styles.hero}>
        <img src={logo} alt="DawaMZ" className={styles.heroLogo} />

        <div className={styles.heroTextBlock}>
          <h1 className={styles.heroTitle}>{text.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{text.heroSubtitle}</p>
          <p className={styles.heroTagline}>{text.heroTagline}</p>
        </div>

        <div className={styles.optionCards}>
          {/* Auto */}
          <button
            className={`${styles.optionCard} ${autoState.status === "found" ? styles.optionCardActive : ""}`}
            onClick={handleAutoClick}
            disabled={autoState.status === "locating"}
          >
            <div className={styles.optionLeft}>
              <div className={styles.optionIconWrap}>
                {autoState.status === "locating" ? (
                  <span className={styles.spinner} />
                ) : (
                  <i className="ion-ios-navigate" />
                )}
              </div>
              <div className={styles.optionText}>
                <div className={styles.optionTitleRow}>
                  <span className={styles.optionTitle}>{text.autoTitle}</span>
                  <span className={styles.autoBadge}>
                    <span className={styles.autoDot} />
                    {text.autoBadge}
                  </span>
                </div>
                <span className={styles.optionDesc}>
                  {autoState.status === "locating"
                    ? text.locating
                    : autoState.status === "denied"
                      ? text.locationDenied
                      : autoState.status === "not_found"
                        ? text.noPharmacyFound
                        : autoState.status === "found"
                          ? text.foundPharmacy(
                              getPharmacyName(autoState.pharmacy),
                              autoState.distance,
                            )
                          : text.autoDesc}
                </span>
              </div>
            </div>
            <i
              className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.optionArrow} ${autoState.status === "found" ? styles.optionArrowActive : ""}`}
            />
          </button>

          {/* Result card */}
          {autoState.status === "found" && (
            <div ref={resultRef} className={styles.resultCard}>
              <div className={styles.resultInfo}>
                <span className={styles.resultDot} />
                <div className={styles.resultText}>
                  <span className={styles.resultName}>
                    {getPharmacyName(autoState.pharmacy)}
                  </span>
                  <span className={styles.resultDist}>
                    {autoState.distance}
                  </span>
                </div>
              </div>
              <button
                className={styles.resultBtn}
                onClick={() => {
                  const dest = autoState.pharmacy.slug ?? autoState.pharmacy.id;
                  navigate(
                    `/${autoState.regionSlug}/${autoState.citySlug}/${dest}`,
                    { state: { cityImage: autoState.cityImage } }, // add this
                  );
                }}
              >
                <span>{text.viewDetails}</span>
                <i className={`ion-ios-arrow-${isRTL ? "back" : "forward"}`} />
              </button>
            </div>
          )}

          {/* Status cards for denied / not found */}
          {(autoState.status === "denied" ||
            autoState.status === "not_found") && (
            <div className={styles.statusCard}>
              <i
                className={
                  autoState.status === "denied"
                    ? "ion-ios-locate"
                    : "ion-ios-medkit"
                }
              />
              <span>
                {autoState.status === "denied"
                  ? text.locationDenied
                  : text.noPharmacyFound}
              </span>
            </div>
          )}

          <div className={styles.optionDivider} />

          {/* Manual */}
          <button
            className={`${styles.optionCard} ${showRegions ? styles.optionCardActive : ""}`}
            onClick={handleManualClick}
          >
            <div className={styles.optionLeft}>
              <div
                className={`${styles.optionIconWrap} ${styles.optionIconManual}`}
              >
                <i className="ion-ios-map" />
              </div>
              <div className={styles.optionText}>
                <span className={styles.optionTitle}>{text.manualTitle}</span>
                <span className={styles.optionDesc}>{text.manualDesc}</span>
              </div>
            </div>
            <i
              className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.optionArrow} ${showRegions ? styles.optionArrowActive : ""}`}
            />
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
                    <i
                      className={`ion-ios-arrow-${isRTL ? "back" : "forward"} ${styles.cardArrow}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Scroll to top button — small screens only */}
      <button
        className={`${styles.scrollTopBtn} ${showScrollTop ? styles.scrollTopBtnVisible : ""}`}
        onClick={handleScrollTop}
        aria-label="Scroll to top"
      >
        <i className="ion-ios-arrow-up" />
      </button>
    </div>
  );
}
