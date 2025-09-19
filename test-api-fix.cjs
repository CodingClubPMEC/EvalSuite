const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Event = require('./server/models/Event');

async function testAPIFix() {
  try {
    console.log('🧪 Testing API with markModified fix...');
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test the API endpoint
    console.log('🌐 Testing API endpoint...');
    
    const testScores = {
      1: {
        Innovation: 24,
        Feasibility: 19,
        Presentation: 13,
        Impact: 17,
        'Technical Quality': 18
      }
    };
    
    const response = await fetch('http://localhost:5000/api/evaluations/jury/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scores: testScores, autoSave: false })
    });
    
    const result = await response.json();
    console.log('📊 API Response:', result);
    
    if (result.success) {
      console.log('✅ API call successful!');
      
      // Now verify directly in database
      console.log('🔍 Verifying in database...');
      
      await mongoose.connect(process.env.MONGODB_URI);
      const verifyEvent = await Event.findActiveEvent();
      const verifyJury = verifyEvent.juries.find(j => j.juryId === 1);
      const verifyTeam = verifyJury.teamEvaluations.find(t => t.teamId === 1);
      
      console.log('📊 Database verification:', {
        Innovation: verifyTeam.individualMarks.Innovation.score,
        Feasibility: verifyTeam.individualMarks.Feasibility.score,
        Presentation: verifyTeam.individualMarks.Presentation.score,
        Impact: verifyTeam.individualMarks.Impact.score,
        'Technical Quality': verifyTeam.individualMarks['Technical Quality'].score,
        Total: verifyTeam.totalMarks.score
      });
      
      const expectedTotal = 24 + 19 + 13 + 17 + 18;
      if (verifyTeam.totalMarks.score === expectedTotal) {
        console.log('🎉 SUCCESS: API is now correctly updating database!');
      } else {
        console.log('❌ FAILED: Database still not updated correctly');
        console.log(`Expected: ${expectedTotal}, Got: ${verifyTeam.totalMarks.score}`);
      }
      
      await mongoose.disconnect();
      
    } else {
      console.log('❌ API call failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPIFix();