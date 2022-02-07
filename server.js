// External modules
const express = require('express')
const package = require('./package.json');
const dotenv = require("dotenv");
const fsp = require('fs').promises;
const fs = require('fs');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const dirpath = 'c:\\temp\\JsEx2ApiFiles';
const path = require('path');
const db = require("./models/database");


//routes
const users_route = require("./routes/users");
const auth_route = require("./routes/auth");
const posts_route = require("./routes/posts");
const admin_route =  require("./routes/admin");
const message_route = require("./routes/messages");
const { debuglog } = require('util');


const app = express()


dotenv.config();

let  port = 2718;


// General app settings
const set_content_type = function (req, res, next) 
{
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	next()
}

app.use( set_content_type );
app.use(express.json());  // to support JSON-encoded bodies
app.use(express.urlencoded( // to support URL-encoded bodies
{  
  extended: true
}));
//app.use(helemt());
//app.use(morgan("common"));
app.use("/api/users",users_route);
app.use("/api/auth",auth_route.router);
app.use("/api/posts",posts_route);
app.use("/api/admin",admin_route.router);
app.use("/api/messages",message_route.router);



// API functions

// Version 
function get_version( req, res) 
{
	const version_obj = { version: package.version, description: package.description };
	res.send(  JSON.stringify( version_obj) );   
}


// Routing
const router = express.Router();
app.use('/api',router);


// Init 
init();


 async function init(){
	 try{
		const dirname = path.dirname(dirpath);
		if(!ensure_directory_existence())
			await fsp.mkdir(dirpath);

		const salt = await bcrypt.genSalt(10);
		const hashed_password = await bcrypt.hash("654321", salt);
		await db.update_users([{
			username:"admin",
			email:"king@admin.com",
			password:hashed_password,
			ID: 0,
			status:"active",
			is_admin:true,
			createion_date: new Date().toString()
	}]);
		

		
		let msg = `${package.description} listening at port ${port}`
		app.listen(port, () => { console.log( msg ) ; })
	 }
	 catch(err){
		 console.log(err);
	 }
 }


  function ensure_directory_existence() {
	//var dirname = path.dirname(dirpath);
	if (fs.existsSync(dirpath)) 
	  return true;	
}