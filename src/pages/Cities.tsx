import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/language/useLanguage";
import { supabaseClient } from "../services/supabase";
import { isOpenNow } from "../utils/isOpen";
import type { Schedule } from "../utils/isOpen";
import styles from "../styles/pages-style/Cities.module.css";

/* Types */
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

/* Page i18n */
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
    metaTitle: (region: string) => `مدن منطقة ${region} | DawaMZ`,
    metaDesc: (region: string) =>
      `اعثر على أقرب صيدلية مفتوحة في مدن منطقة ${region}`,
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
    metaTitle: (region: string) => `Villes de la région ${region} | DawaMZ`,
    metaDesc: (region: string) =>
      `Trouvez la pharmacie ouverte la plus proche dans la région ${region}`,
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
    metaTitle: (region: string) => `Cities in ${region} | DawaMZ`,
    metaDesc: (region: string) => `Find the nearest open pharmacy in ${region}`,
  },
};

/* Modal i18n */
const suggestTx = {
  ar: {
    suggest: "اقترح مدينة",
    modalTitle: "اقتراح مدينة جديدة",
    modalSubtitle: "ساعدنا في توسيع التغطية",
    cityNameFr: "الاسم بالفرنسية",
    cityNameFrPh: "مثال: Tinghir",
    cityNameAr: "الاسم بالعربية",
    cityNameArPh: "مثال: تنغير",
    region: "المنطقة",
    regionPh: "اختر المنطقة…",
    regionsLoading: "جارٍ تحميل المناطق…",
    note: "ملاحظات",
    notePh: "أي معلومات إضافية مفيدة…",
    cancel: "إلغاء",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    rateLimitMsg:
      "للحد من الإرسال المتكرر، يُسمح بـ اقتراحَين كل 24 ساعة مع انتظار 10 دقائق بين كل إرسال.",
    successTitle: "شكراً لك!",
    successDesc: "تم استلام اقتراحك وسنراجعه قريباً.",
    blockedDailyTitle: "وصلت إلى الحد اليومي",
    blockedDailyDesc: "يمكنك إرسال اقتراحَين كحد أقصى كل 24 ساعة. جرّب لاحقاً.",
    blockedCooldownTitle: "انتظر قليلاً",
    blockedCooldownDesc: "يجب الانتظار 10 دقائق بين كل اقتراح. الوقت المتبقي:",
    requiredName: "الاسم بالفرنسية مطلوب",
    requiredRegion: "يرجى اختيار المنطقة",
    close: "إغلاق",
  },
  fr: {
    suggest: "Suggérer une ville",
    modalTitle: "Suggérer une nouvelle ville",
    modalSubtitle: "Aidez-nous à améliorer la couverture",
    cityNameFr: "Nom (français)",
    cityNameFrPh: "Ex : Tinghir",
    cityNameAr: "Nom (arabe)",
    cityNameArPh: "مثال: تنغير",
    region: "Région",
    regionPh: "Choisir une région…",
    regionsLoading: "Chargement des régions…",
    note: "Remarques",
    notePh: "Toute information utile supplémentaire…",
    cancel: "Annuler",
    send: "Envoyer",
    sending: "Envoi…",
    rateLimitMsg:
      "Pour éviter les abus, vous êtes limité à 2 suggestions par 24 h, avec un délai de 10 min entre chaque envoi.",
    successTitle: "Merci !",
    successDesc:
      "Votre suggestion a été reçue. Nous la traiterons prochainement.",
    blockedDailyTitle: "Limite journalière atteinte",
    blockedDailyDesc:
      "Vous pouvez envoyer au maximum 2 suggestions par 24 h. Réessayez plus tard.",
    blockedCooldownTitle: "Patientez un moment",
    blockedCooldownDesc:
      "Un délai de 10 min est requis entre chaque suggestion. Temps restant :",
    requiredName: "Le nom (français) est requis",
    requiredRegion: "Veuillez sélectionner une région",
    close: "Fermer",
  },
  en: {
    suggest: "Suggest a city",
    modalTitle: "Suggest a new city",
    modalSubtitle: "Help us expand coverage",
    cityNameFr: "Name (French)",
    cityNameFrPh: "e.g. Tinghir",
    cityNameAr: "Name (Arabic)",
    cityNameArPh: "مثال: تنغير",
    region: "Region",
    regionPh: "Select a region…",
    regionsLoading: "Loading regions…",
    note: "Notes",
    notePh: "Any additional helpful information…",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending…",
    rateLimitMsg:
      "To prevent spam, you can submit up to 2 suggestions every 24 hours, with a 10-minute cooldown between each submission.",
    successTitle: "Thank you!",
    successDesc: "Your suggestion has been received. We'll review it soon.",
    blockedDailyTitle: "Daily limit reached",
    blockedDailyDesc:
      "You can send at most 2 suggestions every 24 hours. Please try again later.",
    blockedCooldownTitle: "Please wait a moment",
    blockedCooldownDesc:
      "A 10-minute cooldown is required between suggestions. Time remaining:",
    requiredName: "City name (French) is required",
    requiredRegion: "Please select a region",
    close: "Close",
  },
};

