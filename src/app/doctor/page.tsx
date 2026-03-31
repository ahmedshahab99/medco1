export default function DoctorPage({ params }: { params: Promise<{ doctor: string }> }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Portal</h2>
      <p className="text-gray-600 mb-8">Select a section from the navigation above to get started.</p>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <a href="admin" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all">
          <div className="text-3xl mb-3">🏥</div>
          <h3 className="font-semibold text-lg mb-2">Admin Dashboard</h3>
          <p className="text-sm text-gray-600">Manage appointments, patients, and clinic settings</p>
        </a>
        
        <a href="hr" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all">
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-semibold text-lg mb-2">HR Portal</h3>
          <p className="text-sm text-gray-600">Employee management, attendance, and payroll</p>
        </a>
        
        <a href="reservation" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-all">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-semibold text-lg mb-2">Reservations</h3>
          <p className="text-sm text-gray-600">View and manage patient bookings</p>
        </a>
      </div>
    </div>
  );
}
