// This object will contain all online users (their sessions)
const ONLINE = {};

// Cookie name
const COOKIE = '__user';

// A secret for encryption
const SECRET = 'js.latoT';

// Session expiration
const EXPIRE = '20 minutes';

// Total.js authorize delegate is executed on each request with except for a request to a static file
F.onAuthorize = function(req, res, flags, callback) {

    var cookie = req.cookie(COOKIE);

    // Check the cookie length
    if (!cookie || cookie.length < 20)
        return callback(false);

    // Decrypt the cookie value
    cookie = F.decrypt(cookie, SECRET);
    if (!cookie)
        return callback(false);

    // Look into the session object whether the user is logged in
    var session = ONLINE[cookie.id];
    if (session) {
        // User is online, so we increase his expiration of session
        session.ticks = F.datetime;
        return callback(true, session);
    }

    // Session doesn't exist here, so we try to sign-in user because we have his ID
    var options = {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/api/users/' + cookie.id + '/',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // AJAX Request to API
    var http = require('http');
    http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {

            var json = JSON.parse(data);

            // If user exists in DB
            if (json.success === true) {
                var user = json.data;

                // We have the user so we can set the current timestamp (for his expiration)
                user.ticks = F.datetime;

                // Create a session
                ONLINE[user.id] = user;

                // Authorize the user
                callback(true, user);
            }
            else {
                // If user not exists, then remove the cookie
                res.cookie(COOKIE, '', '-1 day');
                return callback(false);
            }
        });
    }).end();
};

// A simple service cleaner for expired sessions
F.on('service', function(counter) {

    // Clean session each 5 minutes
    if (counter % 5 !== 0)
        return;

    var sessions = Object.keys(ONLINE);

    //  Set 'ticks' to -20 minutes from now
    var ticks = F.datetime.add('-' + EXPIRE);

    for (var i = 0, length = sessions.length; i < length; i++) {
        var session = ONLINE[sessions[i]];

        // Sessions will be removed when are older than "-20 minutes"
        if (session.ticks < ticks)
            delete ONLINE[sessions[i]];
    }

});

// A simple login method for creating an auth cookie
F.userlogin = function(controller, id) {

    var user = {};
    user.id = id;
    user.ticks = F.datetime.getTime();

    // We can add another security elements e.g.: User-Agent, IP address, etc.
    // user.ip = controller.ip;

    controller.cookie(COOKIE, F.encrypt(user, SECRET), '7 days');

    return F;
};

// The method removes auth cookie
F.userlogoff = function(controller) {
    controller.cookie(COOKIE, '', '-1 day');

    return F;
};