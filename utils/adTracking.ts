export interface AdMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  ecpm: number;
  fillRate: number;
  viewability: number;
}

export interface AdEvent {
  adId: string;
  timestamp: number;
  type: 'impression' | 'click' | 'video-complete' | 'rewarded-claim';
  screen: string;
  position: string;
  adFormat?: 'banner' | 'video' | 'interstitial' | 'rewarded';
  duration?: number;
  userEngagement?: number;
}

class AdTracker {
  private events: AdEvent[] = [];
  private impressions: Map<string, number> = new Map();
  private clicks: Map<string, number> = new Map();
  private videoCompletes: Map<string, number> = new Map();
  private rewardedClaims: Map<string, number> = new Map();
  private adRequests: Map<string, number> = new Map();
  private adFills: Map<string, number> = new Map();

  trackAdRequest(adId: string, screen: string, position: string) {
    this.adRequests.set(adId, (this.adRequests.get(adId) || 0) + 1);
    console.log(`[AdTracker] Ad Requested: ${adId}`);
  }

  trackAdFill(adId: string) {
    this.adFills.set(adId, (this.adFills.get(adId) || 0) + 1);
    console.log(`[AdTracker] Ad Filled: ${adId}`);
  }

  trackImpression(adId: string, screen: string, position: string, adFormat: 'banner' | 'video' | 'interstitial' | 'rewarded' = 'banner') {
    const event: AdEvent = {
      adId,
      timestamp: Date.now(),
      type: 'impression',
      screen,
      position,
      adFormat,
    };
    
    this.events.push(event);
    this.impressions.set(adId, (this.impressions.get(adId) || 0) + 1);
    this.trackAdFill(adId);
    
    console.log(`[AdTracker] Impression: ${adId} (${adFormat}) on ${screen} (${position})`);
    console.log(`[AdTracker] Total impressions for ${adId}: ${this.impressions.get(adId)}`);
  }

  trackClick(adId: string, screen: string, position: string, adFormat: 'banner' | 'video' | 'interstitial' | 'rewarded' = 'banner') {
    const event: AdEvent = {
      adId,
      timestamp: Date.now(),
      type: 'click',
      screen,
      position,
      adFormat,
    };
    
    this.events.push(event);
    this.clicks.set(adId, (this.clicks.get(adId) || 0) + 1);
    
    console.log(`[AdTracker] Click: ${adId} (${adFormat}) on ${screen} (${position})`);
    console.log(`[AdTracker] Total clicks for ${adId}: ${this.clicks.get(adId)}`);
  }

  trackVideoComplete(adId: string, screen: string, duration: number) {
    const event: AdEvent = {
      adId,
      timestamp: Date.now(),
      type: 'video-complete',
      screen,
      position: 'video-ad',
      adFormat: 'video',
      duration,
    };
    
    this.events.push(event);
    this.videoCompletes.set(adId, (this.videoCompletes.get(adId) || 0) + 1);
    
    console.log(`[AdTracker] Video Complete: ${adId} on ${screen} (${duration}s)`);
    console.log(`[AdTracker] Total video completes for ${adId}: ${this.videoCompletes.get(adId)}`);
  }

  trackRewardedClaim(adId: string, screen: string, rewardValue: number) {
    const event: AdEvent = {
      adId,
      timestamp: Date.now(),
      type: 'rewarded-claim',
      screen,
      position: 'rewarded-ad',
      adFormat: 'rewarded',
      userEngagement: rewardValue,
    };
    
    this.events.push(event);
    this.rewardedClaims.set(adId, (this.rewardedClaims.get(adId) || 0) + 1);
    
    console.log(`[AdTracker] Rewarded Claim: ${adId} on ${screen} (Value: ${rewardValue})`);
    console.log(`[AdTracker] Total rewarded claims for ${adId}: ${this.rewardedClaims.get(adId)}`);
  }

