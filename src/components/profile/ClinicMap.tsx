"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ClinicMapProps {
  lat: number | null;
  lng: number | null;
  address: string | null;
}

export default function ClinicMap({ lat, lng, address }: ClinicMapProps) {
  if (lat == null || lng == null) return null;

  const position: L.LatLng = new L.LatLng(lat, lng);

  return (
    <section className="mb-10 px-2 relative z-0">
      <h2 className="text-base font-semibold mb-3 text-center text-foreground/80">الموقع على الخريطة</h2>
      <div className="w-full h-[250px] sm:h-[300px] rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            {address && <Popup>{address}</Popup>}
          </Marker>
        </MapContainer>
      </div>
    </section>
  );
}
