const PositionsService = require("../services/positionService");

class PositionsController {
  static async getAll(req, res) {
    try {
      const result = await PositionsService.getAll();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getByElection(req, res) {
    try {
      const election_id = parseInt(req.params.electionId);
      
      if (isNaN(election_id)) {
        return res.status(400).json({ 
          error: "Invalid election ID" 
        });
      }

      const result = await PositionsService.getByElection(election_id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const position_id = parseInt(req.params.id);
      
      if (isNaN(position_id)) {
        return res.status(400).json({ 
          error: "Invalid position ID" 
        });
      }

      const result = await PositionsService.getById(position_id);
      
      if (!result.data) {
        return res.status(404).json({ 
          error: "Position not found" 
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { election_id, position_name, max_vote_allowed } = req.body;

      if (!election_id || !position_name) {
        return res.status(400).json({ 
          error: "election_id and position_name are required" 
        });
      }

      const result = await PositionsService.create(
        election_id,
        position_name,
        max_vote_allowed || 1
      );

      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.message.includes("already exists") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const position_id = parseInt(req.params.id);
      const { position_name, max_vote_allowed } = req.body;

      if (!position_name) {
        return res.status(400).json({ 
          error: "position_name is required" 
        });
      }

      const result = await PositionsService.update(
        position_id,
        position_name,
        max_vote_allowed
      );

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const position_id = parseInt(req.params.id);

      const result = await PositionsService.delete(position_id);
      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes("not found") ? 404 : 
                         error.message.includes("candidates") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = PositionsController;