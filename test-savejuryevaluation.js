// Test script for saveJuryEvaluation function
// This script tests the enhanced saveJuryEvaluation function with comprehensive logging

const { saveJuryEvaluation, autoSaveEvaluation } = require('./src/services/apiService.js');

async function testSaveJuryEvaluation() {
  console.log('🧪 Testing saveJuryEvaluation function...\n');
  
  // Test data
  const testJuryId = '1';
  const testScores = {
    '1': {
      'Innovation': 20,
      'Feasibility': 15,
      'Presentation': 12,
      'Impact': 18,
      'Technical Quality': 16
    },
    '2': {
      'Innovation': 22,
      'Feasibility': 18,
      'Presentation': 14,
      'Impact': 19,
      'Technical Quality': 17
    }
  };
  
  try {
    console.log('📝 Test 1: Normal save operation');
    console.log('Jury ID:', testJuryId);
    console.log('Scores:', JSON.stringify(testScores, null, 2));
    console.log('---');
    
    const result = await saveJuryEvaluation(testJuryId, testScores, false);
    console.log('✅ Save result:', result);
    console.log('---\n');
    
  } catch (error) {
    console.error('❌ Save test failed:', error.message);
    console.error('Error details:', {
      operationId: error.operationId,
      juryId: error.juryId,
      autoSave: error.autoSave,
      duration: error.duration
    });
    console.log('---\n');
  }
  
  try {
    console.log('📝 Test 2: Auto-save operation');
    console.log('Jury ID:', testJuryId);
    console.log('Scores:', JSON.stringify(testScores, null, 2));
    console.log('---');
    
    const autoSaveResult = await autoSaveEvaluation(testJuryId, testScores);
    console.log('✅ Auto-save result:', autoSaveResult);
    console.log('---\n');
    
  } catch (error) {
    console.error('❌ Auto-save test failed:', error.message);
    console.log('---\n');
  }
  
  try {
    console.log('📝 Test 3: Invalid data test');
    console.log('Testing with invalid jury ID...');
    console.log('---');
    
    await saveJuryEvaluation(null, testScores, false);
    console.log('❌ This should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Correctly caught invalid jury ID error:', error.message);
    console.log('---\n');
  }
  
  try {
    console.log('📝 Test 4: Invalid scores test');
    console.log('Testing with invalid scores...');
    console.log('---');
    
    await saveJuryEvaluation(testJuryId, null, false);
    console.log('❌ This should have failed but didn\'t');
    
  } catch (error) {
    console.log('✅ Correctly caught invalid scores error:', error.message);
    console.log('---\n');
  }
  
  console.log('🏁 Test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSaveJuryEvaluation().catch(console.error);
}

module.exports = { testSaveJuryEvaluation };
