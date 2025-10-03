// Test job detection system
const { analyzeJobPost } = require('./matchJobKeywords.cjs');

// Test cases for job detection
const testCases = [
  {
    name: "High Confidence Handyman Job",
    text: "Looking for a reliable handyman in Belfast to fix my kitchen cabinets. Good pay for experienced worker.",
    expectedCategory: "handyman",
    expectedMinConfidence: 0.7
  },
  {
    name: "House Clearance Job",
    text: "Need house clearance service in Northern Ireland. House full of furniture to clear out. Contact for quote.",
    expectedCategory: "clearance", 
    expectedMinConfidence: 0.6
  },
  {
    name: "Electrician Job Posting",
    text: "Hiring qualified electrician for residential work. Must be experienced. Apply with references.",
    expectedCategory: "trades",
    expectedMinConfidence: 0.8
  },
  {
    name: "General Maintenance",
    text: "Small maintenance job needed. Anyone recommend someone reliable for odd jobs around the house?",
    expectedCategory: "handyman",
    expectedMinConfidence: 0.4
  },
  {
    name: "Non-Job Post",
    text: "Just finished watching a great movie tonight. Highly recommend it to everyone!",
    expectedCategory: "general",
    expectedMinConfidence: 0.0
  },
  {
    name: "Borderline Job Post",
    text: "Does anyone know a good decorator in the area? Need some advice on paint colors.",
    expectedCategory: "general",
    expectedMinConfidence: 0.2
  }
];

console.log("🧪 MAAD Job Detection System Test Results");
console.log("=" .repeat(50));

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`Text: "${testCase.text}"`);
  
  const result = analyzeJobPost(testCase.text);
  
  console.log(`📊 Results:`);
  console.log(`   - Is Job: ${result.isJob}`);
  console.log(`   - Confidence: ${result.confidence}`);
  console.log(`   - Category: ${result.category}`);
  console.log(`   - Keywords: [${result.matchedKeywords.join(', ')}]`);
  console.log(`   - Location Match: ${result.hasLocation} ${result.locationMatches.length > 0 ? `(${result.locationMatches.join(', ')})` : ''}`);
  
  // Check if test passes
  const confidencePassed = result.confidence >= testCase.expectedMinConfidence;
  const categoryPassed = result.category === testCase.expectedCategory || testCase.expectedMinConfidence === 0;
  const testPassed = confidencePassed && categoryPassed;
  
  if (testPassed) {
    passedTests++;
    console.log(`   ✅ PASS`);
  } else {
    console.log(`   ❌ FAIL`);
    console.log(`   Expected: confidence >= ${testCase.expectedMinConfidence}, category = ${testCase.expectedCategory}`);
  }
});

console.log("\n" + "=" .repeat(50));
console.log(`🎯 Test Summary: ${passedTests}/${totalTests} tests passed`);
console.log(`📈 Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);

if (passedTests === totalTests) {
  console.log("🎉 All tests passed! Job detection system is working perfectly.");
} else {
  console.log("⚠️  Some tests failed. Consider adjusting keyword weights or thresholds.");
}