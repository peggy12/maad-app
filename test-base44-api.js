// Test Base44 API Connection
import 'dotenv/config';

const BASE_URL = 'https://manaboutadog.base44.app';
const AGENT_NAME = 'MAAD';
const API_KEY = 'd4c9f08499e944ef99621b19d45e9df3';

async function testBase44API() {
  console.log('🧪 Testing Base44 API Connection...\n - test-base44-api.js:9');
  console.log('Config: - test-base44-api.js:10');
  console.log('Base URL: - test-base44-api.js:11', BASE_URL);
  console.log('Agent Name: - test-base44-api.js:12', AGENT_NAME);
  console.log('API Key: - test-base44-api.js:13', API_KEY.substring(0, 8) + '...\n');

  try {
    // Try different endpoint formats
    const testPrompt = 'Hello, I need help with plumbing work in my house.';
    
    // Test 1: POST to /api/agents/{name}/invoke
    console.log('\n📡 Test 1: POST to /api/agents/MAAD/invoke - test-base44-api.js:20');
    let url = `${BASE_URL}/api/agents/${AGENT_NAME}/invoke`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ prompt: testPrompt })
    });
    console.log('Status: - test-base44-api.js:30', response.status);
    
    // Test 2: GET to /api/agents/{name}
    console.log('\n📡 Test 2: GET to /api/agents/MAAD - test-base44-api.js:33');
    url = `${BASE_URL}/api/agents/${AGENT_NAME}`;
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });
    console.log('Status: - test-base44-api.js:41', response.status);
    let data2 = await response.text();
    console.log('Response: - test-base44-api.js:43', data2);
    
    // Test 3: POST to /api/chat or /api/invoke
    console.log('\n📡 Test 3: POST to /api/chat - test-base44-api.js:46');
    url = `${BASE_URL}/api/chat`;
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ 
        agent: AGENT_NAME,
        message: testPrompt 
      })
    });
    console.log('Status: - test-base44-api.js:59', response.status);
    let data3 = await response.text();
    console.log('Response: - test-base44-api.js:61', data3.substring(0, 200));

    console.log('\n📊 Final Response Status: - test-base44-api.js:63', response.status, response.statusText);
    console.log('📊 Response Headers: - test-base44-api.js:64', Object.fromEntries(response.headers.entries()));

    const data = data3;
    console.log('📊 Response Body: - test-base44-api.js:67', data);

    if (response.ok) {
      console.log('\n✅ Base44 API connection successful! - test-base44-api.js:70');
      try {
        const json = JSON.parse(data);
        console.log('🤖 Agent Response: - test-base44-api.js:73', json.output || json.response || json);
      } catch (e) {
        console.log('📝 Raw response: - test-base44-api.js:75', data);
      }
    } else {
      console.error('\n❌ Base44 API error: - test-base44-api.js:78', response.status, response.statusText);
      console.error('Response body: - test-base44-api.js:79', data);
    }
  } catch (error) {
    console.error('\n❌ Failed to connect to Base44 API: - test-base44-api.js:82', error);
    console.error('Error details: - test-base44-api.js:83', error.message);
  }
}

testBase44API();
