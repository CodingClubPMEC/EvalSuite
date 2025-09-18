const mongoose = require('mongoose');

// Event Schema - Top level of hierarchy
const eventSchema = new mongoose.Schema({
  // Event Information
  eventId: {
    type: String,
    required: true,
    unique: true,
    default: () => `event_${Date.now()}`
  },
  title: {
    type: String,
    required: true,
    default: "INTERNAL HACKATHON"
  },
  subtitle: {
    type: String,
    default: "for Smart India Hackathon"
  },
  year: {
    type: String,
    required: true,
    default: "2025"
  },
  organization: {
    type: String,
    default: "Parala Maharaja Engineering College"
  },
  organizationShort: {
    type: String,
    default: "PMEC"
  },
  systemName: {
    type: String,
    default: "EvalSuite"
  },
  
  // Event Configuration
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  
  // Event Hierarchy - Juries (Second level)
  juries: [{
    juryId: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    expertise: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Teams evaluated by this jury (Third level)
    teamEvaluations: [{
      teamId: {
        type: Number,
        required: true
      },
      teamName: {
        type: String,
        required: true
      },
      teamMembers: [String],
      projectTitle: String,
      category: String,
      
      // Individual marks per criteria (Fourth level)
      individualMarks: {
        Innovation: {
          score: { type: Number, default: 0 },
          maxMarks: { type: Number, default: 25 }
        },
        Feasibility: {
          score: { type: Number, default: 0 },
          maxMarks: { type: Number, default: 20 }
        },
        Presentation: {
          score: { type: Number, default: 0 },
          maxMarks: { type: Number, default: 15 }
        },
        Impact: {
          score: { type: Number, default: 0 },
          maxMarks: { type: Number, default: 20 }
        },
        'Technical Quality': {
          score: { type: Number, default: 0 },
          maxMarks: { type: Number, default: 20 }
        }
      },
      
      // Total marks (Fifth level - calculated field)
      totalMarks: {
        score: { type: Number, default: 0 },
        maxPossible: { type: Number, default: 100 }
      },
      
      // Evaluation metadata
      isSubmitted: {
        type: Boolean,
        default: false
      },
      submittedAt: Date,
      lastModified: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Jury statistics
    totalTeamsEvaluated: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Event-wide statistics
  statistics: {
    totalJuries: { type: Number, default: 0 },
    totalTeams: { type: Number, default: 0 },
    totalEvaluations: { type: Number, default: 0 },
    completedEvaluations: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    
    // Team rankings across all juries
    leaderboard: [{
      teamId: Number,
      teamName: String,
      averageScore: Number,
      totalScore: Number,
      rank: Number
    }]
  },
  
  // Evaluation criteria for reference
  evaluationCriteria: [{
    name: String,
    maxMarks: Number,
    description: String,
    weight: Number
  }],
  
  // Auto-save configuration
  autoSave: {
    enabled: { type: Boolean, default: true },
    interval: { type: Number, default: 2000 },
    lastAutoSave: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware to update statistics before saving
eventSchema.pre('save', function(next) {
  // Calculate total juries
  this.statistics.totalJuries = this.juries.filter(jury => jury.isActive).length;
  
  // Calculate total teams (unique teams across all juries)
  const uniqueTeams = new Set();
  this.juries.forEach(jury => {
    jury.teamEvaluations.forEach(team => {
      uniqueTeams.add(team.teamId);
    });
  });
  this.statistics.totalTeams = uniqueTeams.size;
  
  // Calculate total and completed evaluations
  let totalEvals = 0;
  let completedEvals = 0;
  
  this.juries.forEach(jury => {
    totalEvals += jury.teamEvaluations.length;
    completedEvals += jury.teamEvaluations.filter(team => team.isSubmitted).length;
  });
  
  this.statistics.totalEvaluations = totalEvals;
  this.statistics.completedEvaluations = completedEvals;
  this.statistics.completionPercentage = totalEvals > 0 ? 
    Math.round((completedEvals / totalEvals) * 100) : 0;
  
  // Update jury statistics
  this.juries.forEach(jury => {
    jury.totalTeamsEvaluated = jury.teamEvaluations.filter(team => team.isSubmitted).length;
    
    // Calculate average score for this jury
    const submittedEvals = jury.teamEvaluations.filter(team => team.isSubmitted);
    if (submittedEvals.length > 0) {
      const totalScore = submittedEvals.reduce((sum, team) => sum + team.totalMarks.score, 0);
      jury.averageScore = Math.round((totalScore / submittedEvals.length) * 100) / 100;
    }
    
    // Update total marks for each team evaluation
    jury.teamEvaluations.forEach(team => {
      const marks = team.individualMarks;
      team.totalMarks.score = 
        marks.Innovation.score +
        marks.Feasibility.score +
        marks.Presentation.score +
        marks.Impact.score +
        marks['Technical Quality'].score;
    });
  });
  
  next();
});

// Instance method to get consolidated leaderboard
eventSchema.methods.generateLeaderboard = function() {
  const teamScores = new Map();
  
  // Collect all scores for each team
  this.juries.forEach(jury => {
    jury.teamEvaluations.forEach(team => {
      if (team.isSubmitted) {
        if (!teamScores.has(team.teamId)) {
          teamScores.set(team.teamId, {
            teamId: team.teamId,
            teamName: team.teamName,
            scores: [],
            totalScore: 0,
            averageScore: 0
          });
        }
        teamScores.get(team.teamId).scores.push(team.totalMarks.score);
      }
    });
  });
  
  // Calculate averages and sort
  const leaderboard = Array.from(teamScores.values()).map(team => {
    const totalScore = team.scores.reduce((sum, score) => sum + score, 0);
    const averageScore = team.scores.length > 0 ? totalScore / team.scores.length : 0;
    
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      averageScore: Math.round(averageScore * 100) / 100,
      totalScore: totalScore,
      evaluationCount: team.scores.length
    };
  }).sort((a, b) => b.averageScore - a.averageScore);
  
  // Add ranks
  leaderboard.forEach((team, index) => {
    team.rank = index + 1;
  });
  
  // Update the leaderboard in the document
  this.statistics.leaderboard = leaderboard;
  
  return leaderboard;
};

// Static method to find active event
eventSchema.statics.findActiveEvent = function() {
  return this.findOne({ status: 'active' });
};

module.exports = mongoose.model('Event', eventSchema);