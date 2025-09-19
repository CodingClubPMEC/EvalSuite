const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import the Event model
const eventSchema = new mongoose.Schema({}, { strict: false });
eventSchema.statics.findActiveEvent = function() {
  return this.findOne({ status: 'active' });
};

async function testDirectSave() {
  try {
    console.log('🧪 Testing direct database save...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Event = mongoose.model('Event', eventSchema, 'events');
    
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
    
    // Test direct score update
    console.log('\\n🔧 Updating scores directly...');
    
    team.individualMarks.Innovation.score = 22;
    team.individualMarks.Feasibility.score = 18;
    team.individualMarks.Presentation.score = 13;
    team.individualMarks.Impact.score = 19;
    team.individualMarks['Technical Quality'].score = 17;
    
    // Calculate total
    team.totalMarks.score = 
      team.individualMarks.Innovation.score +
      team.individualMarks.Feasibility.score +
      team.individualMarks.Presentation.score +
      team.individualMarks.Impact.score +
      team.individualMarks['Technical Quality'].score;
    
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
    
    // Save to database
    console.log('\\n💾 Saving to database...');
    await activeEvent.save();
    console.log('✅ Saved successfully');
    
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
    
    if (verifyTeam.totalMarks.score === 89) {
      console.log('✅ SUCCESS: Scores were updated correctly in database!');
    } else {
      console.log('❌ FAILED: Scores were not updated correctly');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDirectSave();