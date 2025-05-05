<script lang="ts">
import { onMount } from 'svelte';

let weather: any = null;
let error = '';
let loading = true;
// Budapest coordinates
const location = { latitude: 47.4979, longitude: 19.0402 };

onMount(async () => {
  try {
    loading = true;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );
    
    if (!res.ok) throw new Error('Weather service unavailable');
    
    const data = await res.json();
    weather = {
      current: data.current_weather,
      daily: data.daily
    };
  } catch (e) {
    console.error('Weather error:', e);
    error = 'Could not fetch weather data';
  } finally {
    loading = false;
  }
});

function getWeatherDescription(code: number): string {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  const codes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm'
  };
  return codes[code] || 'Unknown';
}
</script>

<div class="weather-widget card p-3 mb-3">
  {#if error}
    <div class="alert alert-warning mb-0">
      <i class="bi bi-exclamation-triangle me-2"></i>{error}
    </div>
  {:else if loading}
    <div class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading weather...</span>
      </div>
    </div>
  {:else if weather}
    <div class="d-flex align-items-center justify-content-between">
      <div>
        <h5 class="card-title mb-2">Weather in Budapest</h5>
        <p class="mb-1">
          <i class="bi bi-thermometer-half me-2"></i>
          {weather.current.temperature}°C
        </p>
        <p class="mb-1">
          <i class="bi bi-cloud me-2"></i>
          {getWeatherDescription(weather.current.weathercode)}
        </p>
        <p class="mb-0">
          <i class="bi bi-wind me-2"></i>
          {weather.current.windspeed} km/h
        </p>
      </div>
      {#if weather.daily}
        <div class="text-end">
          <p class="mb-1 text-muted small">Today's Range</p>
          <p class="mb-0">
            <span class="text-primary">{weather.daily.temperature_2m_min[0]}°C</span>
            <span class="mx-1">-</span>
            <span class="text-danger">{weather.daily.temperature_2m_max[0]}°C</span>
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .weather-widget {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
  .bi {
    font-size: 1.1em;
  }
</style>