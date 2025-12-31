'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet, FiTrendingDown, FiSun } from 'react-icons/fi';
import { GiPlantRoots } from 'react-icons/gi';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import { slideUp } from '@/lib/anim';

interface SustainabilityMetrics {
  waterUsage: number;
  carbonFootprint: number;
  soilHealth: number;
  energyEfficiency: number;
  overallScore: number;
}

interface Practice {
  title: string;
  description: string;
  impact: string;
  icon: any;
  color: string;
  active: boolean;
}

export default function SustainabilityDisplay() {
  const { t, locale } = useI18n();
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    waterUsage: 0,
    carbonFootprint: 0,
    soilHealth: 0,
    energyEfficiency: 0,
    overallScore: 0,
  });
  const [hasData, setHasData] = useState(false);
  const [waterSaved, setWaterSaved] = useState(0);
  const [co2Reduced, setCo2Reduced] = useState(0);
  const [chemicalReduction, setChemicalReduction] = useState(0);

  const calculateRealMetrics = useCallback(() => {
    const farmProfile = storage.getFarmProfile();
    const irrigationPlan = storage.get('irrigationPlan');
    const diseaseRiskData = storage.get('diseaseRiskData');

    if (!farmProfile) {
      setHasData(false);
      return;
    }

    setHasData(true);

    // Calculate Water Usage Efficiency
    let waterScore = 50; // Base score

    if (irrigationPlan) {
      // Drip irrigation is most efficient
      if (irrigationPlan.method?.includes('Drip')) {
        waterScore += 30;
      } else if (irrigationPlan.method?.includes('Sprinkler')) {
        waterScore += 20;
      } else {
        waterScore += 10;
      }

      // Soil-based adjustment
      if (farmProfile.soilType === 'Loamy') {
        waterScore += 10; // Best water retention
      } else if (farmProfile.soilType === 'Clay') {
        waterScore += 5; // Good retention
      }

      // Weather-adjusted watering
      if (irrigationPlan.rainAdjustment?.includes('Reduce')) {
        waterScore += 10; // Adapting to rain
      }
    }

    if (farmProfile.irrigationType === 'Drip Irrigation') {
      waterScore = Math.min(waterScore + 15, 100);
    }

    // Calculate Carbon Footprint Reduction
    let carbonScore = 40; // Base score

    // Organic farming reduces carbon
    // Organic farming reduces carbon
    const currentCrops = Array.isArray(farmProfile.currentCrops)
      ? farmProfile.currentCrops
      : (typeof farmProfile.currentCrops === 'string' ? [farmProfile.currentCrops] : []);

    const hasOrganicCrops = currentCrops.some((crop: string) =>
      crop.toLowerCase().includes('organic')
    );
    if (hasOrganicCrops) {
      carbonScore += 25;
    }

    // Efficient irrigation reduces machinery use
    if (farmProfile.irrigationType === 'Drip Irrigation') {
      carbonScore += 20;
    } else if (farmProfile.irrigationType === 'Sprinkler') {
      carbonScore += 15;
    }

    // Disease prevention reduces chemical use
    if (diseaseRiskData && diseaseRiskData.level === 'Low') {
      carbonScore += 15; // Less need for pesticides
    } else if (diseaseRiskData && diseaseRiskData.level === 'Medium') {
      carbonScore += 10;
    }

    // Calculate Soil Health
    let soilScore = 60; // Base score

    // Soil type quality
    if (farmProfile.soilType === 'Loamy') {
      soilScore += 20; // Best soil
    } else if (farmProfile.soilType === 'Silty') {
      soilScore += 15;
    } else if (farmProfile.soilType === 'Clay') {
      soilScore += 10;
    } else if (farmProfile.soilType === 'Sandy') {
      soilScore += 5;
    }

    // Crop rotation improves soil
    const rotationPlan = storage.get('rotationPlan');
    if (rotationPlan) {
      soilScore += 15;
    }

    // Low disease risk indicates healthy soil
    if (diseaseRiskData && diseaseRiskData.level === 'Low') {
      soilScore += 5;
    }

    // Calculate Energy Efficiency
    let energyScore = 45; // Base score

    // Drip irrigation uses less energy
    if (farmProfile.irrigationType === 'Drip Irrigation') {
      energyScore += 25;
    } else if (farmProfile.irrigationType === 'Sprinkler') {
      energyScore += 15;
    }

    // Smaller farms are more energy efficient per acre
    const farmSize = parseFloat(farmProfile.farmSize) || 0;
    if (farmSize > 0 && farmSize <= 5) {
      energyScore += 20;
    } else if (farmSize <= 10) {
      energyScore += 15;
    } else if (farmSize <= 20) {
      energyScore += 10;
    }

    // Efficient irrigation planning
    if (irrigationPlan && irrigationPlan.method?.includes('Drip')) {
      energyScore += 10;
    }

    // Cap all scores at 100
    waterScore = Math.min(waterScore, 100);
    carbonScore = Math.min(carbonScore, 100);
    soilScore = Math.min(soilScore, 100);
    energyScore = Math.min(energyScore, 100);

    // Calculate overall score
    const overallScore = Math.round(
      (waterScore + carbonScore + soilScore + energyScore) / 4
    );

    // Calculate environmental impact
    const farmSizeNum = parseFloat(farmProfile.farmSize) || 1;

    // Water saved (liters per season)
    let waterSavedCalc = 0;
    if (farmProfile.irrigationType === 'Drip Irrigation') {
      waterSavedCalc = farmSizeNum * 2500; // 2500L per acre with drip
    } else if (farmProfile.irrigationType === 'Sprinkler') {
      waterSavedCalc = farmSizeNum * 1500;
    } else {
      waterSavedCalc = farmSizeNum * 500;
    }

    // CO2 reduced (kg per season)
    let co2Calc = 0;
    if (farmProfile.irrigationType === 'Drip Irrigation') {
      co2Calc = farmSizeNum * 85; // 85kg CO2 per acre
    }
    if (diseaseRiskData && diseaseRiskData.level === 'Low') {
      co2Calc += farmSizeNum * 45; // Less pesticide use
    }

    // Chemical reduction percentage
    let chemicalCalc = 0;
    if (diseaseRiskData && diseaseRiskData.level === 'Low') {
      chemicalCalc = 60;
    } else if (diseaseRiskData && diseaseRiskData.level === 'Medium') {
      chemicalCalc = 35;
    } else {
      chemicalCalc = 15;
    }

    setMetrics({
      waterUsage: Math.round(waterScore),
      carbonFootprint: Math.round(carbonScore),
      soilHealth: Math.round(soilScore),
      energyEfficiency: Math.round(energyScore),
      overallScore: overallScore,
    });

    setWaterSaved(Math.round(waterSavedCalc));
    setCo2Reduced(Math.round(co2Calc));
    setChemicalReduction(chemicalCalc);

    // Save metrics for dashboard
    storage.saveSustainabilityMetrics({
      ...metrics,
      overallScore,
      waterSaved: Math.round(waterSavedCalc),
      co2Reduced: Math.round(co2Calc),
      chemicalReduction: chemicalCalc,
    });
  }, []);

  useEffect(() => {
    calculateRealMetrics();
  }, [calculateRealMetrics]);

  // Practice data with translations based on real farm data
  const getPractices = (): Practice[] => {
    const farmProfile = storage.getFarmProfile();
    const irrigationPlan = storage.get('irrigationPlan');
    const diseaseRiskData = storage.get('diseaseRiskData');

    const practices: Practice[] = [];
    // Water Conservation - Active if using efficient irrigation
    if (farmProfile?.irrigationType === 'Drip Irrigation' || irrigationPlan?.method?.includes('Drip')) {
      practices.push({
        title: t('sustainability.waterConservation'),
        description: locale === 'en' ? `Using ${irrigationPlan?.method || 'drip irrigation'} system` :
          locale === 'hi' ? `${irrigationPlan?.method || 'ड्रिप सिंचाई'} प्रणाली का उपयोग` :
            locale === 'te' ? `${irrigationPlan?.method || 'డ్రిప్ నీటిపారుదల'} వ్యవస్థను ఉపయోగించడం` :
              locale === 'mr' ? `${irrigationPlan?.method || 'ठिबक सिंचन'} प्रणाली वापरणे` :
                `${irrigationPlan?.method || 'சொட்டு நீர்ப்பாசனம்'} அமைப்பு பயன்படுத்துதல்`,
        impact: locale === 'en' ? `Saving ${waterSaved.toLocaleString()}L water per season` :
          locale === 'hi' ? `प्रति सीजन ${waterSaved.toLocaleString()}L पानी बचाया` :
            locale === 'te' ? `సీజన్‌కు ${waterSaved.toLocaleString()}L నీరు ఆదా` :
              locale === 'mr' ? `प्रति हंगाम ${waterSaved.toLocaleString()}L पाणी वाचवले` :
                `பருவத்திற்கு ${waterSaved.toLocaleString()}L நீர் சேமிப்பு`,
        icon: FiDroplet,
        color: 'blue',
        active: true,
      });
    }
    // Carbon Reduction - Active if disease risk is low (less chemicals needed)
    if (diseaseRiskData && (diseaseRiskData.level === 'Low' || diseaseRiskData.level === 'Medium')) {
      practices.push({
        title: t('sustainability.carbonReduction'),
        description: locale === 'en' ? `${diseaseRiskData.level} disease risk - reduced chemical use` :
          locale === 'hi' ? `${diseaseRiskData.level === 'Low' ? 'कम' : 'मध्यम'} रोग जोखिम - रासायनिक उपयोग कम` :
            locale === 'te' ? `${diseaseRiskData.level === 'Low' ? 'తక్కువ' : 'మధ్యస్థ'} వ్యాధి ప్రమాదం - రసాయన వినియోగం తగ్గింది` :
              locale === 'mr' ? `${diseaseRiskData.level === 'Low' ? 'कमी' : 'मध्यम'} रोग धोका - रासायनिक वापर कमी` :
                `${diseaseRiskData.level === 'Low' ? 'குறைந்த' : 'நடுத்தர'} நோய் ஆபத்து - இரசாயன பயன்பாடு குறைந்தது`,
        impact: locale === 'en' ? `Reduced ${co2Reduced}kg CO₂ emissions` :
          locale === 'hi' ? `${co2Reduced}kg CO₂ उत्सर्जन कम किया` :
            locale === 'te' ? `${co2Reduced}kg CO₂ ఉద్గారాలు తగ్గించబడ్డాయి` :
              locale === 'mr' ? `${co2Reduced}kg CO₂ उत्सर्जन कमी केले` :
                `${co2Reduced}kg CO₂ உமிழ்வு குறைக்கப்பட்டது`,
        icon: FiTrendingDown,
        color: 'green',
        active: true,
      });
    }
    // Soil Health - Active if good soil type or crop rotation
    const rotationPlan = storage.get('rotationPlan');
    if (farmProfile?.soilType === 'Loamy' || farmProfile?.soilType === 'Silty' || rotationPlan) {
      practices.push({
        title: t('sustainability.organicFarming'),
        description: locale === 'en' ? `${farmProfile?.soilType || 'Quality'} soil with ${rotationPlan ? 'crop rotation' : 'good management'}` :
          locale === 'hi' ? `${farmProfile?.soilType || 'गुणवत्ता'} मिट्टी ${rotationPlan ? 'फसल चक्र के साथ' : 'अच्छे प्रबंधन के साथ'}` :
            locale === 'te' ? `${farmProfile?.soilType || 'నాణ్యత'} మట్టి ${rotationPlan ? 'పంట భ్రమణతో' : 'మంచి నిర్వహణతో'}` :
              locale === 'mr' ? `${farmProfile?.soilType || 'गुणवत्ता'} माती ${rotationPlan ? 'पीक फेरबदलासह' : 'चांगल्या व्यवस्थापनासह'}` :
                `${farmProfile?.soilType || 'தரமான'} மண் ${rotationPlan ? 'பயிர் சுழற்சியுடன்' : 'நல்ல மேலாண்மையுடன்'}`,
        impact: locale === 'en' ? `Soil health score: ${metrics.soilHealth}%` :
          locale === 'hi' ? `मिट्टी स्वास्थ्य स्कोर: ${metrics.soilHealth}%` :
            locale === 'te' ? `మట్టి ఆరోగ్య స్కోర్: ${metrics.soilHealth}%` :
              locale === 'mr' ? `माती आरोग्य स्कोअर: ${metrics.soilHealth}%` :
                `மண் ஆரோக்கிய மதிப்பெண்: ${metrics.soilHealth}%`,
        icon: GiPlantRoots,
        color: 'emerald',
        active: true,
      });
    }
    // Energy Efficiency - Active if using efficient irrigation
    if (farmProfile?.irrigationType === 'Drip Irrigation' || metrics.energyEfficiency > 60) {
      practices.push({
        title: t('sustainability.renewableEnergy'),
        description: locale === 'en' ? `Efficient ${farmProfile?.irrigationType || 'irrigation'} system` :
          locale === 'hi' ? `कुशल ${farmProfile?.irrigationType || 'सिंचाई'} प्रणाली` :
            locale === 'te' ? `సమర్థవంతమైన ${farmProfile?.irrigationType || 'నీటిపారుదల'} వ్యవస్థ` :
              locale === 'mr' ? `कार्यक्षम ${farmProfile?.irrigationType || 'सिंचन'} प्रणाली` :
                `திறமையான ${farmProfile?.irrigationType || 'நீர்ப்பாசன'} அமைப்பு`,
        impact: locale === 'en' ? `Energy efficiency: ${metrics.energyEfficiency}%` :
          locale === 'hi' ? `ऊर्जा दक्षता: ${metrics.energyEfficiency}%` :
            locale === 'te' ? `శక్తి సామర్థ్యం: ${metrics.energyEfficiency}%` :
              locale === 'mr' ? `ऊर्जा कार्यक्षमता: ${metrics.energyEfficiency}%` :
                `ஆற்றல் திறன்: ${metrics.energyEfficiency}%`,
        icon: FiSun,
        color: 'yellow',
        active: true,
      });
    }

    return practices;
  };

  const getRecommendations = () => {
    const farmProfile = storage.getFarmProfile();
    const irrigationPlan = storage.get('irrigationPlan');
    const diseaseRiskData = storage.get('diseaseRiskData');
    const rotationPlan = storage.get('rotationPlan');

    const recommendations: any = {
      en: [],
      hi: [],
      te: [],
      mr: [],
      ta: [],
    };

    // Recommendation 1: Irrigation efficiency
    if (!irrigationPlan || !irrigationPlan.method?.includes('Drip')) {
      recommendations.en.push('Upgrade to drip irrigation system to save 40% water');
      recommendations.hi.push('40% पानी बचाने के लिए ड्रिप सिंचाई प्रणाली में अपग्रेड करें');
      recommendations.te.push('40% నీరు ఆదా చేయడానికి డ్రిప్ నీటిపారుదల వ్యవస్థకు అప్‌గ్రేడ్ చేయండి');
      recommendations.mr.push('40% पाणी वाचवण्यासाठी ठिबक सिंचन प्रणालीमध्ये अपग्रेड करा');
      recommendations.ta.push('40% நீரை சேமிக்க சொட்டு நீர்ப்பாசன அமைப்புக்கு மேம்படுத்தவும்');
    } else if (metrics.energyEfficiency < 70) {
      recommendations.en.push('Install solar panels for irrigation pumps to reduce energy costs');
      recommendations.hi.push('ऊर्जा लागत कम करने के लिए सिंचाई पंपों के लिए सौर पैनल स्थापित करें');
      recommendations.te.push('శక్తి ఖర్చులను తగ్గించడానికి నీటిపారుదల పంపుల కోసం సౌర ప్యానెల్లను ఇన్‌స్టాల్ చేయండి');
      recommendations.mr.push('ऊर्जा खर्च कमी करण्यासाठी सिंचन पंपांसाठी सौर पॅनेल स्थापित करा');
      recommendations.ta.push('ஆற்றல் செலவுகளை குறைக்க நீர்ப்பாசன பம்புகளுக்கு சூரிய பேனல்களை நிறுவவும்');
    }

    // Recommendation 2: Crop rotation
    if (!rotationPlan) {
      recommendations.en.push('Implement crop rotation to maintain soil fertility and reduce pests');
      recommendations.hi.push('मिट्टी की उर्वरता बनाए रखने और कीटों को कम करने के लिए फसल चक्र लागू करें');
      recommendations.te.push('మట్టి సారవంతత నిర్వహించడానికి మరియు తెగుళ్లను తగ్గించడానికి పంట భ్రమణను అమలు చేయండి');
      recommendations.mr.push('मातीची सुपीकता राखण्यासाठी आणि कीटक कमी करण्यासाठी पीक फेरबदल लागू करा');
      recommendations.ta.push('மண் வளத்தை பராமரிக்கவும் பூச்சிகளை குறைக்கவும் பயிர் சுழற்சியை செயல்படுத்தவும்');
    }

    // Recommendation 3: Disease management
    if (diseaseRiskData && (diseaseRiskData.level === 'High' || diseaseRiskData.level === 'Medium')) {
      recommendations.en.push('Use organic pest control methods to reduce chemical usage');
      recommendations.hi.push('रासायनिक उपयोग कम करने के लिए जैविक कीट नियंत्रण विधियों का उपयोग करें');
      recommendations.te.push('రసాయన వినియోగాన్ని తగ్గించడానికి సేంద్రీయ తెగులు నియంత్రణ పద్ధతులను ఉపయోగించండి');
      recommendations.mr.push('रासायनिक वापर कमी करण्यासाठी सेंद्रिय कीटक नियंत्रण पद्धती वापरा');
      recommendations.ta.push('இரசாயன பயன்பாட்டை குறைக்க இயற்கை பூச்சி கட்டுப்பாடு முறைகளை பயன்படுத்தவும்');
    } else {
      recommendations.en.push('Continue preventive measures to maintain low disease risk');
      recommendations.hi.push('कम रोग जोखिम बनाए रखने के लिए निवारक उपाय जारी रखें');
      recommendations.te.push('తక్కువ వ్యాధి ప్రమాదాన్ని నిర్వహించడానికి నివారణ చర్యలను కొనసాగించండి');
      recommendations.mr.push('कमी रोग धोका राखण्यासाठी प्रतिबंधात्मक उपाय सुरू ठेवा');
      recommendations.ta.push('குறைந்த நோய் ஆபத்தை பராமரிக்க தடுப்பு நடவடிக்கைகளை தொடரவும்');
    }

    // Recommendation 4: Soil health
    if (farmProfile?.soilType === 'Sandy') {
      recommendations.en.push('Add organic matter and mulch to improve water retention in sandy soil');
      recommendations.hi.push('रेतीली मिट्टी में पानी की अवधारण में सुधार के लिए जैविक पदार्थ और मल्च जोड़ें');
      recommendations.te.push('ఇసుక మట్టిలో నీటి నిలుపుదలని మెరుగుపరచడానికి సేంద్రీయ పదార్థం మరియు మల్చ్ జోడించండి');
      recommendations.mr.push('वाळूमय मातीत पाणी धारणा सुधारण्यासाठी सेंद्रिय पदार्थ आणि मल्च जोडा');
      recommendations.ta.push('மணல் மண்ணில் நீர் தக்கவைப்பை மேம்படுத்த இயற்கை பொருட்கள் மற்றும் மல்ச் சேர்க்கவும்');
    } else if (farmProfile?.soilType === 'Clay') {
      recommendations.en.push('Improve drainage and avoid overwatering in clay soil');
      recommendations.hi.push('मिट्टी की मिट्टी में जल निकासी में सुधार करें और अधिक पानी देने से बचें');
      recommendations.te.push('మట్టి మట్టిలో నీటి నిష్కాసనను మెరుగుపరచండి మరియు అధిక నీరు పెట్టడం నివారించండి');
      recommendations.mr.push('चिकणमातीत निचरा सुधारा आणि जास्त पाणी देणे टाळा');
      recommendations.ta.push('களிமண் மண்ணில் வடிகால் மேம்படுத்தவும் அதிக நீர் பாய்ச்சுவதை தவிர்க்கவும்');
    } else {
      recommendations.en.push('Maintain soil health with cover crops and minimal tillage');
      recommendations.hi.push('कवर फसलों और न्यूनतम जुताई के साथ मिट्टी के स्वास्थ्य को बनाए रखें');
      recommendations.te.push('కవర్ పంటలు మరియు కనిష్ట సాగుతో మట్టి ఆరోగ్యాన్ని నిర్వహించండి');
      recommendations.mr.push('कव्हर पिके आणि किमान नांगरणीसह मातीचे आरोग्य राखा');
      recommendations.ta.push('கவர் பயிர்கள் மற்றும் குறைந்தபட்ச உழவுடன் மண் ஆரோக்கியத்தை பராமரிக்கவும்');
    }

    // Recommendation 5: Water conservation
    if (metrics.waterUsage < 70) {
      recommendations.en.push('Install rainwater harvesting system to supplement irrigation');
      recommendations.hi.push('सिंचाई के पूरक के लिए वर्षा जल संचयन प्रणाली स्थापित करें');
      recommendations.te.push('నీటిపారుదలకు అనుబంధంగా వర్షపు నీటి సేకరణ వ్యవస్థను ఇన్‌స్టాల్ చేయండి');
      recommendations.mr.push('सिंचनाला पूरक म्हणून पावसाचे पाणी साठवण्याची प्रणाली स्थापित करा');
      recommendations.ta.push('நீர்ப்பாசனத்திற்கு துணையாக மழை நீர் சேகரிப்பு அமைப்பை நிறுவவும்');
    }

    // Recommendation 6: Composting
    recommendations.en.push('Create composting systems for organic waste to reduce fertilizer costs');
    recommendations.hi.push('उर्वरक लागत कम करने के लिए जैविक कचरे के लिए कंपोस्टिंग सिस्टम बनाएं');
    recommendations.te.push('ఎరువుల ఖర్చులను తగ్గించడానికి సేంద్రీయ వ్యర్థాల కోసం కంపోస్టింగ్ వ్యవస్థలను సృష్టించండి');
    recommendations.mr.push('खत खर्च कमी करण्यासाठी सेंद्रिय कचऱ्यासाठी कंपोस्टिंग प्रणाली तयार करा');
    recommendations.ta.push('உர செலவுகளை குறைக்க இயற்கை கழிவுகளுக்கு உரமாக்கல் அமைப்புகளை உருவாக்கவும்');

    const currentLocale = locale === 'en' ? 'en' :
      locale === 'hi' ? 'hi' :
        locale === 'te' ? 'te' :
          locale === 'mr' ? 'mr' : 'ta';

    return recommendations[currentLocale];
  };

  const practices = getPractices();
  const recommendations = getRecommendations();

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
      green: 'border-green-500/50 bg-green-500/10 text-green-400',
      emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
      yellow: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Sustainability Score */}
      <div className="rounded-lg border border-primary-500/50 bg-primary-500/20 p-6 backdrop-blur-md">
        <h3 className="text-xl font-semibold text-white mb-2">{t('sustainability.overallScore')}</h3>
        {hasData ? (
          <>
            <div className="flex items-end gap-2">
              <p className="text-5xl font-bold text-primary-400">{metrics.overallScore}</p>
              <p className="text-lg text-primary-300 mb-2">/100</p>
            </div>
            <p className="text-sm text-primary-200 mt-2">
              {metrics.overallScore >= 80 ? t('sustainability.excellentProgress') :
                metrics.overallScore >= 60 ? t('sustainability.goodProgress') :
                  t('sustainability.needsImprovement')}
            </p>
          </>
        ) : (
          <p className="text-sm text-primary-200 mt-2">
            {locale === 'en' ? 'Complete your farm profile to see your sustainability score' :
              locale === 'hi' ? 'अपना स्थिरता स्कोर देखने के लिए अपनी फार्म प्रोफ़ाइल पूरी करें' :
                locale === 'te' ? 'మీ స్థిరత్వ స్కోర్‌ను చూడటానికి మీ వ్యవసాయ ప్రొఫైల్‌ను పూర్తి చేయండి' :
                  locale === 'mr' ? 'तुमचा शाश्वतता स्कोअर पाहण्यासाठी तुमची फार्म प्रोफाइल पूर्ण करा' :
                    'உங்கள் நிலைத்தன்மை மதிப்பெண்ணைப் பார்க்க உங்கள் பண்ணை சுயவிவரத்தை முடிக்கவும்'}
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <FiDroplet className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">{t('sustainability.waterUsageEfficiency')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('sustainability.current')}</span>
              <span className="text-white font-semibold">{metrics.waterUsage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.waterUsage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <FiTrendingDown className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">{t('sustainability.carbonFootprint')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('sustainability.reduction')}</span>
              <span className="text-white font-semibold">{metrics.carbonFootprint}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.carbonFootprint}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <GiPlantRoots className="h-5 w-5 text-emerald-400" />
            <span className="text-white font-medium">{t('sustainability.soilHealth')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('sustainability.quality')}</span>
              <span className="text-white font-semibold">{metrics.soilHealth}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.soilHealth}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3">
            <FiSun className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">{t('sustainability.energyEfficiency')}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('sustainability.renewable')}</span>
              <span className="text-white font-semibold">{metrics.energyEfficiency}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.energyEfficiency}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Practices */}
      <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
        <h4 className="text-lg font-semibold text-white mb-4">{t('sustainability.sustainablePractices')}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {practices.map((practice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-lg border p-4 ${getColorClasses(practice.color)}`}
            >
              <div className="flex items-start gap-3">
                <practice.icon className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-semibold text-white mb-1">{practice.title}</h5>
                  <p className="text-sm text-gray-300 mb-2">{practice.description}</p>
                  <p className="text-xs font-medium">{practice.impact}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-white/20 bg-white/10 p-6 backdrop-blur-md">
        <h4 className="text-lg font-semibold text-white mb-4">{t('sustainability.recommendationsImprovement')}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec: string, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-semibold">
                {index + 1}
              </div>
              <p className="text-sm text-gray-300">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      {hasData && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 backdrop-blur-md">
          <h4 className="text-lg font-semibold text-green-300 mb-3">{t('sustainability.environmentalImpact')}</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{waterSaved.toLocaleString()}</p>
              <p className="text-sm text-gray-300 mt-1">{t('sustainability.litersSaved')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{co2Reduced}</p>
              <p className="text-sm text-gray-300 mt-1">{t('sustainability.co2Reduced')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{chemicalReduction}%</p>
              <p className="text-sm text-gray-300 mt-1">{t('sustainability.lessChemical')}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
