// Mumbai location coordinates database
export interface LocationCoords {
  lat: number;
  lng: number;
  name: string;
}

export const MUMBAI_LOCATIONS: Record<string, LocationCoords> = {
  andheri: { lat: 19.1136, lng: 72.8697, name: "Andheri" },
  bandra: { lat: 19.0596, lng: 72.8295, name: "Bandra" },
  juhu: { lat: 19.0883, lng: 72.8263, name: "Juhu" },
  kurla: { lat: 19.0726, lng: 72.8845, name: "Kurla" },
  dadar: { lat: 19.0178, lng: 72.8478, name: "Dadar" },
  worli: { lat: 19.0176, lng: 72.8152, name: "Worli" },
  colaba: { lat: 18.9067, lng: 72.8147, name: "Colaba" },
  churchgate: { lat: 18.9322, lng: 72.8264, name: "Churchgate" },
  goregaon: { lat: 19.1663, lng: 72.8526, name: "Goregaon" },
  malad: { lat: 19.1874, lng: 72.8484, name: "Malad" },
  borivali: { lat: 19.2307, lng: 72.8567, name: "Borivali" },
  powai: { lat: 19.1176, lng: 72.9060, name: "Powai" },
  vikhroli: { lat: 19.1100, lng: 72.9253, name: "Vikhroli" },
  ghatkopar: { lat: 19.0860, lng: 72.9081, name: "Ghatkopar" },
  chembur: { lat: 19.0522, lng: 72.8994, name: "Chembur" },
  wadala: { lat: 19.0177, lng: 72.8674, name: "Wadala" },
  sion: { lat: 19.0404, lng: 72.8620, name: "Sion" },
  matunga: { lat: 19.0272, lng: 72.8560, name: "Matunga" },
  parel: { lat: 19.0048, lng: 72.8435, name: "Parel" },
  "lower parel": { lat: 18.9980, lng: 72.8310, name: "Lower Parel" },
  "marine lines": { lat: 18.9438, lng: 72.8234, name: "Marine Lines" },
  "grant road": { lat: 18.9630, lng: 72.8118, name: "Grant Road" },
  "mumbai central": { lat: 18.9710, lng: 72.8197, name: "Mumbai Central" },
  vashi: { lat: 19.0771, lng: 72.9986, name: "Vashi" },
  thane: { lat: 19.2183, lng: 72.9781, name: "Thane" },
  "bandra west": { lat: 19.0596, lng: 72.8295, name: "Bandra West" },
  "andheri west": { lat: 19.1362, lng: 72.8296, name: "Andheri West" },
  "andheri east": { lat: 19.1136, lng: 72.8697, name: "Andheri East" },
  versova: { lat: 19.1320, lng: 72.8140, name: "Versova" },
  santacruz: { lat: 19.0841, lng: 72.8410, name: "Santacruz" },
  khar: { lat: 19.0725, lng: 72.8362, name: "Khar" },
};

export function getLocationCoords(name: string): LocationCoords | null {
  const key = name.toLowerCase().trim();
  return MUMBAI_LOCATIONS[key] || null;
}

// Generate intermediate waypoints between two points for route display
export function generateRouteWaypoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numPoints: number = 6
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    // Add slight curve for realistic road-like path
    const jitter = i > 0 && i < numPoints - 1 ? (Math.sin(i * 1.5) * 0.003) : 0;
    points.push([
      startLat + (endLat - startLat) * t + jitter,
      startLng + (endLng - startLng) * t - jitter * 0.5,
    ]);
  }
  return points;
}
