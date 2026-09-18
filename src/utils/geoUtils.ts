import { ProjectItem, ForemanItem, ForemanAssignment } from '../types';

export interface GeoLocationPoint {
  id: string;
  type: 'PROJECT_MAIN' | 'FOREMAN_WORK_SITE' | 'FOREMAN_BASE' | 'DAILY_LOG_POINT';
  title: string;
  subtitle?: string;
  lokasi: string;
  patokan?: string;
  lat: number;
  lng: number;
  mandorName?: string;
  mandorContact?: string;
  picName?: string;
  picContact?: string;
  status?: string;
  statusBadgeColor?: string;
  noSPBJ?: string;
  notes?: string;
  manpowerCount?: number;
  updatedAt?: string;
  radiusMeter?: number;
}

// Default fallback PLN electrical project coordinate centers in Jabodetabek / Jabar
export const DEFAULT_PLN_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  // Jakarta
  'gambir': { lat: -6.1768, lng: 106.8306 },
  'menteng': { lat: -6.1950, lng: 106.8350 },
  'cempaka': { lat: -6.1720, lng: 106.8650 },
  'jakarta pusat': { lat: -6.1805, lng: 106.8284 },
  'jakarta selatan': { lat: -6.2615, lng: 106.8106 },
  'jakarta timur': { lat: -6.2250, lng: 106.9004 },
  'jakarta barat': { lat: -6.1683, lng: 106.7589 },
  'jakarta utara': { lat: -6.1384, lng: 106.8640 },

  // Bekasi & Cikarang
  'cikarang': { lat: -6.3050, lng: 107.1500 },
  'cikarang pusat': { lat: -6.3644, lng: 107.1706 },
  'cikarang barat': { lat: -6.2680, lng: 107.0980 },
  'cikarang timur': { lat: -6.3240, lng: 107.2100 },
  'giic': { lat: -6.3685, lng: 107.1852 },
  'deltamas': { lat: -6.3620, lng: 107.1725 },
  'jababeka': { lat: -6.3120, lng: 107.1350 },
  'cibitung': { lat: -6.2625, lng: 107.0850 },
  'mm2100': { lat: -6.2950, lng: 107.0850 },
  'tambun': { lat: -6.2650, lng: 107.0600 },
  'bekasi': { lat: -6.2383, lng: 106.9756 },

  // Karawang
  'karawang': { lat: -6.3060, lng: 107.3015 },
  'karawang barat': { lat: -6.3210, lng: 107.2750 },
  'kiic': { lat: -6.3550, lng: 107.2880 },
  'suryacipta': { lat: -6.3880, lng: 107.3350 },
  'jatiluhur': { lat: -6.5320, lng: 107.3910 },

  // Tangerang & Banten
  'tangerang': { lat: -6.1783, lng: 106.6319 },
  'bsd': { lat: -6.3016, lng: 106.6525 },
  'serpong': { lat: -6.3200, lng: 106.6700 },

  // Default Center (Greater Jakarta / Cikarang Hub)
  'default': { lat: -6.2845, lng: 107.1425 }
};

/**
 * Parses GPS coordinates from a text string or object.
 * Returns null if invalid.
 */
export function parseCoordinates(input?: string | { lat: number; lng: number } | null): { lat: number; lng: number } | null {
  if (!input) return null;
  if (typeof input === 'object' && typeof input.lat === 'number' && typeof input.lng === 'number') {
    if (!isNaN(input.lat) && !isNaN(input.lng)) {
      return { lat: input.lat, lng: input.lng };
    }
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Format: "-6.2146, 106.8451" or "-6.2146 106.8451"
    const match = trimmed.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }
  return null;
}

/**
 * Intelligent location matching for Indonesian electrical job sites to derive realistic coordinates
 */
export function getCoordinatesForLocationName(locationName?: string, indexSeed = 0): { lat: number; lng: number } {
  if (!locationName) return DEFAULT_PLN_LOCATIONS.default;

  const locLower = locationName.toLowerCase();

  for (const [key, coords] of Object.entries(DEFAULT_PLN_LOCATIONS)) {
    if (key !== 'default' && locLower.includes(key)) {
      // Add slight deterministic pseudo-offset based on indexSeed so multiple points don't perfectly overlap
      const latOffset = ((indexSeed * 7) % 19 - 9) * 0.0035;
      const lngOffset = ((indexSeed * 11) % 23 - 11) * 0.0035;
      return {
        lat: Number((coords.lat + latOffset).toFixed(6)),
        lng: Number((coords.lng + lngOffset).toFixed(6))
      };
    }
  }

  // Fallback with pseudo-offset
  const base = DEFAULT_PLN_LOCATIONS.default;
  const latOffset = ((indexSeed * 7) % 19 - 9) * 0.004;
  const lngOffset = ((indexSeed * 11) % 23 - 11) * 0.004;
  return {
    lat: Number((base.lat + latOffset).toFixed(6)),
    lng: Number((base.lng + lngOffset).toFixed(6))
  };
}

