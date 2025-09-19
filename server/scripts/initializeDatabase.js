const mongoose = require('mongoose');
const path = require('path');
const Event = require('../models/Event');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import the hackathon configuration
const hackathonConfig = {
  session: {
    year: "2025",
    title: "INTERNAL HACKATHON",
    subtitle: "for Smart India Hackathon",
    organization: "Parala Maharaja Engineering College",
    organizationShort: "PMEC",
    systemName: "EvalSuite"
  },
  
  juryMembers: [
    {
      id: 1,
      name: "Dr. Anita Sharma",
      designation: "Professor, Computer Science",
      department: "PMEC",
      email: "anita.sharma@pmec.edu",
      phone: "+91-9876543210",
      expertise: ["AI/ML", "Software Development", "Innovation"],
      isActive: true
    },
    {
      id: 2,
      name: "Prof. Rajesh Kumar",
      designation: "Head of Department, IT",
      department: "PMEC",
      email: "rajesh.kumar@pmec.edu",
      phone: "+91-9876543211",
      expertise: ["System Design", "Database Management", "Project Management"],
      isActive: true
    },
    {
      id: 3,
      name: "Dr. Priya Mehta",
      designation: "Associate Professor, AI/ML",
      department: "PMEC",
      email: "priya.mehta@pmec.edu",
      phone: "+91-9876543212",
      expertise: ["Machine Learning", "Data Science", "Research"],
      isActive: true
    },
    {
      id: 4,
      name: "Prof. Suresh Patel",
      designation: "Industry Expert",
      department: "External",
      email: "suresh.patel@industry.com",
      phone: "+91-9876543213",
      expertise: ["Industry Standards", "Business Analysis", "Product Development"],
      isActive: true
    },
    {
      id: 5,
      name: "Dr. Kavita Jain",
      designation: "Assistant Professor, Electronics",
      department: "PMEC",
      email: "kavita.jain@pmec.edu",
      phone: "+91-9876543214",
      expertise: ["IoT", "Hardware Design", "Embedded Systems"],
      isActive: true
    }
  ],
  
  teams: [
    {
      id: 1,
      name: "Team Alpha",
      members: ["Rahul Sharma", "Priya Singh", "Amit Kumar"],
      projectTitle: "Smart Traffic Management System",
      category: "Smart Cities"
    },
    {
      id: 2,
      name: "Team Beta",
      members: ["Sneha Patel", "Rohit Verma", "Kavya Reddy"],
      projectTitle: "AI-Powered Healthcare Diagnostic Tool",
      category: "Healthcare"
    },
    {
      id: 3,
      name: "Team Gamma",
      members: ["Arjun Gupta", "Neha Joshi", "Vikram Yadav"],
      projectTitle: "Sustainable Energy Management Platform",
      category: "Clean Energy"
    },
    {
      id: 4,
      name: "Team Delta",
      members: ["Riya Agarwal", "Karan Malhotra", "Deepika Soni"],
      projectTitle: "EdTech Learning Analytics System",
      category: "Education"
    },
    {
      id: 5,
      name: "Team Epsilon",
      members: ["Manish Tiwari", "Shweta Gupta", "Harsh Dubey"],
      projectTitle: "Smart Agriculture Monitoring Solution",
      category: "Agriculture"
    }
  ],
  
  evaluationCriteria: [
    { id: 1, name: "Innovation", maxMarks: 25, description: "Originality and creativity of the solution", weight: 25 },
    { id: 2, name: "Feasibility", maxMarks: 20, description: "Practicality and implementability of the solution", weight: 20 },
    { id: 3, name: "Presentation", maxMarks: 15, description: "Quality of presentation and communication", weight: 15 },
    { id: 4, name: "Impact", maxMarks: 20, description: "Potential social and economic impact", weight: 20 },
    { id: 5, name: "Technical Quality", maxMarks: 20, description: "Technical soundness and implementation quality", weight: 20 }
  ]
};

