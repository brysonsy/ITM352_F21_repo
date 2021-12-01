/*
Author: Bryson Yuen
Worked with Sean Sumida
Program based off of Assignment1, Lab13, and Lab14
*/

// Setup Server
var express = require('express'); // Loads express module
var app = express(); // Places express module in variable app
var querystring = require("querystring");
var fs = require('fs') // Starts and loads fs systems
var products_array = require('./product_data.json'); // Links products_data.json and sets it as var products_array
var qString;
var user_data = './user_data.json'; // Gets data from user_data.json and sets it as var user_data

if (fs.existsSync(user_data)) {
    var file_stats = fs.statSync(user_data);
    data = fs.readFileSync(user_data, 'utf-8');
    // Returns string and sets object value to users_reg_data variable
    var users_reg_data = JSON.parse(fs.readFileSync(user_data, 'utf-8'));
}
else {
    // In case user data does not go through, test in console
    console.log(`${user_data} does not exist!`)
}

// Code borrowed and modified from Lab 13
// Gets data from body
app.use(express.urlencoded({ extended: true }));
// Monitors requests and sends it to the next request
app.all('*', function (request, response, next) {
    for (i = 0; i < products_array.length; i++) {
        console.log(request.method + ' to path ' + request.path);
    }
    next();
});

