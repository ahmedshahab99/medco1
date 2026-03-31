"use client";

import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { User, Phone, Mail, CalendarDays, UserCircle2, Tag, X } from "lucide-react";
import { ALL_TAGS, DOCTORS } from "../../../lib/mock/patients";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    doctor: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real app: call API to create patient
    onClose();
    setForm({ name: "", phone: "", email: "", dob: "", gender: "", doctor: "" });
    setSelectedTags([]);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إضافة مريض جديد">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <Input
            required
            placeholder="مثال: محمد أحمد الزهراني"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-slate-400" />
            رقم الجوال <span className="text-red-500">*</span>
          </label>
          <Input
            required
            placeholder="05xxxxxxxx"
            dir="ltr"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-slate-400" />
            البريد الإلكتروني
          </label>
          <Input
            placeholder="example@email.com"
            dir="ltr"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* DOB + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              تاريخ الميلاد
            </label>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <UserCircle2 className="w-4 h-4 text-slate-400" />
              الجنس
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">اختر...</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
        </div>

        {/* Doctor */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">الطبيب المعالج</label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.doctor}
            onChange={(e) => setForm({ ...form, doctor: e.target.value })}
          >
            <option value="">اختر الطبيب...</option>
            {DOCTORS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400" />
            التصنيفات
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {active && <X className="w-3 h-3 inline ml-1" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">حفظ المريض</Button>
        </div>
      </form>
    </Modal>
  );
}
