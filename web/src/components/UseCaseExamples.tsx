import React, { useState } from 'react';
import { 
  Code2, 
  Smartphone, 
  Zap, 
  Users, 
  Briefcase,
  Coffee,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface UseCase {
  id: string;
  title: string;
  description: string;
  scenario: string;
  steps: string[];
  benefit: string;
  icon: React.ComponentType<any>;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
}

const useCases: UseCase[] = [
  {
    id: 'freelancer-urgent',
    title: 'Acil Müşteri Düzeltmesi',
    scenario: 'Bir freelancer müşterisinin canlı sitedeki kritik bir hatayı düzeltmesi',
    steps: [
      'Müşteriden acil hata bildirimi al',
      'MobileCoderMCP ile telefonda hatayı analiz et',
      'Hızlıca "Fix critical bug" şablonunu kullan',
      'Diff Viewer ile değişiklikleri kontrol et',
      'Apply Changes ile anında düzeltmeyi onayla',
      'Müşteriye "Düzeltildi" bildirimi gönder'
    ],
    benefit: 'Ofis dışundayken bile 5 dakikada krizi çöz',
    icon: AlertTriangle,
    color: 'from-red-500 to-orange-600',
    difficulty: 'intermediate',
    timeEstimate: '5-10 dakika'
  },
  {
    id: 'commuter-coding',
    title: 'Yolculukta Kod Geliştirme',
    scenario: 'Bir yazılımcının toplu taşıma sırasında proje geliştirmesi',
    steps: [
      'Otobüste telefonu aç ve MobileCoderMCP\'ye bağlan',
      'Önceki günkü devam eden görevi "Continue development" ile devam ettir',
      'Yeni özellik için "Add new feature" şablonunu kullan',
      'Voice commands ile el kullanmadan komut gönder',
      'Varışta ofiste bilgisayarı aç ve değişiklikleri kontrol et'
    ],
    benefit: 'Seyahat süresini verimli kodlamaya çevir',
    icon: Coffee,
    color: 'from-blue-500 to-cyan-600',
    difficulty: 'beginner',
    timeEstimate: '15-30 dakika'
  },
  {
    id: 'meeting-code-review',
    title: 'Toplantı Anında Kod İncelemesi',
    scenario: 'Müşteri toplantısı sırasında gelen acil kod inceleme talebi',
    steps: [
      'Toplantı odasında telefonda sessizce MobileCoderMCP aç',
      'Müşterinin bahsettiği modülü hızlıca bul',
      'File Explorer ile ilgili dosyalara göz at',
      '"Analyze code quality" şablonu ile kodu değerlendir',
      'Diff Viewer ile potansiyel sorunları tespit et',
      'Toplantıda bulguları paylaş'
    ],
    benefit: 'Toplantıyı kesmeden teknik katkı sağla',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    difficulty: 'advanced',
    timeEstimate: '10-20 dakika'
  },
  {
    id: 'vacation-debugging',
    title: 'Tatilde Uzaktan Hata Ayıklama',
    scenario: 'Tatilde olan yazılımcının acil bir sorunu uzaktan çözmesi',
    steps: [
      'Plajda telefonla MobileCoderMCP\'ye bağlan',
      'Hata loglarını analiz etmek için "Debug performance" şablonunu kullan',
      'Remote desktop bağlantısı kurarak sistemi kontrol et',
      'Sorunu çözmek için "Fix memory leak" şablonunu çalıştır',
      'Test etmek için "Add unit tests" şablonunu kullan'
    ],
    benefit: 'Tatil keyfi olmadan teknik sorunları çöz',
    icon: Smartphone,
    color: 'from-green-500 to-teal-600',
    difficulty: 'intermediate',
    timeEstimate: '20-40 dakika'
  },
  {
    id: 'client-presentation',
    title: 'Müşteri Sunumu Öncesinde Son Dokunuşlar',
    scenario: 'Müşteri sunumu 10 dakika öncesinde kritik bir hatanın keşfedilmesi',
    steps: [
      'Sunum mekanında telefonda MobileCoderMCP aç',
      'Hızlıca "Fix critical bug" komutu ile sorunu ara',
      'Template Commands ile "Optimize performance" çalıştır',
      'Diff Viewer ile düzeltmeyi görsel olarak kontrol et',
      'Sunumda düzeltmeyi anında uygulamak için hazır ol'
    ],
    benefit: 'Sunum öncesinde krizi önleyerek profesyonel imaj koru',
    icon: Briefcase,
    color: 'from-yellow-500 to-red-600',
    difficulty: 'advanced',
    timeEstimate: '5-15 dakika'
  },
  {
    id: 'learning-new-tech',
    title: 'Yeni Teknoloji Öğrenimi',
    scenario: 'Bir geliştiricinin yeni bir framework\'ü hızlıca adapte olması',
    steps: [
      'MobileCoderMCP ile mevcut projede yeni teknoloji araştır',
      '"Generate CRUD API" şablonu ile hızlıca API yapısı oluştur',
      'Template Commands ile "Add authentication" özelliğini ekle',
      'Diff Viewer ile değişiklikleri adım adım incele',
      'Voice commands ile el kullanmadan öğrenmeye devam et'
    ],
    benefit: 'Yeni teknolojilere hızlıca adapte olma',
    icon: TrendingUp,
    color: 'from-indigo-500 to-purple-600',
    difficulty: 'intermediate',
    timeEstimate: '30-60 dakika'
  },
  {
    id: 'emergency-deployment',
    title: 'Acil Deployment',
    scenario: 'Production\'da kritik bir sorunun acil olarak düzeltilmesi',
    steps: [
      'MobileCoderMCP ile anında production ortamına bağlan',
      '"Hotfix critical issue" şablonu ile acil yama oluştur',
      'Diff Viewer ile değişikliklerin güvenliğini kontrol et',
      'Apply Changes ile anında deployment yap',
      'Monitor ile değişikliklerin canlı takibini başlat'
    ],
    benefit: 'Kritik production sorunlarını dakikalar içinde çözme',
    icon: Zap,
    color: 'from-red-600 to-pink-600',
    difficulty: 'advanced',
    timeEstimate: '10-30 dakika'
  }
];

const difficultyColors = {
  beginner: 'from-green-500 to-emerald-500',
  intermediate: 'from-blue-500 to-cyan-500',
  advanced: 'from-purple-500 to-pink-600'
};

const difficultyLabels = {
  beginner: 'Başlangıç',
  intermediate: 'Orta Seviye',
  advanced: 'İleri Seviye'
};

export default function UseCaseExamples() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | UseCase['difficulty']>('all');

  const filteredCases = useCases.filter(useCase => 
    filter === 'all' || useCase.difficulty === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Kullanım Senaryoları</h1>
          <p className="text-gray-400">MobileCoderMCP\'nin farklı durumlarda nasıl kullanılabileceğini keşfedin</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('beginner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'beginner' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            Başlangıç
          </button>
          <button
            onClick={() => setFilter('intermediate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'intermediate' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            Orta
          </button>
          <button
            onClick={() => setFilter('advanced')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'advanced' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            İleri
          </button>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCases.map((useCase) => {
            const Icon = useCase.icon;
            const isSelected = selectedCase === useCase.id;
            
            return (
              <div
                key={useCase.id}
                onClick={() => setSelectedCase(isSelected ? null : useCase.id)}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 cursor-pointer transition-all hover:scale-[1.02] hover:border-gray-600 ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${useCase.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{useCase.title}</h3>
                      <p className="text-sm text-gray-400">{useCase.scenario}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    useCase.difficulty === 'beginner' 
                      ? 'bg-green-900/30 text-green-400 border-green-700/30'
                      : useCase.difficulty === 'intermediate'
                        ? 'bg-blue-900/30 text-blue-400 border-blue-700/30'
                        : 'bg-purple-900/30 text-purple-400 border-purple-700/30'
                  }`}>
                    {difficultyLabels[useCase.difficulty]}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Adımlar:</h4>
                    <ol className="space-y-2">
                      {useCase.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-blue-400">{index + 1}</span>
                          </div>
                          <span className="text-sm text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Fayda:</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{useCase.benefit}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Tahmini Süre: {useCase.timeEstimate}</span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Bu senaryo sizin için uygun!</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Kendi Senaryonuzu Oluşturun</h2>
          <p className="text-gray-400 mb-6">MobileCoderMCP ile iş akışınızı nasıl iyileştirebileceğinizi keşfedin</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
              Kullanıcı Rehberini Başlat
            </button>
            <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors">
              Daha Fazla Öğren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}