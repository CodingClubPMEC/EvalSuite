// Hackathon Configuration Management
// This file contains all configurable data for the hackathon system

export const hackathonConfig = {
  // Current hackathon session information
  session: {
    year: "2025",
    title: "INTERNAL HACKATHON",
    subtitle: "for Smart India Hackathon",
    organization: "Parala Maharaja Engineering College",
    organizationShort: "PMEC",
    logoPath: "/pmec-logo.png",
    theme: {
      primary: "orange",
      secondary: "slate"
    }
  },

  // Jury Members Configuration
  juryMembers: [
    {
      id: 1,
      name: "Dr. Anita Sharma",
      designation: "Professor, Computer Science",
      department: "PMEC",
      email: "anita.sharma@pmec.edu",
      phone: "+91-9876543210",
      expertise: ["AI/ML", "Software Development", "Innovation"],
      isActive: true,
      addedDate: "2025-01-01"
    },
    {
      id: 2,
      name: "Prof. Rajesh Kumar",
      designation: "Head of Department, IT",
      department: "PMEC",
      email: "rajesh.kumar@pmec.edu",
      phone: "+91-9876543211",
      expertise: ["System Design", "Database Management", "Project Management"],
      isActive: true,
      addedDate: "2025-01-01"
    },
    {
      id: 3,
      name: "Dr. Priya Mehta",
      designation: "Associate Professor, AI/ML",
      department: "PMEC",
      email: "priya.mehta@pmec.edu",
      phone: "+91-9876543212",
      expertise: ["Machine Learning", "Data Science", "Research"],
      isActive: true,
      addedDate: "2025-01-01"
    },
    {
      id: 4,
      name: "Prof. Suresh Patel",
      designation: "Industry Expert",
      department: "External",
      email: "suresh.patel@industry.com",
      phone: "+91-9876543213",
      expertise: ["Industry Standards", "Business Analysis", "Product Development"],
      isActive: true,
      addedDate: "2025-01-01"
    },
    {
      id: 5,
      name: "Dr. Kavita Jain",
      designation: "Assistant Professor, Electronics",
      department: "PMEC",
      email: "kavita.jain@pmec.edu",
      phone: "+91-9876543214",
      expertise: ["IoT", "Hardware Design", "Embedded Systems"],
      isActive: true,
      addedDate: "2025-01-01"
    }
  ],

  // Teams Configuration
  teams: [
    {
      id: 1,
      name: "Team Alpha",
      members: ["Rahul Sharma", "Priya Singh", "Amit Kumar"],
      projectTitle: "Smart Traffic Management System",
      category: "Smart Cities",
      registrationDate: "2025-01-15",
      isActive: true
    },
    {
      id: 2,
      name: "Team Beta",
      members: ["Sneha Patel", "Rohit Verma", "Kavya Reddy"],
      projectTitle: "AI-Powered Healthcare Diagnostic Tool",
      category: "Healthcare",
      registrationDate: "2025-01-16",
      isActive: true
    },
    {
      id: 3,
      name: "Team Gamma",
      members: ["Arjun Gupta", "Neha Joshi", "Vikram Yadav"],
      projectTitle: "Sustainable Energy Management Platform",
      category: "Clean Energy",
      registrationDate: "2025-01-17",
      isActive: true
    },
    {
      id: 4,
      name: "Team Delta",
      members: ["Riya Agarwal", "Karan Malhotra", "Deepika Soni"],
      projectTitle: "EdTech Learning Analytics System",
      category: "Education",
      registrationDate: "2025-01-18",
      isActive: true
    },
    {
      id: 5,
      name: "Team Epsilon",
      members: ["Manish Tiwari", "Shweta Gupta", "Harsh Dubey"],
      projectTitle: "Smart Agriculture Monitoring Solution",
      category: "Agriculture",
      registrationDate: "2025-01-19",
      isActive: true
    }
  ],

  // Evaluation Criteria Configuration
  evaluationCriteria: [
    { 
      id: 1,
      name: "Innovation", 
      maxMarks: 25,
      description: "Originality and creativity of the solution",
      weight: 25,
      isActive: true
    },
    { 
      id: 2,
      name: "Feasibility", 
      maxMarks: 20,
      description: "Practicality and implementability of the solution",
      weight: 20,
      isActive: true
    },
    { 
      id: 3,
      name: "Presentation", 
      maxMarks: 15,
      description: "Quality of presentation and communication",
      weight: 15,
      isActive: true
    },
    { 
      id: 4,
      name: "Impact", 
      maxMarks: 20,
      description: "Potential social and economic impact",
      weight: 20,
      isActive: true
    },
    { 
      id: 5,
      name: "Technical Quality", 
      maxMarks: 20,
      description: "Technical soundness and implementation quality",
      weight: 20,
      isActive: true
    }
  ],

  // System Configuration
  system: {
    maxTeamsPerJury: 50,
    allowScoreModification: true,
    autoSaveInterval: 2000, // milliseconds
    exportFormats: ["xlsx", "pdf"],
    backupFrequency: "daily",
    adminEmails: ["admin@pmec.edu"],
    features: {
      realTimeUpdates: true,
      consolidatedMarksheet: true,
      leaderboard: true,
      individualExports: true,
      bulkOperations: true
    }
  }
};

