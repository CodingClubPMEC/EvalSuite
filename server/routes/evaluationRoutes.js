const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// POST /api/evaluations/jury/:juryId - Save jury evaluation scores
const { logger } = require('../utils/logger');

router.post('/jury/:juryId', async (req, res) => {
  try {
    const { juryId } = req.params;
    const { scores, autoSave = false } = req.body;
    
    logger.info(`[START] Processing evaluation submission for jury ${juryId}${autoSave ? ' (auto-save)' : ''}`);
    logger.db('evaluation_submission', { 
      juryId, 
      autoSave, 
      scoresCount: Object.keys(scores).length,
      timestamp: new Date().toISOString(),
      scores: JSON.stringify(scores)
    });

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scores data provided'
      });
    }

    // Find active event
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    // Find jury in the event
    const jury = activeEvent.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({
        success: false,
        error: 'Jury not found in active event'
      });
    }

    logger.info(`[JURY] Found jury ${jury.name} (ID: ${jury.juryId})`);
    
    // Update scores for each team
    Object.keys(scores).forEach(teamId => {
      logger.info(`[TEAM] Processing scores for team ${teamId}`);
      const teamScores = scores[teamId];
      const team = jury.teamEvaluations.find(t => t.teamId === parseInt(teamId));
      
      if (!team) {
        logger.error(`[TEAM] Team ${teamId} not found in jury's evaluation list`);
        return;
      }
      
      if (team && teamScores) {
        // Update individual marks
        if (teamScores.Innovation !== undefined) {
          team.individualMarks.Innovation.score = Math.min(teamScores.Innovation, 25);
        }
        if (teamScores.Feasibility !== undefined) {
          team.individualMarks.Feasibility.score = Math.min(teamScores.Feasibility, 20);
        }
        if (teamScores.Presentation !== undefined) {
          team.individualMarks.Presentation.score = Math.min(teamScores.Presentation, 15);
        }
        if (teamScores.Impact !== undefined) {
          team.individualMarks.Impact.score = Math.min(teamScores.Impact, 20);
        }
        if (teamScores['Technical Quality'] !== undefined) {
          team.individualMarks['Technical Quality'].score = Math.min(teamScores['Technical Quality'], 20);
        }

        // Calculate total marks
        const marks = team.individualMarks;
        team.totalMarks.score = 
          marks.Innovation.score +
          marks.Feasibility.score +
          marks.Presentation.score +
          marks.Impact.score +
          marks['Technical Quality'].score;

        console.log('📊 [DEBUG] Scores after update:', {
          Innovation: team.individualMarks.Innovation.score,
          Feasibility: team.individualMarks.Feasibility.score,
          Presentation: team.individualMarks.Presentation.score,
          Impact: team.individualMarks.Impact.score,
          'Technical Quality': team.individualMarks['Technical Quality'].score,
          Total: team.totalMarks.score
        });

        // Mark as submitted if not auto-save and scores exist
        if (!autoSave && team.totalMarks.score > 0) {
          team.isSubmitted = true;
          team.submittedAt = new Date();
        }
        
        team.lastModified = new Date();
      }
    });

    // Update jury activity
    jury.lastActivity = new Date();
    
    // Update auto-save timestamp if applicable
    if (autoSave) {
      activeEvent.autoSave.lastAutoSave = new Date();
    }

    // Mark nested document as modified so Mongoose will save it
    activeEvent.markModified('juries');
    
    console.log('💾 [DEBUG] Marked juries as modified, saving to database...');

    // Log pre-save state
    logger.db('pre_save_state', {
      eventId: activeEvent._id,
      juryId,
      autoSave,
      modifiedPaths: activeEvent.modifiedPaths()
    });

    // Save the updated event
    try {
      const savedEvent = await activeEvent.save();
      logger.info(`Successfully saved evaluation for jury ${juryId}`);
      logger.db('save_success', {
        eventId: savedEvent._id,
        juryId,
        autoSave,
        savedAt: new Date()
      });
    } catch (saveError) {
      logger.error('Failed to save evaluation', saveError);
      throw saveError;
    }

    res.json({
      success: true,
      message: autoSave ? 'Auto-save completed' : 'Evaluation saved successfully',
      data: {
        juryId: jury.juryId,
        lastSaved: jury.lastActivity,
        totalTeamsEvaluated: jury.totalTeamsEvaluated,
        averageScore: jury.averageScore,
        autoSave: autoSave
      }
    });

  } catch (error) {
    console.error('Error saving evaluation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save evaluation',
      message: error.message
    });
  }
});

