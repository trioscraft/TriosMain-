// Indian calendar data for the admin/member calendar.
//
// National holidays (fixed Gregorian dates) are computed for any year.
// Festivals are curated per year (2025–2027) from Indian festival calendars:
// Hindu festivals are Panchang-based and may shift by a day depending on
// region/city, and Eid / Muharram dates are tentative (moon sighting).

export type IndianHoliday = {
  date: string; // YYYY-MM-DD
  name: string;
  emoji: string;
  holiday_type: "festival" | "national";
};

const FESTIVALS_BY_YEAR: Record<number, Array<{ date: string; name: string; emoji: string }>> = {
  2025: [
    { date: "2025-01-13", name: "Lohri", emoji: "🔥" },
    { date: "2025-01-14", name: "Makar Sankranti", emoji: "🪁" },
    { date: "2025-01-14", name: "Pongal", emoji: "🎋" },
    { date: "2025-02-02", name: "Vasant Panchami", emoji: "🌼" },
    { date: "2025-02-26", name: "Maha Shivaratri", emoji: "🕉️" },
    { date: "2025-03-13", name: "Holika Dahan", emoji: "🔥" },
    { date: "2025-03-14", name: "Holi", emoji: "🎨" },
    { date: "2025-03-31", name: "Eid-ul-Fitr", emoji: "🕌" },
    { date: "2025-04-06", name: "Ram Navami", emoji: "🙏" },
    { date: "2025-04-12", name: "Hanuman Jayanti", emoji: "🙏" },
    { date: "2025-04-18", name: "Good Friday", emoji: "✝️" },
    { date: "2025-04-20", name: "Easter", emoji: "✝️" },
    { date: "2025-06-07", name: "Eid-ul-Adha", emoji: "🕌" },
    { date: "2025-07-06", name: "Rath Yatra", emoji: "🛕" },
    { date: "2025-08-09", name: "Raksha Bandhan", emoji: "🎀" },
    { date: "2025-08-16", name: "Janmashtami", emoji: "🪶" },
    { date: "2025-08-27", name: "Ganesh Chaturthi", emoji: "🐘" },
    { date: "2025-09-22", name: "Navratri Begins", emoji: "💃" },
    { date: "2025-10-01", name: "Durga Puja Begins", emoji: "🛕" },
    { date: "2025-10-02", name: "Dussehra / Vijayadashami", emoji: "🏹" },
    { date: "2025-10-18", name: "Dhanteras", emoji: "🪔" },
    { date: "2025-10-20", name: "Diwali", emoji: "🪔" },
    { date: "2025-10-22", name: "Govardhan Puja", emoji: "⛰️" },
    { date: "2025-10-23", name: "Bhai Dooj", emoji: "❤️" },
    { date: "2025-10-28", name: "Chhath Puja", emoji: "🌅" },
    { date: "2025-11-05", name: "Guru Nanak Jayanti", emoji: "🕊️" },
    { date: "2025-12-24", name: "Christmas Eve", emoji: "🎄" },
  ],
  2026: [
    { date: "2026-01-13", name: "Lohri", emoji: "🔥" },
    { date: "2026-01-14", name: "Makar Sankranti", emoji: "🪁" },
    { date: "2026-01-14", name: "Pongal", emoji: "🎋" },
    { date: "2026-01-23", name: "Vasant Panchami", emoji: "🌼" },
    { date: "2026-02-15", name: "Maha Shivaratri", emoji: "🕉️" },
    { date: "2026-03-03", name: "Holika Dahan", emoji: "🔥" },
    { date: "2026-03-04", name: "Holi", emoji: "🎨" },
    { date: "2026-03-19", name: "Ugadi / Gudi Padwa", emoji: "🎊" },
    { date: "2026-03-21", name: "Eid-ul-Fitr", emoji: "🕌" },
    { date: "2026-03-26", name: "Ram Navami", emoji: "🙏" },
    { date: "2026-03-31", name: "Mahavir Jayanti", emoji: "🕉️" },
    { date: "2026-04-03", name: "Good Friday", emoji: "✝️" },
    { date: "2026-04-05", name: "Easter", emoji: "✝️" },
    { date: "2026-04-14", name: "Ambedkar Jayanti", emoji: "⚖️" },
    { date: "2026-04-14", name: "Vaisakhi / Baisakhi", emoji: "🌾" },
    { date: "2026-05-01", name: "Buddha Purnima", emoji: "🪷" },
    { date: "2026-05-27", name: "Eid-ul-Adha", emoji: "🕌" },
    { date: "2026-06-26", name: "Muharram", emoji: "🌙" },
    { date: "2026-07-16", name: "Rath Yatra", emoji: "🛕" },
    { date: "2026-08-26", name: "Onam", emoji: "🌴" },
    { date: "2026-08-26", name: "Milad-un-Nabi", emoji: "🕌" },
    { date: "2026-08-28", name: "Raksha Bandhan", emoji: "🎀" },
    { date: "2026-09-04", name: "Janmashtami", emoji: "🪶" },
    { date: "2026-09-14", name: "Ganesh Chaturthi", emoji: "🐘" },
    { date: "2026-10-11", name: "Navratri Begins", emoji: "💃" },
    { date: "2026-10-19", name: "Durga Ashtami", emoji: "🛕" },
    { date: "2026-10-20", name: "Dussehra / Vijayadashami", emoji: "🏹" },
    { date: "2026-10-29", name: "Karwa Chauth", emoji: "🌙" },
    { date: "2026-11-06", name: "Dhanteras", emoji: "🪔" },
    { date: "2026-11-08", name: "Diwali", emoji: "🪔" },
    { date: "2026-11-09", name: "Govardhan Puja", emoji: "⛰️" },
    { date: "2026-11-10", name: "Bhai Dooj", emoji: "❤️" },
    { date: "2026-11-15", name: "Chhath Puja", emoji: "🌅" },
    { date: "2026-11-24", name: "Guru Nanak Jayanti", emoji: "🕊️" },
  ],
  2027: [
    { date: "2027-01-13", name: "Lohri", emoji: "🔥" },
    { date: "2027-01-14", name: "Makar Sankranti", emoji: "🪁" },
    { date: "2027-01-14", name: "Pongal", emoji: "🎋" },
    { date: "2027-02-11", name: "Vasant Panchami", emoji: "🌼" },
    { date: "2027-03-06", name: "Maha Shivaratri", emoji: "🕉️" },
    { date: "2027-03-10", name: "Eid-ul-Fitr", emoji: "🕌" },
    { date: "2027-03-21", name: "Holika Dahan", emoji: "🔥" },
    { date: "2027-03-22", name: "Holi", emoji: "🎨" },
    { date: "2027-03-26", name: "Good Friday", emoji: "✝️" },
    { date: "2027-03-28", name: "Easter", emoji: "✝️" },
    { date: "2027-04-07", name: "Gudi Padwa / Ugadi", emoji: "🎊" },
    { date: "2027-04-14", name: "Ambedkar Jayanti", emoji: "⚖️" },
    { date: "2027-04-14", name: "Vaisakhi / Baisakhi", emoji: "🌾" },
    { date: "2027-04-15", name: "Ram Navami", emoji: "🙏" },
    { date: "2027-04-20", name: "Hanuman Jayanti", emoji: "🙏" },
    { date: "2027-05-23", name: "Buddha Purnima", emoji: "🪷" },
    { date: "2027-05-27", name: "Eid-ul-Adha", emoji: "🕌" },
    { date: "2027-08-17", name: "Raksha Bandhan", emoji: "🎀" },
    { date: "2027-08-25", name: "Janmashtami", emoji: "🪶" },
    { date: "2027-09-04", name: "Ganesh Chaturthi", emoji: "🐘" },
    { date: "2027-09-12", name: "Onam", emoji: "🌴" },
    { date: "2027-09-30", name: "Navratri Begins", emoji: "💃" },
    { date: "2027-10-07", name: "Durga Ashtami", emoji: "🛕" },
    { date: "2027-10-09", name: "Dussehra / Vijayadashami", emoji: "🏹" },
    { date: "2027-10-18", name: "Karwa Chauth", emoji: "🌙" },
    { date: "2027-10-27", name: "Dhanteras", emoji: "🪔" },
    { date: "2027-10-29", name: "Diwali", emoji: "🪔" },
    { date: "2027-10-30", name: "Govardhan Puja", emoji: "⛰️" },
    { date: "2027-10-31", name: "Bhai Dooj", emoji: "❤️" },
    { date: "2027-11-04", name: "Chhath Puja", emoji: "🌅" },
    { date: "2027-11-14", name: "Guru Nanak Jayanti", emoji: "🕊️" },
    { date: "2027-12-24", name: "Christmas Eve", emoji: "🎄" },
  ],
};

