import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Loader2, MapPin, AlertTriangle, Search, LocateFixed, Sunrise, Sunset, Eye, Gauge } from 'lucide-react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { LanguageContext } from '../../contexts/LanguageContext';

// Weather code mapping (from Open-Meteo documentation)
const weatherConditions: { [code: number]: { description: string; icon: React.ElementType } } = {
    0: { description: 'Clear sky', icon: Sun },
    1: { description: 'Mainly clear', icon: Sun },
    2: { description: 'Partly cloudy', icon: Cloud },
    3: { description: 'Overcast', icon: Cloud },
    45: { description: 'Fog', icon: Cloud },
    48: { description: 'Rime fog', icon: Cloud },
    51: { description: 'Light drizzle', icon: CloudRain },
    53: { description: 'Drizzle', icon: CloudRain },
    55: { description: 'Dense drizzle', icon: CloudRain },
    56: { description: 'Light freezing drizzle', icon: CloudRain },
    57: { description: 'Dense freezing drizzle', icon: CloudRain },
    61: { description: 'Slight rain', icon: CloudRain },
    63: { description: 'Rain', icon: CloudRain },
    65: { description: 'Heavy rain', icon: CloudRain },
    66: { description: 'Light freezing rain', icon: CloudRain },
    67: { description: 'Heavy freezing rain', icon: CloudRain },
    71: { description: 'Slight snow', icon: CloudSnow },
    73: { description: 'Snow', icon: CloudSnow },
    75: { description: 'Heavy snow', icon: CloudSnow },
    77: { description: 'Snow grains', icon: CloudSnow },
    80: { description: 'Slight rain showers', icon: CloudRain },
    81: { description: 'Rain showers', icon: CloudRain },
    82: { description: 'Violent rain showers', icon: CloudRain },
    85: { description: 'Slight snow showers', icon: CloudSnow },
    86: { description: 'Heavy snow showers', icon: CloudSnow },
    95: { description: 'Thunderstorm', icon: CloudRain },
    96: { description: 'Thunderstorm with hail', icon: CloudRain },
    99: { description: 'Thunderstorm with heavy hail', icon: CloudRain },
};

const getWeatherInfo = (code: number) => {
    return weatherConditions[code] || { description: 'Unknown', icon: Sun };
};

const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
const getDayOfWeek = (dateString: string) => new Date(dateString).toLocaleDateString([], { weekday: 'short' });


interface WeatherData {
    name: string;
    current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
        surface_pressure: number;
        visibility: number;
    };
    daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        sunrise: string[];
        sunset: string[];
    };
}

const CurrentWeatherDetails = ({ weatherData }: { weatherData: WeatherData }) => {
    const { t } = useContext(LanguageContext);
    return (
    <div className="text-center w-full animate-fade-in pt-4">
        <div className="flex items-center justify-center gap-2">
            <MapPin size={18} />
            <h2 className="text-2xl font-bold">{weatherData.name}</h2>
        </div>
        <div className="my-4">
            {React.createElement(getWeatherInfo(weatherData.current.weather_code).icon, { size: 64 })}
        </div>
        <p className="text-6xl font-bold">{Math.round(weatherData.current.temperature_2m)}°C</p>
        <p className="text-lg mt-2 font-medium">{getWeatherInfo(weatherData.current.weather_code).description}</p>
        <p className="text-sm opacity-80">{t('feelsLike')} {Math.round(weatherData.current.apparent_temperature)}°C</p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-left p-4 bg-black/20 rounded-lg max-w-sm mx-auto">
            <div className="flex items-center gap-2"><Droplets size={16} /><span className="text-xs">{t('humidity')}: <strong>{weatherData.current.relative_humidity_2m}%</strong></span></div>
            <div className="flex items-center gap-2"><Wind size={16} /><span className="text-xs">{t('wind')}: <strong>{Math.round(weatherData.current.wind_speed_10m)} km/h</strong></span></div>
            <div className="flex items-center gap-2"><Gauge size={16} /><span className="text-xs">{t('pressure')}: <strong>{Math.round(weatherData.current.surface_pressure)} hPa</strong></span></div>
            <div className="flex items-center gap-2"><Eye size={16} /><span className="text-xs">{t('visibility')}: <strong>{(weatherData.current.visibility / 1000).toFixed(1)} km</strong></span></div>
            <div className="flex items-center gap-2"><Sunrise size={16} /><span className="text-xs">{t('sunrise')}: <strong>{formatTime(weatherData.daily.sunrise[0])}</strong></span></div>
            <div className="flex items-center gap-2"><Sunset size={16} /><span className="text-xs">{t('sunset')}: <strong>{formatTime(weatherData.daily.sunset[0])}</strong></span></div>
        </div>
    </div>
    );
};

