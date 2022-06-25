// ================================================ ** Import all required Modules and packages **===================================================

const jwt = require('jsonwebtoken')


const isVerifyToken = function (req, res, next) {

    try {
        let token = req.headers["x-api-key"]
        if (!token) return res.status(401).send({ status: false, msg: "token must be present " })
        let decodedToken = jwt.verify(token, "project1");
        if (!decodedToken) return  res.status(401).send({ status: false, msg: "token is invalid" });
        
        // set author id int the request author
        req.authorId = decodedToken.authorId
        next()
    } catch (err) {
         return res.status(401).send({ status: false, msg: "token is invalid" });
    }
};



//================================================ ** Exprots all modules here ** ===================================================

module.exports = { isVerifyToken }