import axios from 'axios';
import { WeatherData, CityCoordinates } from '../../types';
import { env } from '../../config/env';
import logger from '../../utils/logger';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

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
  'SAN_FRANCISCO': { lat: 37.7749, lon: -122.4194 },
  'SF': { lat: 37.7749, lon: -122.4194 },
  'SEATTLE': { lat: 47.6062, lon: -122.3321 },
  'DENVER': { lat: 39.7392, lon: -104.9903 },
  'BOSTON': { lat: 42.3601, lon: -71.0589 },
  'ATLANTA': { lat: 33.749, lon: -84.388 },
  'DALLAS': { lat: 32.7767, lon: -96.797 },
  'LAS_VEGAS': { lat: 36.1699, lon: -115.1398 },
  'VEGAS': { lat: 36.1699, lon: -115.1398 },
};

export class OpenWeatherService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = env.openweatherApiKey;
  }

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
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const coords = this.getCoordinates(city);
    const url = `${OPENWEATHER_BASE_URL}/weather`;

    interface OpenWeatherResponse {
      main: {
        temp: number;
        humidity: number;
      };
      wind: {
        speed: number;
      };
      weather: Array<{
        main: string;
        description: string;
      }>;
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(url, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.apiKey,
          units: 'imperial',
        },
        timeout: 10000,
      });

      const data = response.data;

      return {
        city: this.normalizeCity(city),
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        condition: data.weather[0]?.main || 'Unknown',
        forecast24h: [],
        lastUpdate: new Date(),
        source: 'openweather',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenWeather API key');
        }
        throw new Error(`OpenWeather API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  async getForecast(city: string, hours: number = 24): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const coords = this.getCoordinates(city);
    const url = `${OPENWEATHER_BASE_URL}/forecast`;

    interface ForecastItem {
      dt: number;
      main: {
        temp: number;
        humidity: number;
      };
      wind: {
        speed: number;
      };
      weather: Array<{
        main: string;
      }>;
    }

    interface OpenWeatherForecastResponse {
      list: ForecastItem[];
    }

    try {
      const response = await axios.get<OpenWeatherForecastResponse>(url, {
        params: {
          lat: coords.lat,
          lon: coords.lon,
          appid: this.apiKey,
          units: 'imperial',
          cnt: Math.ceil(hours / 3),
        },
        timeout: 10000,
      });

      const data = response.data;
      const firstItem = data.list[0];

      const forecast24h = data.list.slice(0, Math.ceil(hours / 3)).map((item) => ({
        time: new Date(item.dt * 1000).toISOString(),
        temp: Math.round(item.main.temp),
      }));

      return {
        city: this.normalizeCity(city),
        temperature: firstItem ? Math.round(firstItem.main.temp) : 0,
        humidity: firstItem?.main.humidity || 0,
        windSpeed: firstItem ? Math.round(firstItem.wind.speed) : 0,
        condition: firstItem?.weather[0]?.main || 'Unknown',
        forecast24h,
        lastUpdate: new Date(),
        source: 'openweather',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenWeather API error: ${error.response?.status || error.message}`);
      }
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  isSupported(city: string): boolean {
    return this.normalizeCity(city) in CITIES;
  }
}

export const openWeatherService = new OpenWeatherService();
