require("./products_data.js");

var num_products = 5;
for (var count = 1; eval("typeof name"+count) != 'undefined'; count++) {
    if (count > num_products/2) {
        console.log("That's enough!");
        process.exit();
    }
    console.log(`${count}. ${eval('name' + count)}`);
}
