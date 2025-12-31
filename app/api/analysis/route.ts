import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { farmProfile, weatherData } = await request.json();

    if (!farmProfile) {
      return NextResponse.json(
        { error: 'Farm profile is required' },
        { status: 400 }
      );
    }

    const analysis = generateIntelligentAnalysis(farmProfile, weatherData);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

function generateIntelligentAnalysis(farmProfile: any, weatherData: any) {
  const { soilType, currentCrops, location, farmSize } = farmProfile;

  // Soil-based irrigation recommendations
  const irrigationPlan = generateIrrigationPlan(soilType, currentCrops, weatherData);

  // Weather and soil-based yield forecast
  const yieldForecast = generateYieldForecast(soilType, currentCrops, weatherData, farmSize);

  // Disease risk based on weather
  const diseaseRisk = calculateDiseaseRisk(currentCrops, weatherData);

  // Sustainability score
  const ecoScore = calculateEcoScore(soilType, irrigationPlan);

  return {
    irrigationPlan,
    yieldForecast,
    diseaseRisk,
    ecoScore,
    recommendations: generateRecommendations(farmProfile, weatherData, irrigationPlan, yieldForecast),
  };
}

function generateIrrigationPlan(soilType: string, crops: string[], weatherData: any) {
  // Soil water retention capacity
  const soilRetention: any = {
    'Clay': { retention: 'high', drainageSpeed: 'slow', wateringFrequency: 'low' },
    'Sandy': { retention: 'low', drainageSpeed: 'fast', wateringFrequency: 'high' },
    'Loamy': { retention: 'medium', drainageSpeed: 'medium', wateringFrequency: 'medium' },
    'Silty': { retention: 'medium-high', drainageSpeed: 'medium-slow', wateringFrequency: 'low-medium' },
  };

  const soilInfo = soilRetention[soilType] || soilRetention['Loamy'];

  // Calculate irrigation needs based on weather
  const avgTemp = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.temp, 0) / 7 || 25;
  const totalRain = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.rain, 0) || 0;

  let wateringSchedule = 'Every 3 days';
  let dailyWaterAmount = 25; // in mm
  let method = 'Drip irrigation';

  // Adjust based on soil type
  if (soilType === 'Clay') {
    wateringSchedule = totalRain > 50 ? 'Every 5-7 days' : 'Every 4-5 days';
    dailyWaterAmount = 20;
    method = 'Drip irrigation (prevent waterlogging)';
  } else if (soilType === 'Sandy') {
    wateringSchedule = totalRain > 50 ? 'Every 2 days' : 'Daily';
    dailyWaterAmount = 30;
    method = 'Drip or sprinkler irrigation';
  } else if (soilType === 'Loamy') {
    wateringSchedule = totalRain > 50 ? 'Every 4 days' : 'Every 3 days';
    dailyWaterAmount = 25;
    method = 'Any irrigation method';
  }

  // Adjust for temperature
  if (avgTemp > 30) {
    dailyWaterAmount = dailyWaterAmount + 5;
  }

  // Calculate Weekly Total
  const frequencyDays = wateringSchedule.includes('Daily') ? 1 : parseInt(wateringSchedule.match(/\d+/)?.[0] || '3');
  const weeklyTotal = (dailyWaterAmount * 7) / frequencyDays;

  // Generate Smart 7-Day Schedule (Mock based on weather logic)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const smartSchedule = days.map((day, i) => {
    // Improve logic: Skip if rain > 10mm, Irrigate based on schedule freq
    const isRainy = (weatherData?.forecast?.[i]?.rain || 0) > 10;
    const isIrrigationDay = i % frequencyDays === 0;

    let action = 'Hold';
    let icon = 'cloud';
    let amount = '-';

    if (isRainy) {
      action = 'Skip';
      icon = 'rain';
      amount = 'Rain';
    } else if (isIrrigationDay) {
      action = 'Irrigate';
      icon = 'droplet';
      amount = `${dailyWaterAmount}mm`;
    }

    return { day, action, icon, amount };
  });

  // Generate Steps based on Method
  let steps = [
    'Check soil moisture at root depth (10-15cm).',
    'Ensure water source is clean and filter is working.'
  ];
  if (method.includes('Drip')) {
    steps.push('Open lateral valves and flush lines for 2 mins.');
    steps.push(`Run system for calculated duration to deliver ${dailyWaterAmount}mm.`);
    steps.push('Check for clogged emitters.');
  } else {
    steps.push('Ensure even distribution across the field.');
    steps.push('Avoid watering during high wind or peak heat.');
  }

  return {
    soilType,
    retention: soilInfo.retention,
    drainageSpeed: soilInfo.drainageSpeed,
    wateringSchedule,
    dailyWaterAmount: dailyWaterAmount, // Send as Number
    amountPerIrrigation: dailyWaterAmount, // Explicit key for frontend
    method,
    weeklyTotal: parseFloat(weeklyTotal.toFixed(1)), // Send formatted number
    rainAdjustment: totalRain > 50 ? 'Reduce watering by 30%' : 'Normal schedule',
    tips: generateIrrigationTips(soilType, totalRain),
    smartSchedule, // New Field
    steps // New Field
  };
}

