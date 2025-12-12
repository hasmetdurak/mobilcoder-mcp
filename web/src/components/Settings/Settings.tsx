import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { signOut } from '../../lib/auth';
import { ArrowLeft, LogOut, Moon, Sun, Bell, BellOff, Wifi, Copy, Check, Battery, Smartphone, DollarSign, Monitor, Globe, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWakeLock } from '../../lib/wakeLock';
import MonetizationStrategy from '../MonetizationStrategy';

type TabType = 'general' | 'mobile' | 'network' | 'monetization';

export default function Settings() {
  const navigate = useNavigate();
  const { user, connectionCode, theme, notifications, setUser, setTheme, setNotifications, setConnectionCode } = useStore();
  const [copied, setCopied] = useState(false);
  const { status: wakeLockStatus, requestWakeLock, releaseWakeLock } = useWakeLock();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showMonetization, setShowMonetization] = useState(false);

  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown'
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleCopyCode = () => {
    if (connectionCode) {
      navigator.clipboard.writeText(connectionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetConnection = () => {
    if (confirm('Are you sure you want to reset the connection? You will need to pair again.')) {
      setConnectionCode(null);
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus({
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.type || 'unknown',
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    updateNetworkStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'general', label: 'Genel', icon: Monitor },
    { id: 'mobile', label: 'Mobil', icon: Smartphone },
    { id: 'network', label: 'Ağ', icon: networkStatus.online ? Wifi : WifiOff },
    { id: 'monetization', label: 'Monetizasyon', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 px-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400 bg-gray-800/50'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Connection */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Bağlantı</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Bağlantı Kodu</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 p-3 rounded-lg border border-gray-700 font-mono">
                      {connectionCode || 'Ayarlanmadı'}
                    </div>
                    {connectionCode && (
                      <button
                        onClick={handleCopyCode}
                        className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleResetConnection}
                  className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold py-3 px-4 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Wifi className="w-5 h-5" />
                  MCP Bağlantısını Sıfırla
                </button>
              </div>
            </section>

            {/* Preferences */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Tercihler</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">Karanlık Mod</p>
                      <p className="text-sm text-gray-400">Koyu/açık tema geçişi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      theme === 'dark' ? 'bg-primary-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notifications ? (
                      <Bell className="w-5 h-5 text-gray-400" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">Bildirimler</p>
                      <p className="text-sm text-gray-400">Bağlantı uyarılarını etkinleştir</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications ? 'bg-primary-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Account */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Hesap</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">E-posta</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Ad</p>
                  <p className="font-medium">{user?.displayName}</p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-900/20 hover:bg-red-900/30 text-red-400 font-semibold py-3 px-4 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </div>
            </section>

            {/* About */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Hakkında</h2>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">Sürüm 1.0.0</p>
                <p className="text-gray-400">
                  MobileCoderMCP - Her yerden kodla
                </p>
                <a
                  href="https://github.com/hasmetdurak/mobilcoder-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  GitHub Deposu
                </a>
              </div>
            </section>
          </div>
        )}

        {/* Mobile Tab */}
        {activeTab === 'mobile' && (
          <div className="space-y-6">
            {/* Mobile Keep Alive */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Mobil Optimizasyon</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      {wakeLockStatus.isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Ekranı Açık Tut</p>
                      <p className="text-sm text-gray-400">Kodlama sırasında ekran kilitlenmesini önle</p>
                      {wakeLockStatus.isFallbackActive && (
                        <p className="text-xs text-yellow-400 mt-1">Yedek mod kullanılıyor</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (wakeLockStatus.isActive) {
                        releaseWakeLock();
                      } else {
                        requestWakeLock();
                      }
                    }}
                    disabled={!wakeLockStatus.isSupported}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      !wakeLockStatus.isSupported
                        ? 'bg-gray-700 cursor-not-allowed'
                        : wakeLockStatus.isActive
                          ? 'bg-green-600'
                          : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        wakeLockStatus.isActive ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Battery Status */}
                {wakeLockStatus.batteryLevel !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Battery className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Pil Seviyesi</p>
                        <p className="text-sm text-gray-400">Mevcut pil durumu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            wakeLockStatus.batteryLevel > 0.5
                              ? 'bg-green-500'
                              : wakeLockStatus.batteryLevel > 0.2
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${wakeLockStatus.batteryLevel * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {Math.round(wakeLockStatus.batteryLevel * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Mobile Tips */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Mobil İpuçları</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Klavye kısayollarını kullanarak daha hızlı kodlayın</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Ekranı açık tut özelliği pil tüketimini artırabilir</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Wi-Fi bağlantısı daha stabil performans sağlar</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Tarayıcı sekmesini arka planda tutarak bağlantıyı koruyun</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Network Status */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Ağ Durumu</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${networkStatus.online ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                    <div>
                      <p className="font-medium">Bağlantı Durumu</p>
                      <p className="text-sm text-gray-400">
                        {networkStatus.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    networkStatus.online 
                      ? 'bg-green-900/30 text-green-400 border border-green-800' 
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {networkStatus.online ? 'AKTİF' : 'PASİF'}
                  </span>
                </div>

                {networkStatus.online && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bağlantı Türü</p>
                        <p className="text-sm text-gray-400">Ağ bağlantı tipi</p>
                      </div>
                      <span className="text-gray-300 capitalize">
                        {networkStatus.connectionType === 'wifi' ? 'Wi-Fi' : 
                         networkStatus.connectionType === 'cellular' ? 'Mobil' : 
                         networkStatus.connectionType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Hız Kalitesi</p>
                        <p className="text-sm text-gray-400">Bağlantı hızı</p>
                      </div>
                      <span className="text-gray-300 capitalize">
                        {networkStatus.effectiveType === '4g' ? 'Hızlı' :
                         networkStatus.effectiveType === '3g' ? 'Orta' :
                         networkStatus.effectiveType === '2g' ? 'Yavaş' :
                         'Bilinmiyor'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Network Tips */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Ağ Optimizasyonu</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Wi-Fi bağlantısı daha stabil MCP bağlantısı sağlar</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Zayıf sinyalde bağlantı kopmalarını önlemek için ekranı açık tutun</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">VPN kullanımı bağlantı hızını etkileyebilir</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                  <p className="text-gray-300">Bağlantı kesildiğinde otomatik yeniden bağlanma çalışacaktır</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Monetization Tab */}
        {activeTab === 'monetization' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Monetizasyon Stratejisi</h3>
              <p className="text-sm text-green-700">
                MobileCoder MCP'nin gelir modelini ve pazarlama stratejisini görün.
              </p>
            </div>
            
            <button
              onClick={() => setShowMonetization(true)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <DollarSign className="w-5 h-5" />
              Monetizasyon Stratejisini Görüntüle
            </button>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Hedef Kitle</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bireysel geliştiriciler</li>
                <li>• Ekipler ve kurumlar</li>
                <li>• Öğrenciler ve eğitmenler</li>
                <li>• Freelancer'lar</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Pazarlama Kanalları</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Teknik bloglar ve Medium</li>
                <li>• GitHub ve açık kaynak toplulukları</li>
                <li>• Sosyal medya (Twitter, LinkedIn)</li>
                <li>• Konferanslar ve meetup'lar</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Monetization Strategy Modal */}
      {showMonetization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Monetizasyon Stratejisi</h2>
              <button
                onClick={() => setShowMonetization(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <MonetizationStrategy />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
