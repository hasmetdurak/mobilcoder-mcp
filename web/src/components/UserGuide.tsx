import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  Zap, 
  Smartphone, 
  Shield, 
  Settings as SettingsIcon,
  ChevronRight,
  ChevronDown,
  Check,
  Play,
  Clock,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  steps: GuideStep[];
  tips?: string[];
}

interface GuideStep {
  title: string;
  description: string;
  code?: string;
  action?: string;
}

const userGuide: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Hızlı Başlangıç',
    description: 'MobileCoderMCP\'yi 5 dakikada kurun ve kodlamaya başlayın',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    steps: [
      {
        title: 'Google ile Giriş Yapın',
        description: 'Hızlı ve güvenli giriş için Google hesabınızı kullanın',
        action: "Ana sayfada 'Sign in with Google' butonuna tıklayın"
      },
      {
        title: 'Bağlantı Kodunu Alın',
        description: 'Dashboard\'da size özel bağlantı kodu gösterilecek',
        action: "Bu kodu kopyalayın"
      },
      {
        title: 'MCP Sunucusunu Kurun',
        description: 'Tek komutla masaüstünüzde MCP sunucusunu başlatın',
        code: 'npx mobile-coder-mcp init --code=SIZIN_KODUNUZ'
      },
      {
        title: 'Bağlantı Kurun',
        description: 'Telefonunuzu masaüstünüze bağlayın',
        action: "Dashboard'da 'Start Coding' butonuna tıklayın"
      }
    ],
    tips: [
      'İlk bağlantı biraz sürebilir, internet bağlantınızı kontrol edin',
      'Kodu güvenli bir yere kaydedin',
      'MCP sunucusu arka planda çalışmaya devam edecektir'
    ]
  },
  {
    id: 'daily-usage',
    title: 'Günlük Kullanım',
    description: 'Her gün telefonunuzdan kodlama yapmanın en verimli yolları',
    icon: Smartphone,
    color: 'from-green-500 to-teal-600',
    steps: [
      {
        title: 'Hızlı Şablonları Kullanın',
        description: 'Tek tıkla yaygın görevleri tamamlayın',
        action: "Chat ekranında Templates ikonuna tıklayın"
      },
      {
        title: 'Sesli Komutlar',
        description: 'Yazmak yerine konuşarak komut gönderin',
        action: "Mikrofon ikonuna tıklayın ve konuşun"
      },
      {
        title: 'Dosya Yönetimi',
        description: 'Proje dosyalarınızı doğrudan yönetin',
        action: "Sol menüden Project Files seçeneğini kullanın"
      },
      {
        title: 'Diff İncelemesi',
        description: 'Kod değişikliklerini detaylıca inceleyin',
        action: "Değişiklik yapıldığında 'View Changes' butonuna tıklayın"
      }
    ],
    tips: [
      'En sık kullandığınız şablonları favorilere ekleyin',
      'Ekran kilitlemeyi Settings\'ten açın',
      'Çevrimdışıyken komutlar kuyruğa alınır, bağlantı gelince otomatik gönderilir'
    ]
  },
  {
    id: 'advanced-features',
    title: 'Gelişmiş Özellikler',
    description: 'Profesyonel kodlama deneyimi için gelişmiş özellikler',
    icon: Code2,
    color: 'from-purple-500 to-pink-600',
    steps: [
      {
        title: 'Template Komutları',
        description: '120+ hazır şablonla hızlıca kodlayın',
        action: "Templates menüsünden kategoriye göre şablon seçin"
      },
      {
        title: 'Side-by-Side Diff',
        description: 'Eski ve yeni kodu karşılaştırın',
        action: "Diff Viewer'da Split View modunu kullanın"
      },
      {
        title: 'Wake Lock',
        description: 'Kodlama sırasında ekranın kapanmasını önleyin',
        action: "Settings > Keep Screen On özelliğini açın"
      },
      {
        title: 'Context Dosyaları',
        description: 'AI\'a bağlam sağlamak için dosya ekleyin',
        action: "File Explorer\'dan dosya seçip 'Add to Context' tıklayın"
      }
    ],
    tips: [
      'Birden fazla dosya ekleyerek daha iyi bağlam sağlayın',
      'Favori şablonlarınızı kişiselleştirin',
      'Unified diff modu daha compact görünüm sunar'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Sorun Giderme',
    description: 'Yaygın sorunlar ve çözümleri',
    icon: Shield,
    color: 'from-red-500 to-orange-600',
    steps: [
      {
        title: 'Bağlantı Sorunları',
        description: 'WebRTC bağlantısı kurulamıyor',
        action: "1. İnternet bağlantısını kontrol edin\n2. MCP sunucusunun çalıştığından emin olun\n3. Bağlantı kodunu yenileyin"
      },
      {
        title: 'Komutlar Çalışmıyor',
        description: 'Gönderilen komutlar işlenmiyor',
        action: "1. MCP sunucusunun loglarını kontrol edin\n2. Komut formatını doğrulayın\n3. Offline queue durumunu kontrol edin"
      },
      {
        title: 'Diff Hataları',
        description: 'Kod değişiklikleri gösterilemiyor',
        action: "1. Tarayıcıyı yenileyin\n2. Dosya boyutunu kontrol edin\n3. Unified view modunu deneyin"
      },
      {
        title: 'Pil Tüketimi',
        description: 'Wake Lock pil hızlı tüketiyor',
        action: "1. Gerekmediğinde kapatın\n2. Düşük pil modunu kullanın\n3. Şarj cihazınızda bulundurun"
      }
    ],
    tips: [
      'Her zaman en son sürümü kullanın',
      'Sorun devam ederse support@mobilecoder.com adresine yazın',
      'Hata loglarını paylaşırken hassas bilgileri temizleyin'
    ]
  }
];