// POST /api/evaluations/jury/:juryId/team/:teamId - Save individual team evaluation
router.post('/jury/:juryId/team/:teamId', async (req, res) => {
  try {
    const { juryId, teamId } = req.params;
    const { scores, submit = false } = req.body;

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scores data provided'
      });
    }

    // Find active event
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    // Find jury and team
    const jury = activeEvent.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({
        success: false,
        error: 'Jury not found'
      });
    }

    const team = jury.teamEvaluations.find(t => t.teamId === parseInt(teamId));
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found in jury evaluations'
      });
    }

    // Update individual marks with validation
    const criteria = ['Innovation', 'Feasibility', 'Presentation', 'Impact', 'Technical Quality'];
    const maxMarks = { Innovation: 25, Feasibility: 20, Presentation: 15, Impact: 20, 'Technical Quality': 20 };

    criteria.forEach(criterion => {
      if (scores[criterion] !== undefined) {
        const score = Math.max(0, Math.min(scores[criterion], maxMarks[criterion]));
        team.individualMarks[criterion].score = score;
      }
    });

    // Calculate total marks
    const marks = team.individualMarks;
    team.totalMarks.score = 
      marks.Innovation.score +
      marks.Feasibility.score +
      marks.Presentation.score +
      marks.Impact.score +
      marks['Technical Quality'].score;

    // Handle submission
    if (submit) {
      team.isSubmitted = true;
      team.submittedAt = new Date();
    }

    team.lastModified = new Date();
    jury.lastActivity = new Date();

    // Mark nested document as modified so Mongoose will save it
    activeEvent.markModified('juries');

    await activeEvent.save();

    res.json({
      success: true,
      message: submit ? 'Team evaluation submitted' : 'Team scores updated',
      data: {
        teamId: team.teamId,
        teamName: team.teamName,
        individualMarks: team.individualMarks,
        totalMarks: team.totalMarks,
        isSubmitted: team.isSubmitted,
        lastModified: team.lastModified
      }
    });

  } catch (error) {
    console.error('Error saving team evaluation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save team evaluation',
      message: error.message
    });
  }
});

