const CandidatesService = require("../services/candidatesService");

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
}

module.exports = CandidatesController;