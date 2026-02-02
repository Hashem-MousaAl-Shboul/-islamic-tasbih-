import { adTracker } from './adTracking';

interface AdConfig {
  imageUrl: string;
  headline: string;
  cta: string;
  description?: string;
  destinationUrl: string;
  regions?: string[];
  languages?: string[];
}

interface RegionalCPM {
  tier1: number;
  tier2: number;
  tier3: number;
  global: number;
}

class AdStrategy {
  private sessionAdCount: number = 0;
  private lastInterstitialTime: number = 0;
  private interstitialCooldown: number = 180000;
  private maxInterstitialsPerSession: number = 5;
  
  private tier1Countries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'KR', 'AE', 'SA', 'QA', 'KW'];
  private tier2Countries = ['ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'BE', 'AT', 'CH', 'TR', 'EG', 'MA', 'DZ'];
  
  private regionalCPM: { [key: string]: RegionalCPM } = {
    banner: { tier1: 8, tier2: 5, tier3: 3, global: 5 },
    video: { tier1: 25, tier2: 15, tier3: 8, global: 15 },
    interstitial: { tier1: 15, tier2: 10, tier3: 5, global: 10 },
    rewarded: { tier1: 40, tier2: 25, tier3: 12, global: 25 },
  };
  
  private islamicBannerAds: AdConfig[] = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=200&fit=crop',
      headline: 'تعلم القرآن الكريم بسهولة',
      cta: 'ابدأ الآن',
      description: 'انضم إلى ملايين المسلمين في تعلم القرآن الكريم',
      destinationUrl: 'https://quran.com',
      regions: ['MENA', 'ASIA', 'GLOBAL'],
      languages: ['ar', 'ur', 'id', 'tr'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop',
      headline: 'Learn Quran Easily',
      cta: 'Start Now',
      description: 'Join millions of Muslims learning the Quran',
      destinationUrl: 'https://quran.com',
      regions: ['US', 'EU', 'UK'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop',
      headline: 'Apprends le Coran Facilement',
      cta: 'Commencer',
      description: 'Rejoignez des millions de musulmans dans l\'apprentissage du Coran',
      destinationUrl: 'https://quran.com',
      regions: ['FR', 'BE', 'CH'],
      languages: ['fr'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop',
      headline: 'Kuran-ı Kolayca Öğrenin',
      cta: 'Şimdi Başla',
      description: 'Milyonlarca Müslüman\'a katılın',
      destinationUrl: 'https://quran.com',
      regions: ['TR'],
      languages: ['tr'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop',
      headline: 'Belajar Al-Quran Dengan Mudah',
      cta: 'Mulai Sekarang',
      description: 'Bergabunglah dengan jutaan Muslim belajar Al-Quran',
      destinationUrl: 'https://quran.com',
      regions: ['ID', 'MY', 'BN'],
      languages: ['id', 'ms'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop',
      headline: 'آسانی سے قرآن سیکھیں',
      cta: 'ابھی شروع کریں',
      description: 'لاکھوں مسلمانوں کے ساتھ قرآن سیکھیں',
      destinationUrl: 'https://quran.com',
      regions: ['PK', 'IN', 'BD'],
      languages: ['ur', 'hi'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&h=200&fit=crop',
      headline: 'مواقيت الصلاة الدقيقة',
      cta: 'شاهد الآن',
      description: 'احصل على أوقات الصلاة الدقيقة لموقعك',
      destinationUrl: 'https://www.islamicfinder.org',
      regions: ['MENA', 'GLOBAL'],
      languages: ['ar'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&h=200&fit=crop',
      headline: 'Accurate Prayer Times',
      cta: 'View Now',
      description: 'Get precise prayer times for your location',
      destinationUrl: 'https://www.islamicfinder.org',
      regions: ['GLOBAL'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1564769610832-ad4218ae0779?w=400&h=200&fit=crop',
      headline: 'أذكار الصباح والمساء',
      cta: 'احفظ الآن',
      description: 'حصّن نفسك بالأذكار اليومية المأثورة',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['MENA', 'GLOBAL'],
      languages: ['ar'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1564769610832-ad4218ae0779?w=400&h=200&fit=crop',
      headline: 'Daily Islamic Remembrance',
      cta: 'Learn Now',
      description: 'Protect yourself with daily adhkar',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['GLOBAL'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1590650213165-f1f47f56bf45?w=400&h=200&fit=crop',
      headline: 'الأحاديث النبوية الشريفة',
      cta: 'تعلم المزيد',
      description: 'اكتشف كنوز السنة النبوية المطهرة',
      destinationUrl: 'https://sunnah.com',
      regions: ['GLOBAL'],
      languages: ['ar', 'en', 'ur', 'id', 'tr', 'fr'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=400&h=200&fit=crop',
      headline: 'دروس إسلامية يومية',
      cta: 'ابدأ التعلم',
      description: 'عزز معرفتك الدينية كل يوم',
      destinationUrl: 'https://www.islamicity.org',
      regions: ['GLOBAL'],
      languages: ['ar', 'en'],
    },
  ];

  private interstitialAds: AdConfig[] = [
    {
      imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&h=600&fit=crop',
      headline: 'مصحف ��قمي متكامل',
      cta: 'حمّل المصحف',
      description: 'اقرأ القرآن الكريم بجودة عالية مع التفسير والترجمة',
      destinationUrl: 'https://quran.com',
      regions: ['MENA', 'GLOBAL'],
      languages: ['ar'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&h=600&fit=crop',
      headline: 'Complete Digital Quran',
      cta: 'Download Now',
      description: 'Read the Holy Quran in HD with translation and tafsir',
      destinationUrl: 'https://quran.com',
      regions: ['GLOBAL'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&h=600&fit=crop',
      headline: 'تطبيق الأذان الذكي',
      cta: 'حمّل الآن مجاناً',
      description: 'لن تفوتك صلاة بعد الآن مع التنبيهات الذكية',
      destinationUrl: 'https://www.islamicfinder.org',
      regions: ['MENA', 'GLOBAL'],
      languages: ['ar'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&h=600&fit=crop',
      headline: 'Smart Adhan App',
      cta: 'Download Free',
      description: 'Never miss a prayer with smart notifications',
      destinationUrl: 'https://www.islamicfinder.org',
      regions: ['GLOBAL'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop',
      headline: 'حصن المسلم الشامل',
      cta: 'تصفح الأذكار',
      description: 'جميع الأذكار والأدعية في مكان واحد',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['MENA', 'GLOBAL'],
      languages: ['ar'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop',
      headline: 'Fortress of Muslim',
      cta: 'Browse Adhkar',
      description: 'All daily prayers and remembrance in one place',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['GLOBAL'],
      languages: ['en'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop',
      headline: 'Müslüman Kalesi',
      cta: 'Zikirler',
      description: 'Tüm dualar ve zikirler tek yerde',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['TR'],
      languages: ['tr'],
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&h=600&fit=crop',
      headline: 'Benteng Muslim',
      cta: 'Jelajahi Dzikir',
      description: 'Semua doa dan dzikir dalam satu tempat',
      destinationUrl: 'https://www.hisnmuslim.com',
      regions: ['ID', 'MY'],
      languages: ['id', 'ms'],
    },
  ];

  private videoAdUrls: string[] = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  ];

  private getUserRegionTier(): 'tier1' | 'tier2' | 'tier3' | 'global' {
    try {
      const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
      const country = locale.split('-')[1]?.toUpperCase() || 'US';
      
      if (this.tier1Countries.includes(country)) return 'tier1';
      if (this.tier2Countries.includes(country)) return 'tier2';
      return 'tier3';
    } catch {
      return 'global';
    }
  }

  private getUserLanguage(): string {
    try {
      if (typeof navigator !== 'undefined') {
        const lang = navigator.language.split('-')[0];
        return lang;
      }
    } catch {
      return 'en';
    }
    return 'en';
  }

  getRandomBannerAd(): AdConfig {
    const userLang = this.getUserLanguage();
    
    const filteredAds = this.islamicBannerAds.filter(ad => 
      !ad.languages || ad.languages.includes(userLang) || ad.languages.includes('en')
    );
    
    const adsToUse = filteredAds.length > 0 ? filteredAds : this.islamicBannerAds;
    const randomIndex = Math.floor(Math.random() * adsToUse.length);
    return adsToUse[randomIndex];
  }

  getRandomInterstitialAd(): AdConfig {
    const userLang = this.getUserLanguage();
    
    const filteredAds = this.interstitialAds.filter(ad => 
      !ad.languages || ad.languages.includes(userLang) || ad.languages.includes('en')
    );
    
    const adsToUse = filteredAds.length > 0 ? filteredAds : this.interstitialAds;
    const randomIndex = Math.floor(Math.random() * adsToUse.length);
    return adsToUse[randomIndex];
  }

  getRandomVideoUrl(): string {
    const randomIndex = Math.floor(Math.random() * this.videoAdUrls.length);
    return this.videoAdUrls[randomIndex];
  }

  shouldShowInterstitial(): boolean {
    const now = Date.now();
    const timeSinceLastAd = now - this.lastInterstitialTime;
    
    if (this.sessionAdCount >= this.maxInterstitialsPerSession) {
      console.log('[AdStrategy] Max interstitials reached for this session');
      return false;
    }
    
    if (timeSinceLastAd < this.interstitialCooldown) {
      console.log('[AdStrategy] Interstitial cooldown active');
      return false;
    }
    
    const showAd = Math.random() < 0.3;
    
    if (showAd) {
      this.lastInterstitialTime = now;
      this.sessionAdCount++;
      console.log(`[AdStrategy] Showing interstitial (${this.sessionAdCount}/${this.maxInterstitialsPerSession})`);
    }
    
    return showAd;
  }

  resetSessionCount(): void {
    this.sessionAdCount = 0;
    console.log('[AdStrategy] Session ad count reset');
  }

  getOptimalAdPlacement(screenName: string): {
    showTopBanner: boolean;
    showBottomBanner: boolean;
    showInlineAds: boolean;
    inlineAdFrequency: number;
  } {
    switch (screenName) {
      case 'tasbih':
        return {
          showTopBanner: false,
          showBottomBanner: true,
          showInlineAds: false,
          inlineAdFrequency: 0,
        };
      case 'adhkar':
        return {
          showTopBanner: false,
          showBottomBanner: true,
          showInlineAds: true,
          inlineAdFrequency: 5,
        };
      case 'settings':
        return {
          showTopBanner: true,
          showBottomBanner: true,
          showInlineAds: false,
          inlineAdFrequency: 0,
        };
      default:
        return {
          showTopBanner: false,
          showBottomBanner: true,
          showInlineAds: false,
          inlineAdFrequency: 0,
        };
    }
  }

  getRevenueReport(): void {
    adTracker.printReport();
    
    const suggestions = adTracker.getOptimizationSuggestions();
    console.log('\n💡 OPTIMIZATION SUGGESTIONS:');
    suggestions.forEach(suggestion => {
      console.log(`   ${suggestion}`);
    });
    console.log('');
  }

  getAdScheduleRecommendation(): {
    bannerRefreshRate: number;
    interstitialFrequency: number;
    videoAdFrequency: number;
    rewardedAdOpportunities: string[];
  } {
    return {
      bannerRefreshRate: 30,
      interstitialFrequency: 3,
      videoAdFrequency: 2,
      rewardedAdOpportunities: [
        'بعد إتمام 100 تسبيحة',
        'بعد قراءة 10 أذكار',
        'مكافأة يومية',
        'فتح ميزات إضافية',
      ],
    };
  }

  calculateProjectedRevenue(
    dailyActiveUsers: number,
    options?: {
      tier1Percentage?: number;
      tier2Percentage?: number;
      tier3Percentage?: number;
    }
  ): {
    daily: number;
    monthly: number;
    yearly: number;
    breakdown: {
      bannerAds: number;
      videoAds: number;
      interstitialAds: number;
      rewardedAds: number;
    };
    byRegion: {
      tier1: number;
      tier2: number;
      tier3: number;
    };
  } {
    const tier1Pct = options?.tier1Percentage || 0.15;
    const tier2Pct = options?.tier2Percentage || 0.25;
    const tier3Pct = options?.tier3Percentage || 0.60;
    
    const tier1Users = dailyActiveUsers * tier1Pct;
    const tier2Users = dailyActiveUsers * tier2Pct;
    const tier3Users = dailyActiveUsers * tier3Pct;
    
    const avgSessionsPerUser = 3;
    const avgBannersPerSession = 5;
    const avgInterstitialsPerSession = 0.3;
    const avgVideosPerSession = 0.5;
    const avgRewardedPerSession = 0.2;
    
    const calculateForTier = (users: number, tier: 'tier1' | 'tier2' | 'tier3') => {
      const totalSessions = users * avgSessionsPerUser;
      const bannerImpressions = totalSessions * avgBannersPerSession;
      const interstitialImpressions = totalSessions * avgInterstitialsPerSession;
      const videoImpressions = totalSessions * avgVideosPerSession;
      const rewardedImpressions = totalSessions * avgRewardedPerSession;
      
      const bannerCPM = this.regionalCPM.banner[tier];
      const interstitialCPM = this.regionalCPM.interstitial[tier];
      const videoCPM = this.regionalCPM.video[tier];
      const rewardedCPM = this.regionalCPM.rewarded[tier];
      
      return {
        banner: (bannerImpressions / 1000) * bannerCPM,
        interstitial: (interstitialImpressions / 1000) * interstitialCPM,
        video: (videoImpressions / 1000) * videoCPM,
        rewarded: (rewardedImpressions / 1000) * rewardedCPM,
      };
    };
    
    const tier1Revenue = calculateForTier(tier1Users, 'tier1');
    const tier2Revenue = calculateForTier(tier2Users, 'tier2');
    const tier3Revenue = calculateForTier(tier3Users, 'tier3');
    
    const totalBanner = tier1Revenue.banner + tier2Revenue.banner + tier3Revenue.banner;
    const totalInterstitial = tier1Revenue.interstitial + tier2Revenue.interstitial + tier3Revenue.interstitial;
    const totalVideo = tier1Revenue.video + tier2Revenue.video + tier3Revenue.video;
    const totalRewarded = tier1Revenue.rewarded + tier2Revenue.rewarded + tier3Revenue.rewarded;
    
    const dailyRevenue = totalBanner + totalInterstitial + totalVideo + totalRewarded;
    
    const tier1Total = tier1Revenue.banner + tier1Revenue.interstitial + tier1Revenue.video + tier1Revenue.rewarded;
    const tier2Total = tier2Revenue.banner + tier2Revenue.interstitial + tier2Revenue.video + tier2Revenue.rewarded;
    const tier3Total = tier3Revenue.banner + tier3Revenue.interstitial + tier3Revenue.video + tier3Revenue.rewarded;
    
    return {
      daily: dailyRevenue,
      monthly: dailyRevenue * 30,
      yearly: dailyRevenue * 365,
      breakdown: {
        bannerAds: totalBanner,
        videoAds: totalVideo,
        interstitialAds: totalInterstitial,
        rewardedAds: totalRewarded,
      },
      byRegion: {
        tier1: tier1Total,
        tier2: tier2Total,
        tier3: tier3Total,
      },
    };
  }
  
  getRegionalReport(): void {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║      🌍 GLOBAL AD STRATEGY REPORT 🌍            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log('📊 REGIONAL CPM RATES:\n');
    console.log('🥇 Tier 1 Countries (High Revenue):');
    console.log('   Countries: US, CA, GB, AU, DE, FR, JP, KR, UAE, SA, QA, KW');
    console.log(`   Banner CPM: ${this.regionalCPM.banner.tier1}`);
    console.log(`   Video CPM: ${this.regionalCPM.video.tier1}`);
    console.log(`   Interstitial CPM: ${this.regionalCPM.interstitial.tier1}`);
    console.log(`   Rewarded CPM: ${this.regionalCPM.rewarded.tier1}\n`);
    
    console.log('🥈 Tier 2 Countries (Medium Revenue):');
    console.log('   Countries: ES, IT, NL, SE, NO, DK, BE, AT, CH, TR, EG, MA, DZ');
    console.log(`   Banner CPM: ${this.regionalCPM.banner.tier2}`);
    console.log(`   Video CPM: ${this.regionalCPM.video.tier2}`);
    console.log(`   Interstitial CPM: ${this.regionalCPM.interstitial.tier2}`);
    console.log(`   Rewarded CPM: ${this.regionalCPM.rewarded.tier2}\n`);
    
    console.log('🥉 Tier 3 Countries (Emerging Markets):');
    console.log('   Countries: Rest of World');
    console.log(`   Banner CPM: ${this.regionalCPM.banner.tier3}`);
    console.log(`   Video CPM: ${this.regionalCPM.video.tier3}`);
    console.log(`   Interstitial CPM: ${this.regionalCPM.interstitial.tier3}`);
    console.log(`   Rewarded CPM: ${this.regionalCPM.rewarded.tier3}\n`);
    
    console.log('🌐 LANGUAGE SUPPORT:');
    console.log('   ✅ Arabic (AR) - Primary');
    console.log('   ✅ English (EN) - Global');
    console.log('   ✅ Urdu (UR) - Pakistan, India');
    console.log('   ✅ Indonesian (ID) - Indonesia, Malaysia');
    console.log('   ✅ Turkish (TR) - Turkey');
    console.log('   ✅ French (FR) - France, Africa');
    console.log('   ✅ Malay (MS) - Malaysia, Brunei\n');
    
    console.log('📈 EXAMPLE PROJECTIONS (Global Distribution):\n');
    
    const scenarios = [1000, 10000, 50000, 100000, 500000];
    scenarios.forEach(dau => {
      const projection = this.calculateProjectedRevenue(dau);
      console.log(`   ${dau.toLocaleString()} DAU:`);
      console.log(`   • Daily: ${projection.daily.toFixed(0)}`);
      console.log(`   • Monthly: ${projection.monthly.toFixed(0)}`);
      console.log(`   • Yearly: ${projection.yearly.toFixed(0)}`);
      console.log(`   • By Region - T1: ${projection.byRegion.tier1.toFixed(0)}, T2: ${projection.byRegion.tier2.toFixed(0)}, T3: ${projection.byRegion.tier3.toFixed(0)}\n`);
    });
    
    console.log('🎯 GLOBAL REACH FEATURES:');
    console.log('   ✅ Multi-language ad content');
    console.log('   ✅ Regional CPM optimization');
    console.log('   ✅ Automatic language detection');
    console.log('   ✅ Cultural relevance targeting');
    console.log('   ✅ 24/7 global ad coverage\n');
    
    console.log('═'.repeat(60) + '\n');
  }
}

export const adStrategy = new AdStrategy();

if (typeof window !== 'undefined') {
  (window as any).adStrategy = adStrategy;
  console.log('[AdStrategy] Available globally as window.adStrategy');
  console.log('[AdStrategy] Use adStrategy.getRevenueReport() to see full report');
}
