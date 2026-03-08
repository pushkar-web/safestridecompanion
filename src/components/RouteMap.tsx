import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  className?: string;
  showRoute?: boolean;
  animateMarker?: boolean;
}

const RouteMap = ({
  startLat = 19.1136,
  startLng = 72.8697,
  endLat = 19.0596,
  endLng = 72.8295,
  className = "",
  showRoute = true,
  animateMarker = false,
}: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([(startLat + endLat) / 2, (startLng + endLng) / 2], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Custom purple icon
    const purpleIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:hsl(262,83%,58%);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: "",
    });

    const greenIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:hsl(155,75%,40%);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: "",
    });

    L.marker([startLat, startLng], { icon: purpleIcon }).addTo(map);
    L.marker([endLat, endLng], { icon: greenIcon }).addTo(map);

    if (showRoute) {
      // Simulated route waypoints (Mumbai: Andheri to Bandra)
      const routePoints: L.LatLngExpression[] = [
        [startLat, startLng],
        [19.1050, 72.8600],
        [19.0950, 72.8500],
        [19.0830, 72.8420],
        [19.0720, 72.8350],
        [endLat, endLng],
      ];

      L.polyline(routePoints, {
        color: "hsl(262, 83%, 58%)",
        weight: 4,
        opacity: 0.8,
        dashArray: "10 6",
      }).addTo(map);

      if (animateMarker) {
        const movingIcon = L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:hsl(262,83%,58%);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);animation:pulse 1.5s infinite">
            <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 0 hsla(262,83%,58%,0.4)}50%{box-shadow:0 0 0 8px hsla(262,83%,58%,0)}}</style>
          </div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
          className: "",
        });

        const marker = L.marker([startLat, startLng], { icon: movingIcon }).addTo(map);
        let idx = 0;
        const moveInterval = setInterval(() => {
          idx = (idx + 1) % routePoints.length;
          const pt = routePoints[idx] as [number, number];
          marker.setLatLng(pt);
        }, 2000);

        return () => {
          clearInterval(moveInterval);
          map.remove();
          mapInstanceRef.current = null;
        };
      }
    }

    map.fitBounds([[startLat, startLng], [endLat, endLng]], { padding: [30, 30] });
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [startLat, startLng, endLat, endLng, showRoute, animateMarker]);

  return <div ref={mapRef} className={`w-full ${className}`} />;
};

export default RouteMap;
