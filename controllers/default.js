exports.install = function() {

    ROUTE('/', view_homepage);
    ROUTE('/article/{id}', view_article);

    // Forms ['new-article', 'edit-article', 'login', 'signup']
    ROUTE('/form/{form_type}/', view_form);

    // Administration
    ROUTE('/admin/', view_administration);

    // Enables a localization mechanism + compression for all client-side components
	LOCALIZE('/components/*.html', ['compress']);

};

function view_homepage() {
    var self = this;

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

function view_form(form_type) {
    var self = this;
    var title = '';
    var path = '';

    // Zisti typ formulara
    form_type = form_type || '';
    switch (form_type) {
        case 'new-article':
            path = '/components/new-article-form.html';
            title = 'New article';
            break;

        case 'edit-article':
            path = '/components/edit-article-form.html';
            title = 'Edit article';
            break;

        case 'login':
            path = '/components/login-form.html';
            title = 'Log in';
            break;

        case 'signup':
            path = '/components/signup-form.html';
            title = 'Sign up';
            break;

        default:
            self.view('404');
            return;
    }

    self.view('form', { data: { title: title, componentPath: path } });
}

function view_administration() {
    var self = this;

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