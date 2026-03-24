'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  clinicName: string;
  status: 'active' | 'inactive';
}

export default function SuperAdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 'dr-smith', name: 'Dr. John Smith', specialty: 'Cardiology', email: 'john.smith@clinic.com', phone: '+1-555-0101', clinicName: 'Heart Care Center', status: 'active' },
    { id: 'dr-johnson', name: 'Dr. Sarah Johnson', specialty: 'Neurology', email: 'sarah.j@clinic.com', phone: '+1-555-0102', clinicName: 'Brain Health Institute', status: 'active' },
    { id: 'dr-williams', name: 'Dr. Michael Williams', specialty: 'Orthopedics', email: 'm.williams@clinic.com', phone: '+1-555-0103', clinicName: 'Bone & Joint Clinic', status: 'inactive' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    clinicName: '',
  });

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const doctorId = newDoctor.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const doctor: Doctor = {
      id: doctorId,
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      email: newDoctor.email,
      phone: newDoctor.phone,
      clinicName: newDoctor.clinicName,
      status: 'active',
    };

    setDoctors([...doctors, doctor]);
    setIsModalOpen(false);
    setNewDoctor({ name: '', specialty: '', email: '', phone: '', clinicName: '' });
  };

  const toggleStatus = (id: string) => {
    setDoctors(doctors.map(doc => 
      doc.id === id ? { ...doc, status: doc.status === 'active' ? 'inactive' : 'active' } : doc
    ));
  };

  const deleteDoctor = (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage all doctors and their clinics</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Doctor
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-sm font-medium text-gray-600">Total Doctors</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{doctors.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-sm font-medium text-gray-600">Active Doctors</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{doctors.filter(d => d.status === 'active').length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-sm font-medium text-gray-600">Inactive Doctors</div>
            <div className="text-3xl font-bold text-red-600 mt-2">{doctors.filter(d => d.status === 'inactive').length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-sm font-medium text-gray-600">Total Clinics</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{new Set(doctors.map(d => d.clinicName)).size}</div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">All Doctors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-500">ID: {doctor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                        {doctor.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor.clinicName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.email}</div>
                      <div className="text-sm text-gray-500">{doctor.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        doctor.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${doctor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage
                        </Link>
                        <button
                          onClick={() => toggleStatus(doctor.id)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          {doctor.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Doctor</h3>
            </div>
            <form onSubmit={handleAddDoctor} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="doctor@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1-555-0100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    required
                    value={newDoctor.clinicName}
                    onChange={(e) => setNewDoctor({ ...newDoctor, clinicName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Medical Center Name"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