  getMetrics(adId?: string): AdMetrics {
    if (adId) {
      const impressions = this.impressions.get(adId) || 0;
      const clicks = this.clicks.get(adId) || 0;
      const requests = this.adRequests.get(adId) || 0;
      const fills = this.adFills.get(adId) || 0;
      const videoCompletes = this.videoCompletes.get(adId) || 0;
      const rewardedClaims = this.rewardedClaims.get(adId) || 0;
      
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const fillRate = requests > 0 ? (fills / requests) * 100 : 100;
      const viewability = impressions > 0 ? 95 : 0;
      const revenue = this.calculateRevenue(impressions, clicks, videoCompletes, rewardedClaims);
      const ecpm = impressions > 0 ? (revenue / impressions) * 1000 : 0;
      
      return { impressions, clicks, ctr, revenue, ecpm, fillRate, viewability };
    }

    let totalImpressions = 0;
    let totalClicks = 0;
    let totalRequests = 0;
    let totalFills = 0;
    let totalVideoCompletes = 0;
    let totalRewardedClaims = 0;
    
    this.impressions.forEach(count => totalImpressions += count);
    this.clicks.forEach(count => totalClicks += count);
    this.adRequests.forEach(count => totalRequests += count);
    this.adFills.forEach(count => totalFills += count);
    this.videoCompletes.forEach(count => totalVideoCompletes += count);
    this.rewardedClaims.forEach(count => totalRewardedClaims += count);
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const fillRate = totalRequests > 0 ? (totalFills / totalRequests) * 100 : 100;
    const viewability = totalImpressions > 0 ? 95 : 0;
    const revenue = this.calculateRevenue(totalImpressions, totalClicks, totalVideoCompletes, totalRewardedClaims);
    const ecpm = totalImpressions > 0 ? (revenue / totalImpressions) * 1000 : 0;
    
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr,
      revenue,
      ecpm,
      fillRate,
      viewability,
    };
  }

  private calculateRevenue(impressions: number, clicks: number, videoCompletes: number = 0, rewardedClaims: number = 0): number {
    const bannerCPM = 5;
    const videoCPM = 15;
    const rewardedCPM = 25;
    const cpc = 0.5;
    
    const bannerImpressions = impressions - videoCompletes - rewardedClaims;
    const bannerRevenue = (bannerImpressions / 1000) * bannerCPM;
    const videoRevenue = (videoCompletes / 1000) * videoCPM;
    const rewardedRevenue = (rewardedClaims / 1000) * rewardedCPM;
    const clickRevenue = clicks * cpc;
    
    return bannerRevenue + videoRevenue + rewardedRevenue + clickRevenue;
  }

  getRevenueBreakdown(): {
    cpm: { banner: number; video: number; rewarded: number; total: number };
    cpc: { clicks: number; revenue: number };
    total: number;
  } {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalVideoCompletes = 0;
    let totalRewardedClaims = 0;
    
    this.impressions.forEach(count => totalImpressions += count);
    this.clicks.forEach(count => totalClicks += count);
    this.videoCompletes.forEach(count => totalVideoCompletes += count);
    this.rewardedClaims.forEach(count => totalRewardedClaims += count);
    
    const bannerCPM = 5;
    const videoCPM = 15;
    const rewardedCPM = 25;
    const cpc = 0.5;
    
    const bannerImpressions = totalImpressions - totalVideoCompletes - totalRewardedClaims;
    const bannerRevenue = (bannerImpressions / 1000) * bannerCPM;
    const videoRevenue = (totalVideoCompletes / 1000) * videoCPM;
    const rewardedRevenue = (totalRewardedClaims / 1000) * rewardedCPM;
    const clickRevenue = totalClicks * cpc;
    
    const cpmTotal = bannerRevenue + videoRevenue + rewardedRevenue;
    
    return {
      cpm: {
        banner: bannerRevenue,
        video: videoRevenue,
        rewarded: rewardedRevenue,
        total: cpmTotal,
      },
      cpc: {
        clicks: totalClicks,
        revenue: clickRevenue,
      },
      total: cpmTotal + clickRevenue,
    };
  }

  getMonthlyProjection(): number {
    const metrics = this.getMetrics();
    const dailyRevenue = metrics.revenue;
    return dailyRevenue * 30;
  }

  printReport() {
    const metrics = this.getMetrics();
    const monthlyProjection = this.getMonthlyProjection();
    const yearlyProjection = monthlyProjection * 12;
    const breakdown = this.getRevenueBreakdown();
    
    let totalVideoCompletes = 0;
    let totalRewardedClaims = 0;
    this.videoCompletes.forEach(count => totalVideoCompletes += count);
    this.rewardedClaims.forEach(count => totalRewardedClaims += count);
    
    console.log('\n========================================================');
    console.log('       📊 AD PERFORMANCE REPORT (CPM + CPC) 📊        ');
    console.log('========================================================\n');
    
    console.log('🎯 KEY METRICS:');
    console.log(`   Total Impressions: ${metrics.impressions.toLocaleString()}`);
    console.log(`   Total Clicks: ${metrics.clicks.toLocaleString()}`);
    console.log(`   Video Completes: ${totalVideoCompletes.toLocaleString()}`);
    console.log(`   Rewarded Claims: ${totalRewardedClaims.toLocaleString()}`);
    console.log(`   CTR: ${metrics.ctr.toFixed(2)}%`);
    console.log(`   eCPM: $${metrics.ecpm.toFixed(2)}`);
    console.log(`   Fill Rate: ${metrics.fillRate.toFixed(2)}%`);
    console.log(`   Viewability: ${metrics.viewability.toFixed(2)}%\n`);
    
    console.log('💰 REVENUE BREAKDOWN (CPM vs CPC):');
    console.log('   ------------------------------------------------');
    console.log('   📊 CPM Revenue (Cost Per 1000 Impressions):');
    console.log(`      • Banner Ads (CPM $5): $${breakdown.cpm.banner.toFixed(2)}`);
    console.log(`      • Video Ads (CPM $15): $${breakdown.cpm.video.toFixed(2)}`);
    console.log(`      • Rewarded Ads (CPM $25): $${breakdown.cpm.rewarded.toFixed(2)}`);
    console.log(`      • CPM Subtotal: $${breakdown.cpm.total.toFixed(2)} (${breakdown.total > 0 ? ((breakdown.cpm.total / breakdown.total) * 100).toFixed(1) : '0'}%)`);
    console.log('   ------------------------------------------------');
    console.log('   🖱️  CPC Revenue (Cost Per Click):');
    console.log(`      • Total Clicks: ${breakdown.cpc.clicks.toLocaleString()}`);
    console.log(`      • CPC Rate: $0.50 per click`);
    console.log(`      • CPC Subtotal: $${breakdown.cpc.revenue.toFixed(2)} (${breakdown.total > 0 ? ((breakdown.cpc.revenue / breakdown.total) * 100).toFixed(1) : '0'}%)`);
    console.log('   ------------------------------------------------');
    console.log(`   💎 TOTAL REVENUE: $${breakdown.total.toFixed(2)}\n`);
    
    console.log('💵 REVENUE PROJECTIONS:');
    console.log(`   Daily Revenue: $${metrics.revenue.toFixed(2)}`);
    console.log(`   Monthly Revenue: $${monthlyProjection.toFixed(2)}`);
    console.log(`   Yearly Revenue: $${yearlyProjection.toFixed(2)}\n`);
    
    console.log('📈 GROWTH SCENARIOS (If you scale to):');
    console.log(`   10K DAU:  $${(monthlyProjection * 10).toFixed(0)}/mo`);
    console.log(`   50K DAU:  $${(monthlyProjection * 50).toFixed(0)}/mo`);
    console.log(`   100K DAU: $${(monthlyProjection * 100).toFixed(0)}/mo`);
    console.log(`   500K DAU: $${(monthlyProjection * 500).toFixed(0)}/mo\n`);
    
    console.log('📊 Ad Performance by ID:');
    console.log('--------------------------------------------------------');
    this.impressions.forEach((_, adId) => {
      const adMetrics = this.getMetrics(adId);
      console.log(`\n🎯 ${adId}:`);
      console.log(`   Impressions: ${adMetrics.impressions.toLocaleString()}`);
      console.log(`   Clicks: ${adMetrics.clicks.toLocaleString()}`);
      console.log(`   CTR: ${adMetrics.ctr.toFixed(2)}%`);
      console.log(`   eCPM: $${adMetrics.ecpm.toFixed(2)}`);
      console.log(`   Revenue: $${adMetrics.revenue.toFixed(2)}`);
    });
    
    console.log('\n========================================================\n');
  }

  getOptimizationSuggestions(): string[] {
    const metrics = this.getMetrics();
    const suggestions: string[] = [];
    
    if (metrics.ctr < 2) {
      suggestions.push('⚠️  CTR is low. Consider improving ad creative or placement.');
    }
    
    if (metrics.ecpm < 3) {
      suggestions.push('⚠️  eCPM is low. Try implementing video/rewarded ads for higher revenue.');
    }
    
    if (metrics.fillRate < 90) {
      suggestions.push('⚠️  Fill rate is low. Check ad network configuration.');
    }
    
    let totalVideoCompletes = 0;
    let totalRewardedClaims = 0;
    this.videoCompletes.forEach(count => totalVideoCompletes += count);
    this.rewardedClaims.forEach(count => totalRewardedClaims += count);
    
    if (totalVideoCompletes === 0) {
      suggestions.push('💡 Consider adding video ads for 3x higher CPM.');
    }
    
    if (totalRewardedClaims === 0) {
      suggestions.push('💡 Consider adding rewarded ads for 5x higher CPM and better engagement.');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('✅ Your ad strategy is performing well! Keep optimizing.');
    }
    
    return suggestions;
  }

  reset() {
    this.events = [];
    this.impressions.clear();
    this.clicks.clear();
    this.videoCompletes.clear();
    this.rewardedClaims.clear();
    this.adRequests.clear();
    this.adFills.clear();
    console.log('[AdTracker] Metrics reset');
  }
}

export const adTracker = new AdTracker();

if (typeof window !== 'undefined') {
  (window as any).adTracker = adTracker;
  console.log('[AdTracker] Available globally as window.adTracker');
  console.log('[AdTracker] Use adTracker.printReport() to see metrics');
  console.log('[AdTracker] CPC & CPM tracking activated! 🚀');
  console.log('[AdTracker] - CPM: Banner ($5), Video ($15), Rewarded ($25)');
  console.log('[AdTracker] - CPC: $0.50 per click');
}
