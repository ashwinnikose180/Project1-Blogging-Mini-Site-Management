
const blogModel = require('../Model/blogsModel')
const authorModel = require('../Model/authorModel')
const mongoose = require("mongoose")
const { query } = require('express');
const jwt = require('jsonwebtoken')
let ObjectId = require('mongoose').Types.ObjectId


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody)
}


// ========================= check that any key value is empty or whitespace / not by using isValid function================================
// =========================================================================================================================================

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


// ================================================ ** Write logic Create Blog api **===================================================


let createBlog = async function (req, res) {
    try {

        let data = req.body;
        let authorId = data.authorId

        //  checking that required key is present or not
        if (!data.title) return res.status(400).send({ status: false, msg: "Title tag is required" })
        if (!data.body) return res.status(400).send({ status: false, msg: "body tag is required" })
        if (!data.category) return res.status(400).send({ status: false, msg: "category tag is required" })
        if (!data.authorId) return res.status(400).send({ status: false, msg: "authorId tag is required" })

        // here we are checking that if any field is empty or send data with space 
        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "title is not empty" })
        if (!isValid(data.body)) return res.status(400).send({ status: false, msg: "body is not empty" })
        if (!isValid(data.category)) return res.status(400).send({ status: false, msg: "category is not empty" })
        if (!isValid(data.authorId)) return res.status(400).send({ status: false, msg: " authorId is not empty" })

        // Author id format is valid or not
        if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).send({ status: false, mess: "Please enter a valid id " })

        // this authorId is present in our db or not
        let isExistsAuthorId = await authorModel.findById(authorId)

        // create blog with real author id 
        let token = req.headers["x-api-key"];
        let decodedToken = jwt.verify(token, "project1")

        let logginUserAuthorId = decodedToken.authorId
        if (logginUserAuthorId != authorId) return res.status(403).send({ status: false, msg: "You are not autherized to create blog with another id" })
        // send the error mess if authorId is not present in db
        if (!isExistsAuthorId) return res.status(400).send({ status: false, msg: "This author id is not present in db" })

        // everyting is fine then create data in database and send the responce with satatus 201
        let newBlogObject = await blogModel.create(data)
        res.status(201).send({ status: true, data: newBlogObject })

    } catch (err) {
        res.status(500).send({ status: false, msg: "Internal problem" })
    }
};



// ================================================ ** Write logic Get Blogs API **===================================================

const getBlogs = async function (req, res) {
    try {
        let query = req.query;
        let filter = {
            isdeleted: false,
            isPublished: true,
            ...query
        };
        if (isValidRequestBody(query)) {
            const { authorId, category, subcategory, tags } = query

            if (isValid(category)) {
                filter['category'] = category.trim()
            }


            // console.log(req.query.authorId)
            if (filter.authorId) {
                let id = filter.authorId.toString();
                if (!isValid(id)) return res.status(400).send({ status: false, msg: "authorId should not be empty" })
            }
            if (isValid(authorId)) {
                filter['authorId'] = authorId
            }


            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filter['tags'] = { $all: tagsArr }
            }
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filter['subcategory'] = { $all: subcatArr }
            }
        }

        let getSpecificBlogs = await blogModel.find(filter);
        if (getSpecificBlogs.length == 0) {
            return res.status(400).send({ status: false, data: "No blogs can be found" });
        }
        else {
            return res.status(200).send({ status: true, data: getSpecificBlogs });
        }
    }
    catch (error) {
        res.status(500).send({ status: false, err: error.message });

    }
}

// ================================================ ** Write logic Update Blog  Api **===================================================


const updateBlog = async function (req, res) {
    try {

        let authorTokenId = req.authorId
        //getting blog Object id from params
        let blogId = req.params.blogId

        if (!ObjectId.isValid(blogId)) {
            return res.status(400).send({ status: false, msg: "Please provide a valid params id" })
        }
        // return res.send({status:false,msg:"Please provide a valid params id"})
        // This blogId is present in db or not
        let blog = await blogModel.findById(blogId);

        if (blog.authorId.toString() !== authorTokenId) return res.status(403).send({ status: false, msg: "you are not autharise for Update anoter person data" })
        //if not present then send error mess
        if (!blog || blog.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "no such blog exists" });
        };

        // getting all the requested data form body for updatation
        let blogData = req.body;


        //check that if this field is available then it's contains right data/ value/content or not
        if (blogData.title) {
            if (!isValid(blogData.title)) return res.status(400).send({ status: false, msg: "title field is not empty" })
        }
        if (blogData.category) {
            if (!isValid(blogData.category)) return res.status(400).send({ status: false, msg: "category field is not empty" })
        }
        if (blogData.tags) {
            if (!isValid(blogData.tags)) return res.status(400).send({ status: false, msg: "tags field is not empty" })
        }
        if (blogData.subcategory) {
            if (!isValid(blogData.subcategory)) return res.status(400).send({ status: false, msg: "subcategory field is not empty" })
        }

        //if everything is fine then update it with new data and time and return updated data in responce with 200 status
        let updateBlog = await blogModel.findOneAndUpdate({ _id: blogId }, {
            $set: { "title": req.body.title, "body": req.body.body, "category": req.body.category, "isPublished": true, "publishedAt": new Date() },
            $push: { "tags": req.body.tags, "subcategory": req.body.subcategory }
        }, { new: true })
        return res.status(200).send({ status: true, data: updateBlog });

    } catch (err) {
        return res.status(500).send({ status: false, msg: "Internal Server Error" })
    }
};




