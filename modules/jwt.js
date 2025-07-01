const jwt = require('jsonwebtoken');

function generateAccessToken(email) {
    return jwt.sign({email}, process.env.TOKEN_SECRET, {expiresIn: '24h'}) 
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (token == null) {
        return res.sendStatus(401).json({result: false, error: 'No token'});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded)=> {
        if (err) {
            return res.sendStatus(403).json({result: false, error: 'Token invalid'});
        }
        req.email = decoded.email;
        next();
    })
}

module.exports = {generateAccessToken, authenticateToken};