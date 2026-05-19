// Services page with React Query and optimistic UI
"use client"

import React, { useState } from "react"
import { Plus, Edit2, Trash2, Clock, Activity, Power, Stethoscope } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Modal } from "@/components/ui/Modal"
import { Toast, useToast, type ToastType } from "@/components/ui/Toast"
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/ConfirmDialog"
import { useServices, useCreateService, useUpdateService, useDeleteService, type Service } from "@/hooks/use-services"

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
]

interface FormData {
  name: string
  description: string
  duration: number
  color: string
  isActive: boolean
}

const INITIAL_FORM: FormData = {
  name: "",
  description: "",
  duration: 30,
  color: COLORS[0],
  isActive: true,
}

export default function ServicesPage() {
  const { data: services, isLoading, error } = useServices()
  const createMutation = useCreateService()
  const updateMutation = useUpdateService()
  const deleteMutation = useDeleteService()

  const { toast, showToast, hideToast } = useToast()
  const { confirmState, confirm, closeConfirm } = useConfirmDialog()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description || "",
        duration: service.duration,
        color: service.color,
        isActive: service.isActive,
      })
    } else {
      setEditingService(null)
      setFormData({
        ...INITIAL_FORM,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingService(null)
    setFormData(INITIAL_FORM)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.duration) {
      showToast("الرجاء ملء الحقول الأساسية: الاسم والمدة", "warning")
      return
    }

    try {
      if (editingService) {
        setUpdatingId(editingService.id)
        await updateMutation.mutateAsync({
          id: editingService.id,
          data: {
            name: formData.name,
            description: formData.description || null,
            duration: formData.duration,
            color: formData.color,
            isActive: formData.isActive,
          },
        })
        showToast("تم تحديث الخدمة بنجاح", "success")
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || null,
          duration: formData.duration,
          color: formData.color,
          isActive: formData.isActive,
        })
        showToast("تمت إضافة الخدمة بنجاح", "success")
      }
      handleCloseModal()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ"
      showToast(message, "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteClick = (id: string, name: string) => {
    confirm({
      title: "حذف الخدمة",
      message: `هل أنت متأكد من حذف خدمة "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => handleDelete(id),
    })
  }

  const handleDelete = async (id?: string) => {
    const targetId = id ?? deletingId
    if (!targetId) return

    closeConfirm()
    try {
      await deleteMutation.mutateAsync(targetId)
      showToast("تم حذف الخدمة بنجاح", "success")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ"
      showToast(message, "error")
    } finally {
      setDeletingId(null)
    }
  }

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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-red-200 bg-red-50/50">
          <h3 className="text-lg font-bold text-red-800 mb-1">خطأ في تحميل الخدمات</h3>
          <p className="text-red-600">{(error as Error).message}</p>
        </Card>
      ) : !services || services.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Stethoscope className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد خدمات مضافة</h3>
          <p className="text-slate-500 max-w-sm">لم تقم بإضافة أي خدمات بعد، استخدم الزر بالأعلى للبدء في إضافة خدماتك.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const isDeleting = deletingId === service.id
            const isUpdating = updatingId === service.id
            const isPending = isDeleting || isUpdating

            return (
              <Card 
                key={service.id} 
                className={`p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group ${isPending ? 'opacity-50' : ''}`}
              >
                {(isDeleting || isUpdating) && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className={`absolute top-0 right-0 w-full h-1 ${service.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${service.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {service.isActive ? <Activity className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    {service.isActive ? "نشـط" : "غير نشط"}
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(service)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setDeletingId(service.id)
                        handleDeleteClick(service.id, service.name)
                      }}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: service.color + "20", color: service.color }}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>{service.duration} دقيقة</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

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
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">وصف الخدمة</label>
            <Textarea 
              placeholder="وصف تفصيلي يشرح للمريض ما تتضمنه الخدمة..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  value={formData.duration} 
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">لون الخدمة</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseModal}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : editingService ? "حفظ التعديلات" : "إضافة الخدمة"}
            </Button>
          </div>
        </div>
      </Modal>

      <Toast 
        message={toast.message} 
        type={toast.type as ToastType} 
        isVisible={toast.visible} 
        onClose={hideToast} 
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={handleDelete}
        onCancel={closeConfirm}
        type="danger"
      />
    </div>
  )
}