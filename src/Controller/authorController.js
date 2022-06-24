// ==========================================Require all mandatory modules and packages===========================================================

const { isValidObjectId } = require("mongoose")
const authorModel = require("../Model/authorModel")


// ========================= check that any key value is empty or whitespace / not by using isValid function================================
// =========================================================================================================================================


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
};



// =============================================================================================================================================
// here using regex for validation mail, basically it's check that mail format is correct or not
// ==============================================================================================================================================


const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
};


// ===============================================================================================================================================
// some field like fname, lname , title this field doesn't contains any type or digit.here i check that string contains digit or not by using regex
// ================================================================================================================================================


const regex = /\d/;
const isVerifyString = function (string) {
    return regex.test(string)
};

// ================================================ ** Write logic create author api **===================================================

const createAuthor = async (req, res) => {
    try {
        let data = req.body

        //deny empty data request {}
        let arrKeys = Object.keys(data);
        if (arrKeys.length == 0) return res.status(400).send({ status: true, msg: "Data is required" })

        //  checking that required key is present or not
        if (!data.fname) return res.status(400).send({ status: false, msg: "fname is required" })
        if (!data.lname) return res.status(400).send({ status: false, msg: "lname is required" })
        if (!data.title) return res.status(400).send({ status: false, msg: "title is required" })
        if (!data.email) return res.status(400).send({ status: false, msg: "email is required" })
        if (!data.password) return res.status(400).send({ status: false, msg: "password is required" })

        // here we are checking that if any field is empty or send data with space 
        if (!isValid(data.fname)) return res.status(400).send({ status: false, msg: "invalid fName" })
        if (!isValid(data.lname)) return res.status(400).send({ status: false, msg: "invalid lName" })
        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "invalid title" })
        if (!isValid(data.email)) return res.status(400).send({ status: false, msg: "email should not be empty" })
        if (!isValid(data.password)) return res.status(400).send({ status: false, msg: "invalid password" })

        // email format is valid or not by using isVerifyString()
        if (!validateEmail(data.email)) return res.status(400).send({ status: false, msg: "invalid email" })
        // fname and lname and title is proper syntax
        if (isVerifyString(data.fname)) return res.status(400).send({ status: false, msg: "fname doesn't contains any digit" })
        if (isVerifyString(data.lname)) return res.status(400).send({ status: false, msg: "lname doesn't contains any digit" })
        if (isVerifyString(data.title)) return res.status(400).send({ status: false, msg: "title doesn't contains any digit" })

        // Email is unique or not
        let isUniqueEmail = await authorModel.findOne({ email: data.email })
        if (isUniqueEmail) return res.status(400).send({ status: false, msg: "email is already exits" })

        // title contains right value or not   enum: ["Mr", "Mrs", "Miss"]
        let arr = ["Mr", "Mrs", "Miss"]
        if (!arr.includes(data.title)) return res.status(400).send({ status: false, msg: "This is not valid value for title" })

     

        // everyting is fine then create data in database and send the responce with satatus 201
        let created = await authorModel.create(data)
        res.status(201).send({ status: true, data: created })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


//=====================================================Export the module==========================================================================
module.exports.createAuthor = createAuthor;
