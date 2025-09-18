const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// GET /api/events - Get all events or active event
router.get('/', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    let events;
    if (status === 'all') {
      events = await Event.find().sort({ createdAt: -1 });
    } else {
      events = await Event.find({ status }).sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// GET /api/events/active - Get the active event with full hierarchy
router.get('/active', async (req, res) => {
  try {
    const activeEvent = await Event.findActiveEvent();
    
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    // Generate updated leaderboard
    activeEvent.generateLeaderboard();
    await activeEvent.save();
    
    res.json({
      success: true,
      data: activeEvent
    });
  } catch (error) {
    console.error('Error fetching active event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active event',
      message: error.message
    });
  }
});

// POST /api/events - Create new event or initialize from config
router.post('/initialize', async (req, res) => {
  try {
    const {
      title = "INTERNAL HACKATHON",
      subtitle = "for Smart India Hackathon",
      year = "2025",
      organization = "Parala Maharaja Engineering College",
      juries = [],
      teams = [],
      evaluationCriteria = []
    } = req.body;

    // Check if active event already exists
    let activeEvent = await Event.findActiveEvent();
    
    if (activeEvent) {
      return res.json({
        success: true,
        message: 'Active event already exists',
        data: activeEvent
      });
    }

    // Create new event with hierarchical structure
    const newEvent = new Event({
      title,
      subtitle,
      year,
      organization,
      evaluationCriteria,
      juries: juries.map(jury => ({
        juryId: jury.id,
        name: jury.name,
        designation: jury.designation,
        department: jury.department,
        email: jury.email,
        phone: jury.phone,
        expertise: jury.expertise,
        isActive: jury.isActive,
        teamEvaluations: teams.map(team => ({
          teamId: team.id,
          teamName: team.name,
          teamMembers: team.members,
          projectTitle: team.projectTitle,
          category: team.category,
          individualMarks: {
            Innovation: { score: 0, maxMarks: 25 },
            Feasibility: { score: 0, maxMarks: 20 },
            Presentation: { score: 0, maxMarks: 15 },
            Impact: { score: 0, maxMarks: 20 },
            'Technical Quality': { score: 0, maxMarks: 20 }
          },
          totalMarks: { score: 0, maxPossible: 100 },
          isSubmitted: false,
          lastModified: new Date()
        })),
        totalTeamsEvaluated: 0,
        averageScore: 0,
        lastActivity: new Date()
      }))
    });

    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event initialized successfully',
      data: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      message: error.message
    });
  }
});

// GET /api/events/active/jury/:juryId - Get active event's specific jury evaluations
router.get('/active/jury/:juryId', async (req, res) => {
  try {
    const { juryId } = req.params;
    
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    const jury = activeEvent.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({
        success: false,
        error: 'Jury not found in active event'
      });
    }

    // Convert team evaluations to the format expected by frontend
    const scores = {};
    jury.teamEvaluations.forEach(team => {
      scores[team.teamId] = {
        Innovation: team.individualMarks.Innovation.score,
        Feasibility: team.individualMarks.Feasibility.score,
        Presentation: team.individualMarks.Presentation.score,
        Impact: team.individualMarks.Impact.score,
        'Technical Quality': team.individualMarks['Technical Quality'].score
      };
    });

    res.json({
      success: true,
      data: {
        event: {
          eventId: activeEvent.eventId,
          title: activeEvent.title,
          subtitle: activeEvent.subtitle,
          year: activeEvent.year,
          evaluationCriteria: activeEvent.evaluationCriteria
        },
        jury: {
          juryId: jury.juryId,
          name: jury.name,
          designation: jury.designation,
          department: jury.department,
          email: jury.email,
          expertise: jury.expertise
        },
        scores: scores,
        lastSaved: jury.lastActivity,
        statistics: {
          totalTeamsEvaluated: jury.totalTeamsEvaluated,
          averageScore: jury.averageScore
        }
      }
    });
  } catch (error) {
    console.error('Error fetching active jury evaluations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jury evaluations',
      message: error.message
    });
  }
});

