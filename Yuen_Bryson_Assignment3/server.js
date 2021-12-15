/*
Author: Sean Sumida & Bryson Yuen
Program based off of Assignment2, Lab 13, Lab 14, Lab 15, Noah Kim Assignment 3, and Jacob Graham Assignment 3
*/

// Setup Server
var express = require('express'); // Loads express module
var app = express(); // Places express module in variable app
var myParser = require("body-parser"); // Gets access to POST and GET data
var products = require('./products_data.json'); // Links products_data.json and sets it as var products
app.use(myParser.urlencoded({ extended: true }));
app.use(myParser.json());
var fs = require('fs'); // Starts and loads fs systems
var qs = require('qs');

// Setup sessions
var session = require('express-session'); // Require express sessions
app.use(session({ secret: "MySecretKey" })); // Lab 15, initializes sessions

// Setup cookies
var cookieParser = require('cookie-parser'); // Require cookie-parser
app.use(cookieParser()); // Calls cookies

// Setup nodemailer
const nodemailer = require("nodemailer"); // Require nodemailer module

const url = require('url');
const { count } = require('console');
const e = require('express'); // For encryption
const shift = 4;

// Lets userdata file be read
// Load in user data
var user_data_file = './user_data.json';

// Checks to see if the file exists
if (fs.existsSync(user_data_file)) {
    var file_stats = fs.statSync(user_data_file);
    // Returns string and parses into object, then sets object value to user_data
    var user_data = JSON.parse(fs.readFileSync(user_data_file, 'utf-8'));
}
else {
    console.log(`${user_data_file} does not exist!`);
}

// Universal app.get
app.all('*', function (request, response, next) {
    if (typeof request.session.cart == "undefined") {
        // Creates sessions for the shopping cart
        request.session.cart = {};
    }
    next();
});

// Retrieves product data from the json
app.post("/get_products_data", function (request, response, next) {
    response.json(products);
});

// Password encryption
// Code modified and borrowed from Chloe Cheng and StackOverflow
function encrypt(password) {
    var encrypted = [];
    var encrypted_result = "";
    // Loops through the passwords then save the new encrypted password
    for (var i = 0; i < password.length; i++) {
        encrypted.push(password.charCodeAt(i) + shift);
        encrypted_result += String.fromCharCode(encrypted[i]);
    }
    return encrypted_result;
}

// Process Registration
// Borrowed and modified code from Assignment 2, Noah Kim Assignment 3, and Jacob Graham Assignment 3
app.post('/process_register', function (request, response, next) {
    var errors = [];

    // Checks if full name contains only letters
    if (/^[A-Za-z]+ [A-Za-z]+$/.test(request.body.fullname) == false) {
        errors.push('Only letters are allowed for full names.')
    }

    // Full name needs to be less than 30 characters
    if ((request.body.fullname.length > 30 || request.body.fullname.length < 1)) {
        errors.push('Full Name can only be a maximum of 30 characters.')
    }

    // Username validation, lets the username be case insensitive
    username = request.body.username.toLowerCase();

    // Checks if the username is already taken
    if (typeof user_data[username] != 'undefined') {
        errors.push('This username is taken already, please choose a different username.');
    }

    // Only allow usernames with letters and numbers
    if (/^[0-9a-zA-Z]+$/.test(request.body.username) == false) {
        errors.push('Usernames can only have letters or numbers.');
    }

    // Makes username be a minimum of 4 characters and max of 10
    if ((request.body.username.length > 10 || request.body.username.length < 4)) {
        errors.push('Your username must contain 4-10 characters.')
    }

    // Email limitations used from w3schools
    if (/[A-Za-z0-9._]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(request.body.email) == false) {
        errors.push('Please use a valid format email format (ex. kazman@hawaii.edu).');
    }

    // Makes password a minimum of six characters
    if (request.body.password.length < 6) {
        errors.push('Your password is too short, please use at least 6 characters.')
    }

    // Check to see if the passwords are the same
    if (request.body.password !== request.body.repeat_password) {
        errors.push('Your password does not match.')
    }

    // Saves the registration to userdata and makes it a query
    // Borrowed and modified code from Lab 14, Noah Kim and Screencasts
    if (errors.length == 0) {
        POST = request.body
        var username = POST['username']
        let encrypted_pass = encrypt(request.body.password); // Makes the new password registered the encrypted password
        user_data[username] = {};
        user_data[username].name = request.body.fullname; // Saves user's name
        user_data[username].password = encrypted_pass; // Saves encrypted password
        user_data[username].email = request.body.email; // Saves user's email
        data = JSON.stringify(user_data);
        fs.writeFileSync(user_data_file, data, "utf-8"); // Add the new user to userdata
        request.query.name = user_data[username].name;
        request.query.email = user_data[username].email;
        // If there are no errors, user has successfully registered and is sent to invoice
        response_string = `<script>alert('${user_data[username].name} Registration successful.'); 
        location.href = "${'./invoice.html?' + qs.stringify(request.query)}"; 
        </script>`;
        // Saves info to a variable so we can use it for personalization
        var user_info = { "username": username, "name": user_data[username].name, "email": user_data[username].email };
        response.cookie('user_info', JSON.stringify(user_info), { maxAge: 30 * 60 * 1000 }); // Makes query string of user data into a cookie, then makes it so the data expires after 30 minutes
        response.send(response_string);

    }
    // If there are errors, redirect to register page and keeps info in query string
    if (errors.length > 0) {
        request.query.fullname = request.body.fullname;
        request.query.username = request.body.username;
        request.query.email = request.body.email;
        // Adds error to query string
        request.query.errors = errors.join(';');
        response.redirect('register.html?' + qs.stringify(request.query));
    }
});

