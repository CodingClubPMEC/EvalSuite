// Lazy import ExcelJS and file-saver to reduce initial bundle size
const importExcelJS = () => import('exceljs');
const importFileSaver = () => import('file-saver');

import { configManager } from '../config/hackathonConfig';

export const exportToExcel = async (data, identifier) => {
  // Get dynamic data
  const teams = configManager.getActiveTeams();
  const evaluationCriteria = configManager.getActiveEvaluationCriteria();
  const juryProfiles = configManager.getActiveJuryMembers();
  
  // Dynamically import ExcelJS and FileSaver only when needed
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
    importExcelJS(),
    importFileSaver()
  ]);

  let workbook, filename;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  if (data.consolidated) {
    // Handle consolidated marksheet export
    workbook = await createConsolidatedWorkbook(data, ExcelJS, evaluationCriteria);
    filename = `SIH_Consolidated_Marksheet_${timestamp}.xlsx`;
  } else {
    // Handle individual jury export (legacy support)
    workbook = await createIndividualWorkbook(data, identifier, ExcelJS, teams, evaluationCriteria);
    const jury = juryProfiles.find(j => j.id === parseInt(identifier));
    const juryName = jury ? jury.name : `Jury_${identifier}`;
    filename = `SIH_Marksheet_${juryName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
  }

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, filename);
};

// Create consolidated marksheet workbook
const createConsolidatedWorkbook = async (data, ExcelJS, evaluationCriteria) => {
  const workbook = new ExcelJS.Workbook();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  
  // Add header rows
  summarySheet.addRow(['INTERNAL HACKATHON - CONSOLIDATED MARKSHEET']);
  summarySheet.addRow(['Parala Maharaja Engineering College']);
  summarySheet.addRow(['Generated:', new Date(data.generatedAt).toLocaleString()]);
  summarySheet.addRow([]);
  summarySheet.addRow(['TEAM RANKINGS (by Average Score)']);
  summarySheet.addRow(['Rank', 'Team Name', 'Project Title', 'Average Score', 'Total Evaluators']);
  
  // Add team data
  data.teams.forEach((team, index) => {
    summarySheet.addRow([
      index + 1,
      team.name,
      team.projectTitle,
      parseFloat(team.averageScore),
      team.submittedJuries
    ]);
  });

  // Set column widths
  summarySheet.columns = [
    { width: 8 }, { width: 15 }, { width: 35 }, { width: 15 }, { width: 15 }
  ];

  // Detailed Sheet with all jury scores
  const detailedSheet = workbook.addWorksheet('Detailed Scores');
  
  const detailedHeaders = [
    'Rank', 'Team Name', 'Project Title', 'Members'
  ];
  
  // Add criteria average columns
  evaluationCriteria.forEach(criteria => {
    detailedHeaders.push(`${criteria.name} (Avg)`);
  });
  
  // Add individual jury columns
  data.juries.forEach(jury => {
    evaluationCriteria.forEach(criteria => {
      detailedHeaders.push(`${jury.name} - ${criteria.name}`);
    });
    detailedHeaders.push(`${jury.name} - Total`);
  });
  
  detailedHeaders.push('Overall Average', 'Total Evaluators');
  
  // Add headers to sheet
  detailedSheet.addRow(detailedHeaders);
  
  // Add team data
  data.teams.forEach((team, index) => {
    const row = [
      index + 1,
      team.name,
      team.projectTitle,
      team.members.join(', ')
    ];
    
    // Add criteria averages
    evaluationCriteria.forEach(criteria => {
      row.push(parseFloat(team.scores[criteria.name]?.average || 0));
    });
    
    // Add individual jury scores
    data.juries.forEach(jury => {
      const juryScore = team.juryScores[jury.id];
      if (juryScore) {
        evaluationCriteria.forEach(criteria => {
          row.push(juryScore.scores[criteria.name] || 0);
        });
        row.push(juryScore.total);
      } else {
        // Jury didn't evaluate this team
        evaluationCriteria.forEach(() => row.push('N/A'));
        row.push('N/A');
      }
    });
    
    row.push(parseFloat(team.averageScore), team.submittedJuries);
    detailedSheet.addRow(row);
  });
  
  // Set column widths
  detailedSheet.columns = detailedHeaders.map(() => ({ width: 12 }));

  return workbook;
};

// Create individual jury workbook (legacy support)
const createIndividualWorkbook = async (scores, juryId, ExcelJS, teams, evaluationCriteria) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Marksheet');
  
  // Add header row
  const headers = ['Team Name', 'Project Title', 'Members', 
    ...evaluationCriteria.map(c => `${c.name} (${c.maxMarks})`), 
    `Total (${evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)})`
  ];
  worksheet.addRow(headers);

  // Add team data
  teams.forEach(team => {
    const teamScores = scores[team.id] || {};
    const total = evaluationCriteria.reduce((sum, criteria) => {
      return sum + (teamScores[criteria.name] || 0);
    }, 0);

    worksheet.addRow([
      team.name,
      team.projectTitle,
      team.members.join(', '),
      ...evaluationCriteria.map(criteria => teamScores[criteria.name] || 0),
      total
    ]);
  });

  // Set column widths
  worksheet.columns = [
    { width: 15 }, { width: 30 }, { width: 40 },
    ...evaluationCriteria.map(() => ({ width: 12 })),
    { width: 10 }
  ];

  return workbook;
};
