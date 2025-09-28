import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaSun, FaCloud, FaCloudRain, FaCloudSun, FaThermometerHalf, FaTint, FaWind } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike?: number;
  uvIndex?: number;
  visibility?: number;
  pressure?: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    precipitation?: number;
  }>;
  alerts?: Array<{
    type: string;
    title: string;
    description: string;
    severity: string;
  }>;
  lastUpdated?: string;
}

const WeatherWidget: React.FC = () => {
  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ['/weather'],
  });

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny')) return <FaSun className="text-warning" />;
    if (lowerCondition.includes('cloudy')) return <FaCloud className="text-secondary" />;
    if (lowerCondition.includes('rain')) return <FaCloudRain className="text-info" />;
    if (lowerCondition.includes('partly')) return <FaCloudSun className="text-warning" />;
    return <FaSun className="text-warning" />;
  };

  if (isLoading) {
    return (
      <AnimatedCard>
        <div className="card-header">
          <h5 className="mb-0">Weather</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  if (!weather) return null;

  return (
    <AnimatedCard>
      <div className="card-header">
        <h5 className="mb-0">Weather</h5>
      </div>
      <div className="card-body">
        <div className="current-weather mb-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="mb-1">{weather.temperature}°F</h3>
              <p className="text-muted mb-0">{weather.condition}</p>
              <small className="text-muted">{weather.location}</small>
            </div>
            <div className="weather-icon fs-1">
              {getWeatherIcon(weather.condition)}
            </div>
          </div>
        </div>

        <div className="weather-details mb-3">
          <div className="row g-2">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <FaTint className="text-info me-2" />
                <small>{weather.humidity}%</small>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <FaWind className="text-secondary me-2" />
                <small>{weather.windSpeed} mph</small>
              </div>
            </div>
            {weather.feelsLike && (
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <FaThermometerHalf className="text-warning me-2" />
                  <small>Feels like {weather.feelsLike}°F</small>
                </div>
              </div>
            )}
            {weather.uvIndex && (
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <FaSun className="text-warning me-2" />
                  <small>UV {weather.uvIndex}</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {weather.alerts && weather.alerts.length > 0 && (
          <div className="weather-alerts mb-3">
            {weather.alerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.type} alert-sm`}>
                <strong>{alert.title}</strong>
                <br />
                <small>{alert.description}</small>
              </div>
            ))}
          </div>
        )}

        <div className="forecast">
          <h6 className="mb-2">5-Day Forecast</h6>
          <div className="forecast-list">
            {weather.forecast.map((day, index) => (
              <div key={index} className="d-flex align-items-center justify-content-between py-1">
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    {getWeatherIcon(day.condition)}
                  </div>
                  <small className="fw-semibold">{day.day}</small>
                </div>
                <div className="text-end">
                  <small className="fw-semibold">{day.high}°</small>
                  <small className="text-muted ms-1">{day.low}°</small>
                  {day.precipitation && (
                    <div className="small text-info">
                      {day.precipitation}% rain
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default WeatherWidget;