// GET /api/evaluations/jury/:juryId/status - Get evaluation status for jury
router.get('/jury/:juryId/status', async (req, res) => {
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
        error: 'Jury not found'
      });
    }

    const totalTeams = jury.teamEvaluations.length;
    const submittedTeams = jury.teamEvaluations.filter(team => team.isSubmitted).length;
    const completionPercentage = totalTeams > 0 ? Math.round((submittedTeams / totalTeams) * 100) : 0;

    res.json({
      success: true,
      data: {
        juryId: jury.juryId,
        juryName: jury.name,
        totalTeams,
        submittedTeams,
        pendingTeams: totalTeams - submittedTeams,
        completionPercentage,
        averageScore: jury.averageScore,
        lastActivity: jury.lastActivity,
        teams: jury.teamEvaluations.map(team => ({
          teamId: team.teamId,
          teamName: team.teamName,
          totalScore: team.totalMarks.score,
          isSubmitted: team.isSubmitted,
          submittedAt: team.submittedAt,
          lastModified: team.lastModified
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching evaluation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch evaluation status',
      message: error.message
    });
  }
});

// GET /api/evaluations/status - Get overall evaluation status
router.get('/status', async (req, res) => {
  try {
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    const juriesStatus = activeEvent.juries.map(jury => {
      const totalTeams = jury.teamEvaluations.length;
      const submittedTeams = jury.teamEvaluations.filter(team => team.isSubmitted).length;
      
      return {
        juryId: jury.juryId,
        juryName: jury.name,
        designation: jury.designation,
        department: jury.department,
        totalTeams,
        submittedTeams,
        completionPercentage: totalTeams > 0 ? Math.round((submittedTeams / totalTeams) * 100) : 0,
        averageScore: jury.averageScore,
        lastActivity: jury.lastActivity,
        isComplete: submittedTeams === totalTeams && totalTeams > 0
      };
    });

    const overallStats = activeEvent.statistics;

    res.json({
      success: true,
      data: {
        event: {
          title: activeEvent.title,
          subtitle: activeEvent.subtitle,
          year: activeEvent.year,
          status: activeEvent.status
        },
        overallStatistics: overallStats,
        juriesStatus,
        summary: {
          totalJuries: juriesStatus.length,
          completedJuries: juriesStatus.filter(jury => jury.isComplete).length,
          overallCompletion: overallStats.completionPercentage,
          lastUpdated: activeEvent.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching overall status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch evaluation status',
      message: error.message
    });
  }
});

// POST /api/evaluations/autosave/:juryId - Auto-save endpoint
router.post('/autosave/:juryId', async (req, res) => {
  try {
    const { juryId } = req.params;
    const { scores } = req.body;

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid scores data provided'
      });
    }

    // Find active event
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({
        success: false,
        error: 'No active event found'
      });
    }

    // Find jury in the event
    const jury = activeEvent.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({
        success: false,
        error: 'Jury not found in active event'
      });
    }

    // Update scores for each team (auto-save mode)
    Object.keys(scores).forEach(teamId => {
      const teamScores = scores[teamId];
      const team = jury.teamEvaluations.find(t => t.teamId === parseInt(teamId));
      
      if (team && teamScores) {
        // Update individual marks
        if (teamScores.Innovation !== undefined) {
          team.individualMarks.Innovation.score = Math.min(teamScores.Innovation, 25);
        }
        if (teamScores.Feasibility !== undefined) {
          team.individualMarks.Feasibility.score = Math.min(teamScores.Feasibility, 20);
        }
        if (teamScores.Presentation !== undefined) {
          team.individualMarks.Presentation.score = Math.min(teamScores.Presentation, 15);
        }
        if (teamScores.Impact !== undefined) {
          team.individualMarks.Impact.score = Math.min(teamScores.Impact, 20);
        }
        if (teamScores['Technical Quality'] !== undefined) {
          team.individualMarks['Technical Quality'].score = Math.min(teamScores['Technical Quality'], 20);
        }

        // Calculate total marks
        const marks = team.individualMarks;
        team.totalMarks.score = 
          marks.Innovation.score +
          marks.Feasibility.score +
          marks.Presentation.score +
          marks.Impact.score +
          marks['Technical Quality'].score;

        // Don't mark as submitted for auto-save
        team.lastModified = new Date();
      }
    });

    // Update jury activity and auto-save timestamp
    jury.lastActivity = new Date();
    activeEvent.autoSave.lastAutoSave = new Date();

    // Mark nested document as modified so Mongoose will save it
    activeEvent.markModified('juries');
    activeEvent.markModified('autoSave');

    // Save the updated event
    await activeEvent.save();

    res.json({
      success: true,
      message: 'Auto-save completed',
      timestamp: new Date().toISOString(),
      data: {
        juryId: jury.juryId,
        lastAutoSave: activeEvent.autoSave.lastAutoSave
      }
    });

  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({
      success: false,
      error: 'Auto-save failed',
      message: error.message
    });
  }
});



// GET /api/evaluations/jury/:juryId/download - Download jury evaluation results as CSV
const { Parser } = require('json2csv');
router.get('/jury/:juryId/download', async (req, res) => {
  try {
    const { juryId } = req.params;
    const activeEvent = await Event.findActiveEvent();
    if (!activeEvent) {
      return res.status(404).json({ success: false, error: 'No active event found' });
    }
    const jury = activeEvent.juries.find(j => j.juryId === parseInt(juryId));
    if (!jury) {
      return res.status(404).json({ success: false, error: 'Jury not found' });
    }
    const data = jury.teamEvaluations.map(team => ({
      TeamID: team.teamId,
      TeamName: team.teamName,
      ProjectTitle: team.projectTitle,
      Category: team.category,
      Innovation: team.individualMarks.Innovation.score,
      Feasibility: team.individualMarks.Feasibility.score,
      Presentation: team.individualMarks.Presentation.score,
      Impact: team.individualMarks.Impact.score,
      TechnicalQuality: team.individualMarks['Technical Quality'].score,
      TotalMarks: team.totalMarks.score,
      IsSubmitted: team.isSubmitted,
      SubmittedAt: team.submittedAt,
      LastModified: team.lastModified
    }));
    const fields = [
      'TeamID', 'TeamName', 'ProjectTitle', 'Category',
      'Innovation', 'Feasibility', 'Presentation', 'Impact', 'TechnicalQuality',
      'TotalMarks', 'IsSubmitted', 'SubmittedAt', 'LastModified'
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`jury_${juryId}_evaluations.csv`);
    return res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to generate CSV', message: error.message });
  }
});

module.exports = router;