import axios from 'axios';
import { WeatherData, CityCoordinates } from '../../types';
import logger from '../../utils/logger';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';

const CITIES: Record<string, CityCoordinates> = {
  'NEW_YORK': { lat: 40.7128, lon: -74.006 },
  'NYC': { lat: 40.7128, lon: -74.006 },
  'LOS_ANGELES': { lat: 34.0522, lon: -118.2437 },
  'LA': { lat: 34.0522, lon: -118.2437 },
  'CHICAGO': { lat: 41.8781, lon: -87.6298 },
  'MIAMI': { lat: 25.7617, lon: -80.1918 },
  'HOUSTON': { lat: 29.7604, lon: -95.3698 },
  'PHOENIX': { lat: 33.4484, lon: -112.074 },
  'PHILADELPHIA': { lat: 39.9526, lon: -75.1652 },
  'SAN_ANTONIO': { lat: 29.4241, lon: -98.4936 },
  'SAN_DIEGO': { lat: 32.7157, lon: -117.1611 },
  'DALLAS': { lat: 32.7767, lon: -96.797 },
  'SAN_JOSE': { lat: 37.3382, lon: -121.8863 },
  'AUSTIN': { lat: 30.2672, lon: -97.7431 },
  'JACKSONVILLE': { lat: 30.3322, lon: -81.6557 },
  'FORT_WORTH': { lat: 32.7555, lon: -97.3308 },
  'COLUMBUS': { lat: 39.9612, lon: -82.9988 },
  'CHARLOTTE': { lat: 35.2271, lon: -80.8431 },
  'SAN_FRANCISCO': { lat: 37.7749, lon: -122.4194 },
  'SF': { lat: 37.7749, lon: -122.4194 },
  'INDIANAPOLIS': { lat: 39.7684, lon: -86.1581 },
  'SEATTLE': { lat: 47.6062, lon: -122.3321 },
  'DENVER': { lat: 39.7392, lon: -104.9903 },
  'WASHINGTON': { lat: 38.9072, lon: -77.0369 },
  'DC': { lat: 38.9072, lon: -77.0369 },
  'BOSTON': { lat: 42.3601, lon: -71.0589 },
  'NASHVILLE': { lat: 36.1627, lon: -86.7816 },
  'DETROIT': { lat: 42.3314, lon: -83.0458 },
  'PORTLAND': { lat: 45.5152, lon: -122.6784 },
  'LAS_VEGAS': { lat: 36.1699, lon: -115.1398 },
  'VEGAS': { lat: 36.1699, lon: -115.1398 },
  'ATLANTA': { lat: 33.749, lon: -84.388 },
  'MEMPHIS': { lat: 35.1495, lon: -90.049 },
  'BALTIMORE': { lat: 39.2904, lon: -76.6122 },
  'MILWAUKEE': { lat: 43.0389, lon: -87.9065 },
  'ALBUQUERQUE': { lat: 35.0844, lon: -106.6504 },
  'TUCSON': { lat: 32.2226, lon: -110.9747 },
  'FRESNO': { lat: 36.7378, lon: -119.7871 },
  'SACRAMENTO': { lat: 38.5816, lon: -121.4944 },
  'KANSAS_CITY': { lat: 39.0997, lon: -94.5786 },
  'MESA': { lat: 33.4152, lon: -111.8315 },
  'OMAHA': { lat: 41.2565, lon: -95.9345 },
  'CLEVELAND': { lat: 41.4993, lon: -81.6944 },
  'MINNEAPOLIS': { lat: 44.9778, lon: -93.265 },
  'NEW_ORLEANS': { lat: 29.9511, lon: -90.0715 },
  'TAMPA': { lat: 27.9506, lon: -82.4572 },
  'ORLANDO': { lat: 28.5383, lon: -81.3792 },
  'SALT_LAKE_CITY': { lat: 40.7608, lon: -111.891 },
  'PITTSBURGH': { lat: 40.4406, lon: -79.9959 },
  'CINCINNATI': { lat: 39.1031, lon: -84.512 },
  'ST_LOUIS': { lat: 38.627, lon: -90.1994 },
};

const WMO_CODES: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail',
};

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export class OpenMeteoService {
  private normalizeCity(city: string): string {
    return city.toUpperCase().replace(/\s+/g, '_');
  }

  private getCoordinates(city: string): CityCoordinates {
    const normalized = this.normalizeCity(city);
    const coords = CITIES[normalized];
    if (!coords) {
      throw new Error(`Unsupported city: ${city}`);
    }
    return coords;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    const coords = this.getCoordinates(city);
    const url = `${OPEN_METEO_BASE_URL}/forecast`;

    interface OpenMeteoResponse {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number;
      };
      hourly: {
        time: string[];
        temperature_2m: number[];
      };
    }

    try {
      const response = await axios.get<OpenMeteoResponse>(url, {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
          hourly: 'temperature_2m',
          temperature_unit: 'celsius',
          wind_speed_unit: 'kmh',
          forecast_days: 2,
          timezone: 'auto',
        },
        timeout: 10000,
      });

      const data = response.data;
      const forecast24h = data.hourly.time.slice(0, 24).map((time, i) => ({
        time,
        temp: Math.round(celsiusToFahrenheit(data.hourly.temperature_2m[i] ?? 0)),
      }));

      return {
        city: this.normalizeCity(city),
        temperature: Math.round(celsiusToFahrenheit(data.current.temperature_2m)),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(kmhToMph(data.current.wind_speed_10m)),
        condition: WMO_CODES[data.current.weather_code] || 'Unknown',
        forecast24h,
        lastUpdate: new Date(),
        source: 'open-meteo',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Open-Meteo API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getForecast(city: string, hours: number = 24): Promise<WeatherData> {
    const coords = this.getCoordinates(city);
    const url = `${OPEN_METEO_BASE_URL}/forecast`;
    const forecastDays = Math.ceil(hours / 24);

    interface OpenMeteoResponse {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number;
      };
      hourly: {
        time: string[];
        temperature_2m: number[];
      };
    }

    try {
      const response = await axios.get<OpenMeteoResponse>(url, {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
          hourly: 'temperature_2m',
          temperature_unit: 'celsius',
          wind_speed_unit: 'kmh',
          forecast_days: Math.min(forecastDays, 16),
          timezone: 'auto',
        },
        timeout: 10000,
      });

      const data = response.data;
      const forecast24h = data.hourly.time.slice(0, hours).map((time, i) => ({
        time,
        temp: Math.round(celsiusToFahrenheit(data.hourly.temperature_2m[i] ?? 0)),
      }));

      return {
        city: this.normalizeCity(city),
        temperature: Math.round(celsiusToFahrenheit(data.current.temperature_2m)),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(kmhToMph(data.current.wind_speed_10m)),
        condition: WMO_CODES[data.current.weather_code] || 'Unknown',
        forecast24h,
        lastUpdate: new Date(),
        source: 'open-meteo',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Open-Meteo API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  getSupportedCities(): string[] {
    return Object.keys(CITIES).filter((city) => !['NYC', 'LA', 'SF', 'DC', 'VEGAS'].includes(city));
  }

  isSupported(city: string): boolean {
    return this.normalizeCity(city) in CITIES;
  }
}

export const openMeteoService = new OpenMeteoService();
