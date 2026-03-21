/**
 * Trust Score Engine
 * Calculates a farm's data-driven reliability score (0-100)
 */
export interface TrustFactors {
  hasSensors: boolean;
  hasSatellite: boolean;
  analysisCount: number;
  dataReadingsCount: number;
}

export const calculateTrustScore = (factors: TrustFactors) => {
  let score = 0;

  // 1. Hardware Presence (30%)
  if (factors.hasSensors) score += 30;

  // 2. Satellite Monitoring (30%)
  if (factors.hasSatellite) score += 30;

  // 3. Consistency (Engagement) (20%)
  // If they check analysis more than 5 times
  const consistencyScore = Math.min(factors.analysisCount * 4, 20);
  score += consistencyScore;

  // 4. Data Volume (20%)
  // If they have more than 50 sensor readings
  const dataScore = Math.min(Math.floor(factors.dataReadingsCount / 2.5), 20);
  score += dataScore;

  return {
    score,
    label: getTrustLabel(score),
    breakdown: {
      hardware: factors.hasSensors ? 30 : 0,
      satellite: factors.hasSatellite ? 30 : 0,
      engagement: consistencyScore,
      dataVolume: dataScore
    }
  };
};

const getTrustLabel = (score: number) => {
  if (score >= 90) return 'Verified Professional';
  if (score >= 70) return 'Data-Driven Explorer';
  if (score >= 40) return 'Growing Digital';
  return 'Early Adopter';
};
