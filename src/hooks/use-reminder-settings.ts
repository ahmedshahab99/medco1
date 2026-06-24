"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getReminderSettingsAction,
  type ReminderSettings,
} from "@/actions/get-reminder-settings";

export type { ReminderSettings };

function fetchReminderSettings(): Promise<ReminderSettings> {
  return getReminderSettingsAction();
}

export function useReminderSettings() {
  return useQuery({
    queryKey: ["reminder-settings"],
    queryFn: fetchReminderSettings,
    staleTime: 30 * 1000,
  });
}
