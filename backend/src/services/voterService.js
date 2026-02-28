const DBService = require('./dbService');
const bcrypt = require('bcrypt');
class VoterService {
    static async create(fullname, email, password) {
        if(!fullname || !email || !password) {
            throw new Error('All fields are required.');
        }

        let sql = `SELECT * FROM voters WHERE email = ?`;
        const exist = await DBService.read(sql, [email]);

        if(exist.length > 0) {
            throw new Error('This email is already reagistred.');
        }

        const saltRounds = 10;
        const hashedPwd = await bcrypt.hash(password, saltRounds);

        let inputs = `INSERT INTO voters (full_name, email, password_hash)
                VALUES (?, ?, ?)`;
        await DBService.write(inputs, [fullname, email, hashedPwd]);

        return {message: "Voter Registered Successfully"};
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
            return {
                status: 'success',
                message: "Login successful"
            };
        }
}

module.exports = VoterService;