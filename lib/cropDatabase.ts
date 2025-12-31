// Professional Crop Database with Scientific Data
// Based on FAO, USDA, and ICAR guidelines

export interface CropData {
  id: string;
  name: string;
  scientificName: string;
  category: 'cereal' | 'pulse' | 'oilseed' | 'vegetable' | 'fruit' | 'cash' | 'fiber';

  // Growth Parameters
  growthDuration: number; // days
  growthStages: {
    initial: number; // days
    development: number;
    mid: number;
    late: number;
  };

  // Yield Response Factor (Ky) - FAO-33
  yieldResponseFactor: number;

  // Water Requirements (FAO-56 Penman-Monteith)
  cropCoefficient: {
    kc_initial: number;
    kc_mid: number;
    kc_end: number;
  };

  // Climate Requirements
  temperature: {
    min: number; // °C
    optimal: [number, number];
    max: number;
  };
  rainfall: {
    min: number; // mm per season
    optimal: [number, number];
    max: number;
  };

  // Soil Requirements
  soilTypes: string[]; // preferred soil types
  soilPH: [number, number]; // optimal pH range

  // Nutrient Requirements (kg/hectare)
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };

  // Yield Data (kg/hectare)
  averageYield: number;
  potentialYield: number;

  // Disease Susceptibility
  commonDiseases: string[];
  commonPests: string[];

  // Economic Data
  marketDemand: 'high' | 'medium' | 'low';
  storageLife: number; // days
}

export const cropDatabase: Record<string, CropData> = {
  rice: {
    id: 'rice',
    name: 'Rice',
    scientificName: 'Oryza sativa',
    category: 'cereal',
    growthDuration: 120,
    growthStages: {
      initial: 30,
      development: 30,
      mid: 40,
      late: 20,
    },
    yieldResponseFactor: 1.20,
    cropCoefficient: {
      kc_initial: 1.05,
      kc_mid: 1.20,
      kc_end: 0.90,
    },
    temperature: {
      min: 20,
      optimal: [25, 32],
      max: 38,
    },
    rainfall: {
      min: 1000,
      optimal: [1200, 1800],
      max: 2500,
    },
    soilTypes: ['Clay', 'Loamy', 'Silty'],
    soilPH: [5.5, 7.0],
    nutrients: {
      nitrogen: 120,
      phosphorus: 60,
      potassium: 40,
    },
    averageYield: 2500,
    potentialYield: 4500,
    commonDiseases: ['Blast', 'Bacterial Blight', 'Sheath Blight', 'Brown Spot'],
    commonPests: ['Stem Borer', 'Leaf Folder', 'Brown Plant Hopper'],
    marketDemand: 'high',
    storageLife: 365,
  },

  wheat: {
    id: 'wheat',
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    category: 'cereal',
    growthDuration: 120,
    growthStages: {
      initial: 20,
      development: 30,
      mid: 50,
      late: 20,
    },
    yieldResponseFactor: 1.05,
    cropCoefficient: {
      kc_initial: 0.70,
      kc_mid: 1.15,
      kc_end: 0.40,
    },
    temperature: {
      min: 10,
      optimal: [15, 25],
      max: 35,
    },
    rainfall: {
      min: 450,
      optimal: [600, 900],
      max: 1200,
    },
    soilTypes: ['Loamy', 'Clay', 'Silty'],
    soilPH: [6.0, 7.5],
    nutrients: {
      nitrogen: 100,
      phosphorus: 50,
      potassium: 30,
    },
    averageYield: 2000,
    potentialYield: 3500,
    commonDiseases: ['Rust', 'Powdery Mildew', 'Smut', 'Blight'],
    commonPests: ['Aphids', 'Termites', 'Army Worm'],
    marketDemand: 'high',
    storageLife: 365,
  },

  cotton: {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    category: 'fiber',
    growthDuration: 150,
    growthStages: {
      initial: 30,
      development: 50,
      mid: 50,
      late: 20,
    },
    yieldResponseFactor: 0.85,
    cropCoefficient: {
      kc_initial: 0.50,
      kc_mid: 1.15,
      kc_end: 0.70,
    },
    temperature: {
      min: 15,
      optimal: [21, 30],
      max: 40,
    },
    rainfall: {
      min: 500,
      optimal: [700, 1200],
      max: 1500,
    },
    soilTypes: ['Loamy', 'Sandy', 'Clay'],
    soilPH: [6.0, 8.0],
    nutrients: {
      nitrogen: 120,
      phosphorus: 60,
      potassium: 60,
    },
    averageYield: 1500,
    potentialYield: 2500,
    commonDiseases: ['Wilt', 'Boll Rot', 'Leaf Curl', 'Root Rot'],
    commonPests: ['Bollworm', 'Aphids', 'Whitefly', 'Jassids'],
    marketDemand: 'high',
    storageLife: 180,
  },

  corn: {
    id: 'corn',
    name: 'Corn',
    scientificName: 'Zea mays',
    category: 'cereal',
    growthDuration: 110,
    growthStages: {
      initial: 20,
      development: 35,
      mid: 40,
      late: 15,
    },
    yieldResponseFactor: 1.25,
    cropCoefficient: {
      kc_initial: 0.70,
      kc_mid: 1.20,
      kc_end: 0.60,
    },
    temperature: {
      min: 15,
      optimal: [20, 30],
      max: 40,
    },
    rainfall: {
      min: 500,
      optimal: [600, 1000],
      max: 1500,
    },
    soilTypes: ['Loamy', 'Sandy', 'Silty'],
    soilPH: [5.8, 7.0],
    nutrients: {
      nitrogen: 150,
      phosphorus: 60,
      potassium: 40,
    },
    averageYield: 3000,
    potentialYield: 5000,
    commonDiseases: ['Blight', 'Rust', 'Smut', 'Downy Mildew'],
    commonPests: ['Stem Borer', 'Fall Army Worm', 'Aphids'],
    marketDemand: 'high',
    storageLife: 180,
  },

  soybean: {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max',
    category: 'oilseed',
    growthDuration: 100,
    growthStages: {
      initial: 20,
      development: 30,
      mid: 35,
      late: 15,
    },
    yieldResponseFactor: 0.85,
    cropCoefficient: {
      kc_initial: 0.50,
      kc_mid: 1.15,
      kc_end: 0.50,
    },
    temperature: {
      min: 15,
      optimal: [20, 30],
      max: 38,
    },
    rainfall: {
      min: 450,
      optimal: [600, 1000],
      max: 1300,
    },
    soilTypes: ['Loamy', 'Sandy', 'Clay'],
    soilPH: [6.0, 7.5],
    nutrients: {
      nitrogen: 30, // nitrogen-fixing
      phosphorus: 60,
      potassium: 40,
    },
    averageYield: 1800,
    potentialYield: 3000,
    commonDiseases: ['Rust', 'Blight', 'Root Rot', 'Mosaic Virus'],
    commonPests: ['Pod Borer', 'Stem Fly', 'Aphids'],
    marketDemand: 'high',
    storageLife: 365,
  },

  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    category: 'cash',
    growthDuration: 365,
    growthStages: {
      initial: 35,
      development: 60,
      mid: 180,
      late: 90,
    },
    yieldResponseFactor: 1.20,
    cropCoefficient: {
      kc_initial: 0.50,
      kc_mid: 1.25,
      kc_end: 0.75,
    },
    temperature: {
      min: 20,
      optimal: [25, 35],
      max: 40,
    },
    rainfall: {
      min: 1500,
      optimal: [1800, 2500],
      max: 3000,
    },
    soilTypes: ['Loamy', 'Clay', 'Silty'],
    soilPH: [6.0, 7.5],
    nutrients: {
      nitrogen: 200,
      phosphorus: 80,
      potassium: 100,
    },
    averageYield: 35000,
    potentialYield: 60000,
    commonDiseases: ['Red Rot', 'Smut', 'Wilt', 'Rust'],
    commonPests: ['Borer', 'Whitefly', 'Aphids'],
    marketDemand: 'high',
    storageLife: 30,
  },

  potato: {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    category: 'vegetable',
    growthDuration: 90,
    growthStages: {
      initial: 25,
      development: 30,
      mid: 30,
      late: 5,
    },
    yieldResponseFactor: 1.10,
    cropCoefficient: {
      kc_initial: 0.50,
      kc_mid: 1.15,
      kc_end: 0.75,
    },
    temperature: {
      min: 10,
      optimal: [15, 25],
      max: 30,
    },
    rainfall: {
      min: 500,
      optimal: [600, 900],
      max: 1200,
    },
    soilTypes: ['Loamy', 'Sandy'],
    soilPH: [5.0, 6.5],
    nutrients: {
      nitrogen: 150,
      phosphorus: 80,
      potassium: 180,
    },
    averageYield: 15000,
    potentialYield: 25000,
    commonDiseases: ['Late Blight', 'Early Blight', 'Wilt', 'Scab'],
    commonPests: ['Aphids', 'Tuber Moth', 'Cutworm'],
    marketDemand: 'high',
    storageLife: 120,
  },

  tomato: {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    category: 'vegetable',
    growthDuration: 120,
    growthStages: {
      initial: 30,
      development: 40,
      mid: 40,
      late: 10,
    },
    yieldResponseFactor: 1.05,
    cropCoefficient: {
      kc_initial: 0.60,
      kc_mid: 1.15,
      kc_end: 0.80,
    },
    temperature: {
      min: 15,
      optimal: [20, 30],
      max: 35,
    },
    rainfall: {
      min: 400,
      optimal: [600, 1000],
      max: 1300,
    },
    soilTypes: ['Loamy', 'Sandy'],
    soilPH: [6.0, 7.0],
    nutrients: {
      nitrogen: 120,
      phosphorus: 80,
      potassium: 100,
    },
    averageYield: 20000,
    potentialYield: 35000,
    commonDiseases: ['Blight', 'Wilt', 'Leaf Curl', 'Mosaic Virus'],
    commonPests: ['Fruit Borer', 'Whitefly', 'Aphids', 'Mites'],
    marketDemand: 'high',
    storageLife: 14,
  },
};

// Helper functions
export function getCropData(cropName: string): CropData | null {
  const key = cropName.toLowerCase().replace(/\s+/g, '');
  return cropDatabase[key] || null;
}

export function getAllCrops(): CropData[] {
  return Object.values(cropDatabase);
}

export function getCropsByCategory(category: CropData['category']): CropData[] {
  return Object.values(cropDatabase).filter(crop => crop.category === category);
}

export function getCropsBySoilType(soilType: string): CropData[] {
  return Object.values(cropDatabase).filter(crop =>
    crop.soilTypes.includes(soilType)
  );
}

export function getCropsByClimate(temp: number, rainfall: number): CropData[] {
  return Object.values(cropDatabase).filter(crop => {
    const tempOk = temp >= crop.temperature.min && temp <= crop.temperature.max;
    const rainOk = rainfall >= crop.rainfall.min && rainfall <= crop.rainfall.max;
    return tempOk && rainOk;
  });
}
