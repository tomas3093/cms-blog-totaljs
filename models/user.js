NEWSCHEMA('User').make(function(schema) {

    schema.define('id', UID);
    schema.define('email', 'Email', true);
    schema.define('password', String, true);
    schema.define('confirmed', Boolean);

    // Query products
    schema.setQuery(function(error, options, callback) {

        // pagination
        options.page = U.parseInt(options.page) - 1;
        options.max = U.parseInt(options.max, 20);

        // if page not specified set it to 0
        if (options.page < 0)
            options.page = 0;

        // number of items to return
        var take = U.parseInt(options.max);

        // number of items to skip
        var skip = U.parseInt(options.page * options.max);

        // NOSQL is total.js embedded database
        // https://docs.totaljs.com/latest/en.html#api~Database
        var filter = NOSQL('users').find();

        filter.take(take);
        filter.skip(skip);

        if(options.sort) filter.sort(options.sort);

        filter.callback(function(err, res, count) {

            // let's create object which will be returned
            var data = {};
            data.count = count;
            data.items = res;
            data.limit = options.max;
            data.pages = Math.ceil(data.count / options.max) || 1;
            data.page = options.page + 1;

            callback(data);
        });

    });

    // Get single user by id
    schema.setGet(function(error, model, id, callback) {

        NOSQL('users')
            .one()
            .where('id', id)
            .callback(function(err, user){

                callback({success: !!user, data: user});

            });
    });

    // Save the user into the database
    schema.setSave(function(error, model, options, callback) {
        if(model.email) {
            // Zisti ci user s danym emailom nahodou uz neexistuje
            NOSQL('users')
                .one()
                .where('email', model.email)
                .callback(function(err, user){

                    // Vloz usera do DB
                    if (!user) {
                        model.id = UID(); //UID returns string such as 16042321110001yfg

                        var passwordHash = require('password-hash');
                        model.password = passwordHash.generate(model.password);
                        model.confirmed = true;

                        NOSQL('users')
                            .insert(model)
                            .callback(function () {
                                callback({ success: true, id: model.id });
                            });
                    }
                    else {
                        // User uz existuje
                        callback({ success: false, id: user.id })
                    }
                });
        }
    });

    // Remove a specific user
    schema.setRemove(function(error, id, callback) {

        NOSQL('users')
            .remove()
            .where('id', id)
            .callback(function(){
                callback({success: true});
            });
    });
});