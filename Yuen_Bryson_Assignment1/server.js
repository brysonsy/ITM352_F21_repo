var express = require('express');
var app = express();

// Routing 
// monitor all requests

// process purchase request (validate quantities, check quantity available)
app.get('/invoice.html', function(req, res, next) {
    if(typeof req.query['purchase_submit'] != 'undefined') {
        console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.query));
    }
    next();
});

// route all other GET requests to files in public 
app.use(express.static('./public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));