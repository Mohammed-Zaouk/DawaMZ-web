import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../context/language/useLanguage";
import { supabase } from "../services/supabase";
import { getScheduleStatus } from "../utils/isOpen";
import type { Schedule, ScheduleStatus } from "../utils/isOpen";
import styles from "../styles/pages-style/PharmacyDetail.module.css";

// Fix leaflet default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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
  open: boolean;
  is_night_pharmacy: boolean;
  is_on_call: boolean;
  duty_start: string | null;
  duty_end: string | null;
  schedule: Schedule | null;
  slug: string;
  city_id: string;
};

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const translations = {
  ar: {
    back: "رجوع",
    openNow: "مفتوحة الآن",
    closedNow: "مغلقة الآن",
    closingSoon: (t: number) => `يغلق خلال ${t} دقيقة`,
    lunchBreak: "استراحة الغداء",
    lunchReopens: (t: string) => `يعيد الفتح · ${t}`,
    alwaysOpen: "مفتوح 24 ساعة",
    night: "ليلية",
    onCall: "مناوبة",
    notFound: "الصيدلية غير موجودة",
    tomorrow: "غداً",
    opensAt: (day: string, t: string) => `يفتح ${day} · ${t}`,
    dutyStartsOn: (s: string) => `تبدأ المناوبة: ${s}`,
    noPhone: "رقم الهاتف غير متوفر",
    noAddress: "العنوان غير متوفر",
    infoTitle: "معلومات الصيدلية",
    scheduleTitle: "ساعات العمل",
    mapTitle: "الموقع على الخريطة",
    directionsBtn: "الاتجاهات",
    callBtn: "اتصال",
    dutyPeriod: (s: string, e: string) => `مناوبة: ${s} — ${e}`,
    days: {
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
    },
    closed: "مغلق",
    today: "اليوم",
  },
  fr: {
    back: "Retour",
    openNow: "Ouvert maintenant",
    closedNow: "Fermé maintenant",
    closingSoon: (t: number) => `Ferme dans ${t} min`,
    lunchBreak: "Pause déjeuner",
    lunchReopens: (t: string) => `Réouvre à ${t}`,
    alwaysOpen: "Ouvert 24h/24",
    night: "Nuit",
    onCall: "Garde",
    notFound: "Pharmacie introuvable",
    tomorrow: "demain",
    opensAt: (day: string, t: string) => `Ouvre ${day} à ${t}`,
    dutyStartsOn: (s: string) => `Garde commence: ${s}`,
    noPhone: "Numéro non disponible",
    noAddress: "Adresse non disponible",
    infoTitle: "Informations",
    scheduleTitle: "Horaires",
    mapTitle: "Localisation",
    directionsBtn: "Itinéraire",
    callBtn: "Appeler",
    dutyPeriod: (s: string, e: string) => `Garde: ${s} — ${e}`,
    days: {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
    },
    closed: "Fermé",
    today: "Aujourd'hui",
  },
  en: {
    back: "Back",
    openNow: "Open now",
    closedNow: "Closed now",
    closingSoon: (t: number) => `Closes in ${t} min`,
    lunchBreak: "Lunch break",
    lunchReopens: (t: string) => `Reopens at ${t}`,
    alwaysOpen: "Open 24 hours",
    night: "Night",
    onCall: "On Call",
    notFound: "Pharmacy not found",
    tomorrow: "tomorrow",
    opensAt: (day: string, t: string) => `Opens ${day} · ${t}`,
    dutyStartsOn: (s: string) => `On call starts: ${s}`,
    noPhone: "Phone number unavailable",
    noAddress: "Address unavailable",
    infoTitle: "Pharmacy Info",
    scheduleTitle: "Opening Hours",
    mapTitle: "Location",
    directionsBtn: "Directions",
    callBtn: "Call",
    dutyPeriod: (s: string, e: string) => `On call: ${s} — ${e}`,
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    closed: "Closed",
    today: "Today",
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

const getTodayKey = (): DayKey => {
  const days: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className={styles.stars}>
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={
          s <= Math.round(rating) ? "ion-ios-star" : "ion-ios-star-outline"
        }
        style={{
          color:
            s <= Math.round(rating) ? "#f59e0b" : "var(--cardButtonBorder)",
        }}
      />
    ))}
    <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
  </div>
);

