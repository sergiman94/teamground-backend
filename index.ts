
import db from './src/database/index'
import morgan from 'morgan'
import express from 'express'
import router from './src/routes'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
const figlet = require('figlet');
const server = express()
const http = require('http').createServer(server)
import * as dotenv from "dotenv"

// init env variables
dotenv.config()

// connect to db 
db(process.env.DB_URL)

// server config and settings
server.set('port', process.env.PORT || 3000)
server.use(morgan('dev'))
server.use(express.urlencoded({extended:false}))
server.use(express.json())
server.use(cors())
server.use(session({
    secret: "secretcode",
    resave: false,
    saveUninitialized: false
}))

// passport init
server.use(passport.initialize())
server.use(passport.session())

// router init 
router(server)

// server init
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
