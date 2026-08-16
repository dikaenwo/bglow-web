// Kunci API OpenWeatherMap — Silakan isi dengan API Key Anda agar data UV Index terhubung secara langsung
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';

import { requestLocationWithPermission } from './geolocation.js';

export async function fetchWeather(customLat = null, customLon = null) {
  let lat = -6.2088; // Default Jakarta
  let lon = 106.8456;
  let isDefaultLocation = true;
  
  if (customLat !== null && customLon !== null) {
    lat = customLat;
    lon = customLon;
    isDefaultLocation = false;
  } else {
    // 1. Coba ambil posisi fresh via Web Geolocation API
    let gotFreshPos = false;
    try {
      const pos = await requestLocationWithPermission({ silent: true, timeout: 10000 });
      if (pos && pos.lat !== null && pos.lon !== null) {
        lat = pos.lat;
        lon = pos.lon;
        isDefaultLocation = false;
        gotFreshPos = true;
      }
    } catch (e) {
      console.warn("Web geolocation fallback:", e);
    }

    // 2. Fallback ke cache localStorage
    if (!gotFreshPos) {
      const storedLat = localStorage.getItem('bglow_user_lat');
      const storedLon = localStorage.getItem('bglow_user_lon');
      if (storedLat && storedLon) {
        lat = parseFloat(storedLat);
        lon = parseFloat(storedLon);
        isDefaultLocation = false;
      }
    }
  }

  // Reverse geocoding to get location name (Kelurahan & Kecamatan) in real-time
  let locationName = '';
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`;
    const geoRes = await fetch(geoUrl, {
      headers: {
        'User-Agent': 'B-Glow-Skincare-App/1.0'
      }
    });
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData) {
        let kelurahan = '';
        let kecamatan = '';
        
        if (geoData.address) {
          const addr = geoData.address;
          kelurahan = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || '';
          kecamatan = addr.district || addr.city_district || addr.subdistrict || addr.municipality || '';
        }
        
        // If either is missing, parse display_name
        if (geoData.display_name && (!kelurahan || !kecamatan)) {
          const parts = geoData.display_name.split(',').map(p => p.trim());
          const cleanParts = parts.filter(p => {
            if (/^\d+$/.test(p)) return false;
            if (p.toLowerCase() === 'indonesia') return false;
            if (/^(rt|rw)\s*\d+/i.test(p)) return false;
            return true;
          });
          
          if (cleanParts.length >= 2) {
            if (!kelurahan) kelurahan = cleanParts[0];
            const kelIdx = cleanParts.findIndex(p => p.toLowerCase() === kelurahan.toLowerCase());
            if (kelIdx !== -1 && kelIdx + 1 < cleanParts.length) {
              if (!kecamatan) kecamatan = cleanParts[kelIdx + 1];
            }
          }
        }
        
        if (kelurahan && kecamatan) {
          locationName = `${kelurahan}, ${kecamatan}`;
        } else if (kecamatan) {
          locationName = kecamatan;
        } else if (kelurahan) {
          locationName = kelurahan;
        } else if (geoData.address && geoData.address.city) {
          locationName = geoData.address.city;
        }
      }
    }
  } catch (e) {
    console.error("Gagal melakukan reverse geocoding:", e);
  }

  if (!locationName) {
    if (isDefaultLocation) {
      locationName = 'Pasar Manggis, Setiabudi (Default)';
    } else {
      locationName = `Koordinat (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
    }
  } else if (isDefaultLocation) {
    locationName += ' (Default)';
  }

  // 1. Ambil data cuaca umum dan UV Index real-time dari Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,uv_index&timezone=auto`;
  
  let temp = 28;
  let condition = 'Cerah';
  const localHour = new Date().getHours();
  let isDay = localHour >= 6 && localHour < 18;
  let icon = isDay ? '☀️' : '🌙';
  let humidity = 80;
  let openMeteoUv = 0;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data.current) {
      const code = data.current.weather_code;
      // Gunakan penentuan day/night berbasis jam lokal agar selaras dengan ucapan Selamat Pagi/Malam
      isDay = localHour >= 6 && localHour < 18;
      
      condition = 'Cerah';
      icon = isDay ? '☀️' : '🌙';
      
      if (code >= 1 && code <= 3) {
        condition = 'Berawan';
        icon = isDay ? '⛅' : '☁️';
      } else if (code >= 45 && code <= 48) {
        condition = 'Berkabut';
        icon = '🌫️';
      } else if (code >= 51 && code <= 67) {
        condition = 'Hujan';
        icon = '🌧️';
      } else if (code >= 71 && code <= 77) {
        condition = 'Salju';
        icon = '❄️';
      } else if (code >= 95) {
        condition = 'Badai';
        icon = '⛈️';
      }

      temp = Math.round(data.current.temperature_2m);
      humidity = data.current.relative_humidity_2m;
      if (typeof data.current.uv_index === 'number') {
        openMeteoUv = Math.round(data.current.uv_index);
      }
    }
  } catch(e) {
    console.error("Gagal mengambil data cuaca dari Open-Meteo:", e);
  }

  // 2. Ambil data UV Index dari OpenWeatherMap
  let uvIndex = 0;
  let hasUvFromOwm = false;
  
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'YOUR_OPENWEATHER_API_KEY') {
    try {
      // Menggunakan endpoint resmi UV Index API OpenWeatherMap
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
      const uvRes = await fetch(uvUrl);
      if (uvRes.ok) {
        const uvData = await uvRes.json();
        if (uvData && typeof uvData.value === 'number') {
          uvIndex = Math.round(uvData.value);
          hasUvFromOwm = true;
        }
      } else {
        console.warn(`OpenWeatherMap API mengembalikan status: ${uvRes.status}`);
      }
    } catch(e) {
      console.error("Gagal mengambil data UV dari OpenWeatherMap:", e);
    }
  }
  
  // Fallback: gunakan UV index dari Open-Meteo atau cadangan akhir simulasi waktu
  if (!hasUvFromOwm) {
    if (typeof openMeteoUv === 'number') {
      uvIndex = openMeteoUv;
    } else {
      const isNight = localHour >= 18 || localHour < 6;
      if (!isNight) {
        if (localHour >= 11 && localHour <= 13) {
          uvIndex = 8; // Puncak UV siang hari
        } else if ((localHour >= 9 && localHour < 11) || (localHour > 13 && localHour <= 15)) {
          uvIndex = 5; // Sedang
        } else {
          uvIndex = 2; // Rendah
        }
      }
    }
  }
  
  return {
    temp,
    condition,
    icon,
    uvIndex,
    humidity,
    locationName,
    isDefaultLocation
  };
}
