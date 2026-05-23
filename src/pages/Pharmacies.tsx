import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/language/useLanguage";
import { supabaseClient } from "../services/supabase";
import { isOpenNow, getScheduleStatus } from "../utils/isOpen";
import type { Schedule, ScheduleStatus } from "../utils/isOpen";
import styles from "../styles/pages-style/Pharmacies.module.css";

type Pharmacy = {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number;
  is_night_pharmacy: boolean;
  is_on_call: boolean;
  duty_start: string | null;
  duty_end: string | null;
  schedule: Schedule | null;
  slug: string;
  city_id: string;
};

type City = {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  region_id: string;
  image?: string | null;
};

const ITEMS_PER_PAGE = 12;

const translations = {
  ar: {
    back: "رجوع",
    pharmaciesIn: "صيدليات مدينة",
    openNow: "مفتوحة الآن",
    closingSoon: (t: number) => `يغلق خلال ${t} دقيقة`,
    lunchBreak: "استراحة الغداء",
    lunchReopens: (t: string) => `يعيد الفتح · ${t}`,
    alwaysOpen: "مفتوح 24 ساعة",
    night: "ليلية",
    onCall: "مناوبة",
    noPharmacies: "لا توجد صيدليات مفتوحة",
    noPharmaciesSub: "لا توجد صيدليات مفتوحة حالياً في هذه المدينة",
    noNightPharmacies: "لا توجد صيدليات ليلية مفتوحة",
    noNightPharmaciesSub: "لا توجد صيدليات ليلية مفتوحة حالياً في هذه المدينة",
    noOnCallPharmacies: "لا توجد صيدليات مناوبة مفتوحة",
    noOnCallPharmaciesSub:
      "لا توجد صيدليات مناوبة مفتوحة حالياً في هذه المدينة",
    notFound: "المدينة غير موجودة",
    filterAll: "الكل",
    filterNight: "ليلية",
    filterOnCall: "مناوبة",
    searchPlaceholder: "ابحث عن صيدلية...",
    viewDetails: "عرض التفاصيل",
    tomorrow: "غداً",
    opensAt: (day: string, t: string) => `يفتح ${day} · ${t}`,
    dutyStartsOn: (s: string) => `تبدأ المناوبة: ${s}`,
    noPhone: "رقم الهاتف غير متوفر",
    noAddress: "العنوان غير متوفر",
    page: "صفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
    showing: (from: number, to: number, total: number) =>
      `عرض ${from}–${to} من ${total} صيدلية`,
    notFoundSearch: "لم نجد صيدلية بهذا الاسم",
    notFoundSearchSub: "هل أنت متأكد من الاسم؟ يمكنك اقتراحها لإضافتها.",
    suggestBtn: "اقتراح صيدلية",
    metaTitle: (city: string) => `صيدليات مدينة ${city} | DawaMZ`,
    metaDesc: (city: string) =>
      `اعثر على أقرب صيدلية مفتوحة الآن في مدينة ${city}`,
  },
  fr: {
    back: "Retour",
    pharmaciesIn: "Pharmacies de",
    openNow: "Ouvert maintenant",
    closingSoon: (t: number) => `Ferme dans ${t} min`,
    lunchBreak: "Pause déjeuner",
    lunchReopens: (t: string) => `Réouvre à ${t}`,
    alwaysOpen: "Ouvert 24h/24",
    night: "Nuit",
    onCall: "Garde",
    noPharmacies: "Aucune pharmacie ouverte",
    noPharmaciesSub:
      "Aucune pharmacie n'est ouverte en ce moment dans cette ville",
    noNightPharmacies: "Aucune pharmacie de nuit ouverte",
    noNightPharmaciesSub:
      "Aucune pharmacie de nuit n'est ouverte en ce moment dans cette ville",
    noOnCallPharmacies: "Aucune pharmacie de garde ouverte",
    noOnCallPharmaciesSub:
      "Aucune pharmacie de garde n'est ouverte en ce moment dans cette ville",
    notFound: "Ville introuvable",
    filterAll: "Toutes",
    filterNight: "Nuit",
    filterOnCall: "Garde",
    searchPlaceholder: "Rechercher une pharmacie...",
    viewDetails: "Voir détails",
    tomorrow: "demain",
    opensAt: (day: string, t: string) => `Ouvre ${day} à ${t}`,
    dutyStartsOn: (s: string) => `Garde commence: ${s}`,
    noPhone: "Numéro non disponible",
    noAddress: "Adresse non disponible",
    page: "Page",
    of: "sur",
    previous: "Précédent",
    next: "Suivant",
    showing: (from: number, to: number, total: number) =>
      `Affichage de ${from}–${to} sur ${total} pharmacies`,
    notFoundSearch: "Aucune pharmacie trouvée",
    notFoundSearchSub: "Vous êtes sûr du nom ? Suggérez-la pour l'ajouter.",
    suggestBtn: "Suggérer une pharmacie",
    metaTitle: (city: string) => `Pharmacies de ${city} | DawaMZ`,
    metaDesc: (city: string) =>
      `Trouvez la pharmacie ouverte la plus proche à ${city}`,
  },
  en: {
    back: "Back",
    pharmaciesIn: "Pharmacies in",
    openNow: "Open now",
    closingSoon: (t: number) => `Closes in ${t} min`,
    lunchBreak: "Lunch break",
    lunchReopens: (t: string) => `Reopens at ${t}`,
    alwaysOpen: "Open 24 hours",
    night: "Night",
    onCall: "On Call",
    noPharmacies: "No open pharmacies",
    noPharmaciesSub: "No pharmacies are currently open in this city",
    noNightPharmacies: "No open night pharmacies",
    noNightPharmaciesSub: "No night pharmacies are currently open in this city",
    noOnCallPharmacies: "No open on-call pharmacies",
    noOnCallPharmaciesSub:
      "No on-call pharmacies are currently open in this city",
    notFound: "City not found",
    filterAll: "All",
    filterNight: "Night",
    filterOnCall: "On Call",
    searchPlaceholder: "Search pharmacies...",
    viewDetails: "View details",
    tomorrow: "tomorrow",
    opensAt: (day: string, t: string) => `Opens ${day} · ${t}`,
    dutyStartsOn: (s: string) => `On call starts: ${s}`,
    noPhone: "Phone number unavailable",
    noAddress: "Address unavailable",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    showing: (from: number, to: number, total: number) =>
      `Showing ${from}–${to} of ${total} pharmacies`,
    notFoundSearch: "No pharmacy found",
    notFoundSearchSub: "Sure of the name? You can suggest adding it.",
    suggestBtn: "Suggest a pharmacy",
    metaTitle: (city: string) => `Pharmacies in ${city} | DawaMZ`,
    metaDesc: (city: string) =>
      `Find the nearest open pharmacy in ${city} right now`,
  },
};

