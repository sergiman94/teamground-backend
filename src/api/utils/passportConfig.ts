import passport from "passport";
import passportLocal from "passport-local"
import GoogleStrategy from "passport-google-oauth20"
import TwitterStrategy from "passport-twitter"
import UsersDAO from "../../dao/usersDAO";
import {Request, Response, Router, NextFunction} from 'express'
import bcrypt from 'bcrypt'
import { Users } from "src/models/users/users.model";

const LocalStrategy = passportLocal.Strategy


export const google = {
  clientID:
    "998625477461-jfdfcjv7bqqpn4e8cgj3q79lqfc14ce2.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "https://teamground.herokuapp.com/v1/users/register/google/callback",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
};

export const twitter = {
  consumerKey: "3TvQ6CJF5GmwXEoLgWJh1ZFI7",
  consumerSecret: "a7s4QpdEXvpRACOcRdF3CfhKpDFyO38ufhacjgd6ySFAdcLu4A",
  callbackURL: "https://teamground.herokuapp.com/v1/users/register/twitter/callback",
}

passport.serializeUser<any, any>((req, user, done) => {
    console.log('---start serialize user---')
    console.log('user --> ', user)
    done(undefined, user)
})

passport.deserializeUser((user: Users, done) => {
    console.log('---start deserialize user---')
    // console.log('user --> ', user)
    UsersDAO.getUser(user.key).then((user:Users) => done(null, user))
})

/**
 * Sign In using username and password
 *  */ 

passport.use(new LocalStrategy({usernameField: "username"}, (username, password, done) => {
    UsersDAO.getByUsername(username).then( (user: Users) => {
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) throw err
            if (result) {
                return done(null, user)
            } else {
                return done(null, false)
            }
        }) 
    }).catch(err => {
        throw err
    })
}))

/***
 * 
 * Google Strategy
 */

passport.use(
  new GoogleStrategy(
    google,
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      //done(err, user) will return the user we got from fb
      done(null, formatGoogle(profile._json));
    }
  )
);

const formatGoogle = (profile) => {
  let idString = String(profile.sub)
  let id = idString.length >= 2 ? idString.substring(0,4) : idString
  let username = "user".concat(id)
  return {
    firstName: profile.given_name,
    lastName: profile.family_name,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    username: username,
    verified: profile.email_verified
  };
};

/***
 * 
 * Twitter Strategy
 */

passport.use(
  new TwitterStrategy(
    twitter,
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile)
      done(null, formatTwitter(profile._json));
    }
  )
);

export const formatTwitter = (profile) => {
  let idString = String(profile.id_str)
  let id = idString.length >= 2 ? idString.substring(0,4) : idString
  let username = "user".concat(id)
  return {
    firstName: null,
    lastName: null,
    email: null,
    name: profile.name,
    picture: profile.profile_image_url_https,
    username: username,
    verified: profile.verified
  }
}

/**
 * 
 * Verify user authentication
 */

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
