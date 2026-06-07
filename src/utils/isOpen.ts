type TimeRange = { open: string; close: string };
type DaySchedule = TimeRange[] | null;

export type Schedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

const DAYS = [
  "sunday", "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday",
] as const;

const CLOSING_SOON_MINUTES = 45;

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const is24Hours = (slots: TimeRange[]) =>
  slots.some((s) => s.open === "00:00" && s.close === "23:59");

const getTodayString = () => {
  const now = new Date();
  const moroccoOffset = 60;
  const moroccoTime = new Date(
    now.getTime() + (moroccoOffset - now.getTimezoneOffset()) * 60000,
  );
  const y = moroccoTime.getFullYear();
  const m = String(moroccoTime.getMonth() + 1).padStart(2, "0");
  const d = String(moroccoTime.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export type ScheduleStatus =
  | { type: "always_open" }
  | {
    type: "open";
    slot: TimeRange;
    closingSoon: boolean;
    minsLeft: number;
    nextSlot: TimeRange | null;
  }
  | { type: "lunch_break"; reopensAt: string }
  | { type: "closed"; opensAt: string; opensDay: string };

export function getScheduleStatus(
  schedule: Schedule | null,
  isOnCall: boolean,
  dutyStart: string | null,
  dutyEnd: string | null,
  isNightPharmacy: boolean,
): ScheduleStatus {
  if (isOnCall || isNightPharmacy) {
    if (dutyStart === "24h" || dutyEnd === "24h") return { type: "always_open" };

    if (dutyStart && dutyEnd) {
      const today = getTodayString();
      if (today >= dutyStart && today <= dutyEnd) return { type: "always_open" };
      if (today < dutyStart) {
        return { type: "closed", opensAt: dutyStart, opensDay: "duty" };
      }
    } else {
      return { type: "always_open" };
    }
  }

  if (!schedule) return { type: "always_open" };

  const now = new Date();
  const todayKey = DAYS[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todaySlots = schedule[todayKey];

  if (todaySlots && todaySlots.length > 0 && is24Hours(todaySlots))
    return { type: "always_open" };

  if (todaySlots && todaySlots.length > 0) {
    for (let i = 0; i < todaySlots.length; i++) {
      const slot = todaySlots[i];
      const openMin = toMinutes(slot.open);
      const closeMin = toMinutes(slot.close);

      if (currentMinutes >= openMin && currentMinutes < closeMin) {
        const minsLeft = closeMin - currentMinutes;
        const closingSoon = minsLeft <= CLOSING_SOON_MINUTES;
        const nextSlot = todaySlots[i + 1] ?? null;
        return { type: "open", slot, closingSoon, minsLeft, nextSlot };
      }

      const nextSlot = todaySlots[i + 1];
      if (
        nextSlot &&
        currentMinutes >= closeMin &&
        currentMinutes < toMinutes(nextSlot.open)
      ) {
        return { type: "lunch_break", reopensAt: nextSlot.open };
      }

      if (currentMinutes < openMin)
        return { type: "closed", opensAt: slot.open, opensDay: "today" };
    }
  }

  for (let d = 1; d <= 7; d++) {
    const nextDayKey = DAYS[(now.getDay() + d) % 7];
    const nextSlots = schedule[nextDayKey];
    if (nextSlots && nextSlots.length > 0) {
      const dayLabel = d === 1 ? "tomorrow" : nextDayKey;
      return { type: "closed", opensAt: nextSlots[0].open, opensDay: dayLabel };
    }
  }

  return { type: "closed", opensAt: "--", opensDay: "--" };
}

export function isOpenNow(
  schedule: Schedule | null,
  isOnCall: boolean,
  dutyStart: string,
  dutyEnd: string,
  isNightPharmacy: boolean,
): boolean {
  const status = getScheduleStatus(schedule, isOnCall, dutyStart, dutyEnd, isNightPharmacy);
  return (
    status.type === "always_open" ||
    status.type === "open" ||
    status.type === "lunch_break"
  );
}