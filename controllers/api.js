exports.install = function() {

    //       URL 		        Handler Flags			        Method
    ROUTE('/api/articles',      query,  ['*Article']);          // GET (default)
    ROUTE('/api/articles/{id}', get,    ['*Article']);          // GET (default)
    ROUTE('/api/articles',      save,   ['*Article', 'POST']);  // POST
    ROUTE('/api/articles/{id}', remove, ['*Article', 'DELETE']);// DELETE

};

function query() {
    // `this` is an instance of Controller
    // https://docs.totaljs.com/latest/en.html#api~FrameworkController
    var self = this;
    // $query is Schema method that we defined using `schema.setQuery(...)`
    self.$query(self.query, self.callback());
    // instead of self.callback you can supply your own callback function
    // self.$query(self.query, function(err, result){
    //	  self.json(result);
    // });
}

function get(id) {
    // the id is parsed by framework from url `/api/products/{id}`
    var self = this;
    // $get is Schema method that we defined using `schema.setGet(...)`
    this.$get(id, self.callback());
}

function save() {
    var self = this;
    // $save is Schema method that we defined using `schema.setSave(...)`
    // the $save method is available on this.body for POST request
    this.body.$save(self.callback());
    // another way to use it is
    // this.$save(this.body, self.callback());

}

function remove(id) {
    var self = this;
    // $remove is Schema method that we defined using `schema.setRemove(...)`
    this.$remove(id, self.callback());
}

F.on('request', function(req, res){
    console.log(`[${req.method}] ${req.url}`);
    // outputs e.g. `[GET] /api/products`
});