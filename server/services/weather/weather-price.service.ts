import axios from 'axios';
import { cacheService } from '../../config/redis';
import { logger } from '../../utils/logger';

const OPENMETEO_API = 'https://api.open-meteo.com/v1';
const CACHE_TTL = 300; // 5 minutes for weather data

interface WeatherData {
  temperature: number;
  lastUpdated: Date;
}

export class WeatherService {
  /**
   * Get current temperature for a location
   * @param latitude 
   * @param longitude 
   */
  static async getTemperature(latitude: number, longitude: number): Promise<number | null> {
    try {
      const cacheKey = `weather:temp:${latitude}:${longitude}`;
      const cached = await cacheService.get<number>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${OPENMETEO_API}/forecast`, {
        params: {
          latitude,
          longitude,
          current_weather: true,
          temperature_unit: 'fahrenheit'
        },
        timeout: 5000
      });

      const temperature = response.data.current_weather.temperature;
      await cacheService.set(cacheKey, temperature, CACHE_TTL);
      
      return temperature;
    } catch (error) {
      logger.error(`Error fetching temperature for ${latitude},${longitude}:`, error);
      return null;
    }
  }

  /**
   * Get temperature by city name (using common coordinates)
   */
  static async getTemperatureByCity(city: string): Promise<number | null> {
    const cityCoords: Record<string, { lat: number; lon: number }> = {
      'new york': { lat: 40.7128, lon: -74.0060 },
      'nyc': { lat: 40.7128, lon: -74.0060 },
      'los angeles': { lat: 34.0522, lon: -118.2437 },
      'chicago': { lat: 41.8781, lon: -87.6298 },
      'houston': { lat: 29.7604, lon: -95.3698 },
      'miami': { lat: 25.7617, lon: -80.1918 },
      'london': { lat: 51.5074, lon: -0.1278 },
      'paris': { lat: 48.8566, lon: 2.3522 },
      'tokyo': { lat: 35.6762, lon: 139.6503 },
    };

    const coords = cityCoords[city.toLowerCase()];
    if (!coords) {
      logger.warn(`Unknown city: ${city}`);
      return null;
    }

    return this.getTemperature(coords.lat, coords.lon);
  }

  /**
   * Extract city from market title
   */
  static extractCityFromTitle(title: string): string | null {
    const cities = ['new york', 'nyc', 'los angeles', 'chicago', 'houston', 'miami', 'london', 'paris', 'tokyo'];
    
    for (const city of cities) {
      if (title.toLowerCase().includes(city)) {
        return city;
      }
    }
    
    return null;
  }
}