// Configuration Management Functions
export const configManager = {
  // Get active jury members
  getActiveJuryMembers: () => {
    return hackathonConfig.juryMembers.filter(jury => jury.isActive);
  },

  // Get active teams
  getActiveTeams: () => {
    return hackathonConfig.teams.filter(team => team.isActive);
  },

  // Get active evaluation criteria
  getActiveEvaluationCriteria: () => {
    return hackathonConfig.evaluationCriteria.filter(criteria => criteria.isActive);
  },

  // Get total maximum marks
  getTotalMaxMarks: () => {
    return configManager.getActiveEvaluationCriteria()
      .reduce((total, criteria) => total + criteria.maxMarks, 0);
  },

  // Update jury member
  updateJuryMember: (id, updates) => {
    const juryIndex = hackathonConfig.juryMembers.findIndex(jury => jury.id === id);
    if (juryIndex !== -1) {
      hackathonConfig.juryMembers[juryIndex] = {
        ...hackathonConfig.juryMembers[juryIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      return true;
    }
    return false;
  },

  // Add new jury member
  addJuryMember: (juryData) => {
    const maxId = Math.max(...hackathonConfig.juryMembers.map(j => j.id), 0);
    const newJury = {
      id: maxId + 1,
      ...juryData,
      addedDate: new Date().toISOString(),
      isActive: true
    };
    hackathonConfig.juryMembers.push(newJury);
    return newJury;
  },

  // Delete jury member
  deleteJuryMember: (id) => {
    const juryIndex = hackathonConfig.juryMembers.findIndex(jury => jury.id === id);
    if (juryIndex !== -1) {
      hackathonConfig.juryMembers.splice(juryIndex, 1);
      // Note: Cleanup of evaluation data should be handled by the calling component
      // to avoid circular imports between config and dataStorage
      return true;
    }
    return false;
  },

  // Update team
  updateTeam: (id, updates) => {
    const teamIndex = hackathonConfig.teams.findIndex(team => team.id === id);
    if (teamIndex !== -1) {
      hackathonConfig.teams[teamIndex] = {
        ...hackathonConfig.teams[teamIndex],
        ...updates,
        lastModified: new Date().toISOString()
      };
      return true;
    }
    return false;
  },

  // Add new team
  addTeam: (teamData) => {
    const maxId = Math.max(...hackathonConfig.teams.map(t => t.id), 0);
    const newTeam = {
      id: maxId + 1,
      ...teamData,
      registrationDate: new Date().toISOString(),
      isActive: true
    };
    hackathonConfig.teams.push(newTeam);
    return newTeam;
  },

  // Delete team
  deleteTeam: (id) => {
    const teamIndex = hackathonConfig.teams.findIndex(team => team.id === id);
    if (teamIndex !== -1) {
      hackathonConfig.teams.splice(teamIndex, 1);
      return true;
    }
    return false;
  },

  // Update evaluation criteria
  updateEvaluationCriteria: (id, updates) => {
    const criteriaIndex = hackathonConfig.evaluationCriteria.findIndex(c => c.id === id);
    if (criteriaIndex !== -1) {
      hackathonConfig.evaluationCriteria[criteriaIndex] = {
        ...hackathonConfig.evaluationCriteria[criteriaIndex],
        ...updates
      };
      return true;
    }
    return false;
  },

  // Delete evaluation criteria
  deleteEvaluationCriteria: (id) => {
    const criteriaIndex = hackathonConfig.evaluationCriteria.findIndex(c => c.id === id);
    if (criteriaIndex !== -1) {
      hackathonConfig.evaluationCriteria.splice(criteriaIndex, 1);
      return true;
    }
    return false;
  },

  // Get session info
  getSessionInfo: () => {
    return hackathonConfig.session;
  },

  // Update session info
  updateSessionInfo: (updates) => {
    hackathonConfig.session = {
      ...hackathonConfig.session,
      ...updates,
      lastModified: new Date().toISOString()
    };
  },

  // Export configuration for backup
  exportConfig: () => {
    return {
      ...hackathonConfig,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
  },

  // Import configuration from backup
  importConfig: (configData) => {
    try {
      // Validate config structure
      if (configData.session && configData.juryMembers && configData.teams && configData.evaluationCriteria) {
        Object.assign(hackathonConfig, configData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }
};

// Backward compatibility exports
export const juryProfiles = configManager.getActiveJuryMembers();
export const teams = configManager.getActiveTeams();
export const evaluationCriteria = configManager.getActiveEvaluationCriteria();

export default hackathonConfig;