/* Rate-limit helpers */
const RL_KEY = "dawamz_suggest_rl";
const MAX_PER_DAY = 2;
const COOLDOWN_MS = 10 * 60 * 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface RLRecord {
  timestamps: number[];
}

type RLStatus =
  | { allowed: true }
  | { allowed: false; reason: "daily"; resetAt: number }
  | { allowed: false; reason: "cooldown"; unlocksAt: number };

function readRL(): RLRecord {
  try {
    const raw = localStorage.getItem(RL_KEY);
    if (raw) return JSON.parse(raw) as RLRecord;
  } catch {
    /* ignore */
  }
  return { timestamps: [] };
}

function writeRL(rec: RLRecord) {
  localStorage.setItem(RL_KEY, JSON.stringify(rec));
}

function checkRL(): RLStatus {
  const now = Date.now();
  const rec = readRL();
  const recent = rec.timestamps.filter((ts) => now - ts < WINDOW_MS);
  writeRL({ timestamps: recent });

  if (recent.length >= MAX_PER_DAY) {
    return {
      allowed: false,
      reason: "daily",
      resetAt: Math.min(...recent) + WINDOW_MS,
    };
  }
  if (recent.length > 0) {
    const last = Math.max(...recent);
    if (now - last < COOLDOWN_MS) {
      return {
        allowed: false,
        reason: "cooldown",
        unlocksAt: last + COOLDOWN_MS,
      };
    }
  }
  return { allowed: true };
}

function recordSubmission() {
  const rec = readRL();
  rec.timestamps.push(Date.now());
  writeRL(rec);
}

