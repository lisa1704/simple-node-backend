const jwt = require("jsonwebtoken")
const {TOKEN_KEY} =process.env;

const verifyToken = async (req, res, next)=>{
    const token = req.body.token || req.query.token || ["x-access-token"];

    //check for the provided token
    if(!token){
        return res.status(403).send("Authentication token is required")
    }
    //verify the token
    try {
        const decodedToken = await jwt.verify(token, TOKEN_KEY)
        req.currentUser = decodedToken;
    } catch (error) {
        return res.status(401).send("invalid Token provided")
    }

    //proceed with request
    return next()
}
module.exports = verifyToken;