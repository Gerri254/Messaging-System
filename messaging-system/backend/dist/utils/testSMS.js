"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSMSService = testSMSService;
const smsService_1 = require("../services/smsService");
async function testSMSService() {
    console.log('Testing SMS Service...');
    console.log('\n1. Testing phone validation:');
    const phoneTests = [
        '+1234567890',
        '1234567890',
        '+44 7700 900123',
        'invalid-phone',
    ];
    for (const phone of phoneTests) {
        const result = smsService_1.smsService.validatePhoneNumber(phone);
        console.log(`  ${phone}: ${result.valid ? 'Valid' : 'Invalid'} ${result.formatted || result.error || ''}`);
    }
    console.log('\n2. Testing usage stats:');
    try {
        const stats = await smsService_1.smsService.getUsageStats();
        console.log(`  Messages this hour: ${stats.messagesThisHour}`);
        console.log(`  Remaining messages: ${stats.remainingMessages}`);
        console.log(`  Reset time: ${stats.resetTime}`);
    }
    catch (error) {
        console.log(`  Error: ${error}`);
    }
    console.log('\n3. Testing SMS sending:');
    try {
        const result = await smsService_1.smsService.sendSMS('+1234567890', 'Test message from SMS service');
        console.log(`  Success: ${result.success}`);
        console.log(`  Message ID: ${result.messageId || 'N/A'}`);
        console.log(`  Cost: $${result.cost || 0}`);
        console.log(`  Error: ${result.error || 'None'}`);
    }
    catch (error) {
        console.log(`  Error: ${error}`);
    }
    console.log('\nSMS Service test completed.');
}
if (require.main === module) {
    testSMSService().catch(console.error);
}
//# sourceMappingURL=testSMS.js.map