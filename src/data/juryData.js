// Re-export from the new configuration system for backward compatibility
import { configManager } from '../config/hackathonConfig';

export const juryProfiles = configManager.getActiveJuryMembers();
export const teams = configManager.getActiveTeams();
export const evaluationCriteria = configManager.getActiveEvaluationCriteria();
