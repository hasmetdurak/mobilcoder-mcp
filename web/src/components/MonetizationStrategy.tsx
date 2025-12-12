import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Crown, 
  Zap, 
  Target,
  BarChart3,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface MonetizationTier {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  features: string[];
  icon: React.ComponentType<any>;
  color: string;
  popular?: boolean;
  recommended?: boolean;
  userLimit?: string;
  analytics?: string[];
}

const monetizationTiers: MonetizationTier[] = [
  {
    id: 'free',
    name: 'Free Forever',
    price: 0,
    priceDisplay: 'Ücretsiz',
    features: [
      'Sınırsız komut gönderme',
      'Temel template komutları',
      'WebRTC P2P bağlantı',
      'Google ile giriş',
      'Temel dosya yönetimi',
      'Offline queue desteği'
    ],
    icon: Star,
    color: 'from-green-500 to-emerald-600',
    popular: true,
    recommended: true,
    userLimit: 'Sınırsız',
    analytics: ['Kullanım istatistikleri', 'Bağlantı kalitesi', 'Komut başarı oranı']
  },
  {
    id: 'pro-monthly',
    name: 'Pro Aylık',
    price: 9.99,
    priceDisplay: '₺9.99/ay',
    features: [
      'Sınırsız özelliklerin hepsi',
      '120+ profesyonel şablon',
      'Gelişmiş diff viewer',
      'Wake Lock ekran kilitleme',
      'Voice commands (sese komut)',
      'Multi-project desteği',
      'Öncelikli destek',
      'Gelişmiş hata ayıklama',
      'Custom şablon oluşturma',
      'Komut geçmişi senkronizasyonu',
      '7/24 teknik destek',
      'Analytics dashboard',
      'API erişimi (üçüncüller için)'
    ],
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    popular: false,
    recommended: false,
    userLimit: '5 proje',
    analytics: ['Tüm özellikler', 'Performans metrikleri', 'Ekip yönetimi', 'API kullanım raporları', 'Cost analiz']
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yıllık',
    price: 99.99,
    priceDisplay: '₺99.99/yıl',
    features: [
      'Pro planının tüm özellikleri',
      'Aylık plana göre %17 tasarruf',
      'Priority customer support',
      'Özel onboarding session',
      'Custom training sessions',
      'White-label deployment options',
      'Advanced security features',
      'SLA guarantee (99.9% uptime)',
      'Custom integrations'
    ],
    icon: Target,
    color: 'from-orange-500 to-red-600',
    popular: false,
    recommended: false,
    userLimit: 'Sınırsız',
    analytics: ['Enterprise analytics', 'Custom reporting', 'Compliance dashboard', 'Cost optimization', 'Usage predictions']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299.99,
    priceDisplay: 'Özel Fiyat',
    features: [
      'Pro planının tüm özellikleri',
      'Sınırsız kullanıcı limiti',
      'SSO/SAML entegrasyonu',
      'On-premise deployment seçeneği',
      'Özel API rate limitleri',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom training ve workshop',
      'Advanced security ve compliance',
      'Custom SLA terms',
      'White-label mobile app'
    ],
    icon: BarChart3,
    color: 'from-red-600 to-gray-900',
    popular: false,
    recommended: false,
    userLimit: 'Sınırsız',
    analytics: ['Enterprise monitoring', 'Custom compliance', 'Advanced analytics', 'Usage optimization', 'Security auditing', 'Cost management']
  }
];

interface UseCase {
  id: string;
  title: string;
  description: string;
  scenario: string;
  roi: string;
  timeToValue: string;
  recommendedTier: string;
  metrics: {
    timeSaved: string;
    errorReduction: string;
    productivityGain: string;
    costSavings: string;
  };
}

const useCases: UseCase[] = [
  {
    id: 'freelancer-productivity',
    title: 'Freelancer Verimliliği',
    description: 'Freelancer\'ın MobileCoderMCP ile müşteri projelerini daha verimli yönetmesi',
    scenario: 'Bir freelancer ayda 3 farklı müşteri projesini aynı anda yönetme',
    roi: 'Aylık 40+ saat tasarruf',
    timeToValue: '₺15,000/ay ek gelir',
    recommendedTier: 'pro-monthly',
    metrics: {
      timeSaved: '200+ saat/ay',
      errorReduction: '%75 az hata oranı',
      productivityGain: 'Aynı anda 3x daha fazla proje',
      costSavings: 'Aylık ₺2,000 tasarruf'
    }
  },
  {
    id: 'agency-efficiency',
    title: 'Ajans Verimliliği',
    description: 'Yazılım ajansının MobileCoderMCP ile müşteri taleplerini hızlı karşılaması',
    scenario: '10 kişilik bir ajansın 50+ müşteri talebini yönetimi',
    roi: 'Aylık 60+ saat verimlilik artışı',
    timeToValue: '₺25,000/ay ek değer',
    recommendedTier: 'pro-yearly',
    metrics: {
      timeSaved: '300+ saat/ay',
      errorReduction: '%85 az turnaround süresi',
      productivityGain: '2x daha fazla müşteri',
      costSavings: 'Aylık ₺5,000 operasyonel tasarruf'
    }
  },
  {
    id: 'enterprise-roi',
    title: 'Enterprise ROI',
    description: 'Büyük şirketlerin MobileCoderMCP ile tüm ekiplerin merkezi yönetimi',
    scenario: '500+ kişilik bir şirketin tüm geliştirme ekiplerinin tek platformdan yönetimi',
    roi: 'Yıllık ₺500,000+ ROI',
    timeToValue: '₺50,000/ay şirket tasarrufu',
    recommendedTier: 'enterprise',
    metrics: {
      timeSaved: '1000+ saat/ekip',
      errorReduction: '%90 az hata maliyeti',
      productivityGain: '3x daha fazla verimlilik',
      costSavings: 'Yıllık ₺100,000+ operasyonel maliyet'
    }
  }
];

