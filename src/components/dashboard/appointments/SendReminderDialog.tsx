"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { sendAppointmentReminderAction } from "@/actions/send-appointment-reminder";

interface SendReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  patientName: string;
  type: "CANCEL" | "RESCHEDULE";
}

const DIALOG_CONFIG = {
  CANCEL: {
    title: "إشعار إلغاء الموعد",
    description: (name: string) =>
      `هل تريد إرسال إشعار للمريض ${name} بإلغاء الموعد؟`,
  },
  RESCHEDULE: {
    title: "إشعار تعديل الموعد",
    description: (name: string) =>
      `هل تريد إرسال إشعار للمريض ${name} بتعديل موعده؟`,
  },
} as const;

export function SendReminderDialog({
  open,
  onOpenChange,
  appointmentId,
  patientName,
  type,
}: SendReminderDialogProps) {
  const [isPending, startTransition] = useTransition();
  const config = DIALOG_CONFIG[type];

  function handleConfirm() {
    startTransition(async () => {
      const result = await sendAppointmentReminderAction(appointmentId, type);
      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح");
      } else {
        toast.error(result.error ?? "فشل إرسال الإشعار");
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md font-sans">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            {config.description(patientName)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            لا
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            نعم، أرسل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
