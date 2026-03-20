const DBService = require('../services/dbService');

class DashboardController {
  static async getStats(req, res) {
    try {
      // Total voters
      const totalVoters = await DBService.read(
        'SELECT COUNT(*) as count FROM voters',
        []
      );

      // Total candidates
      const totalCandidates = await DBService.read(
        'SELECT COUNT(*) as count FROM candidates',
        []
      );

      // Total elections
      const totalElections = await DBService.read(
        'SELECT COUNT(*) as count FROM elections',
        []
      );

      // Total positions
      const totalPositions = await DBService.read(
        'SELECT COUNT(*) as count FROM positions',
        []
      );

      // ✅ FIXED: Count voters who have actually voted (any vote in any election)
      const votedCount = await DBService.read(
        `SELECT COUNT(DISTINCT voter_id) as count FROM votes`,
        []
      );

      // Calculate turnout (percentage of voters who have cast at least one vote)
      const turnout = totalVoters[0].count > 0
        ? Math.round((votedCount[0].count / totalVoters[0].count) * 100)
        : 0;

      // Election statuses count
      const electionStats = await DBService.read(
        `SELECT 
          SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
          SUM(CASE WHEN status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing,
          SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed
         FROM elections`,
        []
      );

      res.status(200).json({
        status: 'success',
        data: {
          total_voters: totalVoters[0].count,
          total_candidates: totalCandidates[0].count,
          total_elections: totalElections[0].count,
          total_positions: totalPositions[0].count,
          turnout_percentage: turnout,
          elections: {
            upcoming: electionStats[0].upcoming || 0,
            ongoing: electionStats[0].ongoing || 0,
            closed: electionStats[0].closed || 0
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
}

module.exports = DashboardController;