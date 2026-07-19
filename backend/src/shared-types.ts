export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  detectedLanguage?: string;
  citations?: string[];
}

export interface RouteStep {
  instruction: string;
  accessible: boolean;
  type: 'general' | 'ramp' | 'elevator' | 'stairs' | 'gate' | 'seating';
}

export interface NavigationRoute {
  steps: RouteStep[];
  accessible: boolean;
  durationMins: number;
  distanceMeters: number;
  svgPath: string; // Coordinate visualization overlay
  startLocation: string;
  destination: string;
  persona: 'general' | 'wheelchair' | 'visual' | 'stroller';
}

export interface CameraFeed {
  cameraId: string;
  zoneName: string;
  activeThreats: number;
  crowdDensityPercent: number;
  status: 'secure' | 'monitoring' | 'breach';
  facialRecMatches: number;
}

export interface SecurityBriefing {
  timestamp: number;
  briefingText: string;
  threatLevel: 'low' | 'elevated' | 'high';
  recommendedDeployments: {
    id: string;
    action: string;
    targetZone: string;
    status: 'pending' | 'deployed' | 'recalled';
  }[];
}

export interface PitchMetrics {
  zoneId: string;
  grassMoisturePercent: number;
  surfaceTempC: number;
  wearTearIndex: number;
  status: 'optimal' | 'needs_water' | 'needs_repair';
}

export interface PitchAnalysis {
  timestamp: number;
  overallHealth: number; // 0-100
  aiRecommendations: string[];
  metrics: PitchMetrics[];
}

export interface VIPRequest {
  id: string;
  suiteNumber: string;
  guestName: string;
  requestType: 'catering' | 'concierge' | 'technical' | 'medical';
  status: 'pending' | 'in_progress' | 'fulfilled';
  timestamp: number;
  aiSuggestedResponse: string;
}

export interface VIPSuiteMetrics {
  totalActiveSuites: number;
  averageResponseTimeMins: number;
  pendingRequests: number;
  satisfactionScore: number;
}
