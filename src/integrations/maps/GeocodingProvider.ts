import type { Coordinates } from "@/types/domain";

export interface GeocodingProvider {
  geocode(query: string): Promise<Coordinates | null>;
}

export class DemoGeocodingProvider implements GeocodingProvider {
  async geocode(query: string) {
    const normalized = query.toLowerCase();
    if (normalized.includes("nashville") || normalized.includes("372")) {
      return Promise.resolve({ latitude: 36.1627, longitude: -86.7816 });
    }
    if (normalized.includes("knoxville")) {
      return Promise.resolve({ latitude: 35.9606, longitude: -83.9207 });
    }
    return Promise.resolve(null);
  }
}
