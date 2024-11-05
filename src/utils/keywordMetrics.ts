export interface KeywordMetrics {
  potentialTraffic: number;
  potentialConversions: number;
  potentialRevenue: number;
}

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
}

interface ContextData {
  conversionRate: number;
  averageOrderValue: number;
}

export function calculateKeywordMetrics(keyword: Keyword, contextData: ContextData): KeywordMetrics {
  // Calculate potential traffic (32% CTR for first position)
  const potentialTraffic = Math.round(keyword.volume * 0.32);
  
  // Calculate potential conversions using site's conversion rate
  const conversionRate = contextData.conversionRate / 100; // Convert percentage to decimal
  const potentialConversions = Math.round(potentialTraffic * conversionRate);
  
  // Calculate potential revenue using average order value
  const potentialRevenue = Math.round(potentialConversions * contextData.averageOrderValue);

  return {
    potentialTraffic,
    potentialConversions,
    potentialRevenue
  };
}

export function calculateTotalMetrics(keywords: Keyword[], contextData: ContextData): KeywordMetrics {
  return keywords.reduce((acc, keyword) => {
    const metrics = calculateKeywordMetrics(keyword, contextData);
    return {
      potentialTraffic: acc.potentialTraffic + metrics.potentialTraffic,
      potentialConversions: acc.potentialConversions + metrics.potentialConversions,
      potentialRevenue: acc.potentialRevenue + metrics.potentialRevenue
    };
  }, {
    potentialTraffic: 0,
    potentialConversions: 0,
    potentialRevenue: 0
  });
}