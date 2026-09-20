export interface DateRange {
  start: Date;
  end: Date;
}

export function getIsoWeekRange(value: string): DateRange | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isInteger(year) || week < 1 || week > 53) {
    return null;
  }

  const januaryFourth = new Date(year, 0, 4);
  const dayOfWeek = januaryFourth.getDay() || 7;
  const start = new Date(year, 0, 4 - dayOfWeek + 1 + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

export function isDateInRange(value: string, range: DateRange): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= range.start && date < range.end;
}
