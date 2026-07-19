import { useState, useEffect } from 'react';
import { Sprout, Thermometer, Droplets, Activity, RefreshCw, MapPin } from 'lucide-react';

interface PitchMetrics {
  zoneId: string;
  grassMoisturePercent: number;
  surfaceTempC: number;
  wearTearIndex: number;
  status: 'optimal' | 'needs_water' | 'needs_repair';
}

export default function PitchManagement({ role, token }: { role: string; token: string }) {
  const [zones, setZones] = useState<PitchMetrics[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/pitch', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setZones(data.zones || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const runAnalysis = async () => {
    try {
      const res = await fetch('/api/pitch/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    }
  };

  const takeAction = async (zoneId: string, action: string) => {
    try {
      await fetch('/api/pitch/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ zoneId, action })
      });
      fetchZones();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (role !== 'fan') fetchZones();
  }, [role]);

  if (role === 'fan') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Sprout className="w-16 h-16 mb-4 text-stadium-teal" />
        <h2 className="text-xl font-bold">Restricted Area</h2>
        <p className="text-sm">Pitch management is restricted to operations staff.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stadium-brand">Pitch Management</h1>
          <p className="text-sm text-slate-500">Live Agronomy & Grass Quality Monitoring</p>
        </div>
        <button onClick={runAnalysis} className="bg-stadium-teal hover:bg-stadium-teal/90 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2" aria-label="Run AI Health Scan">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Run AI Health Scan
        </button>
      </div>

      {analysis && (
        <div className="glass-card p-5 border-l-4 border-l-stadium-teal flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-stadium-teal" />
              AI Pitch Analysis
            </h3>
            <ul className="text-sm text-slate-700 font-medium space-y-1">
              {analysis.aiRecommendations?.map((r: string, i: number) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Health</span>
            <span className="text-4xl font-black text-stadium-teal">{analysis.overallHealth}%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-10" role="status" aria-label="Loading pitch data"><RefreshCw className="w-8 h-8 text-stadium-teal animate-spin" aria-hidden="true" /></div>
        ) : zones.map(zone => (
          <div key={zone.zoneId} className="glass-card p-4 flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                {zone.zoneId}
              </span>
              {zone.status === 'optimal' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Optimal</span>}
              {zone.status === 'needs_water' && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Dry</span>}
              {zone.status === 'needs_repair' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Wear</span>}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400"/> Moisture</span>
                <span className="font-bold text-slate-700">{zone.grassMoisturePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${zone.grassMoisturePercent}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-orange-400"/> Temp</span>
                <span className="font-bold text-slate-700">{zone.surfaceTempC}°C</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-red-400"/> Wear Index</span>
                <span className="font-bold text-slate-700">{zone.wearTearIndex}/100</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => takeAction(zone.zoneId, 'water')}
                disabled={zone.status === 'optimal'}
                className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-bold disabled:opacity-50"
                aria-label={`Water ${zone.zoneId}`}
              >
                Water Zone
              </button>
              <button 
                onClick={() => takeAction(zone.zoneId, 'repair')}
                disabled={zone.status !== 'needs_repair'}
                className="flex-1 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded text-xs font-bold disabled:opacity-50"
                aria-label={`Dispatch repair to ${zone.zoneId}`}
              >
                Dispatch Repair
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
