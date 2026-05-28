// Toast component with hook for easy usage
"use client"

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { useState, useCallback, useRef } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  message: string
  type?: ToastType
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type = "info", isVisible, onClose }: ToastProps) {
  if (!isVisible) return null

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const colors = {
    success: "border-emerald-500 bg-emerald-50 text-emerald-800",
    error: "border-red-500 bg-red-50 text-red-800",
    warning: "border-amber-500 bg-amber-50 text-amber-800",
    info: "border-blue-500 bg-blue-50 text-blue-800",
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-r-4 shadow-lg ${colors[type]}`}>
        {icons[type]}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="mr-2 hover:bg-black/5 rounded-lg transition-colors p-1 opacity-60">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: "",
    type: "info",
    visible: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, type, visible: true })
    timeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  return { toast, showToast, hideToast }
}