export default function UserGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const toggleStep = (stepTitle: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepTitle)) {
        newSet.delete(stepTitle);
      } else {
        newSet.add(stepTitle);
      }
      return newSet;
    });
  };

  const getSectionProgress = (section: GuideSection) => {
    const completed = section.steps.filter(step => completedSteps.has(step.title)).length;
    return Math.round((completed / section.steps.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Kullanıcı Rehberi</h1>
              <p className="text-sm text-gray-400">MobileCoderMCP\'yi en verimli şekilde kullanın</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">
              {completedSteps.size} / {userGuide.reduce((total, section) => total + section.steps.length, 0)} adım tamamlandı
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {userGuide.map((section) => {
            const Icon = section.icon;
            const progress = getSectionProgress(section);
            const isExpanded = expandedSection === section.id;
            
            return (
              <div key={section.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${section.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                      <p className="text-sm text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">
                      {progress}% tamamlandı
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-700">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>İlerleme</span>
                        <span>{section.steps.filter(s => completedSteps.has(s.title)).length}/{section.steps.length}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-full bg-gradient-to-r ${section.color} rounded-full transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                      {section.steps.map((step, index) => {
                        const isCompleted = completedSteps.has(step.title);
                        
                        return (
                          <div key={index} className="flex gap-4">
                            <button
                              onClick={() => toggleStep(step.title)}
                              className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-green-600 border-green-500' 
                                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              {isCompleted && <Check className="w-4 h-4 text-white mx-auto" />}
                            </button>
                            
                            <div className="flex-1">
                              <h3 className={`font-medium mb-1 ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                                {step.title}
                              </h3>
                              <p className="text-sm text-gray-300 leading-relaxed">
                                {step.description}
                              </p>
                              
                              {step.code && (
                                <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-600">
                                  <code className="text-sm text-blue-300 font-mono">
                                    {step.code}
                                  </code>
                                </div>
                              )}
                              
                              {step.action && (
                                <div className="mt-2 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                                  <p className="text-sm text-blue-300">
                                    <strong>İşlem:</strong> {step.action}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Tips */}
                    {section.tips && section.tips.length > 0 && (
                      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                        <h3 className="font-medium text-yellow-400 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          İpuçları
                        </h3>
                        <ul className="space-y-2 text-sm text-yellow-200">
                          {section.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-400" />
            Hızlı Başlangıç
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setCompletedSteps(new Set(userGuide[0].steps.map(s => s.title)));
                setExpandedSection(null);
              }}
              className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Başlangıç Rehberini Tamamla
            </button>
            
            <button
              onClick={() => {
                setCompletedSteps(new Set());
                setExpandedSection(null);
              }}
              className="p-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              İlerlemeyi Sıfırla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}