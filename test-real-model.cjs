const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import the actual Event model
const Event = require('./server/models/Event');

async function testRealModel() {
  try {
    console.log('🧪 Testing with real Event model...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find active event
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      console.log('❌ No active event found');
      return;
    }
    
    console.log('📋 Found active event:', activeEvent.title);
    
    // Find first jury
    const jury = activeEvent.juries.find(j => j.juryId === 1);
    if (!jury) {
      console.log('❌ Jury 1 not found');
      return;
    }
    
    console.log('👨‍⚖️ Found jury:', jury.name);
    
    // Find first team  
    const team = jury.teamEvaluations.find(t => t.teamId === 1);
    if (!team) {
      console.log('❌ Team 1 not found');
      return;
    }
    
    console.log('🏆 Found team:', team.teamName);
    console.log('📊 Current scores:', {
      Innovation: team.individualMarks.Innovation.score,
      Feasibility: team.individualMarks.Feasibility.score,
      Presentation: team.individualMarks.Presentation.score,
      Impact: team.individualMarks.Impact.score,
      'Technical Quality': team.individualMarks['Technical Quality'].score,
      Total: team.totalMarks.score
    });
    
    // Test score update using the same logic as the API
    console.log('\\n🔧 Updating scores using API logic...');
    
    const testScores = {
      Innovation: 23,
      Feasibility: 19,
      Presentation: 14,
      Impact: 18,
      'Technical Quality': 16
    };
    
    // Update individual marks (same as API logic)
    if (testScores.Innovation !== undefined) {
      team.individualMarks.Innovation.score = Math.min(testScores.Innovation, 25);
    }
    if (testScores.Feasibility !== undefined) {
      team.individualMarks.Feasibility.score = Math.min(testScores.Feasibility, 20);
    }
    if (testScores.Presentation !== undefined) {
      team.individualMarks.Presentation.score = Math.min(testScores.Presentation, 15);
    }
    if (testScores.Impact !== undefined) {
      team.individualMarks.Impact.score = Math.min(testScores.Impact, 20);
    }
    if (testScores['Technical Quality'] !== undefined) {
      team.individualMarks['Technical Quality'].score = Math.min(testScores['Technical Quality'], 20);
    }

    // Calculate total marks (same as API logic)
    const marks = team.individualMarks;
    team.totalMarks.score = 
      marks.Innovation.score +
      marks.Feasibility.score +
      marks.Presentation.score +
      marks.Impact.score +
      marks['Technical Quality'].score;

    team.lastModified = new Date();
    jury.lastActivity = new Date();
    
    console.log('📈 New scores set:', {
      Innovation: team.individualMarks.Innovation.score,
      Feasibility: team.individualMarks.Feasibility.score,  
      Presentation: team.individualMarks.Presentation.score,
      Impact: team.individualMarks.Impact.score,
      'Technical Quality': team.individualMarks['Technical Quality'].score,
      Total: team.totalMarks.score
    });
    
    // Mark as modified to trigger save
    activeEvent.markModified('juries');
    
    // Save to database
    console.log('\\n💾 Saving to database...');
    const saveResult = await activeEvent.save();
    console.log('✅ Save result:', saveResult ? 'Success' : 'Failed');
    
    // Verify by reading back
    console.log('\\n🔍 Verifying by reading back from database...');
    const verifyEvent = await Event.findActiveEvent();
    const verifyJury = verifyEvent.juries.find(j => j.juryId === 1);
    const verifyTeam = verifyJury.teamEvaluations.find(t => t.teamId === 1);
    
    console.log('📊 Verified scores:', {
      Innovation: verifyTeam.individualMarks.Innovation.score,
      Feasibility: verifyTeam.individualMarks.Feasibility.score,
      Presentation: verifyTeam.individualMarks.Presentation.score,
      Impact: verifyTeam.individualMarks.Impact.score,
      'Technical Quality': verifyTeam.individualMarks['Technical Quality'].score,
      Total: verifyTeam.totalMarks.score
    });
    
    const expectedTotal = 23 + 19 + 14 + 18 + 16;
    if (verifyTeam.totalMarks.score === expectedTotal) {
      console.log('✅ SUCCESS: Scores were updated correctly in database!');
    } else {
      console.log('❌ FAILED: Scores were not updated correctly');
      console.log(`Expected total: ${expectedTotal}, Got: ${verifyTeam.totalMarks.score}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testRealModel();