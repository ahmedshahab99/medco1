"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  width?: string;
}

export function Modal({ isOpen, onClose, title, children, hideHeader, width = "max-w-xl" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className={`bg-white rounded-2xl shadow-xl w-full ${width} z-50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden`}>
        {!hideHeader && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className={hideHeader ? "" : "p-6 overflow-y-auto"}>
          {children}
        </div>
      </div>
    </div>
  );
}
