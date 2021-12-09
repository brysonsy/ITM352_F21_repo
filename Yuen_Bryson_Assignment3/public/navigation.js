/*
Author: Sean Sumida & Bryson Yuen
Javascript for the navigation bar used on the products_display
*/

// Function asks the server for the service variable and converts the response to text.
function loadJSON(service, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('POST', service, false);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required the use of an anonymous callback because .open will NOT return a value instead it simply returns undefined
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

// Function for the navigation bar
function navigationbar() {
    var cart_qty;

    loadJSON('./cart_qty', function (response) {
        cart_qty = JSON.parse(response); // Parses the JSON string into an object
    });

    document.write(`
   <div id="nav">
    <ul>`);
    for(p_key in products_array) {
        document.write(`
    <li><a href="./products_display.html?prod_key=${p_key}">${p_key}</a></li>
    `);
    }

    document.write(`
    </ul>
    </div>
    <div id="topnav_right">
    <a href="./shopping_cart.html">Bag</a>
    <b>
    <a href="./login.html">Login</a>
    <a href="/logout">Logout</a>
    <b>
    <a href="./products_display_1.html">Home</a>
        </div>
    `);
}