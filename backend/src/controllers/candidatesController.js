// src/controllers/candidatesController.js
const CandidatesService = require("../services/candidatesService");
const DBService = require("../services/dbService"); // Add this import

class CandidatesController {
  static async create(req, res) {
    try {
      const { position_id, full_name, party_name, photo_url, status } = req.body;

      const validStatuses = ['Active', 'Withdrawn'];
      const finalStatus = (status && validStatuses.includes(status)) ? status : 'Active';

      const result = await CandidatesService.create(
        position_id, 
        full_name, 
        party_name, 
        photo_url, 
        finalStatus
      );

      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.message.includes("required") || error.message.includes("registered") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const result = await CandidatesService.getAll();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ADD THIS NEW METHOD
  static async getByPosition(req, res) {
    try {
      const position_id = parseInt(req.params.positionId);
      
      if (isNaN(position_id)) {
        return res.status(400).json({ 
          error: "Invalid position ID" 
        });
      }

      // First check if position exists
      const positionExists = await DBService.read(
        `SELECT position_id, position_name FROM positions WHERE position_id = ?`,
        [position_id]
      );

      if (positionExists.length === 0) {
        return res.status(404).json({ 
          error: "Position not found" 
        });
      }

      // Get candidates for this position
      const sql = `
        SELECT 
          candidate_id,
          position_id,
          ballot_number,
          full_name,
          party_name,
          photo_url,
          status,
          created_at
        FROM candidates 
        WHERE position_id = ? 
        ORDER BY ballot_number ASC
      `;
      
      const candidates = await DBService.read(sql, [position_id]);

      res.status(200).json({
        status: "success",
        count: candidates.length,
        data: candidates,
        position: {
          id: positionExists[0].position_id,
          name: positionExists[0].position_name
        }
      });
    } catch (error) {
      console.error("Error in getByPosition:", error);
      res.status(500).json({ 
        error: error.message 
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { position_id, full_name, party_name, photo_url, status } = req.body;

      if (!id) throw new Error("Candidate ID is required");

      const validStatuses = ['Active', 'Withdrawn'];
      const finalStatus = (status && validStatuses.includes(status)) ? status : 'Active';

      const result = await CandidatesService.update(
        id,
        position_id,
        full_name,
        party_name,
        photo_url,
        finalStatus
      );

      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes("required") || 
                         error.message.includes("not found") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) throw new Error("Candidate ID is required");

      await CandidatesService.delete(id);
      res.status(204).send();
    } catch (error) {
      const statusCode = error.message.includes("required") || 
                         error.message.includes("not found") ? 400 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}

module.exports = CandidatesController;