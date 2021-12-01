/*
Author: Bryson Yuen
Worked with Sean Sumida
Program based off of Assignment1, Lab13, and Lab14
*/

// Setup Server
var data = require('./public/products_data.js'); // Links products_data.js and sets it as var data
var products = data.products; // Loads products_data.js as var products
const qs = require('qs'); // Use var qs as loaded module
var express = require('express'); // Loads express module
var app = express(); // Places express module in variable app
var myParser = require("body-parser"); // Loads body-parser module
var fs = require('fs'); // Starts and loads fs systems

var filename = 'user_data.json'; // Makes a var with the filename user_data.json
const{request} = require('express');

// Links to request POST
app.all('*', function (req, res, next) { 
    console.log(req.method + ' to ' + req.path);
    next();
});

/* app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products_array = ${JSON.stringify(products_array)};`;
   response.send(products_str);
}); */

// Gets data from body
app.use(express.urlencoded({ "extended": true }));

// Borrowed and modified code from Lab14
if(fs.existsSync(filename)) {
   // Loads user_data file to user_data object
   fileStats = fs.statSync(filename)
   // Outputs in terminal the characters/size of the user_data file
   console.log(filename + ' has ' + fileStats.size + ' characters.');
   data = fs.readFileSync(filename, 'utf-8');
   user_data = JSON.parse(data);
} else {
   console.log(filename + ' does not exist.');
}

// Process Login
// Borrowed and modified code from Lab14
app.post("/process_login", function (req, res, next) {
   var LogError = [];
   console.log(req.query);
   username = req.body.username.toLowerCase(); // Usernames are changed to lowercase
       if (typeof user_data[username] != 'undefined') { // Username and password should not be undefined
       if (user_data[username].password == req.body.password) {
           req.query.username = username;
           console.log(user_data[req.query.username].name);
           req.query.fullname = user_data[req.query.username].name;
           res.redirect('/invoice.html?' + qs.stringify(req.query)); // Redirects to invoice if the username and password is correct
           return; 
       }  
       else { // If password is incorrect displays Invalid Password in console
           LogError.push = ('Invalid Password');
           console.log(LogError);
           req.query.username= username;
           req.query.name= user_data[username].name;
           req.query.LogError=LogError.join(';');
       }   
       } else { // If username is incorrect displays Invalid Username in console
           LogError.push = ('Invalid Username');
           console.log(LogError);
           req.query.username= username;
           req.query.LogError=LogError.join(';');
       }
   res.redirect('./login.html?' + qs.stringify(req.query)); // If there is an error, remain on login page
});

// Process Registration
// Borrowed and modified from Lab 14
app.post("/process_register", function (req, res) {
   qstr = req.body
   console.log(qstr);
   var errors = [];
       if (/^[A-Za-z]+$/.test(req.body.name)) { // Only allows letters to be used for full names
       }
       else {
           errors.push('Use Only Letters for Full Name')
       }
       // Validate whether or not it is a full name
       if (req.body.name == "") {
           errors.push('Invalid Full Name');
       }
// Full name character length should be between 0 and 30 
       if ((req.body.fullname.length > 30 && req.body.fullname.length <0)) {
           errors.push('Full Name Too Long')
       }
// Checks the new username in lowercase across other usernames
   var userreg = req.body.username.toLowerCase(); 
       if (typeof user_data[userreg] != 'undefined') { // Gives error if username is taken and displays message 'Username taken'
           errors.push('Username taken')
       }
       // Requires usernames to be letters and numbers 
       if (/^[0-9a-zA-Z]+$/.test(req.body.username)) {
       }
       else {
           errors.push('Letters And Numbers Only for Username')
       }

// Email Validation
// Borrowed and modified from Lab 14
// Will retain query string with order quantities if the user registers a new account from login page.
    // Password minimum is 6 characters
    if (req.body.password.length < 6) {
      errors.push('Password Minimum 6 Characters')
  }
  // Checks if password was entered correctly in both textboxes 
  if (req.body.password !== req.body.repeat_password) { 
      errors.push('Password Not a Match')
  }

// Borrowed and modified from Lab 14
// If no errors are present then the username is saved
// Fullname, username, and email are made sticky so user does not have to retype in case of an error
req.query.fullname = req.body.fullname;
req.query.username = req.body.username;
req.query.email = req.body.email; 
  if (errors.length == 0) {
      console.log('no errors')
      var username = req.body.username;
      user_data[username] = {}; // Registers user's info.
      user_data[username].name = req.body.fullname;
      user_data[username].password= req.body.password; 
      user_data[username].email = req.body.email; 
      data = JSON.stringify(user_data);  // Set user's info
      fs.writeFileSync(filename, data, "utf-8");
      res.redirect('./invoice.html?' + qs.stringify(req.query));
  }

// Borrowed and modified from Lab 14
// If errors are present redirects to register page and logs the error
  else {
      console.log(errors)
// Redirects to registration page in the case of an error
req.query.errors = errors.join(';');
res.redirect('register.html?' + qs.stringify(req.query));
}
});


// process purchase request (validate quantities, check quantity available)
app.post('/purchase', function (request, response, next) {
   let POST = request.body;

   var errors = {};
   // Assumes no quantities from the start so we have no errors
   errors['no quantities'] = 'Please enter some quantities'

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