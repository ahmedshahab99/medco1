export interface TimeSegment {
  id: string;
  start: string;
  end: string;
}

export interface DaySchedule {
  enabled: boolean;
  segments: TimeSegment[];
}

export type WeekSchedule = Record<string, DaySchedule>;

export type ExceptionType = "off" | "custom" | "break";

export interface Exception {
  id: string;
  date: string;
  type: ExceptionType;
  startTime?: string;
  endTime?: string;
  label?: string;
}

export interface AdvancedSettings {
  bufferBefore: number;
  bufferAfter: number;
  maxPerDay: number;
  bookingWindow: number;
  minNotice: number;
}