const FIXED_NATIONAL: Array<{ m: number; d: number; name: string; emoji: string }> = [
  { m: 1, d: 1, name: "New Year's Day", emoji: "🎉" },
  { m: 1, d: 26, name: "Republic Day", emoji: "🇮🇳" },
  { m: 5, d: 1, name: "Labour Day", emoji: "💪" },
  { m: 8, d: 15, name: "Independence Day", emoji: "🇮🇳" },
  { m: 10, d: 2, name: "Gandhi Jayanti", emoji: "🕊️" },
  { m: 12, d: 25, name: "Christmas", emoji: "🎄" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function getIndianHolidays(year: number): IndianHoliday[] {
  const out: IndianHoliday[] = FIXED_NATIONAL.map((f) => ({
    date: `${year}-${pad(f.m)}-${pad(f.d)}`,
    name: f.name,
    emoji: f.emoji,
    holiday_type: "national",
  }));

  for (const f of FESTIVALS_BY_YEAR[year] || []) {
    out.push({ date: f.date, name: f.name, emoji: f.emoji, holiday_type: "festival" });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function getIndianHolidaysInRange(fromISO: string, toISO: string): IndianHoliday[] {
  if (fromISO > toISO) return [];
  const fromYear = Number(fromISO.slice(0, 4));
  const toYear = Number(toISO.slice(0, 4));
  const out: IndianHoliday[] = [];
  for (let y = fromYear; y <= toYear; y++) {
    for (const h of getIndianHolidays(y)) {
      if (h.date >= fromISO && h.date <= toISO) out.push(h);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}