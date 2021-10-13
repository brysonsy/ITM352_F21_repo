var product_quantities = [2,1,1,3,12];

<table border="1">
        <tr><th>Product #</th><th>Quantity</th></tr>
        <script>
for(var i = 0; i < product_quantities.length; i++){
        document.write(`<tr><td>${i + 1}</td><td>${product_quantities[i]}</td></tr>`)
};
</script>