// Process Login
// Borrowed and modified code from Assignment 2, Noah Kim Assignment 3, and Jacob Graham Assignment 3
app.post('/process_login', function (request, response, next) {
    // For username and password errors deletes them from the query after they are fixed
    delete request.query.username_error;
    delete request.query.password_error;
    username = request.body.username.toLowerCase(); // Makes sure that the username is lowercase
    the_password = request.body.password;
    let encrypted_password_input = encrypt(the_password);
    // Check if username is registered in userdata
    if (typeof user_data[username] != 'undefined') {
        // Check if password is registered in userdata and if it is correct
        if (user_data[username].password == encrypted_password_input) {
            request.query.name = user_data[username].name; // Retrieves the name of the user
            request.query.email = user_data[username].email; // Retreives the email of the user
            response_string =
                `<script> 
            alert('Login for ${user_data[username].name} Login Successful.'); 
            location.href = "${'./invoice.html?' + qs.stringify(request.query)}"; 
            </script>`;
            var user_info = { "username": username, "name": user_data[username].name, "email": user_data[username].email };
            response.cookie('user_info', JSON.stringify(user_info), { maxAge: 30 * 60 * 1000 }); // Makes the session expire after 30 minutes
            response.send(response_string); // Redirects to invoice.html with username info and products if there are no errors
            return;
            // If password is invalid, sends error alert
        } else {
            request.query.username = username;
            request.query.name = user_data[username].name;
            request.query.password_error = 'Thats Not a Correct Password! :( ';
        }
    } else { //Send error alert if username is invalid
        request.query.username = username;
        request.query.username_error = 'Thats Not a Correct Username! :(';
    }
    response.redirect('./login.html?' + qs.stringify(request.query)); // Forces user to login again if there are errors
});

// Process logout request
// Borrowed and modified code from Noah Kim Assignment 3
app.get("/logout", function (request, response) {
    var user_info = request.cookies["user_info"]; // Sets user information as JavaScript
    console.log(JSON.stringify(user_info));
    // Sends message if user successfully logs out
    if (user_info != undefined) {
        var username = user_info["username"]; // Checks which user is logged in
        logout_msg = `<script>alert('You have logged out.'); location.href="./index.html";</script>`;
        response.clearCookie('user_info'); // Destroys cookie
        response.send(logout_msg); // Send message if logged out 
        // If there is no user_info, then displays error message and redirects user to index page
    } else {
        logouterror_msg = `<script>alert("Unable to logout if you are not currently logged in."); location.href="./index.html";</script>`;
        response.send(logouterror_msg);
    }
});

// Cart quantity, adds cart quantities to navbar
// Borrowed and modified code from Noah Kim Assignment 3
app.post('/cart_qty', function (request, response) {
    var total = 0; // 
    for (pkey in request.session.cart) {
        total += request.session.cart[pkey].reduce((a, b) => a + b, 0);
    }
    response.json({ qty: total });
});

// Makes products_data.json into a JavaScript file
// Create an empty variable then reads the data in the json file and saves it as javascript 
var products_data;
var products_data_file = './products_data.json';
if (fs.existsSync(products_data_file)) {
    console.log("reading the file");
    var products_data = JSON.parse(fs.readFileSync(products_data_file, 'utf-8'));
};
console.log(products_data);

