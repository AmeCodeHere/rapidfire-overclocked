import * as XLSX from 'xlsx';

/**
 * Exports the current leaderboard as CSV or XLSX
 * Sorted highest points to lowest, with Rank, Team Name, and Points.
 * Filename format: rapidfire_leaderboard_YYYY-MM-DD_HHMM.csv / .xlsx
 */
export const downloadLeaderboardFile = (leaderboard = {}, teamOrder = [], format = 'csv') => {
  // Ensure all teams from teamOrder are included even if 0 points
  const teamMap = { ...leaderboard };
  teamOrder.forEach(team => {
    if (teamMap[team] === undefined) {
      teamMap[team] = 0;
    }
  });

  // Convert to array and sort descending by points
  const sortedTeams = Object.entries(teamMap)
    .map(([teamName, points]) => ({
      teamName,
      points: Number(points) || 0
    }))
    .sort((a, b) => b.points - a.points);

  // Generate ranks (handling ties appropriately: 1, 2, 2, 4...)
  let currentRank = 1;
  const rows = sortedTeams.map((item, idx) => {
    if (idx > 0 && item.points < sortedTeams[idx - 1].points) {
      currentRank = idx + 1;
    }
    return {
      "Rank": currentRank,
      "Team Name": item.teamName,
      "Current Points": item.points
    };
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Rank
    { wch: 28 }, // Team Name
    { wch: 16 }  // Current Points
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");

  // Format timestamp: YYYY-MM-DD_HHMM
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `rapidfire_leaderboard_${timestamp}.${format}`;

  if (format === 'csv') {
    XLSX.writeFile(workbook, filename, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
  }

  return filename;
};
