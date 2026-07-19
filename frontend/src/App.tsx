import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n'; // initialize i18n
import {
  LayoutDashboard,
  TerminalSquare,
  Map,
  ShieldAlert,
  Sprout,
  Users,
  User,
  Globe,
  Settings
} from 'lucide-react';

import Overview from './pages/Overview';
import CommandCenter from './pages/CommandCenter';
import Navigation from './pages/Navigation';
import SecuritySurveillance from './pages/SecuritySurveillance';
import PitchManagement from './pages/PitchManagement';
import VIPHospitality from './pages/VIPHospitality';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'command' | 'navigation' | 'security' | 'pitch' | 'vip'>('overview');
  const [role, setRole] = useState<'fan' | 'volunteer' | 'organizer'>('fan');
  const [currentLang, setCurrentLang] = useState('en');

  // Token mapping based on the selected role to showcase the security boundaries
  const token = role === 'organizer' ? 'admin-token' : (role === 'volunteer' ? 'volunteer-token' : 'fan-token');

  // Sync lang select with HTML lang attribute (A11y/WCAG)
  useEffect(() => {
    document.documentElement.lang = currentLang;
    i18n.changeLanguage(currentLang);
  }, [currentLang, i18n]);

  const navigationItems = [
    { id: 'overview' as const, label: t('navOverview'), icon: LayoutDashboard },
    { id: 'command' as const, label: t('navCommand'), icon: TerminalSquare },
    { id: 'navigation' as const, label: t('navNavigation'), icon: Map },
    { id: 'security' as const, label: t('navSecurity'), icon: ShieldAlert, badge: role !== 'organizer' ? 'Locked' : undefined },
    { id: 'pitch' as const, label: t('navPitch'), icon: Sprout, badge: role === 'fan' ? 'Locked' : undefined },
    { id: 'vip' as const, label: t('navVip'), icon: Users }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-slate-50">
      
      {/* Sidebar Navigation */}
      <nav 
        className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col flex-shrink-0 z-20 shadow-sm"
        aria-label="Primary platform navigation"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stadium-teal flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-stadium-teal/30">
              M
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide text-stadium-brand uppercase">{t('appName')}</h2>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">FIFA 2026 Edition</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <ul className="flex-1 p-4 space-y-1.5">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                    isActive 
                      ? 'bg-stadium-teal/10 border-stadium-teal/20 text-stadium-teal' 
                      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-stadium-teal' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] bg-red-100 border border-red-200 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer/Settings sidebar section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-semibold">MatchControl v2.0</span>
            <Settings className="w-4 h-4 hover:text-stadium-teal cursor-pointer transition-colors" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex justify-between items-center px-6 z-10 shadow-sm">
          {/* Left spacer or responsive breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-stadium-accent animate-pulse"></span>
            MetLife Stadium Live
          </div>

          {/* Right utility options */}
          <div className="flex items-center gap-5 ml-auto">
            {/* View Role Switcher (Simulating Auth roles) */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 hidden xs:block" />
              <label htmlFor="roleSwitcher" className="text-[10px] uppercase font-bold text-slate-400 hidden sm:block">
                {t('roleSelect')}
              </label>
              <select
                id="roleSwitcher"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-stadium-teal cursor-pointer shadow-sm"
                aria-label="User role switcher selector"
              >
                <option value="fan">{t('roleFan')}</option>
                <option value="volunteer">{t('roleVolunteer')}</option>
                <option value="organizer">{t('roleOrganizer')}</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400 hidden xs:block" />
              <label htmlFor="langSwitcher" className="text-[10px] uppercase font-bold text-slate-400 hidden sm:block">
                {t('langSelect')}
              </label>
              <select
                id="langSwitcher"
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-stadium-teal cursor-pointer shadow-sm"
                aria-label="Language selector"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (MX)</option>
                <option value="fr">Français (CA)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pt">Português (BR)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Tab rendering window */}
        <main className="flex-1 p-6 overflow-y-auto" id="main-content-window" tabIndex={-1}>
          {activeTab === 'overview' && <Overview role={role} token={token} />}
          {activeTab === 'command' && <CommandCenter currentLang={currentLang} onLanguageChange={setCurrentLang} />}
          {activeTab === 'navigation' && <Navigation />}
          {activeTab === 'security' && <SecuritySurveillance role={role} token={token} />}
          {activeTab === 'pitch' && <PitchManagement role={role} token={token} />}
          {activeTab === 'vip' && <VIPHospitality role={role} token={token} />}
        </main>
      </div>
    </div>
  );
}