function generateYieldForecast(soilType: string, crops: string[], weatherData: any, farmSize: number) {
  // Base yield per acre for different crops (kg)
  const baseYields: any = {
    'Rice': 2500,
    'Wheat': 2000,
    'Cotton': 1500,
    'Corn': 3000,
    'Soybean': 1800,
    'Sugarcane': 35000,
    'Potato': 15000,
    'Tomato': 20000,
  };

  // Soil quality multipliers
  const soilMultipliers: any = {
    'Clay': 0.9,
    'Sandy': 0.85,
    'Loamy': 1.0,
    'Silty': 0.95,
  };

  // Weather impact
  const avgTemp = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.temp, 0) / 7 || 25;
  const totalRain = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.rain, 0) || 0;

  let weatherMultiplier = 1.0;
  if (avgTemp > 35 || avgTemp < 15) weatherMultiplier -= 0.1;
  if (totalRain < 20) weatherMultiplier -= 0.15;
  if (totalRain > 100) weatherMultiplier -= 0.1;
  if (totalRain >= 20 && totalRain <= 80) weatherMultiplier += 0.05;

  const cropForecasts = crops.map(crop => {
    const baseYield = baseYields[crop] || 2000;
    const soilMultiplier = soilMultipliers[soilType] || 0.9;
    const estimatedYield = Math.round(baseYield * soilMultiplier * weatherMultiplier * farmSize);
    // Potential Yield is the yield under optimal conditions (1.2x boost usually)
    const potentialYield = Math.round(baseYield * soilMultiplier * 1.2 * farmSize);

    const trend = weatherMultiplier > 1.0 ? 'up' : weatherMultiplier < 0.95 ? 'down' : 'stable';
    const changePercent = Math.round((weatherMultiplier - 1) * 100);

    // Generate Scenarios for "What-If" Simulator
    const scenarios = [
      { id: 's1', name: 'Switch to Drip Irrigation', description: 'Improves water efficiency by 40%', yieldBoost: Math.round(baseYield * 0.15), impact: '+15%', cost: 'Medium' },
      { id: 's2', name: 'Apply Organic Compost', description: 'Enhances soil structure and retention', yieldBoost: Math.round(baseYield * 0.1), impact: '+10%', cost: 'Low' },
      { id: 's3', name: 'Pest Management Program', description: 'Reduces crop loss from pests', yieldBoost: Math.round(baseYield * 0.08), impact: '+8%', cost: 'Medium' }
    ];

    // Generate Numeric Factors for Gap Analysis (0-1 scale)
    const numericFactors = {
      soil: soilMultiplier, // e.g. 0.9
      irrigation: weatherMultiplier >= 1 ? 1.0 : 0.7, // Mock logic
      pest: 0.85
    };

    return {
      crop,
      estimatedYield,
      potentialYield, // Added field
      unit: 'kg',
      trend,
      changePercent,
      confidence: weatherData?.isMockData ? 'medium' : 'high',
      numericFactors, // New Field
      factors: {
        soil: `${Math.round(soilMultiplier * 100)}%`, // Formatted string
        irrigation: weatherMultiplier >= 1 ? 'Optimal' : 'Needs Improvement'
      },
      scenarios // New Field
    };
  });

  return {
    crops: cropForecasts,
    overallTrend: weatherMultiplier > 1.0 ? 'up' : weatherMultiplier < 0.95 ? 'down' : 'stable',
    factors: {
      soil: `${soilType} soil: ${soilMultipliers[soilType] >= 1 ? 'Optimal' : 'Moderate'}`,
      weather: `Weather conditions: ${weatherMultiplier >= 1 ? 'Favorable' : 'Challenging'}`,
      temperature: `Avg temp ${Math.round(avgTemp)}°C: ${avgTemp >= 20 && avgTemp <= 30 ? 'Ideal' : 'Suboptimal'}`,
      rainfall: `Total rain ${Math.round(totalRain)}mm: ${totalRain >= 20 && totalRain <= 80 ? 'Good' : 'Needs adjustment'}`,
    },
  };
}

