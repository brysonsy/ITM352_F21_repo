/* Nav bar, modified and borrowed from Noah Kim Assignment 3 
Author: Sean Sumida & Bryson Yuen */

// Security
// Loads user data into json file without dispalying password in URL
// From https://www.sitepoint.com/community/t/how-to-access-json-file-content-via-xmlhttprequest/281547
function loadJSON(service, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('POST', service, false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

// Function to call nav bar
function navbar() {
    var cart_qty;
    loadJSON('./cart_qty', function (response) {
        // Parsing JSON string into object
        cart_qty = JSON.parse(response);
        console.log(cart_qty);
    });

    document.write(`
    <ul>
        <li><a href="./products_display.html?product_key=Pokeballs">Home</a></li>
        <li><a href="./invoice.html${location.search}">Check Out: ${Number(cart_qty.qty)} In Cart</a></li>
        <li><a href="./login.html${location.search}">Login</a></li>
        <li><a href="./register.html${location.search}">Registration</a></li>
        <li><a href="./logout">Logout</a></li><br>
    </ul> 
    `);
    // Sub nav bar to navigate through products
    for (let product_key in allproducts) {
        document.write(`<a class="nav_items" href='./products_display.html?product_key=${product_key}'>${product_key}</a>`);
        
    }
}