function fmtCountdown(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* Suggest city modal */
function SuggestCityModal({
  defaultRegionId,
  language,
  isRTL,
}: {
  defaultRegionId: string;
  language: "ar" | "fr" | "en";
  isRTL: boolean;
}) {
  const tx = suggestTx[language] ?? suggestTx.en;

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success" | "blocked">("form");

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [regionId, setRegionId] = useState(defaultRegionId);
  const [note, setNote] = useState("");

  const [nameError, setNameError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const [rlStatus, setRlStatus] = useState<RLStatus>({ allowed: true });
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((unlocksAt: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(unlocksAt - Date.now());
    timerRef.current = setInterval(() => {
      const remaining = unlocksAt - Date.now();
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setCountdown(0);
        setRlStatus({ allowed: true });
        setStep("form");
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }, []);

  /* Lock body scroll while modal is open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Cleanup timer on unmount */
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  /* Fetch all regions once when modal first opens */
  const fetchRegions = useCallback(async () => {
    if (regions.length > 0) return;
    setRegionsLoading(true);
    const { data } = await supabaseClient
      .from("regions")
      .select("id, name, name_ar, name_en, image, slug")
      .order("name", { ascending: true });
    setRegions(data ?? []);
    setRegionsLoading(false);
  }, [regions.length]);

  const getRegionLabel = (r: Region) => {
    if (language === "ar") return r.name_ar;
    if (language === "en") return r.name_en;
    return r.name;
  };

  const handleOpen = useCallback(() => {
    const status = checkRL();
    setRlStatus(status);
    if (!status.allowed) {
      setStep("blocked");
      if (status.reason === "cooldown") startCountdown(status.unlocksAt);
    } else {
      setStep("form");
      setName("");
      setNameAr("");
      setRegionId(defaultRegionId);
      setNote("");
      setNameError("");
      setRegionError("");
      setSubmitError("");
      fetchRegions();
    }
    setOpen(true);
  }, [startCountdown, defaultRegionId, fetchRegions]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  async function handleSubmit() {
    let valid = true;
    if (!name.trim()) {
      setNameError(tx.requiredName);
      valid = false;
    }
    if (!regionId) {
      setRegionError(tx.requiredRegion);
      valid = false;
    }
    if (!valid) return;

    const status = checkRL();
    if (!status.allowed) {
      setRlStatus(status);
      setStep("blocked");
      if (status.reason === "cooldown") startCountdown(status.unlocksAt);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const { error: dbErr } = await supabaseClient
        .from("city_suggestions")
        .insert({
          name: name.trim(),
          name_ar: nameAr.trim() || null,
          region_id: regionId,
          note: note.trim() || null,
        });

      if (dbErr) throw dbErr;
      recordSubmission();
      setStep("success");
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* Suggest button (always rendered as the trigger) */
  const triggerBtn = (
    <div className={styles.suggestWrap}>
      <button className={styles.suggestBtn} onClick={handleOpen}>
        <i className="ion-ios-add-circle-outline" />
        {tx.suggest}
      </button>
    </div>
  );

  if (!open) return triggerBtn;

  return (
    <>
      {triggerBtn}

      {/* Modal backdrop */}
      <div
        className={styles.modalBackdrop}
        onClick={handleClose}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Modal header */}
          <div className={styles.modalHeader}>
            <div className={styles.modalHeaderLeft}>
              <div className={styles.modalIconWrap}>
                <i className="ion-ios-pin" />
              </div>
              <div>
                <p className={styles.modalTitle}>{tx.modalTitle}</p>
                <p className={styles.modalSubtitle}>{tx.modalSubtitle}</p>
              </div>
            </div>
            <button
              className={styles.modalCloseBtn}
              onClick={handleClose}
              aria-label={tx.close}
            >
              <i className="ion-ios-close" />
            </button>
          </div>

          {/* Success state */}
          {step === "success" && (
            <div className={styles.centeredBody}>
              <div className={`${styles.stateIcon} ${styles.success}`}>
                <i className="ion-ios-checkmark-circle" />
              </div>
              <p className={styles.stateTitle}>{tx.successTitle}</p>
              <p className={styles.stateDesc}>{tx.successDesc}</p>
              <button className={styles.closeOnlyBtn} onClick={handleClose}>
                {tx.close}
              </button>
            </div>
          )}

          {/* Blocked state */}
          {step === "blocked" && (
            <div className={styles.centeredBody}>
              <div className={`${styles.stateIcon} ${styles.blocked}`}>
                <i className="ion-ios-time" />
              </div>
              {rlStatus.allowed === false && rlStatus.reason === "daily" && (
                <>
                  <p className={styles.stateTitle}>{tx.blockedDailyTitle}</p>
                  <p className={styles.stateDesc}>{tx.blockedDailyDesc}</p>
                </>
              )}
              {rlStatus.allowed === false && rlStatus.reason === "cooldown" && (
                <>
                  <p className={styles.stateTitle}>{tx.blockedCooldownTitle}</p>
                  <p className={styles.stateDesc}>{tx.blockedCooldownDesc}</p>
                  <p className={styles.cooldownTimer}>
                    {fmtCountdown(countdown)}
                  </p>
                </>
              )}
              <button className={styles.closeOnlyBtn} onClick={handleClose}>
                {tx.close}
              </button>
            </div>
          )}

          {/* Form */}
          {step === "form" && (
            <>
              {/* Rate-limit banner */}
              <div className={styles.rateLimitBanner}>
                <i className="ion-ios-information-circle-outline" />
                <p className={styles.rateLimitText}>{tx.rateLimitMsg}</p>
              </div>

              {/* Modal body */}
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>
                    {tx.cityNameFr}
                    <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.formInput}
                    value={name}
                    maxLength={80}
                    placeholder={tx.cityNameFrPh}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                  />
                  {nameError && <p className={styles.formError}>{nameError}</p>}
                  <p className={styles.charCounter}>{name.length}/80</p>
                </div>

                {/* Name (Arabic) */}
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>{tx.cityNameAr}</label>
                  <input
                    className={`${styles.formInput} ${styles.formInputAr}`}
                    value={nameAr}
                    maxLength={80}
                    placeholder={tx.cityNameArPh}
                    dir="rtl"
                    onChange={(e) => setNameAr(e.target.value)}
                  />
                  <p className={styles.charCounter}>{nameAr.length}/80</p>
                </div>

                {/* Region select */}
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>
                    {tx.region}
                    <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      className={styles.formSelect}
                      value={regionId}
                      disabled={regionsLoading}
                      onChange={(e) => {
                        setRegionId(e.target.value);
                        setRegionError("");
                      }}
                    >
                      <option value="" disabled>
                        {regionsLoading ? tx.regionsLoading : tx.regionPh}
                      </option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {getRegionLabel(r)}
                        </option>
                      ))}
                    </select>
                    <i
                      className={`ion-ios-arrow-down ${styles.selectChevron}`}
                    />
                  </div>
                  {regionError && (
                    <p className={styles.formError}>{regionError}</p>
                  )}
                </div>

                {/* Notes */}
                <div className={styles.formRow}>
                  <label className={styles.formLabel}>{tx.note}</label>
                  <textarea
                    className={styles.formTextarea}
                    value={note}
                    maxLength={300}
                    placeholder={tx.notePh}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <p className={styles.charCounter}>{note.length}/300</p>
                </div>

                {submitError && (
                  <p className={styles.formError}>{submitError}</p>
                )}

                <div style={{ height: 8, flexShrink: 0 }} />
              </div>

              {/* Modal footer */}
              <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={handleClose}>
                  {tx.cancel}
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    tx.sending
                  ) : (
                    <>
                      <i className="ion-ios-send" />
                      {tx.send}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* Cities page */
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

      const { data: regionData } = await supabaseClient
        .from("regions")
        .select("*")
        .eq("slug", regionSlug)
        .single();

      if (!regionData) {
        setLoading(false);
        return;
      }
      setRegion(regionData);

      const { data: citiesData } = await supabaseClient
        .from("cities")
        .select("*")
        .eq("region_id", regionData.id)
        .order("name", { ascending: true });

      const cityList = citiesData ?? [];
      setCities(cityList);

      if (cityList.length > 0) {
        const cityIds = cityList.map((c) => c.id);
        const { data: pharmacies } = await supabaseClient
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

  /* Loading skeleton */
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

  /* Not found */
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
      <Helmet>
        <title>{text.metaTitle(getRegionName(region))}</title>
        <meta
          name="description"
          content={text.metaDesc(getRegionName(region))}
        />
        <meta
          property="og:title"
          content={text.metaTitle(getRegionName(region))}
        />
        <meta
          property="og:description"
          content={text.metaDesc(getRegionName(region))}
        />
        {region.image && <meta property="og:image" content={region.image} />}
      </Helmet>

      {/* Region banner */}
      <div className={styles.regionBanner}>
        <div
          className={styles.bannerBg}
          style={{ backgroundImage: `url(${region.image})` }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          {/* Back button */}
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
            <span>{text.back}</span>
          </button>

          {/* Banner text */}
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

        {/* Empty state */}
        {cities.length === 0 ? (
          <div className={styles.empty}>
            <i className="ion-ios-locate" />
            <p>{text.noCities}</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className={styles.grid}>
              {cities.map((city) => {
                const stats = statsMap[city.id] ?? { total: 0, openCount: 0 };
                return (
                  /* City card */
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
                      <span className={styles.cardName}>
                        {getCityName(city)}
                      </span>

                      {/* Card stats */}
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
                              color:
                                stats.openCount > 0 ? "#22c55e" : "#ef4444",
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

            {/* Suggest city button + modal */}
            <SuggestCityModal
              defaultRegionId={region.id}
              language={language}
              isRTL={isRTL}
            />
          </>
        )}
      </section>
    </div>
  );
}
