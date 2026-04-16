"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapLocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  defaultLocation?: { lat: number; lng: number };
}

const BAGHDAD_CENTER: L.LatLng = new L.LatLng(33.3152, 44.3661);

function MapController({ center, zoom }: { center: L.LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null; setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function MapLocationPicker({ onLocationSelect, defaultLocation }: MapLocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng>(() => {
    if (defaultLocation) {
      return new L.LatLng(defaultLocation.lat, defaultLocation.lng);
    }
    return BAGHDAD_CENTER;
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
        setIsGettingLocation(false);
      },
      (err) => {
        setIsGettingLocation(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("تم رفض إذن تحديد الموقع");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("تعذر تحديد الموقع");
            break;
          case err.TIMEOUT:
          default:
            setLocationError("انتهت مهلة تحديد الموقع");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onLocationSelect]);

  useEffect(() => {
    onLocationSelect(position.lat, position.lng);
  }, [position, onLocationSelect]);

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <MapController center={position} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
        className="absolute top-4 end-4 z-[400] bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGettingLocation ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        <span>موقعي</span>
      </button>

      <div className="absolute bottom-4 start-4 end-4 z-[400] bg-white/90 backdrop-blur text-sm p-3 rounded-lg shadow border border-slate-100 flex items-center justify-between text-slate-700 font-medium">
        <span>قم بالنقر على الخريطة لتحديد الموقع بدقة</span>
        <div className="flex gap-4" dir="ltr">
          <span>Lat: {position.lat.toFixed(4)}</span>
          <span>Lng: {position.lng.toFixed(4)}</span>
        </div>
      </div>

      {locationError && (
        <div className="absolute top-16 start-4 z-[400] bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg border border-red-100">
          {locationError}
        </div>
      )}
    </div>
  );
}