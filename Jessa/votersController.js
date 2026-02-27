    static async login(req, res){
        try {
            const {email, password} = req.body;
            const result = await VoterService.login(email, password);
            res.status(200).json(result);
        }
        catch (err) {
            console.error(`Voter login error ${err.message}`);
            res.status(400).json({error: err.message});
        }
    }