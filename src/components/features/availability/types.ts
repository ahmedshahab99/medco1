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

export interface AdvancedSettings {
  bufferBefore: number;
  bufferAfter: number;
  maxPerDay: number;
  bookingWindow: number;
  minNotice: number;
}
