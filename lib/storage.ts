// LocalStorage utility functions for farm data

export const storage = {
  // Farm Profile
  saveFarmProfile: (profile: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmProfile', JSON.stringify(profile));
    }
  },
  
  getFarmProfile: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('farmProfile');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  // Alerts
  saveAlerts: (alerts: any[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alerts', JSON.stringify(alerts));
    }
  },

  getAlerts: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('alerts');
      return data ? JSON.parse(data) : [];
    }
    return [];
  },

  // Sustainability Metrics
  saveSustainabilityMetrics: (metrics: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sustainabilityMetrics', JSON.stringify(metrics));
    }
  },

  getSustainabilityMetrics: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('sustainabilityMetrics');
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  // Generic storage
  save: (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  get: (key: string) => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  remove: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};
