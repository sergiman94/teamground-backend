const express = require('express')
import {Request, Response, Router} from 'express'
import { Promos } from '../models/promos/promos.model'
import promosService from '../../src/api/services/promos/promos.service'
import {success, errorResponse} from '../api/utils/utils'

const router: Router = express.Router()
const bcrypt = require('bcrypt')

/** list*/
router.get('/', async (req, res) => {
    try {
        let items = await promosService.list()
        success(res, items, 200)
    } catch (error) {
        console.log(`Error with promos list service --> ${error}`)
        errorResponse(req, res,`Error with promos list service`, 500, error)
    }
})

/** create */
router.post('/', async (req, res) => {
    try {
        let item = new Promos(req.body)
        let itemCreated = await promosService.create(item)
        success(res, itemCreated, 200)
    } catch (error) {
        console.log(`Error with promos create service ${error}`)
        errorResponse(req, res,`Error with promos create service`, 500, error)
    }
})

/** get by id */
router.get('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item = await promosService.get(itemKey)
        success(res, item, 200)
    } catch (error) {
        console.log(`Error with promos get service ${error}`)
        errorResponse(req, res,`Error with promos get service`, 500, error)
    }
})

/** update by id*/
router.put('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let item = new Promos(req.body)
        let itemUpdated = await promosService.update(itemKey, item)
        success(res, itemUpdated, 200)
    } catch (error) {
        console.log(`Error with promos update service ${error}`)
        errorResponse(req, res,`Error with promos update service`, 500, error)
    }
})

/** delete by id*/
router.delete('/:id', async (req, res) => {
    try {
        let itemKey = req.params.id || ''
        let itemDeleted = await promosService.delete(itemKey)
        success(res, itemDeleted, 200)
    } catch (error) {
        console.log(`Error with promos delete service ${error}`)
        errorResponse(req, res,`Error with promos delete service`, 500, error)
    }
})

export default router
