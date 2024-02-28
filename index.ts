/***
 *  
 * System is only working with version greater than Node 16.x
 * 
 */

/** imports */
import db from './src/database/index'
import morgan from 'morgan'
import express, { application } from 'express'
import router from './src/routes'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import * as passportConfig from './src/api/utils/passportConfig'
import cookieParser from 'cookie-parser'

var figlet = require('figlet');

/** declarations */
const server = express()
const http = require('http').createServer(server)

/** socket config */
const app = express()
var socketServer = app.listen(3001)
var io = require('socket.io')().listen(socketServer)

/** connect to remote dev database */
// mongodb+srv://...

let localURI = "mongodb://localhost:27017/sbox"
let regularURI = "mongodb+srv:/.."
let modifiedURI = 'mongodb://...'
db(modifiedURI)

/** server settings */
server.set('port', process.env.PORT || 3000)
server.use(morgan('dev'))
server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.use(cors())
//server.use(cookieParser("secretCode"))
server.use(session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: false
}))
server.use(passport.initialize())
server.use(passport.session())
/** router and middleware */
router(server)
/** server listening */
http.listen(process.env.PORT || 3000, () => {
    figlet('Vortex Labs', function(err, data) {
        if (err) {
            console.log('Something went wrong with figlet...');
            console.dir(err);
            return;
        }
    });
    console.log(`--------- server listen on port ${server.get('port')} ------- `)    
});
