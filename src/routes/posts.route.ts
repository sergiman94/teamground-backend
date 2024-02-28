const express = require('express')
import {Request, Response, Router} from 'express'
import postsService from '../../src/api/services/posts/posts.service'
import {success, errorResponse} from '../api/utils/utils'
import { PostJSON, Posts } from '../models/posts/posts.model'
const router: Router = express.Router()
const bcrypt = require('bcrypt')

/** list posts */
// TODO: don't use reverse() this should be with the timestamp of the creation
router.get('/', async (req, res) => {
    try {
        let items = (await postsService.list(req.query)).reverse()
        let limit = 12
        let page = Number(req.query.page) || 1
        let paginated = items.slice((page - 1) * limit, page * limit);
        success(res, paginated, 200, limit, paginated.length, page, items.length)
    } catch (error) {
        console.log(`Error with posts list service --> ${error}`)
        errorResponse(req, res,`Error with posts list service`, 500, error)
    }
})

/** list post by owner */
router.get('/owner/:id', async (req, res) => {
    try {
        let userId = req.params.id || '-'
        let items = (await postsService.list(req.query)).reverse()
        let ownerItems = items.filter((post:PostJSON) => post.owner === userId)

        let page = Number(req.query.page) || 1
        let paginated = ownerItems.slice((page - 1) * 12, page * 12);
        success(res, paginated, 200, 12, paginated.length, page, items.length)
    } catch (error) {
        console.log(`Error with posts list service --> ${error}`)
        errorResponse(req, res, `Error with posts list service`, 500, error)
    }
})

/** create post */
router.post('/', async (req, res) => {
    try {
        let item = new Posts(req.body)
        let itemCreated = await postsService.create(item)
        success(res, itemCreated, 200)
    } catch (error) {
        console.log(`Error with post create service ${error}`)
        errorResponse(req, res,`Error with post create service`, 500, error)
    }
})

/** Add comment to post */
router.post('/comment/:id', async (req, res) => {
    try {
        let postId = req.params.id
        let newComment = req.body.comment
        let post: PostJSON = await postsService.get(postId)

        post.comments = [...post.comments, newComment]

        let itemUpdated = await postsService.update(post.key, post)
        success(res, itemUpdated, 200)
        
    } catch (error) {
        console.log(`Error adding comment to post ${error}`)
        errorResponse(req, res, `Error adding comment to post ${error}`, 500, error)
    }
})

/** add like to post */
router.put('/like/:id', async (req, res) => {
    try {
        let postId = req.params.id
        let userLike = req.body.userId
        let post: PostJSON = await postsService.get(postId)

        // TODO: improve this error in server
        if (post.likes.filter((value) => value === userLike).length > 0) {
          var index = post.likes.indexOf(userLike);
          if (index !== -1) {
            post.likes.splice(index, 1)
            await postsService.update(post.key, post)
          }
        } else { 
            post.likes = [...post.likes, userLike]
            let itemUpdated = await postsService.update(post.key, post)
            success(res, itemUpdated, 200)
        }


    } catch (error) {
        console.log(`Error adding like to post ${error}`)
        errorResponse(req, res, `Error adding like to post ${error}`, 500, error)
    }
})

/** get post by id */
router.get('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item = await postsService.get(itemKey)
        success(res, item, 200)
    } catch (error) {
        console.log(`Error with posts get service ${error}`)
        errorResponse(req, res,`Error with posts get service`, 500, error)
    }
})

/** update post by id */
router.put('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item = new Posts(req.body)
        let itemUpdated = await postsService.update(itemKey, item)
        success(res, itemUpdated, 200)
    } catch (error) {
        console.log(`Error with posts update service ${error}`)
        errorResponse(req, res,`Error with posts update service`, 500, error)
    }
})

/** delete post by id */
router.delete('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let itemDeleted = await postsService.delete(itemKey)
        success(res, itemDeleted, 200)
    } catch (error) {
        console.log(`Error with posts delete service ${error}`)
        errorResponse(req, res,`Error with posts delete service`, 500, error)
    }
})

export default router
