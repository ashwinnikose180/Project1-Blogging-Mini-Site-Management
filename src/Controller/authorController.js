
const { isValidObjectId } = require("mongoose")
const authorModel = require("../Model/authorModel")

// ---------------------***----------createAuthor--------------***------------------//

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};

// for email formate verification
const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }

};

// for digit checking in string
const regex = /\d/;
const isVerifyString = function (string) {
    return regex.test(string)
}



// handle 400 error 
const createAuthor = async (req, res) => {
    try {
        let data = req.body
        //validation 
        if (data.fname == undefined) return res.status(400).send({ status: false, msg: "fName is required" })
        if (data.lname == undefined) return res.status(400).send({ status: false, msg: "lName is required" })
        if (data.title == undefined) return res.status(400).send({ status: false, msg: "title is required" })
        if (data.email == undefined) return res.status(400).send({ status: false, msg: "email is required" })
        if (data.password == undefined) return res.status(400).send({ status: false, msg: "password is required" })

        // here we are checking that if any field is empty or send data with space
        if (!isValid(data.fname)) return res.status(400).send({ status: false, msg: "invalid fName" })
        if (!isValid(data.lname)) return res.status(400).send({ status: false, msg: "invalid lName" })
        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "invalid title" })
        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "email is not empty" })
        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "invalid password" })

        // email format is valid or not
        if (!validateEmail(data.email)) return res.status(400).send({ status: false, msg: "invalid email" })
        // fname and lname and title is proper syntax
        if (isVerifyString(data.fname)) return res.status(400).send({ status: false, msg: "fname doesn't contains any digit" })
        if (isVerifyString(data.lname)) return res.status(400).send({ status: false, msg: "lname doesn't contains any digit" })
        if (isVerifyString(data.title)) return res.status(400).send({ status: false, msg: "title doesn't contains any digit" })

        // email is unique or not
        let isUniqueEmail = await authorModel.findOne({ email: data.email })
        if (isUniqueEmail) return res.status(400).send({ status: false, msg: "already exits" })
        // title contains right value or not 
       

        let arrKeys = Object.keys(data);
        if (arrKeys.length == 0) return res.status(400).send({ status: true, msg: "Data is required" })
        let created = await authorModel.create(data)
        res.status(201).send({ status: true, data: created })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createAuthor = createAuthor;
