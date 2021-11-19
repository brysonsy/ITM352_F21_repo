var fs = require('fs');
var express = require('express');
var app = express();
var myParser = require("body-parser");
const { exit } = require('process');
var filename = "./user_data.json";
 
app.use(myParser.urlencoded({ extended: true }));
 
 
if (fs.existsSync(filename)) {
    data = fs.readFileSync(filename, 'utf-8');
 
    user_data = JSON.parse(data);
    console.log("user_data: ", user_data);
 
    fileStats = fs.statSync(filename)
    console.log("user_data.json has " + fileStats.size + " characters");
} else {
    console.log("whoopsies");
}
 
app.get("/login", function (request, response) {
    console.log("request.query()" + JSON.stringify(request.query));
    let str = "<body>";
    if (request.query['error'] != undefined) {
        str += `<h1>${request.query['error']}!</h1>`;
    }
    if (request.query['user'] != undefined && request.query['password'] != undefined) {
        str += `
            <form action="" method="POST">
                <input type="text" name="username" size="40" placeholder="enter username" value="${request.query['user']}"><br />
                <input type="password" name="password" size="40" placeholder="enter password" value="${request.query['password']}"><br />
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
        `;
    } else {
        str += `
        <body>
            <form action="" method="POST">
                <input type="text" name="username" size="40" placeholder="enter username" ><br />
                <input type="password" name="password" size="40" placeholder="enter password"><br />
                <input type="submit" value="Submit" id="submit">
            </form>
        </body>
        `;
    }
    response.send(str);
});
 
app.post("/login", function (request, response) {
    console.log("Got a POST to login")
    let POST = request.body;
 
    let user_name = POST['username'];
    let user_pass = POST['password'];
    console.log("username:", user_name, "password:", user_pass);
 
    if (user_data[user_name] != undefined) {
        if(user_data[user_name].password == user_pass) {
            response.send("Good login")
        } else {
            response.redirect("/login?error=Bad Login");
        }
    } else {
        response.redirect("/login?error=Bad username");
    }
});
 
app.get("/register", function (request, response) {
    str = `
    <body>
        <form action="/register" method="POST">
            <input type="text" name="username" size="40" placeholder="enter username" ><br />
            <input type="password" name="password" size="40" placeholder="enter password"><br />
            <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
            <input type="email" name="email" size="40" placeholder="enter email"><br />
            <input type="submit" value="Submit" id="submit">
        </form>
    </body>
    `;
    response.send(str);
 });
 
 app.post("/register", function (request, response) {
    console.log("Got a POST to register")
    let POST = request.body;
 
    let user_name = POST['username'];
    let user_pass = POST['password'];
    let user_pass_repeat = POST['repeat_password'];
    let user_email = POST['email'];
   
    data = require(filename);
    let names  = [];
    for (const user in data) {
        let username = data[user].name;
        names.push(username);
    }
    console.log("All users: " + JSON.stringify(names));
    if ((!names.includes(user_name)) && (user_pass == user_pass_repeat)){
        user_data[user_name] = {};
        user_data[user_name].name = user_name;
        user_data[user_name].password = user_pass;
        user_data[user_name].email = user_email;
 
        data = JSON.stringify(user_data);
        fs.writeFileSync(filename, data, "utf-8");
 
        response.redirect("/login?" + "user=" + user_name + "&password=" + user_pass);
    } else {
        response.redirect("/register");
    }
 });
 
app.listen(8080, () => console.log(`listening on port 8080`));