// Professional Disease & Pest Database
// Based on ICAR, USDA, and Plant Pathology research

export interface DiseaseData {
  id: string;
  name: string;
  scientificName: string;
  type: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nematode';
  affectedCrops: string[];
  
  // Environmental Conditions
  favorableConditions: {
    temperature: [number, number]; // °C
    humidity: [number, number]; // %
    rainfall: 'low' | 'medium' | 'high';
  };
  
  // Symptoms
  symptoms: string[];
  
  // Impact
  yieldLoss: [number, number]; // % range
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Management
  prevention: string[];
  organicControl: string[];
  chemicalControl: string[];
  
  // Timing
  criticalStages: string[]; // crop growth stages most vulnerable
  spreadRate: 'slow' | 'moderate' | 'fast';
}

export const diseaseDatabase: Record<string, DiseaseData> = {
  // RICE DISEASES
  rice_blast: {
    id: 'rice_blast',
    name: 'Rice Blast',
    scientificName: 'Pyricularia oryzae',
    type: 'fungal',
    affectedCrops: ['Rice'],
    favorableConditions: {
      temperature: [25, 28],
      humidity: [85, 100],
      rainfall: 'high',
    },
    symptoms: [
      'Diamond-shaped lesions on leaves',
      'White to gray centers with brown margins',
      'Neck rot causing lodging',
      'Panicle infection reducing grain fill',
    ],
    yieldLoss: [30, 70],
    severity: 'critical',
    prevention: [
      'Use resistant varieties',
      'Avoid excessive nitrogen fertilization',
      'Maintain proper plant spacing',
      'Remove infected plant debris',
      'Alternate wetting and drying',
    ],
    organicControl: [
      'Neem oil spray (5ml/liter)',
      'Pseudomonas fluorescens application',
      'Trichoderma viride seed treatment',
      'Silicon fertilization',
    ],
    chemicalControl: [
      'Tricyclazole 75% WP @ 0.6g/liter',
      'Carbendazim 50% WP @ 1g/liter',
      'Azoxystrobin 23% SC @ 1ml/liter',
    ],
    criticalStages: ['Tillering', 'Panicle initiation', 'Flowering'],
    spreadRate: 'fast',
  },
  
  rice_bacterial_blight: {
    id: 'rice_bacterial_blight',
    name: 'Bacterial Blight',
    scientificName: 'Xanthomonas oryzae',
    type: 'bacterial',
    affectedCrops: ['Rice'],
    favorableConditions: {
      temperature: [25, 34],
      humidity: [70, 100],
      rainfall: 'high',
    },
    symptoms: [
      'Water-soaked lesions on leaf tips',
      'Yellow to white lesions along leaf margins',
      'Wilting of seedlings (kresek)',
      'Milky bacterial ooze from cut stems',
    ],
    yieldLoss: [20, 50],
    severity: 'high',
    prevention: [
      'Use certified disease-free seeds',
      'Plant resistant varieties',
      'Avoid deep water and high nitrogen',
      'Maintain field sanitation',
      'Avoid injury to plants',
    ],
    organicControl: [
      'Copper oxychloride spray',
      'Pseudomonas fluorescens',
      'Plant extracts (garlic, ginger)',
    ],
    chemicalControl: [
      'Streptocycline 300ppm + Copper oxychloride 0.25%',
      'Plantomycin @ 1g/liter',
    ],
    criticalStages: ['Tillering', 'Maximum tillering', 'Booting'],
    spreadRate: 'fast',
  },
  
  // WHEAT DISEASES
  wheat_rust: {
    id: 'wheat_rust',
    name: 'Wheat Rust (Yellow, Brown, Black)',
    scientificName: 'Puccinia spp.',
    type: 'fungal',
    affectedCrops: ['Wheat'],
    favorableConditions: {
      temperature: [15, 25],
      humidity: [70, 100],
      rainfall: 'medium',
    },
    symptoms: [
      'Yellow/orange pustules on leaves (Yellow rust)',
      'Brown pustules scattered on leaves (Brown rust)',
      'Black pustules on stems (Black rust)',
      'Premature leaf drying',
    ],
    yieldLoss: [20, 60],
    severity: 'critical',
    prevention: [
      'Grow resistant varieties',
      'Early sowing',
      'Balanced fertilization',
      'Remove volunteer wheat plants',
      'Crop rotation',
    ],
    organicControl: [
      'Sulfur dust application',
      'Neem oil spray',
      'Bordeaux mixture',
    ],
    chemicalControl: [
      'Propiconazole 25% EC @ 1ml/liter',
      'Tebuconazole 25% EC @ 1ml/liter',
      'Mancozeb 75% WP @ 2.5g/liter',
    ],
    criticalStages: ['Tillering', 'Stem elongation', 'Heading'],
    spreadRate: 'fast',
  },
  
  // COTTON DISEASES
  cotton_wilt: {
    id: 'cotton_wilt',
    name: 'Cotton Wilt',
    scientificName: 'Fusarium oxysporum',
    type: 'fungal',
    affectedCrops: ['Cotton'],
    favorableConditions: {
      temperature: [25, 32],
      humidity: [60, 80],
      rainfall: 'medium',
    },
    symptoms: [
      'Yellowing and drooping of leaves',
      'Vascular browning in stem',
      'Sudden wilting of plants',
      'Plant death in severe cases',
    ],
    yieldLoss: [30, 80],
    severity: 'critical',
    prevention: [
      'Use wilt-resistant varieties',
      'Crop rotation with non-host crops',
      'Soil solarization',
      'Maintain soil pH 6.5-7.5',
      'Avoid waterlogging',
    ],
    organicControl: [
      'Trichoderma viride seed treatment',
      'Pseudomonas fluorescens soil application',
      'Neem cake application',
      'Biocontrol agents',
    ],
    chemicalControl: [
      'Carbendazim seed treatment @ 2g/kg',
      'Soil drenching with Carbendazim',
    ],
    criticalStages: ['Seedling', 'Vegetative', 'Flowering'],
    spreadRate: 'moderate',
  },
  
  // TOMATO DISEASES
  tomato_late_blight: {
    id: 'tomato_late_blight',
    name: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    type: 'fungal',
    affectedCrops: ['Tomato', 'Potato'],
    favorableConditions: {
      temperature: [15, 25],
      humidity: [85, 100],
      rainfall: 'high',
    },
    symptoms: [
      'Water-soaked lesions on leaves',
      'White fungal growth on leaf undersides',
      'Brown lesions on stems',
      'Fruit rot with firm brown lesions',
    ],
    yieldLoss: [40, 100],
    severity: 'critical',
    prevention: [
      'Use resistant varieties',
      'Avoid overhead irrigation',
      'Proper plant spacing',
      'Remove infected plants immediately',
      'Avoid planting near potato fields',
    ],
    organicControl: [
      'Copper-based fungicides',
      'Bordeaux mixture spray',
      'Neem oil application',
    ],
    chemicalControl: [
      'Mancozeb 75% WP @ 2.5g/liter',
      'Metalaxyl + Mancozeb @ 2g/liter',
      'Cymoxanil + Mancozeb @ 2g/liter',
    ],
    criticalStages: ['Flowering', 'Fruiting'],
    spreadRate: 'fast',
  },
  
  // POTATO DISEASES
  potato_late_blight: {
    id: 'potato_late_blight',
    name: 'Potato Late Blight',
    scientificName: 'Phytophthora infestans',
    type: 'fungal',
    affectedCrops: ['Potato'],
    favorableConditions: {
      temperature: [10, 25],
      humidity: [85, 100],
      rainfall: 'high',
    },
    symptoms: [
      'Dark water-soaked lesions on leaves',
      'White mold on leaf undersides',
      'Tuber rot with reddish-brown discoloration',
      'Rapid plant death in humid conditions',
    ],
    yieldLoss: [50, 100],
    severity: 'critical',
    prevention: [
      'Plant certified disease-free seed tubers',
      'Hill up soil to protect tubers',
      'Avoid irrigation during cool humid periods',
      'Destroy cull piles',
      'Use resistant varieties',
    ],
    organicControl: [
      'Copper fungicides',
      'Bordeaux mixture',
      'Potassium bicarbonate spray',
    ],
    chemicalControl: [
      'Mancozeb 75% WP @ 2.5g/liter',
      'Metalaxyl + Mancozeb @ 2.5g/liter',
      'Dimethomorph + Mancozeb @ 2g/liter',
    ],
    criticalStages: ['Tuber formation', 'Tuber bulking'],
    spreadRate: 'fast',
  },
  
  // COMMON PESTS
  stem_borer: {
    id: 'stem_borer',
    name: 'Stem Borer',
    scientificName: 'Scirpophaga incertulas',
    type: 'pest',
    affectedCrops: ['Rice', 'Corn', 'Sugarcane'],
    favorableConditions: {
      temperature: [25, 35],
      humidity: [60, 90],
      rainfall: 'medium',
    },
    symptoms: [
      'Dead hearts in vegetative stage',
      'White ears in reproductive stage',
      'Holes in stem with frass',
      'Stunted plant growth',
    ],
    yieldLoss: [20, 50],
    severity: 'high',
    prevention: [
      'Remove and destroy stubbles',
      'Avoid staggered planting',
      'Use light traps',
      'Maintain field sanitation',
      'Grow resistant varieties',
    ],
    organicControl: [
      'Release Trichogramma egg parasitoids',
      'Neem seed kernel extract spray',
      'Bacillus thuringiensis application',
      'Pheromone traps',
    ],
    chemicalControl: [
      'Chlorantraniliprole 18.5% SC @ 0.3ml/liter',
      'Cartap hydrochloride 50% SP @ 1g/liter',
      'Fipronil 5% SC @ 2ml/liter',
    ],
    criticalStages: ['Tillering', 'Panicle initiation'],
    spreadRate: 'moderate',
  },
  
  aphids: {
    id: 'aphids',
    name: 'Aphids',
    scientificName: 'Aphis spp.',
    type: 'pest',
    affectedCrops: ['Wheat', 'Cotton', 'Tomato', 'Potato', 'Soybean'],
    favorableConditions: {
      temperature: [20, 30],
      humidity: [50, 80],
      rainfall: 'low',
    },
    symptoms: [
      'Curling and yellowing of leaves',
      'Sticky honeydew on leaves',
      'Sooty mold growth',
      'Stunted plant growth',
      'Virus transmission',
    ],
    yieldLoss: [10, 40],
    severity: 'medium',
    prevention: [
      'Encourage natural predators (ladybugs)',
      'Use reflective mulches',
      'Remove alternate hosts',
      'Maintain field hygiene',
      'Use resistant varieties',
    ],
    organicControl: [
      'Neem oil spray (5ml/liter)',
      'Soap water spray',
      'Garlic extract spray',
      'Release ladybird beetles',
    ],
    chemicalControl: [
      'Imidacloprid 17.8% SL @ 0.3ml/liter',
      'Thiamethoxam 25% WG @ 0.2g/liter',
      'Acetamiprid 20% SP @ 0.2g/liter',
    ],
    criticalStages: ['Seedling', 'Vegetative', 'Flowering'],
    spreadRate: 'fast',
  },
};

