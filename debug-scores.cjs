const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function debugScores() {
  try {
    console.log('🔍 Debugging score update issue...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the Event model
    const eventSchema = new mongoose.Schema({}, { strict: false, collection: 'events' });
    const Event = mongoose.model('Event', eventSchema);
    
    // Find the active event
    const activeEvent = await Event.findOne({ status: 'active' });
    
    if (!activeEvent) {
      console.log('❌ No active event found');
      return;
    }
    
    console.log('\n📊 Current Event Data:');
    console.log(`Event: ${activeEvent.title} ${activeEvent.year}`);
    console.log(`Juries: ${activeEvent.juries.length}`);
    
    // Check first jury's first team scores
    if (activeEvent.juries.length > 0 && activeEvent.juries[0].teamEvaluations.length > 0) {
      const firstJury = activeEvent.juries[0];
      const firstTeam = firstJury.teamEvaluations[0];
      
      console.log('\n📋 Sample Data (Jury 1, Team 1):');
      console.log(`Jury: ${firstJury.name}`);
      console.log(`Team: ${firstTeam.teamName}`);
      console.log('\nIndividual Marks:');
      console.log('  Innovation:', firstTeam.individualMarks.Innovation);
      console.log('  Feasibility:', firstTeam.individualMarks.Feasibility);
      console.log('  Presentation:', firstTeam.individualMarks.Presentation);
      console.log('  Impact:', firstTeam.individualMarks.Impact);
      console.log('  Technical Quality:', firstTeam.individualMarks['Technical Quality']);
      console.log('\nTotal Marks:', firstTeam.totalMarks);
      console.log('Is Submitted:', firstTeam.isSubmitted);
      console.log('Last Modified:', firstTeam.lastModified);
    }
    
    console.log('\n🧪 Testing API endpoint...');
    
    // Test API call
    const fetch = (await import('node-fetch')).default;
    
    // Test getting jury 1 data
    const response = await fetch('http://localhost:5000/api/events/active/jury/1');
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ API Response successful');
      console.log('Scores returned by API:');
      console.log(JSON.stringify(data.data.scores, null, 2));
    } else {
      console.log('\n❌ API Response failed:', data);
    }
    
    console.log('\n🔧 Testing score update...');
    
    // Test updating scores
    const testScores = {
      1: {
        Innovation: 20,
        Feasibility: 15,
        Presentation: 12,
        Impact: 18,
        'Technical Quality': 16
      }
    };
    
    const updateResponse = await fetch('http://localhost:5000/api/evaluations/jury/1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scores: testScores, autoSave: false })
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update result:', updateResult);
    
    // Check if data was actually updated in database
    const updatedEvent = await Event.findOne({ status: 'active' });
    const updatedFirstTeam = updatedEvent.juries[0].teamEvaluations[0];
    
    console.log('\n📈 After Update:');
    console.log('Individual Marks:');
    console.log('  Innovation:', updatedFirstTeam.individualMarks.Innovation);
    console.log('  Total Marks:', updatedFirstTeam.totalMarks);
    console.log('  Is Submitted:', updatedFirstTeam.isSubmitted);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugScores();