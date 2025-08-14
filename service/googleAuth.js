const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
},
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                const newUser = new User({
                    email: profile.emails[0].value,
                    fullName: profile.displayName,
                    avatar: profile.photos[0].value,
                    password: profile.id,
                    role: 'user'
                });
                await newUser.save();
                return done(null, newUser);
            } else {
                return done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;