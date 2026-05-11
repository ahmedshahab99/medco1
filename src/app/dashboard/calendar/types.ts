export type ViewMode = "day" | "week" | "month";

export interface InteractionState {
  apptId: string;
  type: "drag" | "resize";
  startPointerY: number;
  startPointerX: number;
  originalStartTime: Date;
  originalEndTime: Date;
  currentStartTime: Date;
  currentEndTime: Date;
}