const Forecast = ({ weatherData }: { weatherData: WeatherData }) => {
    const { t } = useContext(LanguageContext);
    return (
     <div className="w-full mt-6 animate-fade-in">
         <h3 className="font-bold mb-3 text-left">{t('sevenDayForecast')}</h3>
         <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
             {weatherData.daily.time.map((day: string, index: number) => (
                 <div key={day} className="flex-shrink-0 flex flex-col items-center justify-between p-3 bg-black/20 rounded-lg w-20 h-32">
                     <p className="font-bold text-sm">{index === 0 ? t('today') : getDayOfWeek(day)}</p>
                     {React.createElement(getWeatherInfo(weatherData.daily.weather_code[index]).icon, { size: 28, className:"my-1" })}
                     <div className="text-sm">
                       <span className="font-bold">{Math.round(weatherData.daily.temperature_2m_max[index])}°</span>
                       <span className="opacity-70 ml-1">{Math.round(weatherData.daily.temperature_2m_min[index])}°</span>
                     </div>
                 </div>
             ))}
         </div>
     </div>
    );
};

interface Location {
    latitude: number;
    longitude: number;
    name: string;
}

const Weather: React.FC = () => {
    const { t } = useContext(LanguageContext);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = usePersistentState<Location | null>('focusflow-weather-location', null);
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ place_id: string; display_name: string; lat: string; lon: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchWeather = useCallback(async (lat: number, lon: number, name?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
            const weatherResponse = await fetch(weatherUrl);
            if (!weatherResponse.ok) throw new Error(`Weather API error: ${weatherResponse.statusText}`);
            const weatherApiData = await weatherResponse.json();

            let locationName = name;
            if (!locationName) {
                const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
                const geoResponse = await fetch(geoUrl);
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    locationName = geoData.address.city || geoData.address.town || geoData.address.village || 'Current Location';
                }
            }

            if(name) { // Only persist searched locations
                setLocation({ latitude: lat, longitude: lon, name: locationName || 'Unknown' });
            }
            setWeatherData({ ...weatherApiData, name: locationName || 'Unknown' });

        } catch (err: unknown) {
            console.error("Failed to fetch weather data:", err);
            setError(t('weatherErrorDesc'));
        } finally {
            setIsLoading(false);
        }
    }, [setLocation, t]);

    const handleUseMyLocation = useCallback(() => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation(null); // Clear saved location
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setError(t('locationDenied'));
                    setIsLoading(false);
                }
            );
        } else {
            setError(t('geoNotSupported'));
            setIsLoading(false);
        }
    }, [fetchWeather, setLocation, t]);

    useEffect(() => {
        if (location) {
            fetchWeather(location.latitude, location.longitude, location.name);
        } else {
            handleUseMyLocation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on initial mount
    
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);

        if (searchTimeoutRef.current) {
            window.clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        searchTimeoutRef.current = window.setTimeout(async () => {
            try {
                const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`;
                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error('Geocoding search failed');
                const data = await response.json();
                setSuggestions(data || []);
            } catch (err: unknown) {
                console.error("Failed to fetch suggestions:", err);
                setSuggestions([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                window.clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSuggestionClick = (suggestion: { display_name: string; lat: string; lon: string }) => {
        const { lat, lon, display_name } = suggestion;
        const bestName = display_name.split(',')[0];
        fetchWeather(parseFloat(lat), parseFloat(lon), bestName);
        setSearchInput('');
        setSuggestions([]);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        
        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`;
            const response = await fetch(searchUrl);
            if (!response.ok) throw new Error('Geocoding search failed');
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const bestName = display_name.split(',')[0];
                fetchWeather(parseFloat(lat), parseFloat(lon), bestName);
                setSearchInput('');
            } else {
                setError(`${t('weatherErrorDesc')} (${searchInput})`);
                setIsLoading(false);
            }
        } catch {
            setError(t('weatherErrorDesc'));
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-slate-800 dark:to-slate-950 text-white overflow-hidden">
            <header className="flex-shrink-0 mb-4">
                <form onSubmit={handleSearch} className="flex gap-2 relative z-50">
                    <div className="relative flex-1">
                       <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 z-20 pointer-events-none" />
                       <input
                           ref={inputRef}
                           type="text"
                           value={searchInput}
                           onChange={handleSearchInputChange}
                           onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                           placeholder={t('searchCity')}
                           className="w-full bg-black/20 border-0 rounded-lg pl-9 pr-9 py-2 text-white placeholder:text-white/50 focus:ring-2 focus:ring-white relative z-10"
                           autoComplete="off"
                       />
                       {isSearching && !isLoading && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 animate-spin pointer-events-none z-20" />}
                       {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                                {suggestions.map((s) => (
                                    <button
                                        type="button"
                                        key={s.place_id}
                                        onMouseDown={() => handleSuggestionClick(s)}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600 truncate"
                                    >
                                        {s.display_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={handleUseMyLocation} title="Use my location" className="p-2.5 bg-black/20 rounded-lg hover:bg-black/30"><LocateFixed size={18} /></button>
                </form>
            </header>

            <main className="flex-1 overflow-y-auto relative z-0">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <Loader2 size={48} className="animate-spin text-white mb-4 mx-auto" />
                            <p className="font-medium">{t('fetchingWeather')}</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex h-full items-center justify-center text-center">
                        <div>
                            <AlertTriangle size={48} className="text-red-400 mb-4 mx-auto" />
                            <p className="font-medium text-red-400">{t('weatherError')}</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : weatherData ? (
                    <div className="flex flex-col items-center">
                        <CurrentWeatherDetails weatherData={weatherData} />
                        <Forecast weatherData={weatherData} />
                    </div>
                ) : null}
            </main>
        </div>
    );
};

export default Weather;