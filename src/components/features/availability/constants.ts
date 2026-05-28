import { uid } from "@/lib/date-utils";
import type { WeekSchedule, AdvancedSettings } from "./types";

export const DEFAULT_SCHEDULE: WeekSchedule = {
  saturday:  { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  sunday:    { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  monday:    { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  tuesday:   { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  wednesday: { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  thursday:  { enabled: true,  segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
  friday:    { enabled: false, segments: [{ id: uid(), start: "09:00", end: "17:00" }] },
};

export const DEFAULT_ADVANCED: AdvancedSettings = {
  bufferBefore:  0,
  bufferAfter:   0,
  maxPerDay:     20,
  bookingWindow: 30,
  minNotice:     2,
};
