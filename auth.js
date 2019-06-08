const passport = require('passport/lib');
const LocalStrategy = require('passport-local/lib').Strategy;
const db = require('./database.js');
passport.use('local', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    async function(username, password, done){

        console.log('try to get data from DB');
        let sql = 'select * from users where _username = $1 and _password = $2',
            values = [username.replace(/\s/g, ''), password];
        await db.query(sql, values)
            .then((data) => {
                console.log("Data got from DB")
                //console.log(data);
                return done(null, {
                    id: data.rows[0]._id,
                    username: data.rows[0]._username,
                    email: data.rows[0]._email,
                    password: data.rows[0]._password,
                });
            })
            .catch((err) => {
                console.log("Can't get data from DB")
                console.log(err);
                return done(null, false);
            });
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) =>{
    return done(null,
        {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
    });
});

module.exports = passport;