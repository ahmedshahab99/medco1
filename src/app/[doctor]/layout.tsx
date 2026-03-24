import { notFound } from "next/navigation";

// Sample doctor data - replace with your database/API
const doctors = [
  { id: "dr-smith", name: "Dr. Smith", specialty: "Cardiology" },
  { id: "dr-johnson", name: "Dr. Johnson", specialty: "Neurology" },
  { id: "dr-williams", name: "Dr. Williams", specialty: "Oncology" },
];

export async function generateStaticParams() {
  return doctors.map((doctor) => ({
    doctor: doctor.id,
  }));
}

export default function DoctorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ doctor: string }>;
}) {
  const { doctor } = await params;
  
  // Find doctor data - replace with actual database lookup
  const doctorData = doctors.find((d) => d.id === doctor);
  
  if (!doctorData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Doctor Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  {doctorData.name.charAt(0)}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{doctorData.name}</h1>
                <p className="text-sm text-gray-500">{doctorData.specialty}</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <a
                href={`/${doctor}/admin`}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all"
              >
                Admin
              </a>
              <a
                href={`/${doctor}/hr`}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all"
              >
                HR
              </a>
              <a
                href={`/${doctor}/reservation`}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all"
              >
                Reservation
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