/**
 * Calculates distance in kilometers between two GPS points using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Extracts and consolidates all map points related to a specific project:
 * 1. Project primary job site coordinate
 * 2. Foreman assignments matching this project (by SPBJ, by project name, or by foreman name)
 * 3. Daily log installed material points
 */
export function extractProjectGeoPoints(
  project: ProjectItem,
  allForemen: ForemanItem[] = []
): { points: GeoLocationPoint[]; centerPoint: GeoLocationPoint } {
  const points: GeoLocationPoint[] = [];

  // 1. Primary Project Location Point
  let projCoords = parseCoordinates(
    project.koordinatLat && project.koordinatLng
      ? { lat: project.koordinatLat, lng: project.koordinatLng }
      : project.koordinatGps
  );

  if (!projCoords) {
    projCoords = getCoordinatesForLocationName(project.lokasi, project.no);
  }

  const projectMainPoint: GeoLocationPoint = {
    id: `pt-proj-${project.id}`,
    type: 'PROJECT_MAIN',
    title: `Titik Pekerjaan: ${project.namaPekerjaan}`,
    subtitle: `No. SPBJ: ${project.noSPBJ}`,
    lokasi: project.lokasi,
    lat: projCoords.lat,
    lng: projCoords.lng,
    mandorName: project.mandor,
    mandorContact: project.mandorKontak,
    picName: project.pic,
    picContact: project.picKontak,
    status: project.status,
    statusBadgeColor:
      project.status === 'COMPLETED'
        ? 'bg-emerald-500 text-white'
        : project.status === 'ON_PROGRESS'
        ? 'bg-amber-500 text-slate-950'
        : 'bg-slate-500 text-white',
    noSPBJ: project.noSPBJ,
    notes: project.catatanHarian || 'Titik pusat pelaksanaan pekerjaan SPBJ.',
    manpowerCount: project.manpower?.total || 0,
    updatedAt: project.updatedAt,
    radiusMeter: project.radiusAreaMeter || 500
  };

  points.push(projectMainPoint);

  // 2. Find matching foremen assignments
  const projectSpbjNormalized = project.noSPBJ.toLowerCase().trim();
  const projectNameNormalized = project.namaPekerjaan.toLowerCase().trim();
  const projectMandorNormalized = project.mandor.toLowerCase().trim();

  let assignmentCount = 0;

  allForemen.forEach((foreman, fIdx) => {
    // Check if this foreman is assigned directly or has matching assignments
    const isDirectMandor =
      projectMandorNormalized &&
      (foreman.namaMandor.toLowerCase().includes(projectMandorNormalized) ||
        projectMandorNormalized.includes(foreman.namaMandor.toLowerCase()));

    foreman.assignments?.forEach((asg, aIdx) => {
      const matchSpbj =
        asg.noSPBJ &&
        (asg.noSPBJ.toLowerCase().includes(projectSpbjNormalized) ||
          projectSpbjNormalized.includes(asg.noSPBJ.toLowerCase()));

      const matchPekerjaan =
        asg.namaPekerjaan &&
        (asg.namaPekerjaan.toLowerCase().includes(projectNameNormalized) ||
          projectNameNormalized.includes(asg.namaPekerjaan.toLowerCase()));

      const matchLocation =
        asg.lokasiPekerjaan &&
        (asg.lokasiPekerjaan.toLowerCase().includes(project.lokasi.toLowerCase()) ||
          project.lokasi.toLowerCase().includes(asg.lokasiPekerjaan.toLowerCase()));

      if (isDirectMandor || matchSpbj || matchPekerjaan || matchLocation) {
        assignmentCount++;
        let asgCoords = parseCoordinates(
          asg.koordinatLat && asg.koordinatLng
            ? { lat: asg.koordinatLat, lng: asg.koordinatLng }
            : asg.koordinatGps
        );

        if (!asgCoords) {
          // Calculate offset relative to main project coordinate
          asgCoords = getCoordinatesForLocationName(
            asg.lokasiPekerjaan || project.lokasi,
            (fIdx + 1) * 3 + aIdx
          );
        }

        points.push({
          id: `pt-asg-${asg.id || `${foreman.id}-${aIdx}`}`,
          type: 'FOREMAN_WORK_SITE',
          title: `Titik Mandor: ${foreman.namaMandor}`,
          subtitle: asg.lokasiPekerjaan || 'Posko / Titik Kerja Lapangan',
          lokasi: asg.lokasiPekerjaan || project.lokasi,
          patokan: asg.patokanLokasi || 'Area Tiang / Gardu Kerja Mandor',
          lat: asgCoords.lat,
          lng: asgCoords.lng,
          mandorName: foreman.namaMandor,
          mandorContact: foreman.kontak,
          picName: asg.pic || project.pic,
          picContact: asg.picKontak || project.picKontak,
          status: asg.statusPenugasan || 'BERJALAN',
          statusBadgeColor:
            asg.statusPenugasan === 'SELESAI'
              ? 'bg-emerald-600 text-white'
              : asg.statusPenugasan === 'BERJALAN'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-blue-600 text-white',
          noSPBJ: asg.noSPBJ || project.noSPBJ,
          notes: asg.keterangan || foreman.spesialisasi || 'Penugasan mandor lapangan.',
          manpowerCount: foreman.jumlahAnggota || 8,
          updatedAt: foreman.updatedAt,
          radiusMeter: 250
        });
      }
    });

    // If this foreman is the project's assigned mandor but has no explicit assignment entry
    if (isDirectMandor && foreman.assignments.length === 0) {
      const foremanBaseCoords = getCoordinatesForLocationName(
        foreman.baseLocation || project.lokasi,
        fIdx + 5
      );

      points.push({
        id: `pt-mandor-base-${foreman.id}`,
        type: 'FOREMAN_WORK_SITE',
        title: `Titik Mandor: ${foreman.namaMandor}`,
        subtitle: `Posko Tim Pelaksana (${foreman.jumlahAnggota || 8} Personil)`,
        lokasi: project.lokasi,
        patokan: foreman.baseLocation || 'Posko Kerja Mandor Lapangan',
        lat: Number((projCoords!.lat + 0.0035).toFixed(6)),
        lng: Number((projCoords!.lng + 0.0035).toFixed(6)),
        mandorName: foreman.namaMandor,
        mandorContact: foreman.kontak,
        picName: project.pic,
        picContact: project.picKontak,
        status: 'BERJALAN',
        statusBadgeColor: 'bg-amber-500 text-slate-950',
        noSPBJ: project.noSPBJ,
        notes: foreman.spesialisasi || 'Mandor pelaksana proyek.',
        manpowerCount: foreman.jumlahAnggota || 8,
        radiusMeter: 200
      });
    }
  });

  // If no foreman was found in the database, automatically generate the designated project mandor location point
  if (points.length === 1 && project.mandor) {
    points.push({
      id: `pt-mandor-fallback-${project.id}`,
      type: 'FOREMAN_WORK_SITE',
      title: `Titik Mandor: ${project.mandor}`,
      subtitle: `Regu Pelaksana Lapangan (${project.manpower?.total || 6} Personil)`,
      lokasi: project.lokasi,
      patokan: 'Posko Kerja Mandor Lapangan',
      lat: Number((projCoords.lat + 0.0028).toFixed(6)),
      lng: Number((projCoords.lng + 0.0028).toFixed(6)),
      mandorName: project.mandor,
      mandorContact: project.mandorKontak,
      picName: project.pic,
      picContact: project.picKontak,
      status: 'BERJALAN',
      statusBadgeColor: 'bg-amber-500 text-slate-950',
      noSPBJ: project.noSPBJ,
      notes: `Alokasi tim: ${project.manpower?.teknisiListrik || 3} Teknisi, ${project.manpower?.helper || 2} Helper, ${project.manpower?.hseOfficer || 1} K3`,
      manpowerCount: project.manpower?.total || 6,
      radiusMeter: 200
    });
  }

  // 3. Add Daily Log material locations if available
  project.dailyLogs?.forEach((log, logIdx) => {
    log.materialTerpasang?.forEach((mat, mIdx) => {
      if (mat.lokasiTitik && points.length < 8) {
        // slight offset for material points
        const matLat = Number((projCoords!.lat + ((logIdx + 1) * 0.0018 - 0.002)).toFixed(6));
        const matLng = Number((projCoords!.lng + ((mIdx + 1) * 0.0018 - 0.002)).toFixed(6));

        points.push({
          id: `pt-mat-${log.id}-${mat.id || mIdx}`,
          type: 'DAILY_LOG_POINT',
          title: `Titik Material: ${mat.namaMaterial}`,
          subtitle: `Lokasi: ${mat.lokasiTitik}`,
          lokasi: mat.lokasiTitik,
          lat: matLat,
          lng: matLng,
          mandorName: log.author,
          notes: `${mat.volume} ${mat.satuan} - ${mat.spesifikasi || ''} (${mat.kondisiStatus || 'TERPASANG_BAIK'})`,
          status: 'TERPASANG',
          statusBadgeColor: 'bg-indigo-600 text-white'
        });
      }
    });
  });

  return {
    points,
    centerPoint: projectMainPoint
  };
}

/**
 * Creates Google Maps URL
 */
export function getGoogleMapsUrl(lat: number, lng: number, label?: string): string {
  const query = label ? `${encodeURIComponent(label)}@${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Creates Google Maps Navigation / Directions URL
 */
export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Creates Waze Navigation URL
 */
export function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