// Processes the order from products page
// Borrowed and modified code from Alyssia Chen Assignment 2 and Noah Kim Assignment 3
app.post('/add_to_cart', function (request, response) {
    let POST = request.body; // Creates a variable for the data entered into products
    var qty = POST["prod_qty"];
    var ptype = POST["prod_type"];
    var pindex = POST["prod_index"];
    var cart_info = { "quantity": qty, "type": ptype, "index": pindex };
    response.cookie('cart_info', JSON.stringify(cart_info), { maxAge: 30 * 60 * 1000 });
    // If the entered quantity passes the validation tests, add to cart. If the tests are not passed decline
    if (isNonNegInteger(qty) && qty != 0 && qty <= products_data[ptype][pindex].quantity_available) {
        // Adds quantity data to the cart session
        if (typeof request.session.cart[ptype] == "undefined") {
            request.session.cart[ptype] = [];
        }
        request.session.cart[ptype][pindex] = parseInt(qty);
        response.json({ "status": "Successfully added to cart, please refresh browser to display number of items in cart." });
        // Tests if items are out of stock
    } else if (qty > products_data[ptype][pindex].quantity_available) {
        console.log("products data ptype =" + products_data[ptype]);
        response.json({ "status": "Not enough in stock, not added to cart" });
        // Tests if there are no quantities ordered
    } else if (qty == 0) {
        response.json({ "status": "Invalid quantity, not added to cart. Please order atleast one item." });
        // Tests for invalid quantities
    } else {
        response.json({ "status": "Invalid quantity, please enter a valid number." })
    }
});

// Gets shopping cart data info
app.post('/get_cart', function (request, response) {
    response.json(request.session.cart);
});

// Updates shopping cart session with new quantity info
// Borrowed and modified code from Noah Kim Assignment 3 and Jacob Graham Assignment 3
app.post("/update_cart", function (request, response) {
    // Replaces cart in session with post and checks if updated quantities are valid
    let haserrors = false;
    for (let ptype in request.body.quantities) {
        for (let i in request.body.quantities[ptype]) {
            qty = Number(request.body.quantities[ptype][i]);
            console.log(qty);
            qty = parseInt(Number(qty));
            haserrors = !isNonNegInteger(Number(qty)) || haserrors;
            console.log(qty);
        };
    };
    // Send alert if there are errors
    if (haserrors == true) {
        msg = "Invalid quantities, cart has not updated.";
        // Update cart if there are no errors
    } else {
        msg = "Cart updated successfully. ";
        request.session.cart = request.body.quantities;
    }
    // If items failed to add to the cart, finds the page the user came from
    const ref_URL = new URL(request.get('Referrer'));
    ref_URL.searchParams.set("msg", msg); // Gets new querystring and adds to querystring
    response.redirect(ref_URL.toString()); // Redirect user back to page they were on
    console.log(qty);
});

// Process purchase request and emails the invoice
// Borrowed and modified code from Assignment 3 example code and Noah Kim Assignment 3
app.post('/complete_purchase', function (request, response) {
    var invoice = request.body; // Saves the invoice data to a variable
    var user_info = JSON.parse(request.cookies["user_info"]); // Sets user info to javascript
    var the_email = user_info["email"]; // Saves the users email as a variable
    console.log(the_email);
    var transporter = nodemailer.createTransport({
        // Sets up a mail server and has it function only on the UH network for security
        host: "mail.hawaii.edu",
        port: 25,
        secure: false,
        tls: {
            // Do not fail on invalid certifications
            rejectUnauthorized: false
        }
    });
    var mailOptions = {
        from: 'sumidase@hawaii.edu',
        to: the_email,
        subject: `Thanks, ${user_info.name} for purchasing from Bryson & Sean's Poke Mart.`, // Message in the email if invoice sent
        html: invoice.invoicehtml
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            status_str = 'There was an error and your invoice could not be emailed.'; // Message if invoice could not be sent
        } else {
            status_str = `Your invoice was mailed to ${the_email}`;
        }
        response.json({ "status": status_str });
    });
    response.clearCookie('user_info'); // Destroys cookie
    request.session.destroy(); // Deletes the session once the email is sent
});

// Function to check if value is a non negative integer
// Borrowed and modified from Assignment 2 and Lab 14
function isNonNegInteger(q, return_errors = false) { // Checks if the values input are a positive integer
    errors = []; // Initially assumes there are no errors
    if (q == '' || q == null) q = 0; // If the input is "blank" or null, set the value to 0 
    if (Number(q) != q) errors.push('<font color="red">Not a number!</font>'); // Checks if value is a number
    else if (q < 0) errors.push('<font color="red">Negative value!</font>'); // Checks if value is a positive number
    else if (parseInt(q) != q) errors.push('<font color="red">Not an integer!</font>'); // Checks if value is a whole number
    return return_errors ? errors : (errors.length == 0);
}

app.use(express.static('./public'));
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });