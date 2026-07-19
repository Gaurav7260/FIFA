import { useState, useEffect } from 'react';
import { Camera, ShieldAlert, AlertTriangle, CheckCircle, MapPin, RefreshCw } from 'lucide-react';

interface CameraFeed {
  cameraId: string;
  zoneName: string;
  activeThreats: number;
  crowdDensityPercent: number;
  status: 'secure' | 'monitoring' | 'breach';
  facialRecMatches: number;
}

export default function SecuritySurveillance({ role, token }: { role: string; token: string }) {
  const [feeds, setFeeds] = useState<CameraFeed[]>([]);
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/security/feeds');
      const data = await res.json();
      setFeeds(data.feeds || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getBriefing = async () => {
    try {
      const res = await fetch('/api/security/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setBriefing(data.briefingText || "System offline.");
    } catch (err) {
      setBriefing("Failed to generate AI briefing.");
    }
  };

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 5000);
    return () => clearInterval(interval);
  }, []);

  if (role === 'fan') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldAlert className="w-16 h-16 mb-4 text-stadium-teal" />
        <h2 className="text-xl font-bold">Security Access Denied</h2>
        <p className="text-sm">You do not have clearance to view active surveillance feeds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stadium-brand">Security Surveillance</h1>
          <p className="text-sm text-slate-500">Live CCTV & Threat Detection Simulation</p>
        </div>
        <button onClick={getBriefing} className="bg-stadium-teal hover:bg-stadium-teal/90 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Run AI Threat Scan
        </button>
      </div>

      {briefing && (
        <div className="glass-card p-5 border-l-4 border-l-stadium-gold">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-stadium-gold" />
            AI Commander Briefing
          </h3>
          <p className="text-slate-700 font-medium">{briefing}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-10"><RefreshCw className="w-8 h-8 text-stadium-teal animate-spin" /></div>
        ) : feeds.map(feed => (
          <div key={feed.cameraId} className={`glass-card p-4 flex flex-col gap-4 relative overflow-hidden ${feed.status === 'breach' ? 'border-red-500/50 shadow-lg shadow-red-500/10' : ''}`}>
            
            {feed.status === 'breach' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>}
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Camera className={`w-5 h-5 ${feed.status === 'breach' ? 'text-red-500' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-800">{feed.cameraId}</span>
              </div>
              {feed.status === 'secure' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Secure</span>}
              {feed.status === 'monitoring' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Monitoring</span>}
              {feed.status === 'breach' && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">Breach</span>}
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              {feed.zoneName}
            </div>

            {/* Simulated Live Video Feed Block */}
            <div className="w-full h-32 bg-slate-900 rounded-lg relative flex items-center justify-center overflow-hidden border border-slate-700">
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] text-white font-mono font-bold">REC</span>
              </div>
              <div className="absolute top-2 right-2 z-10">
                 <span className="text-[10px] text-white/70 font-mono">1080P/60FPS</span>
              </div>
              
              {/* Fake grid for CCTV look */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
              
              <span className="text-slate-600 font-mono text-xs z-10">NO SIGNAL DETECTED... (SIMULATION)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Density</p>
                <div className="flex items-end gap-1">
                  <span className={`text-xl font-black ${feed.crowdDensityPercent > 85 ? 'text-red-500' : 'text-slate-700'}`}>{feed.crowdDensityPercent}%</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Active Threats</p>
                <div className="flex items-end gap-1">
                  <span className={`text-xl font-black ${feed.activeThreats > 0 ? 'text-red-500' : 'text-slate-700'}`}>{feed.activeThreats}</span>
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
