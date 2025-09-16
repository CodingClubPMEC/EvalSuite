import * as XLSX from 'xlsx';
import { teams, evaluationCriteria, juryProfiles } from '../data/juryData';

export const exportToExcel = (data, identifier) => {
  let workbook, filename;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

  if (data.consolidated) {
    // Handle consolidated marksheet export
    workbook = createConsolidatedWorkbook(data);
    filename = `SIH_Consolidated_Marksheet_${timestamp}.xlsx`;
  } else {
    // Handle individual jury export (legacy support)
    workbook = createIndividualWorkbook(data, identifier);
    const jury = juryProfiles.find(j => j.id === parseInt(identifier));
    const juryName = jury ? jury.name : `Jury_${identifier}`;
    filename = `SIH_Marksheet_${juryName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
  }

  // Save the file
  XLSX.writeFile(workbook, filename);
};

// Create consolidated marksheet workbook
const createConsolidatedWorkbook = (data) => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['INTERNAL HACKATHON - CONSOLIDATED MARKSHEET'],
    ['Parala Maharaja Engineering College'],
    ['Generated:', new Date(data.generatedAt).toLocaleString()],
    [''],
    ['TEAM RANKINGS (by Average Score)'],
    ['Rank', 'Team Name', 'Project Title', 'Average Score', 'Total Evaluators'],
  ];

  data.teams.forEach((team, index) => {
    summaryData.push([
      index + 1,
      team.name,
      team.projectTitle,
      parseFloat(team.averageScore),
      team.submittedJuries
    ]);
  });

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ width: 8 }, { width: 15 }, { width: 35 }, { width: 15 }, { width: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Detailed Sheet with all jury scores
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
  
  const detailedData = [detailedHeaders];
  
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
    detailedData.push(row);
  });
  
  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  detailedSheet['!cols'] = detailedHeaders.map(() => ({ width: 12 }));
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Scores');

  return workbook;
};

// Create individual jury workbook (legacy support)
const createIndividualWorkbook = (scores, juryId) => {
  const jury = juryProfiles.find(j => j.id === parseInt(juryId));
  const juryName = jury ? jury.name : `Jury ${juryId}`;

  const data = [
    ['Team Name', 'Project Title', 'Members', ...evaluationCriteria.map(c => `${c.name} (${c.maxMarks})`), `Total (${evaluationCriteria.reduce((sum, c) => sum + c.maxMarks, 0)})`]
  ];

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

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet['!cols'] = [
    { width: 15 }, { width: 30 }, { width: 40 },
    ...evaluationCriteria.map(() => ({ width: 12 })),
    { width: 10 }
  ];
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheet');

  return workbook;
};
