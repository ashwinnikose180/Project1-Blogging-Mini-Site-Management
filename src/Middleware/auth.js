// ================================================ ** Import all required Modules and packages **===================================================

const jwt = require('jsonwebtoken')
const blogModel = require('../Model/blogModel')


// Here checked that token is present in header or not
const authentication = function (req, res, next) {

    if (!(req.headers["x-api-key"])) {
        return res.status(401).send({ status: false, msg: "token must be present" })
    }
 
    next()

};

// Here checked that which token is present in header, it's valid or not 
const isVerifyToken = function (req, res, next) {
    let token = req.headers["x-api-key"]
    try {
        let decodedToken = jwt.verify(token, "project1");
        if (!decodedToken) {
            res.status(401).send({ status: false, msg: "token is invalid" });
        }
         next()
    } catch (err) {
        res.status(401).send({ status: false, msg: "token is invalid" });
    }
};

// This is a authorisezation Middleware
const authorise = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) return res.status(401).send({ status: false, msg: "token must be present " })
        let decodedToken = jwt.verify(token, "project1")

        let userToBeModified = req.params.blogId

        let blogData = await blogModel.findById(userToBeModified)
        if(!blogData) return res.status(401).send({ status: false, msg: "Invalid Blog Id" })
      
        let userLoggedIn = decodedToken.authorId
    
        // convert objectId to String
       let authorId = blogData.authorId.toString()
        if ( authorId!= userLoggedIn)
            return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }

    next()
};

// ================================================ ** Exprots all modules here **===================================================

module.exports = { authentication, authorise, isVerifyToken }