
const express = require('express')
import { Router } from 'express'
import { success, errorResponse } from '../../utils/utils'
const router: Router = express.Router()

export default router.get('/', (req, res) => {
    res.json({data: 'welcome to teamground server :D'})
})