const formatDate = (dateStr: string, language: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "short" },
  );
};

export default function Pharmacies() {
  const { regionSlug, citySlug } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();

  const [city, setCity] = useState<City | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "night" | "oncall">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const text = translations[language] ?? translations.en;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: cityData } = await supabaseClient
        .from("cities")
        .select("*")
        .eq("slug", citySlug)
        .single();

      if (!cityData) {
        setLoading(false);
        return;
      }
      setCity(cityData);

      const { data: pharmaData } = await supabaseClient
        .from("pharmacies")
        .select("*")
        .eq("city_id", cityData.id);

      const openOnly = (pharmaData ?? []).filter((p) =>
        isOpenNow(
          p.schedule,
          p.is_on_call ?? false,
          p.duty_start ?? "",
          p.duty_end ?? "",
          p.is_night_pharmacy ?? false,
        ),
      );

      setPharmacies(openOnly);
      setLoading(false);
    };

    fetchData();
  }, [citySlug]);

  const getName = (p: Pharmacy) => (language === "ar" ? p.name_ar : p.name);
  const getAddress = (p: Pharmacy) =>
    language === "ar" ? p.address_ar : p.address;

  const getBadge = (p: Pharmacy) => {
    const status = getScheduleStatus(
      p.schedule,
      p.is_on_call ?? false,
      p.duty_start ?? "",
      p.duty_end ?? "",
      p.is_night_pharmacy ?? false,
    );
    if (status.type === "open" && status.closingSoon)
      return {
        label: text.closingSoon(status.minsLeft),
        color: "#d97706",
        dot: "#f59e0b",
      };
    if (status.type === "lunch_break")
      return { label: text.lunchBreak, color: "#d97706", dot: "#f59e0b" };
    if (status.type === "always_open")
      return { label: text.alwaysOpen, color: "#22c55e", dot: "#22c55e" };
    return { label: text.openNow, color: "#22c55e", dot: "#22c55e" };
  };

  const getScheduleRow = (p: Pharmacy) => {
    const status: ScheduleStatus = getScheduleStatus(
      p.schedule,
      p.is_on_call ?? false,
      p.duty_start ?? "",
      p.duty_end ?? "",
      p.is_night_pharmacy ?? false,
    );
    switch (status.type) {
      case "always_open":
        return {
          label: text.alwaysOpen,
          color: "#22c55e",
          icon: "ion-ios-time",
        };
      case "open":
        if (status.closingSoon)
          return {
            label: text.closingSoon(status.minsLeft),
            color: "#d97706",
            icon: "ion-ios-time",
          };
        return {
          label: status.nextSlot
            ? `${status.slot.open} — ${status.slot.close} · ${status.nextSlot.open} — ${status.nextSlot.close}`
            : `${status.slot.open} — ${status.slot.close}`,
          color: "var(--subtext)",
          icon: "ion-ios-time",
        };
      case "lunch_break":
        return {
          label: text.lunchReopens(status.reopensAt),
          color: "#d97706",
          icon: "ion-ios-restaurant",
        };
      case "closed":
        if (status.opensDay === "duty")
          return {
            label: text.dutyStartsOn(formatDate(status.opensAt, language)),
            color: "#7c3aed",
            icon: "ion-ios-calendar",
          };
        return {
          label: text.opensAt(
            status.opensDay === "tomorrow" ? text.tomorrow : status.opensDay,
            status.opensAt,
          ),
          color: "#ef4444",
          icon: "ion-ios-time",
        };
      default:
        return { label: "—", color: "var(--subtext)", icon: "ion-ios-time" };
    }
  };

  const getWarningBanner = (p: Pharmacy): string | null => {
    const status = getScheduleStatus(
      p.schedule,
      p.is_on_call ?? false,
      p.duty_start ?? "",
      p.duty_end ?? "",
      p.is_night_pharmacy ?? false,
    );
    if (status.type === "open" && status.closingSoon && status.nextSlot)
      return text.lunchReopens(status.nextSlot.open);
    return null;
  };

  const filtered = pharmacies
    .filter((p) => {
      if (filter === "night") return p.is_night_pharmacy;
      if (filter === "oncall") return p.is_on_call;
      return true;
    })
    .filter(
      (p) =>
        getName(p).toLowerCase().includes(search.toLowerCase()) ||
        getAddress(p).toLowerCase().includes(search.toLowerCase()),
    );

  // Resolve empty state content based on search + filter
  const getEmptyState = () => {
    if (search.length > 0) {
      return {
        icon: "ion-ios-search",
        title: text.notFoundSearch,
        sub: text.notFoundSearchSub,
        showSuggest: true,
      };
    }
    if (filter === "night") {
      return {
        icon: "ion-ios-moon",
        title: text.noNightPharmacies,
        sub: text.noNightPharmaciesSub,
        showSuggest: false,
      };
    }
    if (filter === "oncall") {
      return {
        icon: "ion-ios-pulse",
        title: text.noOnCallPharmacies,
        sub: text.noOnCallPharmaciesSub,
        showSuggest: false,
      };
    }
    return {
      icon: "ion-ios-medkit",
      title: text.noPharmacies,
      sub: text.noPharmaciesSub,
      showSuggest: false,
    };
  };

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const showingFrom =
    filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingTo = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build page number array with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.skeletonBanner} />
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className={styles.notFound} dir={isRTL ? "rtl" : "ltr"}>
        <i className="ion-ios-locate" />
        <p>{text.notFound}</p>
      </div>
    );
  }

  const emptyState = getEmptyState();

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      <Helmet>
        <title>
          {text.metaTitle(language === "ar" ? city.name_ar : city.name)}
        </title>
        <meta
          name="description"
          content={text.metaDesc(language === "ar" ? city.name_ar : city.name)}
        />
        <meta
          property="og:title"
          content={text.metaTitle(language === "ar" ? city.name_ar : city.name)}
        />
        <meta
          property="og:description"
          content={text.metaDesc(language === "ar" ? city.name_ar : city.name)}
        />
        {city.image && <meta property="og:image" content={city.image} />}
      </Helmet>
      {/* Banner */}
      <div className={styles.banner}>
        {city.image && (
          <div
            className={styles.bannerBg}
            style={{ backgroundImage: `url(${city.image})` }}
          />
        )}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
            <span>{text.back}</span>
          </button>
          <div className={styles.bannerText}>
            <p className={styles.bannerLabel}>{text.pharmaciesIn}</p>
            <h1 className={styles.bannerTitle}>
              {language === "ar" ? city.name_ar : city.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <i className="ion-ios-search" />
          <input
            type="text"
            placeholder={text.searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
            dir={isRTL ? "rtl" : "ltr"}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              <i className="ion-ios-close" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {(["all", "night", "oncall"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setCurrentPage(1);
            }}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
          >
            {f === "all"
              ? text.filterAll
              : f === "night"
                ? text.filterNight
                : text.filterOnCall}
          </button>
        ))}
      </div>

      {/* Grid */}
      <section className={styles.listSection}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIconWrap}>
              <i className={emptyState.icon} />
            </div>
            <p className={styles.emptyTitle}>{emptyState.title}</p>
            <p className={styles.emptySub}>{emptyState.sub}</p>
            {emptyState.showSuggest && (
              <a
                href="mailto:contact@dawamz.com?subject=Suggestion pharmacie"
                className={styles.emptySuggest}
              >
                <i className="ion-ios-add-circle-outline" />
                <span>{text.suggestBtn}</span>
              </a>
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {paginatedItems.map((pharmacy) => {
                const badge = getBadge(pharmacy);
                const scheduleRow = getScheduleRow(pharmacy);
                const warningBanner = getWarningBanner(pharmacy);
                const address = getAddress(pharmacy);
                const showDutyPeriod =
                  (pharmacy.is_on_call || pharmacy.is_night_pharmacy) &&
                  pharmacy.duty_start &&
                  pharmacy.duty_end &&
                  pharmacy.duty_start !== "24h";

                return (
                  <div key={pharmacy.id} className={styles.card}>
                    {/* ── Header: badge left, pills + name right ── */}
                    <div className={styles.cardHeader}>
                      <div
                        className={styles.statusBadge}
                        style={{ color: badge.color }}
                      >
                        <span
                          className={styles.statusDot}
                          style={{ background: badge.dot }}
                        />
                        <span>{badge.label}</span>
                      </div>
                      <div className={styles.titleRow}>
                        {pharmacy.is_night_pharmacy && (
                          <span className={styles.pillNight}>{text.night}</span>
                        )}
                        {pharmacy.is_on_call && (
                          <span className={styles.pillOnCall}>
                            {text.onCall}
                          </span>
                        )}
                        <h3 className={styles.cardName}>{getName(pharmacy)}</h3>
                      </div>
                    </div>

                    <div className={styles.cardDivider} />

                    {/* ── Info block 1: address + phone ── */}
                    <div className={styles.infoBlock}>
                      <div className={styles.cardRow}>
                        <span
                          className={`${styles.cardAddress} ${!address ? styles.muted : ""}`}
                        >
                          {address || text.noAddress}
                        </span>
                        <div className={styles.iconWrap}>
                          <i className="ion-ios-pin" />
                        </div>
                      </div>
                      <div className={styles.cardRow}>
                        <span
                          className={`${styles.cardPhone} ${!pharmacy.phone ? styles.muted : ""}`}
                        >
                          {pharmacy.phone || text.noPhone}
                        </span>
                        <div className={styles.iconWrap}>
                          <i className="ion-ios-call" />
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardDivider} />

                    {/* ── Info block 2: schedule data ── */}
                    <div className={styles.infoBlock}>
                      {showDutyPeriod && (
                        <div className={styles.cardRow}>
                          <span className={styles.dutyText}>
                            {formatDate(pharmacy.duty_start!, language)} —{" "}
                            {formatDate(pharmacy.duty_end!, language)}
                          </span>
                          <div className={styles.iconWrapPurple}>
                            <i className="ion-ios-calendar" />
                          </div>
                        </div>
                      )}

                      <div className={styles.cardRow}>
                        <span
                          className={styles.scheduleText}
                          style={{ color: scheduleRow.color }}
                        >
                          {scheduleRow.label}
                        </span>
                        <div
                          className={styles.iconWrap}
                          style={{ background: "var(--scheduleAlwaysOpenBg)" }}
                        >
                          <i
                            className={scheduleRow.icon}
                            style={{ color: scheduleRow.color }}
                          />
                        </div>
                      </div>

                      {warningBanner && (
                        <div className={styles.warningBanner}>
                          <span className={styles.warningText}>
                            {warningBanner}
                          </span>
                          <i className="ion-ios-information-circle" />
                        </div>
                      )}
                    </div>

                    {/* ── Detail button ── */}
                    <button
                      className={styles.detailBtn}
                      onClick={() => {
                        const dest = pharmacy.slug ?? pharmacy.id;
                        navigate(`/${regionSlug}/${citySlug}/${dest}`, {
                          state: { cityImage: city?.image },
                        });
                      }}
                    >
                      <span>{text.viewDetails}</span>
                      <i
                        className={`ion-ios-arrow-${isRTL ? "back" : "forward"}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <p className={styles.paginationInfo}>
                  {text.showing(showingFrom, showingTo, filtered.length)}
                </p>
                <div className={styles.paginationControls}>
                  <button
                    className={`${styles.pageBtn} ${styles.pageBtnNav}`}
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label={text.previous}
                  >
                    <i
                      className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`}
                    />
                  </button>

                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className={styles.pageEllipsis}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${currentPage === p ? styles.pageBtnActive : ""}`}
                        onClick={() => goToPage(p as number)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    className={`${styles.pageBtn} ${styles.pageBtnNav}`}
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label={text.next}
                  >
                    <i
                      className={`ion-ios-arrow-${isRTL ? "back" : "forward"}`}
                    />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
