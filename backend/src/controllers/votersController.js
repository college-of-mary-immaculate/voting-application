const VoterService = require('../services/voterService');

class VoterController {
    static async register(req, res) {
        try {
            const {fullname, email, password} = req.body;
            const result = await VoterService.create(fullname, email, password);
            res.status(201).json(result);
        }
        catch (err) {
            console.error(`Voter registration error ${err.message}`);
            res.status(400).json({error: err.message});
        }
    }
    static async login(email, password) {
            if(!email || !password) {
                throw new Error('Email and password are required.');
            }
            let sql = `SELECT * FROM voters WHERE email = ?`;
            const user = await DBService.read(sql, [email]);
    
            if (user.length === 0) {
                throw new Error('Invalid email or password.');
            }
    
            const voter = user[0];
            const match = await bcrypt.compare(password, voter.password_hash);
    
            if (!match) {
                throw new Error('Invalid email or password.');
            }
            return {message: "Login successful"};
        }
}

module.exports = VoterController;