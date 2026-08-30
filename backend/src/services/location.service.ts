import axios from 'axios';
import { prisma } from '../config/database';

export const locationService = {
  /**
   * Geocodes an address string to lat/lon using OpenStreetMap Nominatim.
   */
  async getCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': 'FarmDirect-App/1.0',
        },
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },

  /**
   * Progressively attempts to geocode an address by dropping specific elements if it fails.
   */
  async progressiveGeocode(addressObj: any): Promise<{ lat: number; lon: number } | null> {
    if (!addressObj) return null;
    
    const attempts = [
      // 1. Full detailed address
      [addressObj.addressLine1, addressObj.addressLine2, addressObj.city, addressObj.state, addressObj.postalCode].filter(Boolean).join(', '),
      
      // 2. AddressLine1 + City + State + Postal Code (Drop AddressLine2 which often has apartment numbers causing failures)
      [addressObj.addressLine1, addressObj.city, addressObj.state, addressObj.postalCode].filter(Boolean).join(', '),
      
      // 3. City + Postal Code + State
      [addressObj.city, addressObj.postalCode, addressObj.state].filter(Boolean).join(', '),
      
      // 4. Broad City + State
      [addressObj.city, addressObj.state].filter(Boolean).join(', ')
    ];

    for (const query of attempts) {
      if (!query || query.trim().length === 0) continue;
      
      // Basic normalization
      const cleanQuery = query.replace(/undefined/g, '').replace(/null/g, '').replace(/NaN/g, '').replace(/\s+/g, ' ').trim();
      
      if (cleanQuery.length < 3) continue;
      
      const coords = await this.getCoordinates(cleanQuery);
      if (coords && coords.lat >= -90 && coords.lat <= 90 && coords.lon >= -180 && coords.lon <= 180) {
        return coords;
      }
    }
    
    return null;
  },

  /**
   * Resolves coordinates for a farmer profile if missing and saves them.
   */
  async resolveFarmerLocation(farmerId: string, address: string): Promise<{ lat: number; lon: number } | null> {
    const coords = await this.getCoordinates(address);
    if (coords) {
      await prisma.farmerProfile.update({
        where: { id: farmerId },
        data: {
          latitude: coords.lat,
          longitude: coords.lon,
        },
      });
    }
    return coords;
  },
  
  /**
   * Calculates the approximate geographic distance (Haversine) in km.
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};
