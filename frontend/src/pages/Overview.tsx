import { useEffect, useState } from 'react';
import { Users, AlertTriangle, Sprout, Star, Clock, Calendar, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OverviewProps {
  role: 'fan' | 'volunteer' | 'organizer';
  token: string;
}

export default function Overview({ role, token }: OverviewProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    attendance: 80000,
    maxCapacity: 82500,
    securityThreats: 1,
    pitchHealth: 85,
    vipRequests: 3
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stadium-brand tracking-tight">{t('appName')}</h1>
          <p className="text-slate-500 font-medium mt-1">{t('tagline')}</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-stadium-teal/10 border border-stadium-teal/20 rounded-lg text-stadium-teal font-bold text-sm shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>{t('activeMatch')}: <strong>USA vs Spain</strong></span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Attendance</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800">80,000 <span className="text-sm font-medium text-slate-400">/ 82,500</span></h3>
            </div>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-stadium-teal h-2 rounded-full" style={{ width: '97%' }}></div>
          </div>
          <div className="mt-2 text-xs text-stadium-teal flex items-center justify-between font-semibold">
            <span>Stadium near peak load</span>
            <span>97% Occupied</span>
          </div>
        </div>

        {/* Security Alert Card */}
        <div className="glass-card p-5 relative overflow-hidden border-b-4 border-b-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Posture</p>
              <h3 className="text-2xl font-black mt-1 text-red-600">ELEVATED</h3>
            </div>
            <div className="p-2 bg-red-100 text-red-500 rounded-xl animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-red-600 font-semibold">
            <span>{role === 'fan' ? 'Locked (Staff Only)' : '1 active breach detected'}</span>
            <span>{role === 'fan' ? '' : 'West Tunnel'}</span>
          </div>
        </div>

        {/* Pitch Health Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pitch AI Health</p>
              <h3 className="text-2xl font-black mt-1 text-stadium-brand">
                {role === 'fan' ? 'Restricted' : `${stats.pitchHealth}%`}
              </h3>
            </div>
            <div className="p-2 bg-purple-100 text-stadium-brand rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-stadium-brand font-semibold">
            <span>{role === 'fan' ? 'Sign in as Staff to view' : 'South Zone needs water'}</span>
          </div>
        </div>

        {/* VIP Requests Card */}
        <div className="glass-card p-5 relative overflow-hidden border-b-4 border-b-stadium-gold">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VIP Suites</p>
              <h3 className="text-2xl font-black mt-1 text-slate-800">{role === 'organizer' ? `${stats.vipRequests} Pending` : 'Locked'}</h3>
            </div>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Star className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-amber-600 font-semibold">
            <span>{role === 'organizer' ? 'Immediate action required' : 'Organizer access only'}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Match details card */}
        <div className="glass-card p-6 flex flex-col justify-between border-t-4 border-t-stadium-teal">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-black tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Match
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Clock className="w-4 h-4" />
                <span>18:00 EST</span>
              </div>
            </div>
            
            <div className="text-center my-8">
              <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center border-2 border-blue-200 text-3xl font-black text-blue-700 shadow-sm">US</div>
                  <span className="mt-3 text-sm font-black text-slate-700 uppercase tracking-wide">USA</span>
                </div>
                <span className="text-2xl font-black text-slate-300 italic">VS</span>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-yellow-50 flex items-center justify-center border-2 border-yellow-200 text-3xl font-black text-yellow-600 shadow-sm">ES</div>
                  <span className="mt-3 text-sm font-black text-slate-700 uppercase tracking-wide">Spain</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-400 uppercase tracking-wider text-xs">Venue</span>
                <span className="text-slate-800">MetLife Stadium, NJ</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-400 uppercase tracking-wider text-xs">Group</span>
                <span className="text-slate-800">Group A - Match #12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Person-specific operational highlights */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-stadium-gold" />
            AI Command Center Feed
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-4 transition-all hover:shadow-md">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse"></div>
              <div>
                <h4 className="text-sm font-black text-red-700 uppercase tracking-wide">Security: Perimeter Breach (West Tunnel)</h4>
                <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                  Facial recognition cameras detect unauthorized access attempting to bypass West Tunnel security. Recommend immediate deployment of tactical stewards to Zone W4.
                </p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex gap-4 transition-all hover:shadow-md">
              <div className="w-3 h-3 rounded-full bg-stadium-brand mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-black text-stadium-brand uppercase tracking-wide">Agronomy: Heat Stress Warning</h4>
                <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                  {role === 'fan' ? (
                    "Routine pitch maintenance check logged."
                  ) : (
                    `Surface temperature in the South Pitch Zone has reached 25°C with dropping moisture levels (28%). Deploy targeted sprinkler system immediately.`
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4 transition-all hover:shadow-md">
              <div className="w-3 h-3 rounded-full bg-amber-500 mt-1 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-black text-amber-700 uppercase tracking-wide">VIP: Escalation in Suite S-14</h4>
                <p className="text-xs text-slate-600 mt-1.5 font-medium leading-relaxed">
                  {role === 'organizer' ? 
                    "Guest E. Musk has requested immediate premium catering. AI Agent suggests dispatching the reserve premium cart from Level 3." :
                    "Information restricted to Match Organizers."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
