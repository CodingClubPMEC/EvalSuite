import * as XLSX from 'xlsx';
import { teams, evaluationCriteria, juryProfiles } from '../data/juryData';

export const exportToExcel = (scores, juryId) => {
  // Find jury information
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));
  const juryName = jury ? jury.name : `Jury ${juryId}`;

  // Prepare data for Excel
  const data = [
    // Header row
    [
      'Team Name',
      'Project Title',
      'Members',
      ...evaluationCriteria.map(c => `${c.name} (${c.maxMarks})`),
      `Total (${evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)})`
    ]
  ];

  // Add team data
  teams.forEach(team => {
    const teamScores = scores[team.id] || {};
    const total = evaluationCriteria.reduce((sum, criteria) => {
      return sum + (teamScores[criteria.name] || 0);
    }, 0);

    data.push([
      team.name,
      team.projectTitle,
      team.members.join(', '),
      ...evaluationCriteria.map(criteria => teamScores[criteria.name] || 0),
      total
    ]);
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { width: 15 }, // Team Name
    { width: 30 }, // Project Title
    { width: 40 }, // Members
    ...evaluationCriteria.map(() => ({ width: 12 })), // Criteria columns
    { width: 10 } // Total
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheet');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `SIH_Marksheet_${juryName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);
};