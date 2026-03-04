
import React, { useState, useEffect } from 'react';
// Added Moon to the imports from lucide-react
import { Sun, Moon, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Calendar, MapPin } from 'lucide-react';
import { getGreeting, getCurrentFormattedDate } from '../../utils/dateUtils';
import Logo from '../Branding/Logo';

interface WeatherData {
  temp: number;
  code: number;
  description: string;
}

const GreetingCard: React.FC = () => {
  const greeting = getGreeting();
  const userName = "André Luz";
  const dateStr = getCurrentFormattedDate();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>("Localizando...");

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        const current = data.current_weather;
        
        setWeather({
          temp: Math.round(current.temperature),
          code: current.weathercode,
          description: getWeatherDescription(current.weathercode)
        });
      } catch (error) {
        console.error("Erro ao buscar clima:", error);
      }
    };

    const getPosition = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
            setLocationName("Sua Localização");
          },
          (error) => {
            console.warn("Geolocalização negada ou indisponível:", error);
            // Fallback para uma localização padrão ou apenas modo horário
            fetchWeather(-23.5505, -46.6333); // São Paulo fallback
            setLocationName("Clima Local");
          }
        );
      }
    };

    getPosition();
  }, []);

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return "Céu Limpo";
    if (code <= 3) return "Parcialmente Nublado";
    if (code <= 48) return "Nevoeiro";
    if (code <= 55) return "Garoa";
    if (code <= 65) return "Chuva";
    if (code <= 75) return "Neve";
    if (code <= 82) return "Pancadas de Chuva";
    if (code <= 99) return "Tempestade";
    return "Nublado";
  };

  const getWeatherIcon = () => {
    if (!weather) {
      // Fallback baseado no horário se o clima ainda não carregou
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 18) return <Sun className="text-yellow-400" size={40} />;
      return <Moon className="text-indigo-400" size={40} />;
    }

    const code = weather.code;
    if (code === 0) return <Sun className="text-yellow-400" size={40} />;
    if (code <= 3) return <CloudSun className="text-orange-300" size={40} />;
    if (code <= 48) return <CloudFog className="text-gray-400" size={40} />;
    if (code <= 55 || code <= 65 || code <= 82) return <CloudRain className="text-blue-400" size={40} />;
    if (code <= 75) return <Snowflake className="text-cyan-200" size={40} />;
    if (code <= 99) return <CloudLightning className="text-yellow-600" size={40} />;
    return <Cloud className="text-gray-400" size={40} />;
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border-l-[10px] border-[#AEDD2B] transition-all hover:shadow-[#AEDD2B]/10 dark:shadow-none dark:border-l-lime group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <Logo variant="full" size={32} className="opacity-90 dark:opacity-100 transition-transform group-hover:scale-105" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#02416D] dark:text-white mb-2 tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#066699] to-[#0A5483] dark:from-blue-400 dark:to-blue-200">{userName}!</span>
            </h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-base max-w-xl leading-relaxed">
              Sua plataforma centralizada de registros e protocolos administrativos.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-[#F8F8EC]/50 dark:bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-[#0A5483]/5 dark:border-slate-700/50 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-md transition-all hover:scale-110 hover:rotate-3 duration-300">
              {getWeatherIcon()}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#02416D] dark:text-white leading-none mb-1">
                {weather ? `${weather.temp}°C` : "--°C"}
              </span>
              <span className="text-[10px] font-bold text-[#0A5483] dark:text-slate-400 uppercase tracking-wider opacity-60">
                {weather?.description || "Carregando..." }
              </span>
            </div>
          </div>

          <div className="w-px h-10 bg-[#0A5483]/10 dark:bg-slate-700" />

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-[#0A5483] dark:text-blue-400 uppercase tracking-widest mb-1.5">
              <Calendar size={11} className="text-[#AEDD2B]" />
              {dateStr.split(',')[0]}
            </div>
            <p className="text-xs font-bold text-gray-800 dark:text-slate-200 leading-tight">
              {dateStr.split(',')[1] || dateStr}
            </p>
            <div className="flex items-center justify-end gap-1.5 text-[9px] text-gray-400 dark:text-slate-500 font-semibold mt-1.5">
              <MapPin size={9} />
              {locationName}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#AEDD2B]/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#AEDD2B]/20 transition-colors duration-700" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#0A5483]/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#0A5483]/10 transition-colors duration-700" />
    </div>
  );
};

export default GreetingCard;
