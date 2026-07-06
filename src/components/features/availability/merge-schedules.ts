import { uid } from "@/lib/date-utils";
import type { WeekSchedule, DaySchedule, TimeSegment } from "./types";

/**
 * Merge a list of weekly schedules into a single aggregate schedule.
 *
 * For each day:
 *  - `enabled` is true if ANY doctor has the day enabled.
 *  - `segments` is the union (overlapping ranges merged) of every enabled
 *    doctor's segments for that day.
 *
 * This is used by the calendar's "all doctors" view so that a time block is
 * only shaded as unavailable when no doctor works during that block.
 */
export function mergeSchedules(schedules: WeekSchedule[]): WeekSchedule {
  if (schedules.length === 0) return {};

  // Collect every day key seen across all schedules.
  const dayKeys = new Set<string>();
  for (const s of schedules) {
    for (const key of Object.keys(s)) dayKeys.add(key);
  }

  const merged: WeekSchedule = {};

  for (const dayKey of dayKeys) {
    const allSegments: TimeSegment[] = [];

    for (const s of schedules) {
      const day: DaySchedule | undefined = s[dayKey];
      if (day?.enabled && day.segments?.length) {
        allSegments.push(...day.segments);
      }
    }

    if (allSegments.length === 0) {
      merged[dayKey] = { enabled: false, segments: [] };
      continue;
    }

    // Sort by start time, then merge overlapping/adjacent ranges.
    const sorted = [...allSegments].sort((a, b) => {
      const [ah, am] = a.start.split(":").map(Number);
      const [bh, bm] = b.start.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });

    const mergedSegs: TimeSegment[] = [];
    let current = { id: uid(), start: sorted[0].start, end: sorted[0].end };

    for (let i = 1; i < sorted.length; i++) {
      const seg = sorted[i];
      if (segStartMinutes(seg.start) <= segEndMinutes(current.end)) {
        // Overlapping or adjacent — extend current.
        if (segEndMinutes(seg.end) > segEndMinutes(current.end)) {
          current.end = seg.end;
        }
      } else {
        mergedSegs.push(current);
        current = { id: uid(), start: seg.start, end: seg.end };
      }
    }
    mergedSegs.push(current);

    merged[dayKey] = { enabled: true, segments: mergedSegs };
  }

  return merged;
}

function segStartMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function segEndMinutes(time: string): number {
  return segStartMinutes(time);
}
