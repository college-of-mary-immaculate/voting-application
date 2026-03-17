const AdminService = require("../services/adminService");
const asyncHandler = require("../utils/asyncHandler");

class AdminController {
  static getAll = asyncHandler(async (req, res) => {
    const result = await AdminService.getAll();
    res.json(result);
  });

  static getById = asyncHandler(async (req, res) => {
    const result = await AdminService.getById(req.params.id);
    res.json(result);
  });

  static create = asyncHandler(async (req, res) => {
    const result = await AdminService.create(req.body);
    res.status(201).json(result);
  });

  static update = asyncHandler(async (req, res) => {
    const result = await AdminService.update(req.params.id, req.body);
    res.json(result);
  });

  static delete = asyncHandler(async (req, res) => {
    const result = await AdminService.delete(req.params.id);
    res.json(result);
  });

  static assignVoter = asyncHandler(async (req, res) => {
    const { voter_id, election_id } = req.body;

    if (!voter_id || !election_id) {
      return res.status(400).json({
        status: "error",
        message: "voter_id and election_id are required",
      });
    }

    const result = await AdminService.assignVoterToElection(
      Number(voter_id),
      Number(election_id),
    );

    res.json(result);
  });

  static bulkAssignVoters = asyncHandler(async (req, res) => {
    const election_id = req.params.electionId;
    const {voter_ids } = req.body;

    if (!election_id || !Array.isArray(voter_ids)) {
      return res.status(400).json({
        status: "error",
        message: "election_id and voter_ids (array) are required",
      });
    }

    const result = await AdminService.bulkAssignVotersToElection(
      Number(election_id),
      voter_ids,
    );

    res.json(result);
  });
}

module.exports = AdminController;
