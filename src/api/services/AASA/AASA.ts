
const express = require('express')
import { Router } from 'express'
const router: Router = express.Router()
const aasa = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "TJQ9GW4U34.com.teamground",
        paths: ["/","*"],
      },
    ],
  },
};
export default router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(aasa)
})

