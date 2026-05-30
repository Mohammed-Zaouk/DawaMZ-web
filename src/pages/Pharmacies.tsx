import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "../context/language/useLanguage";
import { supabaseClient } from "../services/supabase";
import { isOpenNow, getScheduleStatus } from "../utils/isOpen";
import type { Schedule, ScheduleStatus } from "../utils/isOpen";
import styles from "../styles/pages-style/Pharmacies.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

// Rate-limit config
const RL_KEY = "dawamz_pharma_suggest_rl";
const MAX_PER_DAY = 2;
const COOLDOWN_MS = 10 * 60 * 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000;

// ─── i18n ─────────────────────────────────────────────────────────────────────

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

const suggestTx = {
  ar: {
    modalTitle: "اقتراح صيدلية",
    modalSubtitle: "ساعدنا في إضافة صيدليات جديدة",
    name: "اسم الصيدلية",
    namePh: "مثال: صيدلية النور",
    address: "العنوان",
    addressPh: "الشارع أو الحي…",
    phone: "رقم الهاتف",
    phonePh: "مثال: 0600000000",
    city: "المدينة",
    cityPh: "اختر المدينة…",
    citiesLoading: "جارٍ تحميل المدن…",
    note: "ملاحظات",
    notePh: "أي معلومات إضافية مفيدة…",
    cancel: "إلغاء",
    send: "إرسال",
    sending: "جارٍ الإرسال…",
    rateLimitMsg:
      "للحد من الإرسال المتكرر، يُسمح بـ اقتراحَين كل 24 ساعة مع انتظار 10 دقائق بين كل إرسال.",
    successTitle: "شكراً لك!",
    successDesc: "تم استلام اقتراحك وسنراجعه في أقرب وقت.",
    blockedDailyTitle: "وصلت إلى الحد اليومي",
    blockedDailyDesc:
      "يُسمح بـ اقتراحَين كحد أقصى كل 24 ساعة. يُرجى المحاولة لاحقاً.",
    blockedCooldownTitle: "يرجى الانتظار قليلاً",
    blockedCooldownDesc:
      "يجب الانتظار 10 دقائق بين كل اقتراح حتى لا يُعدّ إرسالاً مكرراً. الوقت المتبقي:",
    requiredName: "اسم الصيدلية مطلوب",
    requiredCity: "يرجى اختيار المدينة",
    submitError: "حدث خطأ. يُرجى المحاولة مرة أخرى.",
    close: "إغلاق",
  },
  fr: {
    modalTitle: "Suggérer une pharmacie",
    modalSubtitle: "Aidez-nous à enrichir la liste",
    name: "Nom de la pharmacie",
    namePh: "Ex : Pharmacie Al Nour",
    address: "Adresse",
    addressPh: "Rue ou quartier…",
    phone: "Téléphone",
    phonePh: "Ex : 0600000000",
    city: "Ville",
    cityPh: "Choisir une ville…",
    citiesLoading: "Chargement des villes…",
    note: "Remarques",
    notePh: "Toute information utile supplémentaire…",
    cancel: "Annuler",
    send: "Envoyer",
    sending: "Envoi…",
    rateLimitMsg:
      "Pour éviter les doublons, vous êtes limité à 2 suggestions par 24 h avec un délai de 10 min entre chaque envoi.",
    successTitle: "Merci !",
    successDesc: "Votre suggestion a été reçue et sera examinée prochainement.",
    blockedDailyTitle: "Limite journalière atteinte",
    blockedDailyDesc:
      "Vous pouvez envoyer au maximum 2 suggestions par 24 h. Réessayez plus tard.",
    blockedCooldownTitle: "Patientez un moment",
    blockedCooldownDesc:
      "Un délai de 10 min est requis entre chaque suggestion pour éviter les envois en double. Temps restant :",
    requiredName: "Le nom de la pharmacie est requis",
    requiredCity: "Veuillez sélectionner une ville",
    submitError: "Une erreur s'est produite. Veuillez réessayer.",
    close: "Fermer",
  },
  en: {
    modalTitle: "Suggest a pharmacy",
    modalSubtitle: "Help us grow the directory",
    name: "Pharmacy name",
    namePh: "e.g. Al Nour Pharmacy",
    address: "Address",
    addressPh: "Street or neighborhood…",
    phone: "Phone number",
    phonePh: "e.g. 0600000000",
    city: "City",
    cityPh: "Select a city…",
    citiesLoading: "Loading cities…",
    note: "Notes",
    notePh: "Any additional helpful information…",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending…",
    rateLimitMsg:
      "To avoid duplicates, you can submit up to 2 suggestions every 24 hours with a 10-minute cooldown between each submission.",
    successTitle: "Thank you!",
    successDesc:
      "Your suggestion has been received and will be reviewed shortly.",
    blockedDailyTitle: "Daily limit reached",
    blockedDailyDesc:
      "You can send at most 2 suggestions every 24 hours. Please try again later.",
    blockedCooldownTitle: "Please wait a moment",
    blockedCooldownDesc:
      "A 10-minute cooldown between suggestions helps us avoid duplicates. Time remaining:",
    requiredName: "Pharmacy name is required",
    requiredCity: "Please select a city",
    submitError: "Something went wrong. Please try again.",
    close: "Close",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string, language: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(
    language === "ar" ? "ar-MA" : language === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "short" },
  );
};
interface RLRecord {
  timestamps: number[];
}

type RLStatus =
  | { allowed: true }
  | { allowed: false; reason: "daily"; resetAt: number }
  | { allowed: false; reason: "cooldown"; unlocksAt: number };

