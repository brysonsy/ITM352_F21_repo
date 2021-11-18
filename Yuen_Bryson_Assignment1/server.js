// File to validate purchase with necessary requirements.
// Worked with Sean Sumida

var express = require('express');
var app = express();
var myParser = require("body-parser");
const qs = require('querystring');
var products_array = require('./public/products_data.js');

// Routing 
// Monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products_array = ${JSON.stringify(products_array)};`;
   response.send(products_str);
});

app.use(express.urlencoded({ "extended": true }));

// process purchase request (validate quantities, check quantity available)
app.post('/purchase', function (request, response, next) {
   let POST = request.body;

   var errors = {};
   // Assumes no quantities from the start so we have no errors
   errors['no quantities'] = 'Please enter some quantities';

   // Loops through all the products
   let overQuantity = false;
   for (i = 0; i < products_array.length; i++) {
      let quantityAvailable = products_array[i].quantity;
      if(typeof POST[`quantity${i}`] != 'undefined') {
         a_qty = Number(POST[`quantity${i}`]);
         if (a_qty > quantityAvailable) { 
            overQuantity = true;
         }
      }
   }

   if (overQuantity = true) {
      errors['over quantity'] = 'Please'
   }

   // Strings the query
   QString = qs.stringify(POST);
   if (JSON.stringify(errors) === '{}') {
       response.redirect("./invoice.html?" + QString); // If valid, redirect to invoice
   } else {
       let errObj = { 'error': JSON.stringify(errors) }; // Show the errors
       QString += '&' + qs.stringify(errObj);
       response.redirect("./index.html?" + QString); // If invalid, send back to index
   }
});

// Route all other GET requests to files in public 
app.use(express.static('./public'));

// Start server
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