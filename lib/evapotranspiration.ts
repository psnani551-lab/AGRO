// Professional ET₀ Calculator using FAO-56 Penman-Monteith Equation
// Reference: FAO Irrigation and Drainage Paper 56

export interface WeatherData {
  temperature: number; // °C
  temperatureMin: number; // °C
  temperatureMax: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  solarRadiation?: number; // MJ/m²/day
  sunshine?: number; // hours
  latitude: number; // degrees
  elevation: number; // meters
  date: Date;
}

export interface ETResult {
  et0: number; // Reference evapotranspiration (mm/day)
  etc: number; // Crop evapotranspiration (mm/day)
  irrigationNeed: number; // mm/day
  weeklyNeed: number; // mm/week
}

/**
 * Calculate Reference Evapotranspiration (ET₀) using FAO-56 Penman-Monteith
 */
export function calculateET0(weather: WeatherData): number {
  const {
    temperature,
    temperatureMin,
    temperatureMax,
    humidity,
    windSpeed,
    latitude,
    elevation,
    date,
  } = weather;

  // Constants
  const STEFAN_BOLTZMANN = 4.903e-9; // MJ K⁻⁴ m⁻² day⁻¹
  const SOLAR_CONSTANT = 0.0820; // MJ m⁻² min⁻¹
  
  // 1. Atmospheric pressure (kPa)
  const P = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
  
  // 2. Psychrometric constant (kPa/°C)
  const gamma = 0.000665 * P;
  
  // 3. Saturation vapor pressure (kPa)
  const es_tmax = 0.6108 * Math.exp((17.27 * temperatureMax) / (temperatureMax + 237.3));
  const es_tmin = 0.6108 * Math.exp((17.27 * temperatureMin) / (temperatureMin + 237.3));
  const es = (es_tmax + es_tmin) / 2;
  
  // 4. Actual vapor pressure (kPa)
  const ea = (es * humidity) / 100;
  
  // 5. Slope of saturation vapor pressure curve (kPa/°C)
  const delta = (4098 * es) / Math.pow(temperature + 237.3, 2);
  
  // 6. Day of year
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // 7. Solar declination (radians)
  const solarDeclination = 0.409 * Math.sin((2 * Math.PI * dayOfYear / 365) - 1.39);
  
  // 8. Latitude in radians
  const latRad = (Math.PI / 180) * latitude;
  
  // 9. Sunset hour angle (radians)
  const ws = Math.acos(-Math.tan(latRad) * Math.tan(solarDeclination));
  
  // 10. Inverse relative distance Earth-Sun
  const dr = 1 + 0.033 * Math.cos(2 * Math.PI * dayOfYear / 365);
  
  // 11. Extraterrestrial radiation (MJ m⁻² day⁻¹)
  const Ra = (24 * 60 / Math.PI) * SOLAR_CONSTANT * dr * (
    ws * Math.sin(latRad) * Math.sin(solarDeclination) +
    Math.cos(latRad) * Math.cos(solarDeclination) * Math.sin(ws)
  );
  
  // 12. Clear sky solar radiation (MJ m⁻² day⁻¹)
  const Rso = (0.75 + 2e-5 * elevation) * Ra;
  
  // 13. Solar radiation (if not provided, estimate from temperature)
  let Rs: number;
  if (weather.solarRadiation) {
    Rs = weather.solarRadiation;
  } else {
    // Hargreaves radiation formula
    Rs = 0.16 * Math.sqrt(temperatureMax - temperatureMin) * Ra;
  }
  
  // 14. Net shortwave radiation (MJ m⁻² day⁻¹)
  const albedo = 0.23; // grass reference
  const Rns = (1 - albedo) * Rs;
  
  // 15. Net longwave radiation (MJ m⁻² day⁻¹)
  const Rnl = STEFAN_BOLTZMANN * (
    (Math.pow(temperatureMax + 273.16, 4) + Math.pow(temperatureMin + 273.16, 4)) / 2
  ) * (0.34 - 0.14 * Math.sqrt(ea)) * ((1.35 * Rs / Rso) - 0.35);
  
  // 16. Net radiation (MJ m⁻² day⁻¹)
  const Rn = Rns - Rnl;
  
  // 17. Soil heat flux (MJ m⁻² day⁻¹) - negligible for daily calculations
  const G = 0;
  
  // 18. Wind speed at 2m height (m/s)
  const u2 = windSpeed; // assuming measurement at 2m
  
  // 19. FAO-56 Penman-Monteith ET₀ (mm/day)
  const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (temperature + 273)) * u2 * (es - ea);
  const denominator = delta + gamma * (1 + 0.34 * u2);
  const et0 = numerator / denominator;
  
  return Math.max(0, et0); // ET₀ cannot be negative
}

/**
 * Calculate Crop Evapotranspiration (ETc) using crop coefficient
 */
export function calculateETc(
  et0: number,
  cropCoefficient: number,
  stressCoefficient: number = 1.0
): number {
  return et0 * cropCoefficient * stressCoefficient;
}

/**
 * Calculate irrigation requirement considering rainfall and soil moisture
 */
export function calculateIrrigationNeed(
  etc: number,
  effectiveRainfall: number,
  soilMoistureDeficit: number = 0,
  irrigationEfficiency: number = 0.85
): number {
  const netIrrigation = etc - effectiveRainfall + soilMoistureDeficit;
  const grossIrrigation = netIrrigation / irrigationEfficiency;
  return Math.max(0, grossIrrigation);
}

