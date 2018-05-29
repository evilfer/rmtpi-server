import ProcessEnv = NodeJS.ProcessEnv;
import express from 'express';
import passport from 'passport';
import {Request, Response, Router} from "express";


const GoogleStrategy = require('passport-google-oauth20').Strategy;

function genEnsureAuthenticated(users: string[]) {
    return (req: Request, res: Response, next: any) =>
        req.isAuthenticated() && users.indexOf(req.session!.passport.user.id) >= 0 ?
            next() : res.redirect('/auth/google');
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
            cb(null, profile);
        });
    };

    const ensureAuthenticated = genEnsureAuthenticated(users);


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
        const user = req.isAuthenticated() && req.session!.passport.user || null;
        const userData = user && {
            displayName: user.displayName,
            emails: user.emails
                .filter((email: any) => email.type === 'account')
                .map((email: any) => email.value),
            id: user.id,
            valid: users.indexOf(user.id) >= 0
        };

        res.json(userData);
    });

    router.get('/auth/logout', (req: Request, res: Response) => {
        req.logout();
        res.redirect('/auth/status');
    });

    router.get('/auth/google',
        passport.authenticate('google', {
            scope: ['email'],
            failureRedirect: '/auth/status',
            prompt: 'consent'
        }));

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