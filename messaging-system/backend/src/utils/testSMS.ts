// Simple test script to verify SMS integration
import { smsService } from '../services/smsService';

async function testSMSService() {
  console.log('Testing SMS Service...');

  // Test phone validation
  console.log('\n1. Testing phone validation:');
  const phoneTests = [
    '+1234567890',
    '1234567890',
    '+44 7700 900123',
    'invalid-phone',
  ];

  for (const phone of phoneTests) {
    const result = smsService.validatePhoneNumber(phone);
    console.log(`  ${phone}: ${result.valid ? 'Valid' : 'Invalid'} ${result.formatted || result.error || ''}`);
  }

  // Test usage stats
  console.log('\n2. Testing usage stats:');
  try {
    const stats = await smsService.getUsageStats();
    console.log(`  Messages this hour: ${stats.messagesThisHour}`);
    console.log(`  Remaining messages: ${stats.remainingMessages}`);
    console.log(`  Reset time: ${stats.resetTime}`);
  } catch (error) {
    console.log(`  Error: ${error}`);
  }

  // Test single SMS sending
  console.log('\n3. Testing SMS sending:');
  try {
    const result = await smsService.sendSMS('+1234567890', 'Test message from SMS service');
    console.log(`  Success: ${result.success}`);
    console.log(`  Message ID: ${result.messageId || 'N/A'}`);
    console.log(`  Cost: $${result.cost || 0}`);
    console.log(`  Error: ${result.error || 'None'}`);
  } catch (error) {
    console.log(`  Error: ${error}`);
  }

  console.log('\nSMS Service test completed.');
}

// Only run if this file is executed directly
if (require.main === module) {
  testSMSService().catch(console.error);
}

export { testSMSService };