function calculateDiseaseRisk(crops: string[], weatherData: any) {
  const avgHumidity = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.humidity, 0) / 7 || 70;
  const avgTemp = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.temp, 0) / 7 || 25;
  const totalRain = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.rain, 0) || 0;

  let riskScore = 0;

  // High humidity increases disease risk
  if (avgHumidity > 80) riskScore += 3;
  else if (avgHumidity > 70) riskScore += 2;
  else if (avgHumidity > 60) riskScore += 1;

  // Temperature impact
  if (avgTemp > 25 && avgTemp < 35) riskScore += 2; // Ideal for pathogens

  // Rainfall impact
  if (totalRain > 80) riskScore += 2;

  const riskLevel = riskScore >= 6 ? 'High' : riskScore >= 3 ? 'Medium' : 'Low';
  const riskPercent = Math.min(Math.round((riskScore / 7) * 100), 100);

  return {
    level: riskLevel,
    score: riskPercent,
    factors: {
      humidity: `${Math.round(avgHumidity)}% - ${avgHumidity > 70 ? 'High risk' : 'Moderate'}`,
      temperature: `${Math.round(avgTemp)}°C - ${avgTemp > 25 && avgTemp < 35 ? 'Favorable for pathogens' : 'Lower risk'}`,
      rainfall: `${Math.round(totalRain)}mm - ${totalRain > 80 ? 'Excess moisture' : 'Acceptable'}`,
    },
    recommendations: riskScore >= 4 ? [
      'Monitor crops daily for disease symptoms',
      'Ensure proper drainage to prevent waterlogging',
      'Consider preventive fungicide application',
      'Improve air circulation between plants',
    ] : [
      'Regular monitoring is sufficient',
      'Maintain good field hygiene',
      'Remove infected plant debris',
    ],
  };
}

function calculateEcoScore(soilType: string, irrigationPlan: any) {
  let score = 70; // Base score

  // Efficient irrigation method
  if (irrigationPlan.method.includes('Drip')) score += 15;
  else if (irrigationPlan.method.includes('Sprinkler')) score += 10;
  else score += 5;

  // Soil conservation
  if (soilType === 'Loamy') score += 10;
  else if (soilType === 'Clay' || soilType === 'Silty') score += 5;

  // Water efficiency
  const waterAmount = parseInt(irrigationPlan.dailyWaterAmount);
  if (waterAmount <= 25) score += 5;

  return Math.min(score, 100);
}