function readRL(): RLRecord {
  try {
    const r = localStorage.getItem(RL_KEY);
    if (r) return JSON.parse(r);
  } catch {
    /**/
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
  if (recent.length >= MAX_PER_DAY)
    return {
      allowed: false,
      reason: "daily",
      resetAt: Math.min(...recent) + WINDOW_MS,
    };
  if (recent.length > 0) {
    const last = Math.max(...recent);
    if (now - last < COOLDOWN_MS)
      return {
        allowed: false,
        reason: "cooldown",
        unlocksAt: last + COOLDOWN_MS,
      };
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

// ─── SuggestPharmacyModal ─────────────────────────────────────────────────────

function SuggestPharmacyModal({
  language,
  isRTL,
  onClose,
}: {
  language: "ar" | "fr" | "en";
  isRTL: boolean;
  onClose: () => void;
}) {
  const tx = suggestTx[language] ?? suggestTx.en;

  const [step, setStep] = useState<"form" | "success" | "blocked">(() => {
    const s = checkRL();
    return s.allowed ? "form" : "blocked";
  });

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");

  // Validation state
  const [nameError, setNameError] = useState("");
  const [cityError, setCityError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Rate-limit state
  const [rlStatus, setRlStatus] = useState<RLStatus>(() => checkRL());
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lock body scroll while mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Countdown timer for cooldown
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

  useEffect(() => {
    if (rlStatus.allowed === false && rlStatus.reason === "cooldown") {
      startCountdown(rlStatus.unlocksAt);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleSubmit() {
    let valid = true;
    if (!name.trim()) {
      setNameError(tx.requiredName);
      valid = false;
    }
    if (!city.trim()) {
      setCityError(tx.requiredCity);
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
        .from("pharmacy_suggestions")
        .insert({
          name: name.trim(),
          city: city.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          note: note.trim() || null,
        });
      if (dbErr) throw dbErr;
      recordSubmission();
      setStep("success");
    } catch {
      setSubmitError(tx.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconWrap}>
              <i className="ion-ios-medkit" />
            </div>
            <div>
              <p className={styles.modalTitle}>{tx.modalTitle}</p>
              <p className={styles.modalSubtitle}>{tx.modalSubtitle}</p>
            </div>
          </div>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
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
            <button className={styles.closeOnlyBtn} onClick={onClose}>
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
            <button className={styles.closeOnlyBtn} onClick={onClose}>
              {tx.close}
            </button>
          </div>
        )}

        {/* Form */}
        {step === "form" && (
          <>
            {/* Rate-limit notice */}
            <div className={styles.rateLimitBanner}>
              <i className="ion-ios-information-circle-outline" />
              <p className={styles.rateLimitText}>{tx.rateLimitMsg}</p>
            </div>

            <div className={styles.modalBody}>
              {/* Name — required */}
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  {tx.name}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.formInput}
                  value={name}
                  maxLength={100}
                  placeholder={tx.namePh}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                />
                {nameError && <p className={styles.formError}>{nameError}</p>}
                <p className={styles.charCounter}>{name.length}/100</p>
              </div>

              {/* Address — optional */}
              <div className={styles.formRow}>
                <label className={styles.formLabel}>{tx.address}</label>
                <input
                  className={styles.formInput}
                  value={address}
                  maxLength={200}
                  placeholder={tx.addressPh}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <p className={styles.charCounter}>{address.length}/200</p>
              </div>

              {/* Phone — optional */}
              <div className={styles.formRow}>
                <label className={styles.formLabel}>{tx.phone}</label>
                <input
                  className={styles.formInput}
                  value={phone}
                  maxLength={20}
                  placeholder={tx.phonePh}
                  inputMode="tel"
                  type="tel"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* City — required */}
              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  {tx.city}
                  <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.formInput}
                  value={city}
                  maxLength={100}
                  placeholder={tx.cityPh}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setCityError("");
                  }}
                />
                {cityError && <p className={styles.formError}>{cityError}</p>}
              </div>

              {/* Note — optional */}
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

              {submitError && <p className={styles.formError}>{submitError}</p>}
              <div style={{ height: 8, flexShrink: 0 }} />
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={onClose}>
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
  );
}

// ─── Pharmacies Page ──────────────────────────────────────────────────────────

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
  const [showSuggestModal, setShowSuggestModal] = useState(false);

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

  // Localized field accessors
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

  const getEmptyState = () => {
    if (search.length > 0)
      return {
        icon: "ion-ios-search",
        title: text.notFoundSearch,
        sub: text.notFoundSearchSub,
        showSuggest: true,
      };
    if (filter === "night")
      return {
        icon: "ion-ios-moon",
        title: text.noNightPharmacies,
        sub: text.noNightPharmaciesSub,
        showSuggest: false,
      };
    if (filter === "oncall")
      return {
        icon: "ion-ios-pulse",
        title: text.noOnCallPharmacies,
        sub: text.noOnCallPharmaciesSub,
        showSuggest: false,
      };
    return {
      icon: "ion-ios-medkit",
      title: text.noPharmacies,
      sub: text.noPharmaciesSub,
      showSuggest: false,
    };
  };

  // Filtering + pagination
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

  // Loading state
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

  // Not found state
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

      {/* Pharmacy grid */}
      <section className={styles.listSection}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <i className={emptyState.icon} />
            <p className={styles.emptyTitle}>{emptyState.title}</p>
            <p className={styles.emptySub}>{emptyState.sub}</p>
            {emptyState.showSuggest && (
              <button
                className={styles.emptySuggest}
                onClick={() => setShowSuggestModal(true)}
              >
                <i className="ion-ios-add-circle-outline" />
                <span>{text.suggestBtn}</span>
              </button>
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

      {/* Suggest pharmacy modal */}
      {showSuggestModal && (
        <SuggestPharmacyModal
          language={language}
          isRTL={isRTL}
          onClose={() => setShowSuggestModal(false)}
        />
      )}
    </div>
  );
}
