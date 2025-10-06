/**
 * Quick Test Script for Webhook
 * Run: node test-webhook.js
 */

console.log('🧪 Testing MAAD Webhook...\n - test-webhook.js:6');

// Test endpoints
const BASE_URL = 'http://localhost:3003';

// Test 1: Health Check
async function testHealth() {
  console.log('Test 1: Health Check - test-webhook.js:13');
  try {
    const response = await fetch(`${WEBHOOK_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed: - test-webhook.js:17', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed: - test-webhook.js:20', error.message);
    return false;
  }
}

// Test 2: Webhook Verification
async function testVerification() {
  console.log('\nTest 2: Webhook Verification - test-webhook.js:27');
  try {
    const url = `${WEBHOOK_URL}/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123`;
    const response = await fetch(url);
    const text = await response.text();
    
    if (text === 'test123') {
      console.log('✅ Verification passed - test-webhook.js:34');
      return true;
    } else {
      console.error('❌ Verification failed. Got: - test-webhook.js:37', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Verification failed: - test-webhook.js:41', error.message);
    return false;
  }
}

// Test 3: Message Handling
async function testMessage() {
  console.log('\nTest 3: Message Handling - test-webhook.js:48');
  try {
    const testMessage = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '123456' },
          recipient: { id: '820172544505737' },
          timestamp: Date.now(),
          message: {
            text: 'Hello MAAD! This is a test message.'
          }
        }]
      }]
    };

    const response = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    const text = await response.text();
    
    if (text === 'EVENT_RECEIVED') {
      console.log('✅ Message handling passed - test-webhook.js:75');
      return true;
    } else {
      console.error('❌ Message handling failed. Got: - test-webhook.js:78', text);
      return false;
    }
  } catch (error) {
    console.error('❌ Message handling failed: - test-webhook.js:82', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════\n - test-webhook.js:89');
  
  const results = {
    health: await testHealth(),
    verification: await testVerification(),
    message: await testMessage()
  };

  console.log('\n═══════════════════════════════════════ - test-webhook.js:97');
  console.log('\n📊 Test Results: - test-webhook.js:98');
  console.log('Health Check: - test-webhook.js:99', results.health ? '✅' : '❌');
  console.log('Verification: - test-webhook.js:100', results.verification ? '✅' : '❌');
  console.log('Message Handling: - test-webhook.js:101', results.message ? '✅' : '❌');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;

  console.log(`\n🎯 ${passed}/${total} tests passed\n - test-webhook.js:106`);

  if (passed === total) {
    console.log('🎉 All tests passed! Webhook is working correctly.\n - test-webhook.js:109');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.\n - test-webhook.js:111');
    console.log('Make sure your webhook server is running: - test-webhook.js:112');
    console.log('npm run webhook\n - test-webhook.js:113');
  }
}

// Check if server is running first
fetch(`${WEBHOOK_URL}/health`)
  .then(() => runTests())
  .catch(() => {
    console.error('❌ Cannot connect to webhook server at - test-webhook.js:121', WEBHOOK_URL);
    console.log('\n💡 Start the server first: - test-webhook.js:122');
    console.log('npm run webhook\n - test-webhook.js:123');
  });