// Creates a string from variable after get request from product_data.js
app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products_array = ${JSON.stringify(products_array)};`;
    response.send(products_str);
});

// Process purchase request
app.post('/purchase', function (request, response, next) {
    // Variables used for validation
    let POST = request.body;
    let randomValue = false; // Represents amount put into textbox
    var errors = {}; // Start with empty cart
    qString = querystring.stringify(POST);
    // Checks all posted quantities
    for (i in products_array) {
        q = POST['quantity' + i];
        // If the quantity is invalid
        if (isNonNegInt(q) == false) {
            errors['invalid_quantity' + i] = `${q} ${products_array[i].name} is not a valid quantity`;
        }
        // If quantity is greater than 0
        if (q > 0) {
            randomValue = true;
        }
        // If quantity input is greater than quantity available
        if (q > products_array[i].quantity_available) {
            errors['quantity_available' + i] = `${q} of ${products_array[i].name} is not available. Only ${products_array[i].quantity_available} available.`;
        }
    }
    // No quantities were selected
    if (randomValue == false) {
        errors['no_quantities'] = `You need to select some quantities!`;
    }
    // If no errors go to invoice, if errors go back to products
    if (Object.keys(errors).length == 0) {
        // If purchase is valid, we remove from quantity available, the refreshes page with new quantity available
        for (i in products_array) {
            products_array[i].quantity_available -= Number(POST['quantity' + i]);
        }
        // Redirect to login
        response.redirect("./login.html?" + qString); 
    }
    else {
        // Makes an error message from all errors.
        var errorMessage_str = '';
        for (err in errors) {
            errorMessage_str += errors[err] + '\n';
        }
        // Goes back to product display if wrong
        response.redirect(`./products_display.html?errorMessage=${errorMessage_str}&` + qString); 
    }
});

// Process Login
// Borrowed and modified code from Lab14
app.post("/process_login", function (request, response) {
    // Empty variable for errors
    var errors = {}; 
    var loginMessage_str = '';
    var incorrectLogin_str = '';
    // Validate the username and password
    console.log(request.query);
    // Usernames formatted to lowercase
    username = request.body.username.toLowerCase(); 

    // Username and Password should not be undefined
    if (typeof users_reg_data[username] != 'undefined') { 
        if (users_reg_data[username].password == request.body.password) {
            request.query.username = username;
            console.log(users_reg_data[request.query.username].name);
            request.query.name = users_reg_data[request.query.username].name; // Goes to invoice if username and password is correct
            request.query.email = users_reg_data[request.query.username].email; // Puts email in the query
            let more_qString = querystring.stringify(request.query); // Generates a new query
            // Message displays when logged in
            loginMessage_str = `Welcome ${username}, you are logged in!`; 
            response.redirect(`./invoice.html?loginMessage=${loginMessage_str}&` + qString + '&' + more_qString);
            return;
        }

        // If password is incorrect display error
        else { 
            incorrectLogin_str = 'The password is invalid!';
            console.log(errors);
            request.query.username = username;
            request.query.name = users_reg_data[username].name;
        }
    }

    // If username is incorrect display error
    else { 
        incorrectLogin_str = 'The username is invalid!';
        console.log(errors);
        request.query.username = username;
    }
    
    //make username sticky when there's an error
    //redirect to invoice with message
    response.redirect(`./login.html?loginMessage=${incorrectLogin_str}&wrong_pass=${username}`);

    //query string before wrong_pass in case of errors
    //response.redirect(`./login.html?loginMessage=${incorrectLogin_str}&` + qString);
});

// Process Registration
app.post("/process_register", function (request, response) {
    console.log(request.body);
    // Empty variable for errors
    var errors = {};
    var loginMessage_str = '';
    var register_user = request.body.username.toLowerCase();
    // Validates name, username, email, and password
    errors['name'] = [];
    errors['username'] = [];
    errors['email'] = [];
    errors['password'] = [];
    errors['repeat_password'] = [];

    // Limits to letters only
    if (/^[A-Za-z]+ [A-Za-z]+$/.test(request.body.name)) {
    }
    // Error message when format isn't followed
    else {
        errors['name'].push('Please follow the format for names! (ex. Bryson Yuen)');
    }
    // Error message when name textbox is empty
    if (request.body.name == "") {
        errors['name'].push('The name textbox is empty. Please insert a name.');
    }
    // Full names should be letters with max characters being 30, error if name is above 30 characters
    if (request.body.name.length > 30) { 
        errors['name'].push('Name is too long. Insert a name less than 30 characters.');
    }
    // Error if username is already taken
    if (typeof users_reg_data[register_user] != 'undefined') { 
        errors['username'].push('Username is taken.');
    }
    // Limits username to letters and numbers
    if (/^[0-9a-zA-Z]+$/.test(request.body.username)) {
    }
    else {
        errors['username'].push('Use only letters and numbers for your username.');
    }
    // Makes usernames fall between 4 characters and 10 characters
    if (request.body.username.length < 4 || request.body.username.length > 10) {
        errors['username'].push('Your username must contain 4-10 characters.');
    }
    // Used w3 resources for email validation
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(request.body.email)) {
    }
    else {
        errors['email'].push('Please use a valid format email format (ex. tinavo@gmail.com)');
    }
    // Makes password be atleast 6 characters
    if (request.body.password.length < 6) {
        errors['password'].push('Your password is too short (Please use at least 6 characters).');
    }
    // Checks if passwords match
    if (request.body.password != request.body.repeat_password) {
        errors['repeat_password'].push('Your password does not match.');
    }

      // Requests name, username, and email
      request.query.name = request.body.name;
      request.query.username = request.body.username;
      request.query.email = request.body.email;

    // If there are no errors, save user info
    var num_errors = 0;
    for (err in errors) {
        num_errors += errors[err].length;
    }
    if (num_errors == 0) {
        POST = request.body;
        var username = POST["username"];
        users_reg_data[username] = {};
        users_reg_data[username].name = request.body.name;
        users_reg_data[username].password = request.body.password;
        users_reg_data[username].email = request.body.email;

        // Stringifies user information
        data = JSON.stringify(users_reg_data); 
        fs.writeFileSync(user_data, data, "utf-8");
        request.query.name = users_reg_data[request.query.username].name; 
        request.query.email = users_reg_data[request.query.username].email;
        let more_qString = querystring.stringify(request.query); 
        // Redirects to invoice with the message
        loginMessage_str = `Welcome ${username}, you are registered!`;
        response.redirect(`./invoice.html?loginMessage=${loginMessage_str}&` + qString + '&' + more_qString);
        console.log(POST, "account information");
    }
    // Checks for errors
    else {
        console.log('in post register', errors, request.body)
        //errors object for error message (search params)
        request.body.errors_obj = JSON.stringify(errors);
        // Make sticky
        request.query.StickyUsername = register_user.username;
        request.query.StickyName = register_user.name;
        request.query.StickyEmail = register_user.email;
        // Redirects to register html
        response.redirect("./register.html?" + querystring.stringify(request.body)); 

    }
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

// Borrowed and modified from Lab 13
function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (q == '') q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
}