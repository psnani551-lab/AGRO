// Type definitions for farm data models

export interface FarmProfile {
  id: string;
  farmName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  farmSize: number; // in acres
  soilType: 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky';
  irrigationType: 'drip' | 'sprinkler' | 'flood' | 'manual';
  currentCrops: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseRiskAssessment {
  cropType: string;
  riskLevel: 'low' | 'medium' | 'high';
  temperature: number;
  humidity: number;
  rainfall: number;
  assessmentDate: string;
}

export interface IrrigationSchedule {
  cropType: string;
  fieldSize: number;
  soilType: string;
  weatherConditions: string;
  recommendedSchedule: string;
  waterUsageEstimate: number;
}

export interface YieldForecast {
  cropType: string;
  plantingDate: string;
  fieldSize: number;
  soilQuality: string;
  estimatedYield: number;
  confidenceLevel: number;
}

export interface CropRotationPlan {
  currentCrop: string;
  season: string;
  recommendations: string[];
}

export interface MarketData {
  cropType: string;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  demandLevel: 'low' | 'medium' | 'high';
}

export interface Alert {
  id: string;
  type: 'weather' | 'pest' | 'market' | 'irrigation' | 'general';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SustainabilityMetrics {
  waterUsage: number;
  carbonFootprint: number;
  soilHealth: number;
  biodiversity: number;
}
