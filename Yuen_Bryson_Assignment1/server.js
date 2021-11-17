var express = require('express');
var app = express();
const qs = require('querystring');
const { type } = require('os');
var products_array = require('./public/products_data.js');

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
app.use(express.urlencoded({ "extended": true }));

app.post('/purchase', function (request, response, next) {
   // Checks if all the quantities are valid, while looping through products to find errors
   var errors = {};
   var qty = request.body['quantitybox'];
   console.log(qty + typeof qty);
   // found in A1 workshop; used for 
   for (i in products_array) {
      var q = qty[i];
      let name = products_array[i].name;
      let name_price = products_array[i].price;
      console.log(q);
      // check if nonnegint

      // checkif quantity wanted is avalable

      // check if at least 1 quantity 

   }

   var qstring = qs.stringify(request.body);
   // if no errors, send to invoivce.html with quanity data in querystring, otherwsie back to products_display.html
   if (Object.keys(errors).length == 0) {
      response.redirect('./invoice.html?' + qstring);
      //    var quantity_data_num = parseInt(q);

   } else {
      response.redirect('./products_display.html?' + qstring);
   }

})

// route all other GET requests to files in public 
app.use(express.static('./public'));

app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products_array = ${JSON.stringify(products_array)};`;
   response.send(products_str);
});

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
 
// From Lab 13 Check to see if the quantity input is valid
function isNonNegInt(q, returnErrors = false) {
   // Checks if a string 'q' is a non-neg integer.
   errors = []; // assume no errors at first
   if (q == '') q = 0;
   if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
   else {
      if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
      if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
   }
   return returnErrors ? errors : (errors.length == 0);
}
   
// From Lab 13 Check the quantity that is input in the textbox
function checkQuantityTextbox(qtyTextbox) {
      errs = isNonNegInt(qtyTextbox.value, true);
      if (errs.length == 0) errs = ['You want: '];
      if (qtyTextbox.value.trim() == '') errs = ['Please type quantity desired: '];
      document.getElementById(qtyTextbox.name + '_label').innerHTML = errs.join('<font color="red">, </font>');
}