// ================================================ ** Write logic DeleteByID API ** ===================================================

const deleteById = async function (req, res) {

    let blog = req.params.blogId
    let authorTokenId = req.authorId

    if (blog == undefined) {
        return res.status(400).send({ status: false, msg: "blogId must be present in order to delete it" })
    }

    if (!mongoose.Types.ObjectId.isValid(blog)) {
        return res.status(404).send({ status: false, msg: "Please provide a Valid blogId" })
    }
    let fullObject = await blogModel.findById(blog) 

    if (!fullObject) return res.status(400).send({ status: false, msg: "This blog id is not available in database" })
    //autheri.. logic
    if (fullObject.authorId.toString() !== authorTokenId) return res.status(403).send({ status: false, msg: "you are not autharise for Update anoter person data" })




    if (fullObject.isPublished != false && fullObject.isDeleted == false) {
        let newData = await blogModel.updateOne({ _id: blog }, { $set: { "isDeleted": true } })
        res.status(200).send()
    }

    else {
        res.status(400).send({ status: false, msg: "This data is not publised " })
    }
};


// ================================================ ** Write logic for Delete Blog by query params api **=========================================


const deleteBlog = async function (req, res) {
    try {

        let authorTokenId = req.authorId
        let queryAuthorId = req.query.authorId

        let query = req.query;
        let filter = {
            isdeleted: false,
            isPublished: false,
            authorId: authorTokenId,
            
            ...query
        };


       let totalKey= Object.keys(req.query)
        if(totalKey.length==0) return res.status(400).send({status:false, msg:"Please provide a some query for Proper responce"})
        if(req.query.body || req.query.body =='' ) return res.status(400).send({status:false, msg:"You can not delete document by using body"})
       
        if(req.query.title || req.query.title =='' ) return res.status(400).send({status:false, msg:"You can not delete document by using title"})
        
        if(queryAuthorId || queryAuthorId =='')
        {
            if (!mongoose.Types.ObjectId.isValid(queryAuthorId)) {
                return res.status(404).send({ status: false, msg: "Please provide a Valid AuthorId" })
            }
        }
        // this field should not be empty
        if(req.query.tags)
        {
            if(req.query.tags=='' ) return res.status(400).send({ status: false, msg: "Tags field should not be empty" })
        }
   
        if(req.querysubcategory)
        {
            if(req.query.subcategory=='') return res.status(400).send({ status: false, msg: "Subcategory field should not be empty" })

        }
        
        if(req.query.category)
        {
            if(req.query.category=='') return res.status(400).send({ status: false, msg: "category field should not be empty" })

        }

        
        if (filter.blogId) return res.status(400).send({ status: false, msg: "can't find by blogId" })
        if (queryAuthorId) {
            if (queryAuthorId != authorTokenId) return res.status(403).send({ status: false, msg: `you are not Authorise to access data by using this authorId: ${queryAuthorId}` })
        }
        if (isValidRequestBody(query)) {
            const { authorId, category, subcategory, tags } = query

            if (isValid(category)) {
                filter['category'] = category.trim()



            }
            if (isValid(authorId)) {
                filter['authorId'] = authorId
            }

            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filter['tags'] = { $in: tagsArr }

            }
            // in krege to sb mai check krega $all krege to combination mai present hona chahiye 
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
                filter['subcategory'] = { $in: subcatArr }
            }
        }


        let deletedData = await blogModel.updateMany(filter, { $set: { isDeleted: true } })

        res.status(200).send({ status: true, data: deletedData });
    }
    catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
}











// ================================================ ** Exprots all modules here **===================================================

module.exports = {
    getBlogs, createBlog, updateBlog, deleteById, deleteBlog
}