// GET /api/events/:eventId/jury/:juryId - Get specific jury's evaluations
router.get('/:eventId/jury/:juryId', async (req, res) => {
  try {
    const { eventId, juryId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const jury = event.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({
        success: false,
        error: 'Jury not found'
      });
    }

    res.json({
      success: true,
      data: {
        event: {
          eventId: event.eventId,
          title: event.title,
          subtitle: event.subtitle,
          year: event.year
        },
        jury: {
          juryId: jury.juryId,
          name: jury.name,
          designation: jury.designation,
          department: jury.department,
          teamEvaluations: jury.teamEvaluations,
          statistics: {
            totalTeamsEvaluated: jury.totalTeamsEvaluated,
            averageScore: jury.averageScore,
            lastActivity: jury.lastActivity
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jury evaluations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jury evaluations',
      message: error.message
    });
  }
});

// GET /api/events/active/leaderboard - Get consolidated leaderboard
router.get('/active/leaderboard', async (req, res) => {
  try {
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    const leaderboard = activeEvent.generateLeaderboard();
    await activeEvent.save();
    
    res.json({
      success: true,
      data: {
        leaderboard,
        statistics: activeEvent.statistics,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate leaderboard',
      message: error.message
    });
  }
});

// GET /api/events/active/consolidated - Get consolidated marksheet (similar to localStorage version)
router.get('/active/consolidated', async (req, res) => {
  try {
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    // Generate consolidated data similar to the localStorage version
    const consolidated = {
      teams: [],
      juries: activeEvent.juries.map(jury => ({
        id: jury.juryId,
        name: jury.name,
        designation: jury.designation,
        department: jury.department
      })),
      criteria: activeEvent.evaluationCriteria,
      generatedAt: new Date().toISOString(),
      eventInfo: {
        title: activeEvent.title,
        subtitle: activeEvent.subtitle,
        year: activeEvent.year,
        organization: activeEvent.organization
      }
    };

    // Collect unique teams and their scores
    const teamMap = new Map();
    
    activeEvent.juries.forEach(jury => {
      jury.teamEvaluations.forEach(team => {
        if (!teamMap.has(team.teamId)) {
          teamMap.set(team.teamId, {
            id: team.teamId,
            name: team.teamName,
            members: team.teamMembers,
            projectTitle: team.projectTitle,
            category: team.category,
            scores: {},
            totalScore: 0,
            averageScore: 0,
            juryScores: {},
            submittedJuries: 0
          });
        }

        const teamData = teamMap.get(team.teamId);
        
        if (team.isSubmitted) {
          teamData.submittedJuries++;
          teamData.juryScores[jury.juryId] = {
            juryName: jury.name,
            scores: {
              Innovation: team.individualMarks.Innovation.score,
              Feasibility: team.individualMarks.Feasibility.score,
              Presentation: team.individualMarks.Presentation.score,
              Impact: team.individualMarks.Impact.score,
              'Technical Quality': team.individualMarks['Technical Quality'].score
            },
            total: team.totalMarks.score
          };
          
          teamData.totalScore += team.totalMarks.score;
          
          // Accumulate scores by criteria
          Object.keys(team.individualMarks).forEach(criteria => {
            if (!teamData.scores[criteria]) {
              teamData.scores[criteria] = [];
            }
            teamData.scores[criteria].push(team.individualMarks[criteria].score);
          });
        }
      });
    });

    // Calculate averages and format
    Array.from(teamMap.values()).forEach(team => {
      if (team.submittedJuries > 0) {
        team.averageScore = parseFloat((team.totalScore / team.submittedJuries).toFixed(2));
        
        // Calculate average by criteria
        Object.keys(team.scores).forEach(criteria => {
          const scores = team.scores[criteria];
          const sum = scores.reduce((a, b) => a + b, 0);
          team.scores[criteria] = {
            average: parseFloat((sum / scores.length).toFixed(2)),
            individual: scores
          };
        });
      }
      
      consolidated.teams.push(team);
    });

    // Sort by average score
    consolidated.teams.sort((a, b) => b.averageScore - a.averageScore);
    
    res.json({
      success: true,
      data: consolidated
    });
  } catch (error) {
    console.error('Error generating consolidated marksheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate consolidated marksheet',
      message: error.message
    });
  }
});

module.exports = router;