export default function MonetizationStrategy() {
  const [selectedTier, setSelectedTier] = useState<string>('free');
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);

  const calculateROI = (tier: MonetizationTier, useCase: UseCase) => {
    const monthlyCost = tier.price;
    const monthlyValue = parseFloat(useCase.timeToValue.replace('₺', '').replace(',', ''));
    const roi = monthlyValue > 0 ? ((monthlyValue - monthlyCost) / monthlyCost * 100).toFixed(1) : '0';
    return roi;
  };

  const getTierComparison = () => {
    const freeTier = monetizationTiers.find(t => t.id === 'free');
    const proTier = monetizationTiers.find(t => t.id === 'pro-monthly');
    
    if (!freeTier || !proTier) return null;
    
    const timeToPro = proTier.features.includes('Voice commands') ? '30 dakika' : '15 dakika';
    const timeToFree = '60 dakika';
    
    return {
      timeReduction: `${Math.round(((parseInt(timeToFree) - parseInt(timeToPro)) / parseInt(timeToFree)) * 100)}%`,
      productivityGain: '2x',
      errorReduction: '50% az',
      costPerMonth: proTier.priceDisplay,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Monetizasyon Stratejisi</h1>
          <p className="text-gray-400">MobileCoderMCP\'nin farklı kullanıcı segmentleri için değer önerisi</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Current Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Mevcut Planınız</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">Plan</div>
              <div className="text-2xl font-bold text-white">
                {monetizationTiers.find(t => t.id === selectedTier)?.name || 'Free'}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {monetizationTiers.find(t => t.id === selectedTier)?.priceDisplay || 'Ücretsiz'}
            </div>
          </div>
          
          {selectedTier !== 'free' && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">
                  <strong>Pro Plan Aktif!</strong> - Tüm premium özellikler kullanımda
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ROI Calculator */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">ROI Hesaplayıcı</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {useCases.map((useCase) => {
              const tier = monetizationTiers.find(t => t.id === selectedTier);
              const roi = tier ? calculateROI(tier, useCase) : '0';
              
              return (
                <button
                  key={useCase.id}
                  onClick={() => setSelectedUseCase(useCase.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedUseCase === useCase.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="text-left">
                    <h3 className="font-semibold text-white mb-2">{useCase.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
                    
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="flex justify-between">
                        <span>Zaman Değeri:</span>
                        <span className="text-white font-medium">{useCase.timeToValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aylık Maliyet:</span>
                        <span className="text-white font-medium">
                          {tier?.priceDisplay || 'Ücretsiz'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className={`font-medium ${
                          parseFloat(roi) > 50 ? 'text-green-400' : 
                          parseFloat(roi) > 20 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          %{roi}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-blue-400 mb-2">Beklenen Faydalar:</h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-green-400" />
                          <span>{useCase.metrics.timeSaved}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-blue-400" />
                          <span>{useCase.metrics.productivityGain}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-yellow-400" />
                          <span>{useCase.metrics.costSavings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Plan Karşılaştırma</h2>
          
          <div className="space-y-4">
            {monetizationTiers.map((tier) => {
              const isSelected = selectedTier === tier.id;
              const Icon = tier.icon;
              
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${tier.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{tier.name}</h3>
                        <div className="text-sm text-gray-400">{tier.priceDisplay}</div>
                        {tier.recommended && (
                          <div className="text-xs text-yellow-400 mt-1">Önerilen</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {isSelected && (
                        <div className="text-xs text-green-400 mb-2">✓ Seçildi</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-sm font-medium text-blue-400 mb-2">Özellikler:</div>
                    <div className="space-y-1">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {tier.userLimit && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-sm text-gray-400">Kullanıcı Limiti: {tier.userLimit}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade CTA */}
        {selectedTier !== 'enterprise' && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">MobileCoderMCP Pro\'ye Yükseltin</h2>
            <p className="text-blue-100 mb-6">
              İş akışınızı 3x verimli hale getirin, gelişmiş özelliklerle rakiplerin önüne geçin
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-100">
                <Users className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">500+ Şirket Güveni</div>
                  <div className="text-sm text-blue-200">Enterprise grade güvenlik ve SLA</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-blue-100">
                <Crown className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Öncelikli Destek</div>
                  <div className="text-sm text-blue-200">24/7 teknik destek ve özel hesap yöneticisi</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-blue-100">
                <Target className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">Custom Integrations</div>
                  <div className="text-sm text-blue-200">Mevcut sistemlerinize özel entegrasyon desteği</div>
                </div>
              </div>
            </div>
            
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Satış Ekibiyle İletişin
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {/* Analytics Preview */}
        {selectedTier !== 'free' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Analytics Özellikleri</h2>
            <div className="space-y-3">
              {monetizationTiers.find(t => t.id === selectedTier)?.analytics?.map((analytic, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span>{analytic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}