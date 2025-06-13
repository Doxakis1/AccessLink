const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: true }));

// Read SSL certificate and key
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.codingwithdox.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.codingwithdox.com/cert.pem')
};

app.get('/app', function(req, res){
   console.log(JSON.parse(JSON.stringify(req.query)));
   console.log(req.query);		
   console.log("Query parameters:", req.body);
 //  res.send("Hello world via HTTPS!");
   res.send(`
        <form method="POST" action="/app">
            <label>Name: <input type="text" name="name" required></label><br><br>
            <label>Age: <input type="number" name="age" required></label><br><br>
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post('/app', function(req, res){
   const obj = req.body;		
   console.log("We got username: ", obj);
   if (obj?.name){
   	console.log("We got username: " + obj.name);
   }   
   console.log("Query parameters:", req.body);
   res.send("Hello world via HTTPS!");
});

// Create HTTPS server
https.createServer(options, app).listen(8080, function() {
   console.log('HTTPS Server running on port 3000');
});

