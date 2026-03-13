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

  static async updateElection(req, res) {
    try {
      const { id } = req.params;
      const { name, election_type_id, start_at, end_at } = req.body;

      if (!id) throw new Error("Election ID is required");

      const result = await ElectionService.update(id, election_type_id, name, start_at, end_at);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes("required") || error.message.includes("not found") ? 400 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  static async deleteElection(req, res) {
    try {
      const { id } = req.params;

      if (!id) throw new Error("Election ID is required");

      await ElectionService.delete(id);
      res.status(204).send();
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }
}


module.exports = ElectionsController;