

const mongoose = require("mongoose")
const { query } = require('express');
const authorModel = require('../Model/authorModel')
const blogModel = require('../Model/blogModel')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody)
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


// title body ,category author id

let createBlog = async function (req, res) {
    try {
        let data = req.body;
        let authorId = data.authorId
        console.log(data)
        if (data.title == undefined) return res.status(400).send({ status: false, msg: "Title tag is required" })
        if (data.body == undefined) return res.status(400).send({ status: false, msg: "body tag is required" })
        if (data.category == undefined) return res.status(400).send({ status: false, msg: "category tag is required" })
        if (data.authorId == undefined) return res.status(400).send({ status: false, msg: "authorId tag is required" })

        if (!isValid(data.title)) return res.status(400).send({ status: false, msg: "title is not empty" })
        if (!isValid(data.body)) return res.status(400).send({ status: false, msg: "body is not empty" })
        if (!isValid(data.category)) return res.status(400).send({ status: false, msg: "category is not empty" })
        if (!isValid(data.authorId)) return res.status(400).send({ status: false, msg: " authorId is not empty" })
        if (!mongoose.Types.ObjectId.isValid(authorId)) return res.status(400).send({ status: false, mess: "Please enter a valid id " })

        let isExistsAuthorId = await authorModel.findById(authorId)
        if (!isExistsAuthorId) return res.status(400).send({ status: false, msg: "This author id is not present in db" })

        let newBlogObject = await blogModel.create(data)
        res.status(201).send({ status: true, data: newBlogObject })
    } catch (err) {
        res.status(500).send({ status: false, msg: "Internal problem" })
    }
}


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








const updateBlog = async function (req, res) {
    try {
        let blogId = req.params.blogId


        let blog = await blogModel.findById(blogId);

        if (!blog || blog.isdeleted == true) {
            return res.status(404).send({ status: false, msg: "no such blog exists" });
        };

        let blogData = req.body;
        // if(blogData.title)
        // {

        // }
        let updateBlog = await blogModel.findOneAndUpdate({ _id: blogId }, blogData);
        return res.status(200).send({ status: true, data: updateBlog });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Internal Server Error" })
    }
};






// delete By Id --> path params
const deleteById = async function (req, res) {

    let blog = req.params.blogId

    if (!blog) {
        return res.status(400).send({ status: false, msg: "blogId must be present in order to delete it" })
    }

    if (!mongoose.Types.ObjectId.isValid(blog)) {
        return res.status(404).send({ status: false, msg: "Please provide a Valid blogId" })
    }
    let fullObject = await blogModel.findById(blog)

    if (fullObject.isPublished != false && fullObject.isdeleted == false) {
        let newData = await blogModel.findByIdAndUpdate(blog, { $set: { isdeleted: true } })
        res.status(200).send()
    }

    else {
        res.status(400).send({ status: false, msg: "This data is not publised " })
    }
};






const deleteBlog = async function (req, res) {
    try {
        let queryData = req.query

        let filter = {
            isdeleted: false,
            isPublished: true,
            ...queryData
        };
        const { authorId, category, subcategory, tags } = queryData
        if (category) {
            let verifyCategory = await blogModel.findOne({ category: category })
            if (!verifyCategory) {
                return res.status(404).send({ status: false, msg: 'No blogs in this category exist' })
            }
        }
        if (authorId) {
            let verifyCategory = await blogModel.findOne({ authorId: authorId })
            if (!verifyCategory) {
                return res.status(404).send({ status: false, msg: 'author id is not exists' })
            }
        }
        if (tags) {

            if (!await blogModel.find({ tags: tags })) {
                return res.status(404).send({ status: false, msg: 'no blog with this tags exist' })
            }
        }

        if (subcategory) {

            if (!await blogModel.exists(subcategory)) {
                return res.status(404).send({ status: false, msg: 'no blog with this subcategory exist' })
            }
        }

        let getSpecificBlogs = await blogModel.find(filter);

        if (getSpecificBlogs.length == 0) {
            return res.status(404).send({ status: false, msg: "No blogs can be found" });
        }


        let deletedData = await blogModel.updateMany({ $set: { isdeleted: true } })
        res.status(200).send({ status: true, data: deletedData });


    }
    catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }


};



module.exports = {
    getBlogs, deleteBlog, createBlog, updateBlog, deleteById
}

