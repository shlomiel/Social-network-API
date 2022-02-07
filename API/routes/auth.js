const res = require("express/lib/response");
const { StatusCodes } = require("http-status-codes");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/database");

module.exports = {
    router:router,
    validate_user:validate_user
}

ACCESS_TOKEN_SECRET = '95930c67bf8623df771451eb8ea5d11bc22bc3214f178fee23bd3ed8e0331d7f5da8899bbe485333cea6e2d650d328e3b86a1c32c84236853fdff1e2fca83a7b'
ACCESS_TOKEN_SECRET_REFRESH = 'ca9fbbf229251005005858707faf06b33a668b78f8a1382e028f72ca0fae647d74bae7c56aa6f2e98b73afed5ab033c300f5d55194c2ca0fae647d74bae7c56aa6f2e98b73afed5ab033c300f5d55194cde3f4ad19447b3d9bca78'


//////////////////////////// REGISTER
router.post("/register", async (req,res) => {

try {

    //first check if user with that email
    if(await db.find_user(req.body.email)){
        res.status(StatusCodes.UNAUTHORIZED).json("A user associated with that email adress allready exists in the system.");
        return;
    }


    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(req.body.password, salt);
    
    //create new user
    const json_user = {
        username:req.body.username,
        email:req.body.email,
        password:hashed_password,
        ID: await generate_id(),
        status:"created",
        is_admin:false,
        createion_date: new Date().toString()
    }

    const new_user = JSON.stringify(json_user);


    //save user and  responsd
    await db.add_user(new_user,);
    res.status(StatusCodes.OK).json("User Created");
    return;
    }
catch(err){
    res.status(StatusCodes.NOT_ACCEPTABLE);
    console.log(err);
}
});


/////////////////////////// LOGIN/
router.post("/login", async(req,res) => {
    try{
    let user_array = await db.get_users();
    

    for(const user of user_array){

        if( !user.email.localeCompare(req.body.email)  ){  
            const valid_password = await bcrypt.compare(req.body.password, user.password);
            !valid_password && res.status(StatusCodes.BAD_REQUEST).json("wrong password");

            //Authenticated user
            const access_token =   jwt.sign({email : user.email},ACCESS_TOKEN_SECRET,{expiresIn: '20m'});
            console.log(access_token);
            db.set_token_map(access_token,req.body.email);
            res.status(StatusCodes.OK).json(access_token);
            return;
        }
    }

    !user && res.status(StatusCodes.BAD_REQUEST).json("user not found");

    }
    catch(err)
    {
        console.log(err);
    }
});



 async function generate_id() {

    try
    {
       
        const users = await db.get_users().catch(res => {res = 1;return res;});
        if(users == 1){
            return 1;
        }
        
        
        const res = users[users.length - 1].ID + 1;
        
        return res;
    }
    catch(err)
    {
        console.log(err);
    }
 }



 function authenticate_token(req,res) {

     const auth_header = req.headers['authorization'];
     const token = auth_header && auth_header.split(' ')[1];
     if (token == null)
          return res.sendStatus(StatusCodes.UNAUTHORIZED) // unauthorized token
    
    jwt.verify(token,ACCESS_TOKEN_SECRET, (err, user) => {
        if(err)
             return res.sendStatus(StatusCodes.FORBIDDEN); // This token is no longer valid
        req.user = user;
        return;
    });
}


async function validate_user(req,res)
{
    const auth_result = await authenticate_token(req,res);
    if(auth_result == StatusCodes.FORBIDDEN || auth_result == StatusCodes.UNAUTHORIZED){
        res.status(res).json(res.toString());
        return res;
    }
    
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    const post_author = await db.get_token_map(token);

    const user = await db.find_user(post_author);
    if(!user){ 
        res.status(StatusCodes.UNAUTHORIZED).json(StatusCodes.UNAUTHORIZED);
        return res;
    }
    if( user.status.localeCompare("active") ){
        res.status(StatusCodes.UNAUTHORIZED).json(StatusCodes.UNAUTHORIZED);
        return res;
    }
    
}

