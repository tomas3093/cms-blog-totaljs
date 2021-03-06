NEWSCHEMA('Article').make(function(schema) {

    schema.define('id', String);
    schema.define('title', String, true);
    schema.define('description', String, true);
    schema.define('text', String, true);
    schema.define('imgpath', String);
    schema.define('timestamp', Number);

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
        var filter = NOSQL('articles').find();

        filter.take(take);
        filter.skip(skip);

        //if(options.sort) filter.sort(options.sort);
        filter.sort('timestamp', true);

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

    // Get single article by id
    schema.setGet(function(error, model, id, callback) {

        NOSQL('articles')
            .one()
            .where('id', id)
            .callback(function(err, article){

                callback({success: !!article, data: article});

            });
    });

    // Save the article into the database
    schema.setSave(function(error, model, options, callback) {

        // if there's no id then it's an insert otherwise update
        var isNew = model.id ? false : true;

        // create other attributes
        model.timestamp = Date.now();

        if(isNew) {
            model.id = UID();
            model.imgpath = '' + model.id + '.jpg';

            // Insert to DB
            NOSQL('articles')
                .insert(model)
                .callback(function() {

                    callback({success: true, id: model.id});

                });
        } else {

            // Update old article in DB
            NOSQL('articles')
                .update(model)
                .where('id', model.id)
                .callback(function() {

                    callback({success: true, id: model.id});

                });
        }
    });

    // Remove a specific article
    schema.setRemove(function(error, id, callback) {

        NOSQL('articles')
            .remove()
            .where('id', id)
            .callback(function(){

                callback({success: true});

            });
    });
});