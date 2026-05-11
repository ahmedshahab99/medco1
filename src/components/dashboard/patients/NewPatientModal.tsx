"use client";

import React, { useState } from "react";
import { Modal } from "../../ui/Modal";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Label } from "../../ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/Select";
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
          <Label htmlFor="name">
            <User className="w-4 h-4 text-slate-400" />
            الاسم الكامل <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            required
            placeholder="مثال: محمد أحمد الزهراني"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">
            <Phone className="w-4 h-4 text-slate-400" />
            رقم الجوال <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
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
          <Label htmlFor="email">
            <Mail className="w-4 h-4 text-slate-400" />
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
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
            <Label htmlFor="dob">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              تاريخ الميلاد
            </Label>
            <Input
              id="dob"
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gender">
              <UserCircle2 className="w-4 h-4 text-slate-400" />
              الجنس
            </Label>
            <Select
              value={form.gender}
              onValueChange={(value) => setForm({ ...form, gender: value })}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="اختر..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ذكر</SelectItem>
                <SelectItem value="female">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Doctor */}
        <div className="space-y-1.5">
          <Label htmlFor="doctor">
            <UserCircle2 className="w-4 h-4 text-slate-400" />
            الطبيب المعالج
          </Label>
          <Select
            value={form.doctor}
            onValueChange={(value) => setForm({ ...form, doctor: value })}
          >
            <SelectTrigger id="doctor" className="w-full">
              <SelectValue placeholder="اختر الطبيب..." />
            </SelectTrigger>
            <SelectContent>
              {DOCTORS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">
            <Tag className="w-4 h-4 text-slate-400" />
            التصنيفات
          </Label>
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