async function initializeDatabase() {
  try {
    const { logger } = require('../utils/logger');
    logger.info('[INIT] Starting database initialization...');
    const configuredDbName = process.env.MONGODB_DB || process.env.MONGODB_DBNAME;
    logger.info(`[INIT] MongoDB URI: ${(process.env.MONGODB_URI || '').replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Connect to MongoDB
    logger.info('[INIT] 🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGODB_URI || 'UNDEFINED');
    console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'UNDEFINED');
    await mongoose.connect(process.env.MONGODB_URI, configuredDbName ? { dbName: configuredDbName } : undefined);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    // Check if active event already exists
    const existingEvent = await Event.findActiveEvent();
    if (existingEvent) {
      console.log('⚠️  Active event already exists');
      console.log(`📅 Event: ${existingEvent.title} ${existingEvent.year}`);
      console.log(`📊 Statistics: ${existingEvent.statistics.totalJuries} juries, ${existingEvent.statistics.totalTeams} teams`);
      
      // Ask if user wants to reset
      console.log('\n🔄 To reset the database, delete the existing event first');
      return existingEvent;
    }
    
    console.log('🚀 Initializing new event with hierarchical structure...');
    
    // Create new event with full hierarchy
    const newEvent = new Event({
      title: hackathonConfig.session.title,
      subtitle: hackathonConfig.session.subtitle,
      year: hackathonConfig.session.year,
      organization: hackathonConfig.session.organization,
      systemName: hackathonConfig.session.systemName,
      
      // Set evaluation criteria
      evaluationCriteria: hackathonConfig.evaluationCriteria,
      
      // Create hierarchical structure: Event -> Juries -> Teams -> Individual Marks -> Total Marks
      juries: hackathonConfig.juryMembers.map(jury => ({
        juryId: jury.id,
        name: jury.name,
        designation: jury.designation,
        department: jury.department,
        email: jury.email,
        phone: jury.phone,
        expertise: jury.expertise,
        isActive: jury.isActive,
        
        // Each jury evaluates all teams
        teamEvaluations: hackathonConfig.teams.map(team => ({
          teamId: team.id,
          teamName: team.name,
          teamMembers: team.members,
          projectTitle: team.projectTitle,
          category: team.category,
          
          // Individual marks per criteria (Fourth level of hierarchy)
          individualMarks: {
            Innovation: { score: 0, maxMarks: 25 },
            Feasibility: { score: 0, maxMarks: 20 },
            Presentation: { score: 0, maxMarks: 15 },
            Impact: { score: 0, maxMarks: 20 },
            'Technical Quality': { score: 0, maxMarks: 20 }
          },
          
          // Total marks (Fifth level - calculated field)
          totalMarks: { score: 0, maxPossible: 100 },
          
          isSubmitted: false,
          lastModified: new Date()
        })),
        
        totalTeamsEvaluated: 0,
        averageScore: 0,
        lastActivity: new Date()
      }))
    });
    
    // Save the event (this will trigger the pre-save middleware to calculate statistics)
    await newEvent.save();
    
    console.log('✅ Database initialized successfully!');
    console.log('\n📋 Hierarchy Structure Created:');
    console.log(`🏆 Event: ${newEvent.title} ${newEvent.year}`);
    console.log(`👨‍⚖️ Juries: ${newEvent.juries.length} judges`);
    
    newEvent.juries.forEach((jury, index) => {
      console.log(`   ${index + 1}. ${jury.name} (${jury.designation})`);
      console.log(`      📝 Teams to evaluate: ${jury.teamEvaluations.length}`);
      
      jury.teamEvaluations.forEach((team, teamIndex) => {
        console.log(`         ${teamIndex + 1}. ${team.teamName} - ${team.projectTitle}`);
        console.log(`            📊 Individual Marks: Innovation(${team.individualMarks.Innovation.maxMarks}), Feasibility(${team.individualMarks.Feasibility.maxMarks}), Presentation(${team.individualMarks.Presentation.maxMarks}), Impact(${team.individualMarks.Impact.maxMarks}), Technical Quality(${team.individualMarks['Technical Quality'].maxMarks})`);
        console.log(`            🎯 Total Marks: ${team.totalMarks.score}/${team.totalMarks.maxPossible}`);
      });
    });
    
    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total Juries: ${newEvent.statistics.totalJuries}`);
    console.log(`   Total Teams: ${newEvent.statistics.totalTeams}`);
    console.log(`   Total Evaluations: ${newEvent.statistics.totalEvaluations}`);
    console.log(`   Completion: ${newEvent.statistics.completionPercentage}%`);
    
    console.log('\n🎉 Database is ready for use!');
    console.log('📍 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Access API at: http://localhost:5000/api');
    console.log('   3. Test endpoints:');
    console.log('      - GET /api/events/active');
    console.log('      - GET /api/events/active/jury/1');
    console.log('      - POST /api/evaluations/jury/1');
    
    return newEvent;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;