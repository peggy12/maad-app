// Enhanced keyword system with weights and categories
export const JOB_KEYWORDS = {
  // High confidence job indicators (weight: 1.0)
  high: [
    'hiring', 'job', 'position', 'vacancy', 'opening', 'opportunity',
    'apply', 'recruit', 'candidate', 'employee', 'staff', 'work',
    'handyman', 'maintenance', 'repair', 'fix', 'install', 'builder',
    'electrician', 'plumber', 'carpenter', 'painter', 'decorator',
    'clearance', 'removal', 'clear out', 'house clearance', 'junk removal',
    'rubbish removal', 'waste removal', 'skip hire', 'man and van'
  ],
  
  // Medium confidence indicators (weight: 0.7)
  medium: [
    'need', 'looking', 'seeking', 'want', 'require', 'freelance',
    'quote', 'estimate', 'price', 'cost', 'cheap', 'reasonable',
    'bathroom', 'kitchen', 'garden', 'fence', 'shed', 'garage',
    'flat pack', 'assembly', 'mounting', 'shelving', 'curtains',
    'shift', 'move', 'collect', 'dispose', 'empty', 'clean out'
  ],
  
  // Lower confidence but still relevant (weight: 0.4)
  low: [
    'help', 'assist', 'support', 'service', 'available', 'interested',
    'recommend', 'anyone know', 'does anyone', 'wee job', 'small job',
    'odd job', 'handy', 'DIY', 'domestic', 'any lads for'
  ]
};

// Location keywords for targeting specific areas
export const LOCATION_KEYWORDS = [
  'belfast', 'dublin', 'cork', 'derry', 'lisburn', 'newry',
  'bangor', 'craigavon', 'ballymena', 'newtownabbey',
  'north ireland', 'northern ireland', 'republic of ireland',
  'antrim', 'down', 'armagh', 'fermanagh', 'tyrone', 'londonderry'
];

// Trade-specific keyword categories
export const TRADE_CATEGORIES = {
  handyman: ['handyman', 'maintenance', 'repair', 'fix', 'install', 'handy', 'odd job'],
  electrical: ['electrician', 'electrical', 'wiring', 'socket', 'switch', 'fuse'],
  plumbing: ['plumber', 'plumbing', 'leak', 'pipe', 'drain', 'toilet', 'sink'],
  clearance: ['clearance', 'removal', 'junk', 'rubbish', 'waste', 'skip', 'clear out'],
  building: ['builder', 'building', 'construction', 'extension', 'renovation']
};

export interface JobMatchResult {
  isJob: boolean;
  confidence: number;
  matchedKeywords: string[];
  category?: string;
  hasLocation: boolean;
  locationMatches?: string[];
}

export function analyzeJobPost(message: string): JobMatchResult {
  if (!message || typeof message !== 'string') {
    return {
      isJob: false,
      confidence: 0,
      matchedKeywords: [],
      hasLocation: false
    };
  }

  const lowerMessage = message.toLowerCase();
  let totalScore = 0;
  const matchedKeywords: string[] = [];
  let detectedCategory = '';
  
  // Check high confidence keywords
  JOB_KEYWORDS.high.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      totalScore += 1.0;
      matchedKeywords.push(keyword);
    }
  });
  
  // Check medium confidence keywords
  JOB_KEYWORDS.medium.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      totalScore += 0.7;
      matchedKeywords.push(keyword);
    }
  });
  
  // Check low confidence keywords
  JOB_KEYWORDS.low.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      totalScore += 0.4;
      matchedKeywords.push(keyword);
    }
  });
  
  // Determine category
  for (const [category, keywords] of Object.entries(TRADE_CATEGORIES)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      detectedCategory = category;
      break;
    }
  }
  
  // Check for location mentions
  const locationMatches = LOCATION_KEYWORDS.filter(location => 
    lowerMessage.includes(location.toLowerCase())
  );
  
  // Calculate final confidence (normalize by message length factor)
  const confidence = Math.min(totalScore / Math.max(matchedKeywords.length * 0.5, 1), 1.0);
  
  const result: JobMatchResult = {
    isJob: confidence >= 0.3,
    confidence: Number(confidence.toFixed(2)),
    matchedKeywords,
    hasLocation: locationMatches.length > 0
  };
  
  if (detectedCategory) {
    result.category = detectedCategory;
  }
  
  if (locationMatches.length > 0) {
    result.locationMatches = locationMatches;
  }
  
  return result;
}

// Legacy function for backward compatibility
export function isPotentialJob(message: string): boolean {
  return analyzeJobPost(message).isJob;
}