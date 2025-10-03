// Test Base44 root endpoints
import 'dotenv/config';

const BASE_URL = 'https://manaboutadog.base44.app';
const API_KEY = 'd4c9f08499e944ef99621b19d45e9df3';

async function testEndpoints() {
  const endpoints = [
    '/',
    '/api',
    '/docs',
    '/openapi.json',
    '/health',
    '/api/v1/agents',
    '/api/v1/chat',
    '/v1/agents',
    '/v1/chat'
  ];

  console.log('🧪 Testing Base44 endpoints...\n');

  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      console.log(`${response.ok ? '✅' : '❌'} ${response.status} ${endpoint}`);
      
      if (response.status === 200) {
        const text = await response.text();
        console.log(`   Preview: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ERROR ${endpoint}: ${error.message}`);
    }
  }
}

testEndpoints();
