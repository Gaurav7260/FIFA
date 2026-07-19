import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

import { STADIUM_CONTEXT } from './data/stadiumContext.js';
import {
  askConcierge,
  generateSecurityBriefing,
  analyzePitchData,
  generateVIPRecommendations
} from './llmClient.js';
import {
  apiRateLimiter,
  genAiRateLimiter,
  authorizeRole,
  validateBody,
  chatRequestSchema,
  navigationRouteSchema,
  pitchRequestSchema,
  vipRequestSchema,
  errorHandler,
  AuthenticatedRequest
} from './middleware/security.js';
import type { CameraFeed, PitchMetrics, VIPRequest, RouteStep } from './shared-types.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Base: Enable Helmet headers and CORS
app.use(helmet());
app.use(cors({
  origin: '*', // Allow any origin for demo purposes
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Apply global rate limiting to all requests
app.use('/api', apiRateLimiter);

// -------------------------------------------------------------
// IN-MEMORY SIMULATED DATABASE STATE
// -------------------------------------------------------------
let cameraFeeds: CameraFeed[] = [
  { cameraId: "CAM-N1", zoneName: "North Gate VIP Entrance", activeThreats: 0, crowdDensityPercent: 45, status: 'secure', facialRecMatches: 12 },
  { cameraId: "CAM-S2", zoneName: "South Concourse Choke Point", activeThreats: 1, crowdDensityPercent: 88, status: 'monitoring', facialRecMatches: 3 },
  { cameraId: "CAM-E1", zoneName: "East Perimeter Fence", activeThreats: 0, crowdDensityPercent: 12, status: 'secure', facialRecMatches: 0 },
  { cameraId: "CAM-W4", zoneName: "West Tunnel Access", activeThreats: 0, crowdDensityPercent: 95, status: 'breach', facialRecMatches: 1 }
];

let pitchStatus: PitchMetrics[] = [
  { zoneId: "PITCH-N", grassMoisturePercent: 42, surfaceTempC: 22, wearTearIndex: 12, status: 'optimal' },
  { zoneId: "PITCH-S", grassMoisturePercent: 28, surfaceTempC: 25, wearTearIndex: 45, status: 'needs_water' },
  { zoneId: "PITCH-E", grassMoisturePercent: 35, surfaceTempC: 23, wearTearIndex: 18, status: 'optimal' },
  { zoneId: "PITCH-W", grassMoisturePercent: 40, surfaceTempC: 21, wearTearIndex: 85, status: 'needs_repair' }
];

let vipRequests: VIPRequest[] = [
  { id: "VIP-101", suiteNumber: "S-14", guestName: "E. Musk", requestType: "catering", status: "pending", timestamp: Date.now() - 1000 * 60 * 5, aiSuggestedResponse: "Dispatch premium catering cart immediately." },
  { id: "VIP-102", suiteNumber: "S-22", guestName: "L. Messi", requestType: "concierge", status: "in_progress", timestamp: Date.now() - 1000 * 60 * 15, aiSuggestedResponse: "Assign dedicated escort for post-match transit." }
];

// Helper to update sensor data randomly to simulate live feeds
function simulateLiveCameras() {
  cameraFeeds = cameraFeeds.map(c => {
    let delta = Math.floor(Math.random() * 20) - 10;
    const density = Math.max(0, Math.min(100, c.crowdDensityPercent + delta));
    let status: 'secure' | 'monitoring' | 'breach' = 'secure';
    if (density > 90) status = 'breach';
    else if (density > 75) status = 'monitoring';
    
    return {
      ...c,
      crowdDensityPercent: density,
      status
    };
  });
}

function simulatePitchData() {
  pitchStatus = pitchStatus.map(p => {
    let moistureDelta = Math.floor(Math.random() * 5) - 3;
    const moisture = Math.max(10, Math.min(60, p.grassMoisturePercent + moistureDelta));
    let status: 'optimal' | 'needs_water' | 'needs_repair' = 'optimal';
    if (moisture < 30) status = 'needs_water';
    if (p.wearTearIndex > 70) status = 'needs_repair';
    
    return {
      ...p,
      grassMoisturePercent: moisture,
      status
    };
  });
}

// -------------------------------------------------------------
// MODULE A: COMMAND CENTER AI TERMINAL
// -------------------------------------------------------------
app.post('/api/chat', genAiRateLimiter, validateBody(chatRequestSchema), async (req, res, next) => {
  try {
    const { message, history, language } = req.body;
    const chatResult = await askConcierge(message, history, language);
    res.json(chatResult);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE B: SMART NAVIGATION & ROUTING (UNCHANGED)
// -------------------------------------------------------------
app.post('/api/navigation/route', validateBody(navigationRouteSchema), (req, res, next) => {
  try {
    const { startLocation, destination, persona } = req.body;

    const steps: RouteStep[] = [];
    let svgPath = "";
    let durationMins = 12;
    let distanceMeters = 450;

    const matchedGate = STADIUM_CONTEXT.gates.find(g => g.id === startLocation || g.name.includes(startLocation));
    const gateName = matchedGate ? matchedGate.name : startLocation;
    
    steps.push({
      instruction: `Enter via ${gateName} and pass security scan.`,
      accessible: true,
      type: 'gate'
    });

    if (persona === 'wheelchair' || persona === 'stroller') {
      steps.push({ instruction: `Follow the ground-level ramp indicators directly toward elevator tower ${startLocation === 'GateB' ? 'EL-B' : 'EL-A'}.`, accessible: true, type: 'ramp' });
      steps.push({ instruction: `Take Elevator to Concourse Level 2. Elevators are wide and equipped with tactile braille buttons.`, accessible: true, type: 'elevator' });
      steps.push({ instruction: `Exit elevator and head left along the flat step-free concourse path towards target section.`, accessible: true, type: 'general' });
      steps.push({ instruction: `Access seating platform via Section ADA entry ramp. Security stewards are on standby to assist.`, accessible: true, type: 'seating' });
      
      durationMins = 16;
      distanceMeters = 550;
      svgPath = "M 50,50 L 150,50 L 150,150 L 250,150"; 
    } else {
      if (persona === 'visual') {
        steps.push({ instruction: `Turn right past the ticket terminal. Follow the tactile paving grid on the floor for 50 meters.`, accessible: true, type: 'general' });
        steps.push({ instruction: `Climb Stairs ST-A (12 steps, handrails on both sides) to Section 100 level. Audio beacons emit tone markers at landing.`, accessible: false, type: 'stairs' });
        steps.push({ instruction: `Turn left. Section entrance is 15 meters ahead. Guided floor strips lead to seat row.`, accessible: true, type: 'seating' });
        durationMins = 14;
        distanceMeters = 400;
      } else {
        steps.push({ instruction: `Proceed up Main Concourse Stairs directly inside security.`, accessible: false, type: 'stairs' });
        steps.push({ instruction: `Walk past concession stands towards Section seating entrance.`, accessible: true, type: 'general' });
        steps.push({ instruction: `Walk down seating aisle stairs to your row.`, accessible: false, type: 'seating' });
        durationMins = 10;
        distanceMeters = 380;
      }
      svgPath = "M 50,50 L 120,80 L 250,150"; 
    }

    res.json({ steps, accessible: persona === 'wheelchair' || persona === 'stroller', durationMins, distanceMeters, svgPath, startLocation, destination, persona });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE C: SECURITY SURVEILLANCE
// -------------------------------------------------------------
app.get('/api/security/feeds', (req, res) => {
  simulateLiveCameras();
  res.json({ feeds: cameraFeeds });
});

app.post('/api/security/briefing', authorizeRole(['organizer']), async (req, res, next) => {
  try {
    simulateLiveCameras();
    const briefingText = await generateSecurityBriefing(cameraFeeds);
    
    const highestDensity = Math.max(...cameraFeeds.map(c => c.crowdDensityPercent));
    let threatLevel: 'low' | 'elevated' | 'high' = 'low';
    if (highestDensity > 90) threatLevel = 'high';
    else if (highestDensity > 75) threatLevel = 'elevated';

    res.json({
      timestamp: Date.now(),
      briefingText,
      threatLevel,
      recommendedDeployments: [
        { id: "DEP-01", action: "Deploy tactical unit to South Concourse", targetZone: "CAM-S2", status: "pending" }
      ]
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE D: PITCH MANAGEMENT
// -------------------------------------------------------------
app.get('/api/pitch', authorizeRole(['volunteer', 'organizer']), (req, res) => {
  simulatePitchData();
  res.json({ zones: pitchStatus });
});

app.post('/api/pitch/analyze', authorizeRole(['volunteer', 'organizer']), async (req, res, next) => {
  try {
    simulatePitchData();
    const analysis = await analyzePitchData(pitchStatus);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

app.post('/api/pitch/action', authorizeRole(['volunteer', 'organizer']), validateBody(pitchRequestSchema), (req, res, next) => {
  try {
    const { zoneId, action } = req.body;
    
    // Simulate action applying
    pitchStatus = pitchStatus.map(p => {
      if (p.zoneId === zoneId) {
        if (action === 'water') return { ...p, grassMoisturePercent: 55, status: 'optimal' };
        if (action === 'repair') return { ...p, wearTearIndex: 10, status: 'optimal' };
      }
      return p;
    });

    res.json({ success: true, zones: pitchStatus });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE E: VIP HOSPITALITY
// -------------------------------------------------------------
app.get('/api/vip/requests', authorizeRole(['organizer']), (req, res) => {
  res.json({ requests: vipRequests });
});

app.post('/api/vip/requests', authorizeRole(['organizer']), validateBody(vipRequestSchema), async (req, res, next) => {
  try {
    const { suiteNumber, guestName, requestType } = req.body;
    
    // Generate AI response recommendation
    const recommendation = await generateVIPRecommendations(suiteNumber, requestType);

    const newReq: VIPRequest = {
      id: `VIP-${Math.floor(200 + Math.random() * 800)}`,
      suiteNumber,
      guestName,
      requestType: requestType as any,
      status: 'pending',
      timestamp: Date.now(),
      aiSuggestedResponse: recommendation
    };

    vipRequests.unshift(newReq);
    res.status(201).json(newReq);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// STATIC FILES & SPA ROUTING FOR PRODUCTION DEPLOYMENT
// -------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  console.log(`[FIFA MatchControl Pro Backend] Serving static frontend files from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log(`[FIFA MatchControl Pro Backend] Frontend build folder not found at: ${frontendDistPath}. Serving API routes only.`);
}

// -------------------------------------------------------------
// ERROR HANDLER & LAUNCH
// -------------------------------------------------------------
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[FIFA MatchControl Pro Backend] Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
  });
}

export default app;
