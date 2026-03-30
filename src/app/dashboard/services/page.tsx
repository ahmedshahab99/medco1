"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Clock, Activity, Power, MoreVertical, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
}

const INITIAL_SERVICES: Service[] = [
  {
    id: "s1",
    name: "استشارة طبية عامة",
    description: "فحص طبي شامل يتضمن مراجعة التاريخ الطبي ومناقشة الأعراض الحالية لتحديد خطة العلاج المناسبة.",
    duration: 30,
    isActive: true,
  },
  {
    id: "s2",
    name: "مراجعة نتائج التحاليل",
    description: "جلسة مخصصة لمناقشة نتائج التحاليل المخبرية والأشعة وتوضيح مسار التعافي وتعديل الأدوية.",
    duration: 15,
    isActive: true,
  },
  {
    id: "s3",
    name: "استشارة عن بعد",
    description: "جلسة فيديو قصيرة لتقييم الحالات غير الطارئة أو المتابعة الطبية الروتينية.",
    duration: 20,
    isActive: false,
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState<Partial<Service>>({});

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData(service);
    } else {
      setEditingService(null);
      setFormData({
        isActive: true,
        duration: 30,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({});
  };

  const handleSave = () => {
    if (!formData.name || !formData.duration) {
      alert("الرجاء ملء الحقول الأساسية: الاسم والمدة");
      return;
    }

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...formData } as Service : s));
    } else {
      setServices([...services, {
        id: Math.random().toString(),
        name: formData.name,
        description: formData.description || "",
        duration: formData.duration,
        isActive: formData.isActive ?? true,
      }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف خدمة "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الخدمات الطبية</h1>
          <p className="text-slate-500 mt-1">قم بإدارة الخدمات التي تقدمها لمرضاك بمرونة تامة.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shrink-0">
          <Plus className="w-5 h-5" />
          إضافة خدمة جديدة
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Stethoscope className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد خدمات مضافة</h3>
          <p className="text-slate-500 max-w-sm">لم تقم بإضافة أي خدمات بعد، استخدم الزر بالأعلى للبدء في إضافة خدماتك.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 right-0 w-full h-1 ${service.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${service.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {service.isActive ? <Activity className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                  {service.isActive ? "نشـط" : "غير نشط"}
                </div>
                
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(service)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                {service.description || "لا يوجد وصف للخدمة."}
              </p>

              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-medium">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>{service.duration} دقيقة</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingService ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">اسم الخدمة <span className="text-red-500">*</span></label>
            <Input 
              placeholder="مثال: استشارة عن بعد" 
              value={formData.name || ""} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">وصف الخدمة</label>
            <Textarea 
              placeholder="وصف تفصيلي يشرح للمريض ما تتضمنه الخدمة..." 
              value={formData.description || ""} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                المدة الزمنية (بالدقائق) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  min="5" 
                  step="5"
                  className="pr-4 pl-12"
                  value={formData.duration || ""} 
                  onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  دقيقة
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Power className="w-4 h-4 text-slate-400" />
                حالة الخدمة
              </label>
              <div 
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 cursor-pointer select-none hover:bg-slate-50 transition-colors"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? '-translate-x-6' : '-translate-x-1'}`} />
                </div>
                <span className={`font-medium ${formData.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {formData.isActive ? 'نشطة (متاحة للمرضى)' : 'غير نشطة'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              {editingService ? "حفظ التعديلات" : "إضافة الخدمة"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
