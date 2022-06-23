const express = require('express')
const authorController = require('../Controller/authorController');
const blogController = require('../Controller/blogController');
const loginController = require('../Controller/login')
const auth = require('../Middleware/auth')
const router = express.Router();


// create Author API
router.post('/authors', authorController.createAuthor)

// created blog API
router.post('/blogs', auth.authentication, auth.isVerifyToken, blogController.createBlog)

// created Get Blogs API
router.get('/blogs', auth.authentication, auth.isVerifyToken, blogController.getBlogs)

// update Blog API  by blogId
router.put('/blogs/:blogId', auth.authentication, auth.isVerifyToken, auth.authorise, blogController.updateBlog)

// created Delete blog by Id API
router.delete("/delete/:blogId", auth.authentication, auth.isVerifyToken, auth.authorise, blogController.deleteById)

// created delte blogs by query params
router.delete('/blogs', auth.authentication, auth.isVerifyToken, auth.authorise, blogController.deleteBlog)


// phase -- II  ---> created Login API
router.post('/login', loginController.login)

module.exports = router;