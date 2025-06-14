const fs = require('fs');
const https = require('https');
const express = require('express');
const { Mutex } = require('async-mutex');
const app = express();
const logged_in_users = [];
const distress_signal_list = [];
const sig_mutex = new Mutex();
const user_mutex = new Mutex();

//TODO: HASH THE USER PASSWORDS
//const filteredNumbers = numbers.filter(num => num !== 20); // Removes 20

class acDistressSignal {
   constructor(params)
   {
      this.user_location_lat = params.user_location_lat;
      this.user_location_mag = params.user_location_mag;
      this.got_help = 0;
      this.name = params.name;
      this.session_id = params.session_id;
   }
}

class acResponse {
   constructor(res, reas)
   {
      this.response = res;
      this.reason = reas;
   }
}

class acUser {
   name =  ""; // name
   email =  ""; // name
   session_id = ""; //session_id
   password = "";  //password
   user_location_lat = ""; //user_location_lat
   user_location_mag = ""; //user_location_mag
   user_availability = "false"; // default false and yes... string lol
   extra_params = []; // for future usage.
   constructor(params){
      for (const key of params){
         if (key === "name")
         {
            this.name = params[key];
         }
         else if (key === "email")
            this.email = params[key];
         else if (key === "password")
            this.password = params[key];
         else if (key === "user_availability")
            this.user_availability = params[key];
         else {
            this.extra_params.key = params[key];
         }
      }
      this.session_id = crypto.randomUUID();
   }
}

async function userSignUp(params){
   if (!(params.includes("email")) || !(params.includes("password")))
   {
      return new acResponse("false", "Incomplete sign up form");
   }
   const release = await user_mutex.acquire(); 
   try {
      for (user of logged_in_users){
            if (params.email === user.email)
            {
               return new acResponse("false", "User email already registered");
            }
         }
      new_user = new acUser(params);
      logged_in_users.push(new_user);
   }
   finally {
      release()
   }
   return new acResponse("true", new_user.session_id);
}


async function userUpdateLocation(params){
   if (!["email", "session_id", "user_location_lat", "user_location_mag"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Faulty location update");
   }
   const release = await user_mutex.acquire(); 
   try {
      for (user of logged_in_users){
         if (params.email === user.email)
         {
            if (params.new_session_id !== user.session_id)
               return new acResponse("false", "Faulty location update");
            user.user_location_lat = params.user_location_lat;
            user.user_location_mag = params.user_location_mag;
            return new acResponse("true", "User location was updated successfully");
         }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Faulty location update");
}

async function userUpdateAvailability(params){
   if (!["email", "session_id", "user_availability", "user_location_mag"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Faulty availability update");
   }
   const release = await user_mutex.acquire(); 
   try {
      for (user of logged_in_users){
         if (params.email === user.email)
         {
            user.user_availability = params.user_availability;
            return new acResponse("true", "Availability was updated successfully");
         }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Faulty availability update");
}

async function userSignal(params){
   if (!["email", "session_id", "user_location_lat", "user_location_mag"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Incomplete signal formation");
   }
   const release = await user_mutex.acquire(); 
   try {
      for (user of logged_in_users){
         if (params.email === user.email)
         {
            if (params.session_id !== user.session_id){
               return new acResponse("false", "Incomplete signal formation"); //TODO: consider allowing all signals anyways
            }
            const release_sig = await sig_mutex.acquire();
            distress_signal_list.push(new acDistressSignal(params));
            release_sig();
            return new acResponse("true", "Stress singal registed, sit tight, help is coming");
         }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Incomplete signal form");
}

async function userRemoveSignal(params){
   if (!["email", "session_id"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Incomplete signal removal formation");
   }
   const release = await sig_mutex.acquire(); 
   try {
      for (signal of distress_signal_list){
         if (signal.session_id === user.session_id && signal.name === user.name)
         {
            distress_signal_list = distress_signal_list.filter(sig => sig.session_id !== signal.session_id); // Removes sig
            return new acResponse("true", "Stress singal removed successfully");
         }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Incorrect signal removal formation");
}

async function userRespondSignal(params){
   if (!["email", "session_id", "signal_session_id"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Incomplete signal response formation");
   }
   const release = await sig_mutex.acquire(); 
   try {
      for (signal of distress_signal_list) {
      if (signal.session_id === user.signal_session_id) {
         signal.got_help += 1;
         return new acResponse("true", "Successfully responded to signal");
      }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Incorrect signal response formation");
}

async function userLogin(params){
   if (!["email", "password"].every(type => params.includes(type)))
   {
      return new acResponse("false", "Incomplete log in form");
   }
   const release = await user_mutex.acquire();
   try {
      for (user of logged_in_users){
         if (params.email === user.email)
         {
            if (params.password !== user.password){
               return new acResponse("false", "Failed to log in");
            }
            user.session_id = crypto.randomUUID();
            new_session_id = user.session_id;
            return new acResponse("true", new_session_id);
         }
      }
   }
   finally {
      release()
   }
   return new acResponse("false", "Failed to log in");
}

// cookie stuff:
//document.cookie = "username=John Doe; expires=Thu, 18 Dec 2013 12:00:00 UTC; path=/";
class acReq {
   valid_req_types = ["login", "sign_up", "signal", "ask_ai", "update_location", "update_availability", "remove_signal", "respond_signal"];
   req_type =  ""; // request_type
   session_id = ""; //session_id
   extra_params = {}; // for future usage.
   is_valid_req = true;
   constructor(params){
      for (const key in params){
         if (key === "request_type")
         {
            this.req_type = params[key];
         }
         else if (key === "session_id")
            this.session_id = params[key];
         else {
            this.extra_params.key = params[key];
         }
      }
      if (!(this.req_type in this.valid_req_types)){
         this.is_valid_req = false;
         return ;
      }
   }
   async handleRequest(){
      // valid_req_types = ["login", "sign_up", "signal", "ask_ai"];
      request_ret = {};
      switch (this.req_type){
         case "login":
            request_ret = await userLogin(this.extra_params);
            break;
         case "sign_up":
            request_ret = await userSignUp(this.extra_params);
            break;
         case "update_location":
            request_ret = await userUpdateLocation(this.extra_params);
            break;
         case "update_availability":
            request_ret = await userUpdateAvailability(this.extra_params);
            break;
         case "signal":
            request_ret = await userSignal();
            break;
         case "remove_signal":
            request_ret = await userRemoveSignal();
            break;
         case "respond_signal":
            request_ret = await userRespondSignal();
            break;
         case "ask_ai":
            // request_ret = userAskAI();
            break;
      }
      return request_ret;

   }

}

app.use(express.urlencoded({ extended: true }));

// Read SSL certificate and key
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.codingwithdox.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.codingwithdox.com/cert.pem')
};

app.get('/app', async function(req, res){
   const data = JSON.parse(JSON.stringify(req.query));
   if ( data === undefined ||  Object.keys(data).length === 0)
   {
      res.send(`{success: "false", error_message: "Invalid request data"}`);
   }
   const new_request = acReq(data);
   console.log(new_request);
   if (new_request.is_valid_req === false)
   {
      res.send(`{success: "false", error_message: "Unknown request type"}`);
      return ;
   }
   request_ret = await new_request.handleRequest();
   console.log(request_ret);
   res.send(request_ret);
});

app.post('/app', async function(req, res){
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
   console.log('HTTPS Server running on port 8080');
});

