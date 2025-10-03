// CommonJS wrapper for job keyword matching
// This provides the same functionality as matchJobKeywords.ts but in CommonJS format

const JOB_KEYWORDS = {
  high: [
    'hiring', 'job', 'position', 'vacancy', 'opening', 'opportunity',
    'apply', 'recruit', 'candidate', 'employee', 'staff', 'work',
    'handyman', 'maintenance', 'repair', 'fix', 'install', 'builder',
    'electrician', 'plumber', 'carpenter', 'painter', 'decorator',
    'clearance', 'removal', 'clear out', 'house clearance', 'junk removal',
    'rubbish removal', 'waste removal', 'skip hire', 'man and van'
  ],
  medium: [
    'help', 'need', 'looking for', 'required', 'wanted', 'seeking',
    'quote', 'estimate', 'price', 'cost', 'cheap', 'affordable',
    'reliable', 'experienced', 'professional', 'skilled', 'qualified',
    'belfast', 'ni', 'northern ireland', 'local', 'area'
  ],
  low: [
    'recommend', 'suggestion', 'advice', 'know', 'anyone',
    'small job', 'big job', 'urgent', 'asap', 'soon',
    'weekend', 'evening', 'flexible', 'part time', 'full time'
  ]
};

const LOCATION_KEYWORDS = [
  'belfast', 'ni', 'northern ireland', 'lisburn', 'antrim', 
  'newtownabbey', 'carrickfergus', 'bangor', 'holywood',
  'local', 'area', 'nearby', 'close'
];

function analyzeJobPost(text) {
  if (!text || typeof text !== 'string') {
    return {
      isJob: false,
      confidence: 0,
      category: 'unknown',
      matchedKeywords: [],
      hasLocation: false,
      locationMatches: []
    };
  }

  const lowerText = text.toLowerCase();
  let totalScore = 0;
  let matchedKeywords = [];
  let locationMatches = [];

  // Check high-weight keywords
  for (const keyword of JOB_KEYWORDS.high) {
    if (lowerText.includes(keyword.toLowerCase())) {
      totalScore += 1.0;
      matchedKeywords.push(keyword);
    }
  }

  // Check medium-weight keywords
  for (const keyword of JOB_KEYWORDS.medium) {
    if (lowerText.includes(keyword.toLowerCase())) {
      totalScore += 0.6;
      matchedKeywords.push(keyword);
    }
  }

  // Check low-weight keywords
  for (const keyword of JOB_KEYWORDS.low) {
    if (lowerText.includes(keyword.toLowerCase())) {
      totalScore += 0.3;
      matchedKeywords.push(keyword);
    }
  }

  // Check location keywords
  for (const location of LOCATION_KEYWORDS) {
    if (lowerText.includes(location.toLowerCase())) {
      locationMatches.push(location);
      totalScore += 0.2; // Small bonus for location
    }
  }

  // Calculate confidence (cap at 1.0)
  const confidence = Math.min(totalScore / 3, 1.0);

  // Determine category
  let category = 'general';
  if (lowerText.includes('handyman') || lowerText.includes('maintenance')) {
    category = 'handyman';
  } else if (lowerText.includes('clearance') || lowerText.includes('removal')) {
    category = 'clearance';
  } else if (lowerText.includes('electrician') || lowerText.includes('plumber')) {
    category = 'trades';
  }

  return {
    isJob: confidence > 0.3,
    confidence: Math.round(confidence * 100) / 100,
    category,
    matchedKeywords,
    hasLocation: locationMatches.length > 0,
    locationMatches
  };
}

module.exports = {
  analyzeJobPost,
  JOB_KEYWORDS,
  LOCATION_KEYWORDS
};