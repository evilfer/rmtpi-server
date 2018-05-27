import ProcessEnv = NodeJS.ProcessEnv;
import express from 'express';
import passport from 'passport';
import {Request, Response, Router} from "express";


const GoogleStrategy = require('passport-google-oauth20').Strategy;

function ensureAuthenticated(req: Request, res: Response, next: any) {
    return req.isAuthenticated() ?  next() : res.redirect('/auth/google');
}

export function authMiddleware(router: Router, env: ProcessEnv) {
    const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_URL, GOOGLE_USERS = ''} = env;

    if (!SERVER_URL || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error(`missing auth config: [${SERVER_URL}] [${GOOGLE_CLIENT_ID}] [${GOOGLE_CLIENT_SECRET}]`);
    }

    const users = GOOGLE_USERS.split(',');

    const options = {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/auth/google/callback`,
        passReqToCallback: true
    };

    const callback = (request: any, accessToken: any, refreshToken: any, profile: any, cb: (err: Error | null, profile: any | null) => any) => {
        process.nextTick(() => {
            if (users.indexOf(profile.id) >= 0) {
                cb(null, profile);
            } else {
                cb(null, null);
            }
        });
    };

    passport.use(new GoogleStrategy(options, callback));

    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (obj, cb) {
        cb(null, obj);
    });

    router.use(passport.initialize());
    router.use(passport.session());

    router.get('/auth/status', (req: Request, res: Response) => {
        const user = req.session && req.session.passport && req.session.passport.user;

        if (user) {
            const emails = user.emails
                .filter((email: any) => email.type === 'account')
                .map((email: any) => email.value);
            res.send(`${user.displayName} [${emails.join(', ')}] (${user.id})`);
        } else {
            res.send('not logged in');
        }
    });

    router.get('/logout', (req: Request, res: Response) => {
        req.logout();
        res.redirect('/auth/status');
    });

    router.get('/auth/google',
        passport.authenticate('google', {scope: ['email'], failureRedirect: '/auth/status'}));

    router.get('/auth/google/callback',
        passport.authenticate('google', {failureRedirect: '/auth/status'}),
        (req, res) => {
            // Successful authentication, redirect home.
            res.redirect('/auth/status');
        }
    );

    const authRouter = express.Router();
    authRouter.use(ensureAuthenticated);

    return authRouter;
}