// ConfirmDialog component
"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "./Button"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  type?: "danger" | "warning" | "info"
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: {
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600 text-white",
      iconBg: "bg-red-50",
    },
    warning: {
      icon: "text-amber-500",
      button: "bg-amber-500 hover:bg-amber-600 text-white",
      iconBg: "bg-amber-50",
    },
    info: {
      icon: "text-blue-500",
      button: "bg-blue-500 hover:bg-blue-600 text-white",
      iconBg: "bg-blue-50",
    },
  }

  const styles = typeStyles[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 animate-scale-in">
        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} className={`flex-1 ${styles.button}`}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing confirm dialog state
import { useState, useCallback } from "react"

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
}

const DEFAULT_CONFIRM = {
  isOpen: false,
  title: "",
  message: "",
  onConfirm: null,
}

export function useConfirmDialog() {
  const [confirmState, setConfirmState] = useState<ConfirmState>(DEFAULT_CONFIRM)

  const confirm = useCallback((options: {
    title: string
    message: string
    onConfirm: () => void
  }) => {
    setConfirmState({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
    })
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmState(DEFAULT_CONFIRM)
  }, [])

  return { confirmState, confirm, closeConfirm }
}