/**
 * Calculate effective rainfall (mm)
 * Using USDA Soil Conservation Service method
 */
export function calculateEffectiveRainfall(totalRainfall: number): number {
  if (totalRainfall <= 0) return 0;
  
  // SCS method
  if (totalRainfall < 250) {
    return totalRainfall * (125 - 0.2 * totalRainfall) / 125;
  } else {
    return 125 + 0.1 * totalRainfall;
  }
}

/**
 * Get crop coefficient (Kc) based on growth stage
 */
export function getCropCoefficient(
  cropName: string,
  daysAfterPlanting: number,
  totalGrowthDuration: number
): number {
  // Import crop data
  const { getCropData } = require('./cropDatabase');
  const cropData = getCropData(cropName);
  
  if (!cropData) {
    return 1.0; // default
  }
  
  const { kc_initial, kc_mid, kc_end } = cropData.cropCoefficient;
  const stages = cropData.growthStages;
  
  // If crop is past harvest, return end Kc (or 0 if very old)
  if (daysAfterPlanting > totalGrowthDuration + 30) {
    return 0.5; // Minimal ET for fallow/stubble
  }
  
  // Calculate stage boundaries
  const initialEnd = stages.initial;
  const developmentEnd = initialEnd + stages.development;
  const midEnd = developmentEnd + stages.mid;
  const totalDuration = initialEnd + stages.development + stages.mid + stages.late;
  
  // Clamp to total duration
  const effectiveDays = Math.min(daysAfterPlanting, totalDuration);
  
  // Determine Kc based on growth stage
  if (effectiveDays <= initialEnd) {
    return kc_initial;
  } else if (effectiveDays <= developmentEnd) {
    // Linear interpolation during development stage
    const progress = (effectiveDays - initialEnd) / stages.development;
    return kc_initial + (kc_mid - kc_initial) * progress;
  } else if (effectiveDays <= midEnd) {
    return kc_mid;
  } else {
    // Linear interpolation during late stage
    const progress = (effectiveDays - midEnd) / stages.late;
    const kc = kc_mid + (kc_end - kc_mid) * progress;
    return Math.max(kc, 0.3); // Minimum Kc
  }
}

/**
 * Calculate complete irrigation schedule
 */
export function calculateIrrigationSchedule(
  weather: WeatherData,
  cropName: string,
  daysAfterPlanting: number,
  soilType: string,
  recentRainfall: number = 0
): ETResult {
  // Calculate ET₀
  const et0 = calculateET0(weather);
  
  // Get crop coefficient
  const { getCropData } = require('./cropDatabase');
  const cropData = getCropData(cropName);
  const totalDuration = cropData?.growthDuration || 120;
  const kc = getCropCoefficient(cropName, daysAfterPlanting, totalDuration);
  
  // Calculate ETc
  const etc = calculateETc(et0, kc);
  
  // Calculate effective rainfall
  const effectiveRain = calculateEffectiveRainfall(recentRainfall);
  
  // Get irrigation efficiency based on soil type
  let efficiency = 0.85; // drip irrigation default
  if (soilType === 'Sandy') {
    efficiency = 0.80;
  } else if (soilType === 'Clay') {
    efficiency = 0.90;
  }
  
  // Calculate irrigation need
  const irrigationNeed = calculateIrrigationNeed(etc, effectiveRain, 0, efficiency);
  const weeklyNeed = irrigationNeed * 7;
  
  return {
    et0: Math.round(et0 * 100) / 100,
    etc: Math.round(etc * 100) / 100,
    irrigationNeed: Math.round(irrigationNeed * 100) / 100,
    weeklyNeed: Math.round(weeklyNeed * 100) / 100,
  };
}

/**
 * Determine irrigation frequency based on soil type and crop
 */
export function getIrrigationFrequency(
  soilType: string,
  dailyWaterNeed: number,
  rootDepth: number = 30 // cm
): {
  frequency: string;
  amountPerIrrigation: number;
  intervalDays: number;
} {
  // Soil water holding capacity (mm/cm of soil depth)
  const waterHoldingCapacity: Record<string, number> = {
    'Sandy': 0.8,
    'Loamy': 1.5,
    'Clay': 2.0,
    'Silty': 1.8,
  };
  
  const whc = waterHoldingCapacity[soilType] || 1.5;
  
  // Available water in root zone (mm)
  const availableWater = whc * rootDepth * 0.5; // 50% depletion
  
  // Days until irrigation needed
  const intervalDays = Math.floor(availableWater / dailyWaterNeed);
  const clampedInterval = Math.max(1, Math.min(intervalDays, 7));
  
  // Amount per irrigation
  const amountPerIrrigation = dailyWaterNeed * clampedInterval;
  
  // Frequency description
  let frequency: string;
  if (clampedInterval === 1) {
    frequency = 'Daily';
  } else if (clampedInterval === 2) {
    frequency = 'Every 2 days';
  } else if (clampedInterval === 3) {
    frequency = 'Every 3 days';
  } else {
    frequency = `Every ${clampedInterval} days`;
  }
  
  return {
    frequency,
    amountPerIrrigation: Math.round(amountPerIrrigation * 10) / 10,
    intervalDays: clampedInterval,
  };
}
