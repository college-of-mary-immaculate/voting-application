const ElectionService = require("../services/electionService");

class ElectionsController {
  static async createElection(req, res) {
    const { name, election_type_id, start_at, end_at } = req.body;
    const result = await ElectionService.create(election_type_id, name, start_at, end_at);
    res.status(201).json(result);
  }

  static async getElections(req, res) {
    const result = await ElectionService.getAll();
    res.status(200).json(result);
  }
}

module.exports = ElectionsController;