// Helper functions
export function getDiseaseData(diseaseId: string): DiseaseData | null {
  return diseaseDatabase[diseaseId] || null;
}

export function getAllDiseases(): DiseaseData[] {
  return Object.values(diseaseDatabase);
}

export function getDiseasesByCrop(cropName: string): DiseaseData[] {
  return Object.values(diseaseDatabase).filter(disease =>
    disease.affectedCrops.some(crop => 
      crop.toLowerCase() === cropName.toLowerCase()
    )
  );
}

export function getDiseasesByType(type: DiseaseData['type']): DiseaseData[] {
  return Object.values(diseaseDatabase).filter(disease => disease.type === type);
}

export function assessDiseaseRisk(
  temperature: number,
  humidity: number,
  rainfall: 'low' | 'medium' | 'high',
  cropName: string
): Array<{ disease: DiseaseData; riskLevel: 'low' | 'medium' | 'high' }> {
  const cropDiseases = getDiseasesByCrop(cropName);
  
  return cropDiseases.map(disease => {
    let riskScore = 0;
    
    // Temperature check
    const [minTemp, maxTemp] = disease.favorableConditions.temperature;
    if (temperature >= minTemp && temperature <= maxTemp) {
      riskScore += 3;
    } else if (Math.abs(temperature - minTemp) <= 5 || Math.abs(temperature - maxTemp) <= 5) {
      riskScore += 1;
    }
    
    // Humidity check
    const [minHum, maxHum] = disease.favorableConditions.humidity;
    if (humidity >= minHum && humidity <= maxHum) {
      riskScore += 3;
    } else if (Math.abs(humidity - minHum) <= 10 || Math.abs(humidity - maxHum) <= 10) {
      riskScore += 1;
    }
    
    // Rainfall check
    if (disease.favorableConditions.rainfall === rainfall) {
      riskScore += 2;
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore >= 6) {
      riskLevel = 'high';
    } else if (riskScore >= 3) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'low';
    }
    
    return { disease, riskLevel };
  }).sort((a, b) => {
    const riskOrder = { high: 3, medium: 2, low: 1 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });
}