export default function PharmacyDetail() {
  const { pharmacySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cityImage = location.state?.cityImage;
  const { language, isRTL } = useLanguage();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);

  const text = translations[language] ?? translations.en;
  const todayKey = getTodayKey();

  useEffect(() => {
    if (!pharmacySlug) return;
    const fetchData = async () => {
      setLoading(true);

      // Primary: fetch by slug
      let { data } = await supabase
        .from("pharmacies")
        .select("*")
        .eq("slug", pharmacySlug)
        .maybeSingle();

      // Fallback: fetch by id (handles cases where navigation passed an id)
      if (!data) {
        const fallback = await supabase
          .from("pharmacies")
          .select("*")
          .eq("id", pharmacySlug)
          .maybeSingle();
        data = fallback.data;
      }

      setPharmacy(data ?? null);
      setLoading(false);
    };
    fetchData();
  }, [pharmacySlug]);

  if (loading) {
    return (
      <div className={styles.loadingPage} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.skeletonBanner} />
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonActionRow}>
            <div className={styles.skeletonBtn} />
            <div className={styles.skeletonBtn} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonBlock} />
          ))}
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className={styles.notFound} dir={isRTL ? "rtl" : "ltr"}>
        <div className={styles.notFoundIcon}>
          <i className="ion-ios-medkit" />
        </div>
        <p className={styles.notFoundText}>{text.notFound}</p>
        <button className={styles.notFoundBack} onClick={() => navigate(-1)}>
          <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
          {text.back}
        </button>
      </div>
    );
  }

  const getName = () => (language === "ar" ? pharmacy.name_ar : pharmacy.name);
  const getAddress = () =>
    language === "ar" ? pharmacy.address_ar : pharmacy.address;

  const status: ScheduleStatus = getScheduleStatus(
    pharmacy.schedule,
    pharmacy.is_on_call ?? false,
    pharmacy.duty_start ?? "",
    pharmacy.duty_end ?? "",
    pharmacy.is_night_pharmacy ?? false,
  );

  const isEffectivelyOpen =
    pharmacy.open !== false &&
    (status.type === "open" || status.type === "always_open");

  const badge = (() => {
    if (!pharmacy.open)
      return { label: text.closedNow, color: "#ef4444", dot: "#ef4444" };
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
    if (status.type === "open")
      return { label: text.openNow, color: "#22c55e", dot: "#22c55e" };
    if (status.type === "closed")
      return { label: text.closedNow, color: "#ef4444", dot: "#ef4444" };
    return { label: text.openNow, color: "#22c55e", dot: "#22c55e" };
  })();

  const showDutyPeriod =
    (pharmacy.is_on_call || pharmacy.is_night_pharmacy) &&
    pharmacy.duty_start &&
    pharmacy.duty_end &&
    pharmacy.duty_start !== "24h";

  const customIcon = L.divIcon({
    className: "",
    html: `<div style="
      width:40px;height:40px;border-radius:50%;
      background:#1976D2;
      border:3px solid #ffffff;
      box-shadow:0 3px 14px rgba(25,118,210,0.5);
      display:flex;align-items:center;justify-content:center;
      font-size:20px;color:white;font-weight:bold;
    ">+</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });

  return (
    <div className={styles.page} dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        {cityImage && (
          <div
            className={styles.bannerBg}
            style={{ backgroundImage: `url(${cityImage})` }}
          />
        )}
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <i className={`ion-ios-arrow-${isRTL ? "forward" : "back"}`} />
            <span>{text.back}</span>
          </button>
          <div className={styles.bannerBottom}>
            <div className={styles.bannerText}>
              <div className={styles.bannerPills}>
                {pharmacy.is_night_pharmacy && (
                  <span className={styles.pillNight}>{text.night}</span>
                )}
                {pharmacy.is_on_call && (
                  <span className={styles.pillOnCall}>{text.onCall}</span>
                )}
              </div>
              <h1 className={styles.bannerTitle}>{getName()}</h1>
              <div className={styles.statusRow}>
                <span
                  className={styles.statusDot}
                  style={{ background: badge.dot }}
                />
                <span
                  className={styles.statusLabel}
                  style={{ color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ── Quick stats strip ── */}
      <div className={styles.statsStrip}>
        <div
          className={styles.statChip}
          style={{
            background: isEffectivelyOpen
              ? "rgba(34,197,94,0.1)"
              : "rgba(239,68,68,0.08)",
            borderColor: isEffectivelyOpen
              ? "rgba(34,197,94,0.3)"
              : "rgba(239,68,68,0.3)",
          }}
        >
          <span
            className={styles.statChipDot}
            style={{ background: isEffectivelyOpen ? "#22c55e" : "#ef4444" }}
          />
          <span
            style={{
              color: isEffectivelyOpen ? "#22c55e" : "#ef4444",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {isEffectivelyOpen ? text.openNow : text.closedNow}
          </span>
        </div>

        {pharmacy.rating > 0 && (
          <div className={styles.statChip}>
            <i
              className="ion-ios-star"
              style={{ color: "#f59e0b", fontSize: 13 }}
            />
            <span className={styles.statChipText}>
              {pharmacy.rating.toFixed(1)}
            </span>
          </div>
        )}

        {pharmacy.is_night_pharmacy && (
          <div
            className={styles.statChip}
            style={{
              borderColor: "rgba(139,92,246,0.3)",
              background: "rgba(139,92,246,0.07)",
            }}
          >
            <i
              className="ion-ios-moon"
              style={{ color: "var(--pillNightText)", fontSize: 13 }}
            />
            <span
              className={styles.statChipText}
              style={{ color: "var(--pillNightText)" }}
            >
              {text.night}
            </span>
          </div>
        )}

        {pharmacy.is_on_call && (
          <div
            className={styles.statChip}
            style={{
              borderColor: "rgba(34,197,94,0.3)",
              background: "rgba(34,197,94,0.07)",
            }}
          >
            <i
              className="ion-ios-pulse"
              style={{ color: "var(--pillOnCallText)", fontSize: 13 }}
            />
            <span
              className={styles.statChipText}
              style={{ color: "var(--pillOnCallText)" }}
            >
              {text.onCall}
            </span>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div className={styles.actionRow}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
          target="_blank"
          rel="noreferrer"
          className={styles.actionBtn}
        >
          <i className="ion-ios-navigate" />
          <span>{text.directionsBtn}</span>
        </a>
        {pharmacy.phone ? (
          <a
            href={`tel:${pharmacy.phone}`}
            className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
          >
            <i className="ion-ios-call" />
            <span>{text.callBtn}</span>
          </a>
        ) : (
          <span className={`${styles.actionBtn} ${styles.actionBtnDisabled}`}>
            <i className="ion-ios-call" />
            <span>{text.noPhone}</span>
          </span>
        )}
      </div>

      <div className={styles.content}>
        {/* ── Info card ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <i className="ion-ios-information-circle" />
            {text.infoTitle}
          </h2>
          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <div className={styles.iconWrap}>
                <i className="ion-ios-pin" />
              </div>
              <span
                className={`${styles.infoValue} ${!getAddress() ? styles.muted : ""}`}
              >
                {getAddress() || text.noAddress}
              </span>
            </div>

            <div className={styles.infoDivider} />

            <div className={styles.infoRow}>
              <div className={styles.iconWrap}>
                <i className="ion-ios-call" />
              </div>
              <span
                className={`${styles.infoValue} ${!pharmacy.phone ? styles.muted : ""}`}
              >
                {pharmacy.phone || text.noPhone}
              </span>
            </div>

            {pharmacy.rating > 0 && (
              <>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <div className={styles.iconWrap}>
                    <i className="ion-ios-star" style={{ color: "#f59e0b" }} />
                  </div>
                  <StarRating rating={pharmacy.rating} />
                </div>
              </>
            )}

            {showDutyPeriod && (
              <>
                <div className={styles.infoDivider} />
                <div className={styles.infoRow}>
                  <div className={styles.iconWrapPurple}>
                    <i className="ion-ios-calendar" />
                  </div>
                  <span className={styles.dutyValue}>
                    {text.dutyPeriod(
                      formatDate(pharmacy.duty_start!, language),
                      formatDate(pharmacy.duty_end!, language),
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Schedule card ── */}
        {pharmacy.schedule && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="ion-ios-time" />
              {text.scheduleTitle}
            </h2>
            <div className={styles.scheduleCard}>
              {DAY_KEYS.map((day, i) => {
                const slots = pharmacy.schedule![day];
                const isToday = day === todayKey;
                const isOnDuty =
                  isToday &&
                  (pharmacy.is_on_call || pharmacy.is_night_pharmacy) &&
                  pharmacy.duty_start &&
                  pharmacy.duty_end &&
                  pharmacy.duty_start !== "24h";

                return (
                  <div key={day}>
                    <div
                      className={`${styles.scheduleRow} ${isToday ? styles.scheduleRowToday : ""}`}
                    >
                      <div className={styles.scheduleDay}>
                        {isToday && <span className={styles.todayDot} />}
                        <span
                          className={`${styles.dayLabel} ${isToday ? styles.dayLabelToday : ""}`}
                        >
                          {text.days[day]}
                          {isToday && (
                            <span className={styles.todayTag}>
                              {text.today}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className={styles.scheduleSlots}>
                        {isOnDuty ? (
                          <span className={styles.alwaysOpenLabel}>
                            <i className="ion-ios-moon" /> {text.alwaysOpen}
                          </span>
                        ) : !slots || slots.length === 0 ? (
                          <span className={styles.closedLabel}>
                            {text.closed}
                          </span>
                        ) : slots[0].open === "00:00" &&
                          slots[0].close === "23:59" ? (
                          <span className={styles.alwaysOpenLabel}>24h</span>
                        ) : (
                          slots.map((slot, si) => (
                            <span
                              key={si}
                              className={`${styles.slotChip} ${isToday ? styles.slotChipToday : ""}`}
                            >
                              {slot.open} — {slot.close}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                    {i < DAY_KEYS.length - 1 && (
                      <div className={styles.scheduleDivider} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Map card ── */}
        {pharmacy.latitude && pharmacy.longitude && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <i className="ion-ios-map" />
              {text.mapTitle}
            </h2>
            <div className={styles.mapCard}>
              <MapContainer
                center={[pharmacy.latitude, pharmacy.longitude]}
                zoom={15}
                className={styles.map}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[pharmacy.latitude, pharmacy.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <strong>{getName()}</strong>
                    <br />
                    {getAddress()}
                  </Popup>
                </Marker>
              </MapContainer>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                target="_blank"
                rel="noreferrer"
                className={styles.mapDirectionsBtn}
              >
                <i className="ion-ios-navigate" />
                <span>{text.directionsBtn}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