function generateIrrigationTips(soilType: string, totalRain: number) {
  const tips = [];

  if (soilType === 'Clay') {
    tips.push('Avoid overwatering - clay retains water well');
    tips.push('Ensure proper drainage to prevent waterlogging');
    tips.push('Water deeply but less frequently');
  } else if (soilType === 'Sandy') {
    tips.push('Water more frequently - sandy soil drains quickly');
    tips.push('Add organic matter to improve water retention');
    tips.push('Consider mulching to reduce evaporation');
  } else if (soilType === 'Loamy') {
    tips.push('Ideal soil for most crops');
    tips.push('Maintain regular watering schedule');
    tips.push('Monitor soil moisture at root depth');
  }

  if (totalRain > 80) {
    tips.push('Reduce irrigation due to high rainfall');
    tips.push('Check for waterlogging in low areas');
  } else if (totalRain < 20) {
    tips.push('Increase irrigation due to low rainfall');
    tips.push('Consider water conservation techniques');
  }

  return tips;
}

function generateRecommendations(farmProfile: any, weatherData: any, irrigationPlan: any, yieldForecast: any) {
  const recommendations = [];
  const { soilType, currentCrops, location } = farmProfile;
  const avgTemp = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.temp, 0) / 7 || 25;
  const avgHumidity = weatherData?.forecast?.reduce((sum: number, day: any) => sum + day.humidity, 0) / 7 || 60;
  const mainCrop = currentCrops[0] || 'Crop';

  // 1. Precise Fertigation (Nutrient Management)
  // Logic: Recommend NPK ratio based on crop and generic stage (assumed mid-season for demo)
  let fertilizerMsg = 'Apply balanced NPK 19:19:19';
  let fertilizerAction = 'Monitor leaf color for deficiency';

  if (mainCrop.toLowerCase().includes('rice')) {
    fertilizerMsg = 'Vegetative Stage Nutrient Plan';
    fertilizerAction = 'Apply Urea (40kg/acre) + Zinc Sulfate (10kg/acre) for tiller boosting.';
  } else if (mainCrop.toLowerCase().includes('wheat')) {
    fertilizerMsg = 'Crown Root Initiation Stage';
    fertilizerAction = 'Top dress with Urea (25kg/acre) after first irrigation.';
  } else if (mainCrop.toLowerCase().includes('cotton')) {
    fertilizerMsg = 'Square Formation Stage';
    fertilizerAction = 'Foliar spray of Magnesium Sulfate (1%) to prevent reddening.';
  }

  recommendations.push({
    category: 'Nutrients',
    priority: 'high',
    message: fertilizerMsg,
    action: fertilizerAction,
  });

  // 2. Pest & Disease Alert (Weather Driven)
  if (avgHumidity > 75 && avgTemp > 25) {
    recommendations.push({
      category: 'Protection',
      priority: 'critical',
      message: `High Fungal Risk detected for ${mainCrop}`,
      action: 'Spray Propiconazole (1ml/L) or Hexaconazole to prevent Rust/Blast.',
    });
  } else if (avgTemp > 35) {
    recommendations.push({
      category: 'Pest Risk',
      priority: 'high',
      message: 'High Sucking Pest Activity (Thrips/Aphids)',
      action: 'Install yellow sticky traps (20/acre) and spray Neem Oil 10000ppm.',
    });
  }

  // 3. Irrigation Strategy (Soil Specific)
  recommendations.push({
    category: 'Irrigation',
    priority: 'medium',
    message: `${irrigationPlan.method} optimization for ${soilType} soil`,
    action: irrigationPlan.wateringSchedule.includes('Daily')
      ? `Split irrigation: Morning (60%) & Evening (40%) to reduce evaporation.`
      : `Water ${irrigationPlan.wateringSchedule} during early morning hours to prevent fungal growth.`,
  });

  // 4. Market/Harvest Strategy
  recommendations.push({
    category: 'Market',
    priority: 'low',
    message: 'Price Stabilization Predicted',
    action: 'Hold non-perishable stock for 2 weeks. Market arrivals are peaking.',
  });

  return recommendations;
}
