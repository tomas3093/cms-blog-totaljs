exports.install = function() {

    // Unauthorized
    ROUTE('/',                  view_homepage,          ['unauthorize']);
    ROUTE('/login/',            login,                  ['unauthorize']);
    ROUTE('/login/',            login,                  ['unauthorize',     'post']);
    ROUTE('/signup/',           signup,                 ['unauthorize']);
    ROUTE('/signup/',           signup,                 ['unauthorize',     'post']);
    ROUTE('/article/{id}',      view_article,           ['unauthorize']);

    // Authorized
    ROUTE('/',                  view_homepage,          ['authorize']);
    ROUTE('/article/{id}',      view_article,           ['authorize']);
    ROUTE('/admin/',            view_administration,    ['authorize']);
    ROUTE('/article/new/',      new_article,            ['authorize']);
    ROUTE('/article/edit/{id}', edit_article,           ['authorize']);
    ROUTE('/logout/',           logout,                 ['authorize']);


    // Enables a localization mechanism + compression for all client-side components
	LOCALIZE('/components/*.html', ['compress']);
};

function login() {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    // POST
    if (self.flags.indexOf('post') !== -1) {
        // Obtain user ID from database

        NOSQL('users')
            .one()
            .where('email', self.body.email)
            .callback(function(err, user){

                if (!!user) {
                    // Compare with hash password
                    var passwordHash = require('password-hash');
                    var passwordVerified = passwordHash.verify(self.body.password, user.password);
                    if (passwordVerified) {
                        // The method below creates an authorization cookie
                        F.userlogin(self, user.id);
                        // Redirect user to his account
                        self.redirect('/admin/');
                    } else {
                        // TODO: Zadane zle heslo
                        console.log('Wrong password');
                        self.view('404');
                    }
                } else {
                    // TODO: Ak user neexistuje, vypisat hlasku
                    console.log('Wrong email');
                    self.view('404');
                }
            });
    }

    // GET
    else if (self.flags.indexOf('get') !== -1) {
        var path = '/components/login-form.html';
        var title = 'Log in';

        self.view('form', { data: { title: title, componentPath: path } });
    }

    else
        self.view('404');
}

function logout() {
    var self = this;

    // Authorization
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    // The method below removes an authorization cookie
    F.userlogoff(self);

    // Redirect a user to a login page
    self.redirect('/login/');
}

function signup() {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    if (self.flags.indexOf('get') !== -1) {
        var path = '/components/signup-form.html';
        var title = 'Sign up';

        self.view('form', { data: { title: title, componentPath: path } });
    }

    else
        self.view('404');
}

function view_homepage() {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    // Get articles and send it to view
    var options = {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/api/articles/',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // AJAX Request to API
    var http = require('http');
    http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {

            var json = JSON.parse(data);
            self.view('index', { data: json });
        });
    }).end();
}

function view_article(id) {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    id = id || '';
    if (id.length) {
        // TU SA CEZ AJAX LOADNE CLANOK S DANYM ID
        var options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/articles/' + id + '/',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        // AJAX Request to API
        var http = require('http');
        http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {

                var json = JSON.parse(data);

                if (json.success === true)
                    self.view('article', { data: json });
                else
                    self.view('404');
            });
        }).end();
    }
    else
        self.view('404');
}

function view_administration() {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    // Get articles and send it to view
    var options = {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/api/articles/',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // AJAX Request to API
    var http = require('http');
    http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {

            var json = JSON.parse(data);
            self.view('admin-menu', { data: json });
        });
    }).end();
}

function new_article() {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    // GET
    if (self.flags.indexOf('get') !== -1) {
        var path = '/components/new-article-form.html';
        var title = 'New article';

        self.view('form', { data: { title: title, componentPath: path } });
    }

    else
        self.view('404');

}

function edit_article(id) {
    var self = this;

    // Authorization boolean for views
    self.repository.authorize = self.flags.indexOf('authorize') !== -1;

    id = id || '';
    if (id.length) {
        // TU SA CEZ AJAX LOADNE CLANOK S DANYM ID
        var options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/articles/' + id + '/',
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        // AJAX Request to API
        var http = require('http');
        http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (data) {

                var json = JSON.parse(data);

                if (json.success === true) {
                    var title = 'Edit article';
                    self.view('edit-article-form', { data: { success: json.success, title: title, article: json.data }} );
                } else
                    self.view('404');
            });
        }).end();
    }
    else
        self.view('404');
}