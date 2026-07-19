import { useState, useEffect } from 'react';
import { Users, Utensils, MessageSquare, Briefcase, Plus, Send, CheckCircle, RefreshCw } from 'lucide-react';

interface VIPRequest {
  id: string;
  suiteNumber: string;
  guestName: string;
  requestType: 'catering' | 'concierge' | 'technical' | 'medical';
  status: 'pending' | 'in_progress' | 'fulfilled';
  timestamp: number;
  aiSuggestedResponse: string;
}

export default function VIPHospitality({ role, token }: { role: string; token: string }) {
  const [requests, setRequests] = useState<VIPRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSuite, setNewSuite] = useState('');
  const [newGuest, setNewGuest] = useState('');
  const [newType, setNewType] = useState('catering');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/vip/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRequests(data.requests || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/vip/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          suiteNumber: newSuite,
          guestName: newGuest,
          requestType: newType
        })
      });
      setNewSuite('');
      setNewGuest('');
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (role === 'organizer') fetchRequests();
  }, [role]);

  if (role !== 'organizer') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Users className="w-16 h-16 mb-4 text-stadium-brand" />
        <h2 className="text-xl font-bold">Organizer Clearance Required</h2>
        <p className="text-sm">VIP Suite operations are restricted to Match Organizers.</p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'catering': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'concierge': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'technical': return <Briefcase className="w-4 h-4 text-gray-500" />;
      default: return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stadium-brand">VIP Hospitality</h1>
          <p className="text-sm text-slate-500">Suite Management & Premium Guest Requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Submit Request Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-stadium-teal" />
              New Suite Request
            </h3>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label htmlFor="suiteNumber" className="block text-xs font-bold text-slate-500 uppercase mb-1">Suite Number</label>
                <input id="suiteNumber" aria-label="Suite Number" required type="text" placeholder="e.g. S-14" value={newSuite} onChange={e => setNewSuite(e.target.value)} className="w-full glass-input px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="guestName" className="block text-xs font-bold text-slate-500 uppercase mb-1">Guest Name</label>
                <input id="guestName" aria-label="Guest Name" required type="text" placeholder="e.g. J. Doe" value={newGuest} onChange={e => setNewGuest(e.target.value)} className="w-full glass-input px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="requestType" className="block text-xs font-bold text-slate-500 uppercase mb-1">Request Type</label>
                <select id="requestType" aria-label="Request Type" value={newType} onChange={e => setNewType(e.target.value)} className="w-full glass-input px-3 py-2 text-sm">
                  <option value="catering">Catering / F&B</option>
                  <option value="concierge">Concierge Services</option>
                  <option value="technical">Technical Support</option>
                  <option value="medical">Medical Assistance</option>
                </select>
              </div>
              <button type="submit" aria-label="Log Request" className="w-full bg-stadium-brand hover:bg-stadium-brand/90 text-white font-bold py-2 rounded-lg flex justify-center items-center gap-2">
                <Send className="w-4 h-4" aria-hidden="true" /> Log Request
              </button>
            </form>
          </div>
        </div>

        {/* Requests Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Active Requests</h3>
            <button onClick={fetchRequests} aria-label="Refresh requests" className="text-stadium-teal hover:text-stadium-teal/70 p-1">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
          </div>
          
          <div className="space-y-3">
            {requests.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-400 font-medium">No active requests.</div>
            )}
            
            {requests.map(req => (
              <div key={req.id} className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">SUITE {req.suiteNumber}</span>
                    <span className="font-black text-slate-800">{req.guestName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    {getTypeIcon(req.requestType)}
                    <span className="capitalize">{req.requestType} Request</span>
                  </div>
                  
                  <div className="mt-3 bg-stadium-teal/5 border border-stadium-teal/20 p-2 rounded-md">
                    <span className="text-[9px] font-bold text-stadium-teal uppercase tracking-widest block mb-0.5">AI Action Suggestion</span>
                    <p className="text-xs text-slate-700">{req.aiSuggestedResponse}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider w-24 text-center">Pending</span>}
                  {req.status === 'in_progress' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider w-24 text-center">Active</span>}
                  
                  {req.status !== 'fulfilled' && (
                    <button aria-label={`Mark request ${req.id} as done`} className="text-[10px] font-bold text-slate-400 hover:text-green-500 flex items-center gap-1 transition-colors border border-slate-200 hover:border-green-500 rounded px-2 py-1">
                      <CheckCircle className="w-3 h-3" aria-hidden="true" /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
