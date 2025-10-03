// Test automated response generation
const { analyzeJobPost } = require('./matchJobKeywords.cjs');

// Response templates for different job categories
const RESPONSE_TEMPLATES = {
  handyman: `Hi! I'm Greg from MAAD Services. I specialize in handyman work and would love to help with your project. I offer:
- Kitchen & bathroom repairs  
- Furniture assembly
- General maintenance
- Competitive rates
- Fully insured
Contact me for a free quote!`,

  clearance: `Hello! MAAD Clearance Services here. We provide:
- Full house clearances
- Furniture removal  
- Rubbish disposal
- Same day service available
- Licensed waste carriers
- Free quotes
Get in touch to discuss your clearance needs!`,

  trades: `Hi there! Greg from MAAD Services. I'm a qualified tradesman offering:
- Professional workmanship
- Competitive pricing
- Fully insured & certified
- References available
- Free estimates
I'd be happy to quote for your project!`,

  general: `Hello! MAAD Services here. We offer a wide range of handyman and clearance services:
- Home repairs & maintenance
- House clearances  
- Removal services
- Professional & reliable
- Free quotes available
Contact us to discuss your needs!`
};

function generateResponse(jobPost) {
  const analysis = analyzeJobPost(jobPost);
  
  if (!analysis.isJob || analysis.confidence < 0.4) {
    return null; // Don't respond to non-job posts
  }
  
  const template = RESPONSE_TEMPLATES[analysis.category] || RESPONSE_TEMPLATES.general;
  
  // Add location-specific customization
  let response = template;
  if (analysis.hasLocation) {
    const locationText = analysis.locationMatches.includes('belfast') ? 
      " I'm based in Belfast and cover the local area." :
      " I cover Northern Ireland including your area.";
    response += locationText;
  }
  
  return {
    response: response,
    confidence: analysis.confidence,
    category: analysis.category,
    keywords: analysis.matchedKeywords,
    shouldRespond: true
  };
}

// Test cases for response generation
const testJobs = [
  "Looking for a reliable handyman in Belfast to fix my kitchen cabinets. Good pay.",
  "Need full house clearance in Lisburn. House full of furniture to clear out.",
  "Hiring qualified electrician for residential work in Northern Ireland.",
  "Anyone know a good painter for small job? Local area preferred.",
  "Just posting about my weekend plans, nothing work related here."
];

console.log("🤖 MAAD Automated Response System Test");
console.log("=" .repeat(60));

testJobs.forEach((jobPost, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log(`Job Post: "${jobPost}"`);
  
  const result = generateResponse(jobPost);
  
  if (result) {
    console.log(`✅ Response Generated (${result.confidence} confidence, ${result.category} category)`);
    console.log(`📝 Response:`);
    console.log(`"${result.response}"`);
    console.log(`🎯 Keywords: [${result.keywords.join(', ')}]`);
  } else {
    console.log(`❌ No Response - Post not detected as job or confidence too low`);
  }
  console.log("-" .repeat(40));
});

console.log("\n🎉 Response system test complete!");

module.exports = { generateResponse, RESPONSE_TEMPLATES };