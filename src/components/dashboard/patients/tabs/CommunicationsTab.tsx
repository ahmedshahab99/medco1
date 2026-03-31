"use client";

import React, { useState } from "react";
import { Patient, CommunicationLog } from "../../../../lib/types/dashboard";
import { MessageSquare, Phone, Mail, Send, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "../../../ui/Button";
import { Textarea } from "../../../ui/Textarea";

interface CommunicationsTabProps {
  patient: Patient;
}

const CHANNEL_CONFIG: Record<
  CommunicationLog["channel"],
  { label: string; icon: React.ElementType; cls: string }
> = {
  whatsapp: { label: "واتساب", icon: MessageSquare, cls: "bg-emerald-100 text-emerald-600" },
  sms:      { label: "رسالة نصية", icon: Phone,        cls: "bg-blue-100 text-blue-600" },
  email:    { label: "بريد إلكتروني", icon: Mail,      cls: "bg-violet-100 text-violet-600" },
};

const STATUS_CONFIG: Record<
  CommunicationLog["status"],
  { label: string; icon: React.ElementType; cls: string }
> = {
  sent:      { label: "مُرسلة", icon: Send,         cls: "text-slate-500" },
  delivered: { label: "مُستلمة", icon: CheckCircle, cls: "text-emerald-500" },
  failed:    { label: "فشل",     icon: XCircle,     cls: "text-red-500" },
};

const MSG_TEMPLATES = [
  "تذكير بموعدكم غداً في عيادتنا. نتطلع لرؤيتكم.",
  "شكراً لزيارتكم. نتمنى لكم الشفاء العاجل.",
  "هل تودّون حجز موعد متابعة؟ يسعدنا خدمتكم.",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function CommunicationsTab({ patient }: CommunicationsTabProps) {
  const [isComposing, setIsComposing] = useState(false);
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<CommunicationLog["channel"]>("whatsapp");

  const sorted = [...patient.communications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Send button */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{sorted.length} رسالة مُرسلة</p>
        <Button size="sm" className="gap-1.5" onClick={() => setIsComposing(true)}>
          <Plus className="w-4 h-4" />
          رسالة جديدة
        </Button>
      </div>

      {/* Compose panel */}
      {isComposing && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          {/* Channel selector */}
          <div className="flex gap-2">
            {(Object.keys(CHANNEL_CONFIG) as CommunicationLog["channel"][]).map((ch) => {
              const cfg = CHANNEL_CONFIG[ch];
              const Icon = cfg.icon;
              return (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    channel === ch
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Templates */}
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2">قوالب سريعة</p>
            <div className="flex flex-col gap-1.5">
              {MSG_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(tpl)}
                  className="text-right text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  {tpl}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            className="h-24 bg-white text-sm"
            placeholder="أدخل نص الرسالة..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsComposing(false)}>إلغاء</Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsComposing(false)}>
              <Send className="w-3.5 h-3.5" />
              إرسال
            </Button>
          </div>
        </div>
      )}

      {/* Log */}
      {sorted.length === 0 && !isComposing && (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-600">لا توجد رسائل</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((comm) => {
          const ch = CHANNEL_CONFIG[comm.channel];
          const st = STATUS_CONFIG[comm.status];
          const ChIcon = ch.icon;
          const StIcon = st.icon;
          return (
            <div key={comm.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${ch.cls}`}>
                  <ChIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-relaxed">{comm.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-slate-400">{formatDate(comm.date)}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold ${st.cls}`}>
                      <StIcon className="w-3 h-3" />
                      {st.label}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ch.cls}`}>{ch.label}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
