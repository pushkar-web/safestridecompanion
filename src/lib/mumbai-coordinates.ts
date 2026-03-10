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
  "marine drive": { lat: 18.9438, lng: 72.8234, name: "Marine Drive" },
  "grant road": { lat: 18.9630, lng: 72.8118, name: "Grant Road" },
  "mumbai central": { lat: 18.9710, lng: 72.8197, name: "Mumbai Central" },
  vashi: { lat: 19.0771, lng: 72.9986, name: "Vashi" },
  thane: { lat: 19.2183, lng: 72.9781, name: "Thane" },
  "bandra west": { lat: 19.0596, lng: 72.8295, name: "Bandra West" },
  "bandra east": { lat: 19.0596, lng: 72.8395, name: "Bandra East" },
  "andheri west": { lat: 19.1362, lng: 72.8296, name: "Andheri West" },
  "andheri east": { lat: 19.1136, lng: 72.8697, name: "Andheri East" },
  versova: { lat: 19.1320, lng: 72.8140, name: "Versova" },
  santacruz: { lat: 19.0841, lng: 72.8410, name: "Santacruz" },
  khar: { lat: 19.0725, lng: 72.8362, name: "Khar" },
  bkc: { lat: 19.0658, lng: 72.8695, name: "BKC" },
  "bandra kurla complex": { lat: 19.0658, lng: 72.8695, name: "BKC" },
  dharavi: { lat: 19.0430, lng: 72.8527, name: "Dharavi" },
  mahim: { lat: 19.0376, lng: 72.8409, name: "Mahim" },
  "vile parle": { lat: 19.0968, lng: 72.8517, name: "Vile Parle" },
  "vile parle west": { lat: 19.0968, lng: 72.8417, name: "Vile Parle West" },
  "vile parle east": { lat: 19.0968, lng: 72.8617, name: "Vile Parle East" },
  jogeshwari: { lat: 19.1356, lng: 72.8497, name: "Jogeshwari" },
  "kandivali": { lat: 19.2094, lng: 72.8520, name: "Kandivali" },
  dahisar: { lat: 19.2502, lng: 72.8536, name: "Dahisar" },
  mulund: { lat: 19.1726, lng: 72.9562, name: "Mulund" },
  bhandup: { lat: 19.1478, lng: 72.9370, name: "Bhandup" },
  kanjurmarg: { lat: 19.1313, lng: 72.9340, name: "Kanjurmarg" },
  nahur: { lat: 19.1550, lng: 72.9510, name: "Nahur" },
  "fort": { lat: 18.9340, lng: 72.8360, name: "Fort" },
  csmt: { lat: 18.9398, lng: 72.8354, name: "CSMT" },
  "nariman point": { lat: 18.9256, lng: 72.8242, name: "Nariman Point" },
  "haji ali": { lat: 18.9827, lng: 72.8127, name: "Haji Ali" },
  prabhadevi: { lat: 19.0100, lng: 72.8280, name: "Prabhadevi" },
  "elphinstone": { lat: 19.0070, lng: 72.8300, name: "Elphinstone" },
  byculla: { lat: 18.9786, lng: 72.8328, name: "Byculla" },
  "masjid bunder": { lat: 18.9530, lng: 72.8400, name: "Masjid Bunder" },
  sandhurst: { lat: 18.9600, lng: 72.8420, name: "Sandhurst Road" },
  chinchpokli: { lat: 18.9730, lng: 72.8380, name: "Chinchpokli" },
  "curry road": { lat: 18.9930, lng: 72.8430, name: "Curry Road" },
  "king circle": { lat: 19.0290, lng: 72.8580, name: "King Circle" },
  "shivaji park": { lat: 19.0280, lng: 72.8380, name: "Shivaji Park" },
  girgaon: { lat: 18.9540, lng: 72.8160, name: "Girgaon" },
  "girgaon chowpatty": { lat: 18.9553, lng: 72.8134, name: "Girgaon Chowpatty" },
  tardeo: { lat: 18.9720, lng: 72.8140, name: "Tardeo" },
  "breach candy": { lat: 18.9780, lng: 72.8060, name: "Breach Candy" },
  "peddar road": { lat: 18.9720, lng: 72.8080, name: "Peddar Road" },
  malabar: { lat: 18.9530, lng: 72.7980, name: "Malabar Hill" },
  "malabar hill": { lat: 18.9530, lng: 72.7980, name: "Malabar Hill" },
  "navi mumbai": { lat: 19.0330, lng: 73.0297, name: "Navi Mumbai" },
  panvel: { lat: 18.9894, lng: 73.1175, name: "Panvel" },
  nerul: { lat: 19.0330, lng: 73.0190, name: "Nerul" },
  airoli: { lat: 19.1550, lng: 72.9990, name: "Airoli" },
  belapur: { lat: 19.0235, lng: 73.0390, name: "CBD Belapur" },
  kharghar: { lat: 19.0474, lng: 73.0675, name: "Kharghar" },
  mankhurd: { lat: 19.0430, lng: 72.9300, name: "Mankhurd" },
  govandi: { lat: 19.0480, lng: 72.9130, name: "Govandi" },
  turbhe: { lat: 19.0730, lng: 73.0100, name: "Turbhe" },
  "juinagar": { lat: 19.0630, lng: 73.0070, name: "Juinagar" },
  "seawoods": { lat: 19.0240, lng: 73.0170, name: "Seawoods" },
  "gateway of india": { lat: 18.9220, lng: 72.8347, name: "Gateway of India" },
  "cuffe parade": { lat: 18.8920, lng: 72.8140, name: "Cuffe Parade" },
  lokhandwala: { lat: 19.1400, lng: 72.8300, name: "Lokhandwala" },
  oshiwara: { lat: 19.1450, lng: 72.8380, name: "Oshiwara" },
  "four bungalows": { lat: 19.1280, lng: 72.8180, name: "Four Bungalows" },
  kalina: { lat: 19.0750, lng: 72.8560, name: "Kalina" },
  vakola: { lat: 19.0780, lng: 72.8520, name: "Vakola" },
  "gorai": { lat: 19.2450, lng: 72.8150, name: "Gorai" },
  "mira road": { lat: 19.2812, lng: 72.8685, name: "Mira Road" },
  virar: { lat: 19.4559, lng: 72.8111, name: "Virar" },
  vasai: { lat: 19.3919, lng: 72.8397, name: "Vasai" },
  dombivli: { lat: 19.2183, lng: 73.0867, name: "Dombivli" },
  kalyan: { lat: 19.2437, lng: 73.1355, name: "Kalyan" },
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
