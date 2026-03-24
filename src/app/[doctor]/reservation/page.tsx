"use client";
import { useState } from "react";

export default function ReservationPage({ params }: { params: Promise<{ doctor: string }> }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reservations, setReservations] = useState([
    { id: 1, patient: "أحمد محمد", date: "2025-03-25", time: "09:00", type: "استشارة أولى", status: "confirmed" },
    { id: 2, patient: "فاطمة علي", date: "2025-03-25", time: "10:30", type: "متابعة", status: "pending" },
    { id: 3, patient: "حسن كريم", date: "2025-03-25", time: "14:00", type: "استشارة طارئة", status: "confirmed" },
    { id: 4, patient: "نور الدين", date: "2025-03-26", time: "11:00", type: "استشارة أولى", status: "cancelled" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed": return "مؤكد";
      case "pending": return "قيد الانتظار";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">حجوزات المواعيد</h1>
          <p className="text-gray-600 mt-1">إدارة حجوزات المرضى والمواعيد</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          + حجز جديد
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">اختر التاريخ</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">إجمالي الحجوزات</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{reservations.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">مؤكدة</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {reservations.filter(r => r.status === "confirmed").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">قيد الانتظار</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {reservations.filter(r => r.status === "pending").length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-600">ملغاة</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {reservations.filter(r => r.status === "cancelled").length}
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">قائمة الحجوزات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المريض</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الوقت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reservation.patient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{reservation.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{reservation.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-teal-600 hover:text-teal-900 ml-3">عرض</button>
                    <button className="text-blue-600 hover:text-blue-900 ml-3">تعديل</button>
                    {reservation.status !== "cancelled" && (
                      <button className="text-red-600 hover:text-red-900">إلغاء</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all">
            <span className="text-2xl ml-2">📅</span>
            <span>حجز موعد جديد</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-2xl ml-2">📧</span>
            <span>إرسال تذكير</span>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-2xl ml-2">📊</span>
            <span>تصدير التقرير</span>
          </button>
        </div>
      </div>
    </div>
  );
}
