// Test Base44 API Connection
import 'dotenv/config';

const BASE_URL = 'https://manaboutadog.base44.app';
const AGENT_NAME = 'MAAD';
const API_KEY = 'd4c9f08499e944ef99621b19d45e9df3';

async function testBase44API() {
  console.log('🧪 Testing Base44 API Connection...\n');
  console.log('Config:');
  console.log('  Base URL:', BASE_URL);
  console.log('  Agent Name:', AGENT_NAME);
  console.log('  API Key:', API_KEY.substring(0, 8) + '...\n');

  try {
    // Try different endpoint formats
    const testPrompt = 'Hello, I need help with plumbing work in my house.';
    
    // Test 1: POST to /api/agents/{name}/invoke
    console.log('\n📡 Test 1: POST to /api/agents/MAAD/invoke');
    let url = `${BASE_URL}/api/agents/${AGENT_NAME}/invoke`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ prompt: testPrompt })
    });
    console.log('   Status:', response.status);
    
    // Test 2: GET to /api/agents/{name}
    console.log('\n📡 Test 2: GET to /api/agents/MAAD');
    url = `${BASE_URL}/api/agents/${AGENT_NAME}`;
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      }
    });
    console.log('   Status:', response.status);
    let data2 = await response.text();
    console.log('   Response:', data2);
    
    // Test 3: POST to /api/chat or /api/invoke
    console.log('\n📡 Test 3: POST to /api/chat');
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
    console.log('   Status:', response.status);
    let data3 = await response.text();
    console.log('   Response:', data3.substring(0, 200));

    console.log('\n📊 Final Response Status:', response.status, response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = data3;
    console.log('📊 Response Body:', data);

    if (response.ok) {
      console.log('\n✅ Base44 API connection successful!');
      try {
        const json = JSON.parse(data);
        console.log('🤖 Agent Response:', json.output || json.response || json);
      } catch (e) {
        console.log('📝 Raw response:', data);
      }
    } else {
      console.error('\n❌ Base44 API error:', response.status, response.statusText);
      console.error('Response body:', data);
    }
  } catch (error) {
    console.error('\n❌ Failed to connect to Base44 API:', error);
    console.error('Error details:', error.message);
  }
}

testBase44API();
