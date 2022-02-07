const res = require("express/lib/response");
const { StatusCodes } = require("http-status-codes");
const router = require("express").Router();
const db = require("../models/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const msg = require("./messages");
const { find_user } = require("../models/database");

let is_logged_in = false;

/*
• The admin can
• List all users
• Approve a request to join network
• Suspend or delete a user
• Restore a suspended user
• Send a message to all users or to a single one
• Delete a post of a user
*/


router.get("/login",async (req,res)  =>{
    try{
        let user_array = await db.get_users();
        for(const user of user_array){
    
            if( !user.email.localeCompare(req.body.email)  && user.is_admin ){  
                const valid_password = await bcrypt.compare(req.body.password, user.password);
                !valid_password && res.status(StatusCodes.BAD_REQUEST).json("wrong password");
    
                //Authenticated user
                const access_token =   jwt.sign({email : user.email},ACCESS_TOKEN_SECRET,{expiresIn: '20m'});
                console.log(access_token);
                db.set_token_map(access_token,req.body.email);
                res.status(StatusCodes.OK).json(access_token);
                is_logged_in = true;
                return;
            }
        }
    
        !user && res.status(StatusCodes.BAD_REQUEST).json("admin not found");
    
        }
        catch(err)
        {
            console.log(err);
        }
    });
    

async function authorize_admin(req,res)
{
    const result = await auth.validate_user(req,res);
    if(result){
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }

    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    const post_author = db.get_token_map(token);

    if( await db.find_user(post_author).is_admin ){
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }
    

}

router.get("/getusers", async (req,res) =>{
    try{

        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }


        const user_array = await db.get_users();
        let res_array = [];

        for(user of user_array){
            res_array.push(JSON.stringify(user)+ '\n');
        }

        res.status(StatusCodes.OK).json(res_array);
    }   
    
    catch(err)
    {
        console.log(err);
        res.status(StatusCodes.NOT_FOUND);

    }

})


router.post("/approve", async (req,res)=>{
    try{
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
       await change_status("active",req.body.user);
       res.status(StatusCodes.OK).json(req.body.user + " approved");
}
    catch(err){console.log(err);}
})


router.post("/suspend", async (req,res)=>{
    try{
       
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        await change_status("suspended",req.body.user);
        res.status(StatusCodes.OK).json(req.body.user + " suspended");
    }

    catch(err){console.log(err);}
})


router.post("/restore", async (req,res)=>{
    try{
       
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        await change_status("active",req.body.user);
        res.status(StatusCodes.OK).json(req.body.user + " restored");
    }

    catch(err){console.log(err);}
})


router.post("/delete", async (req,res)=>{
    try{
       
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        await change_status("deleted",req.body.user);
        res.status(StatusCodes.OK).json(req.body.user + " deleted");
    }

    catch(err){console.log(err);}
})








async function change_status(new_status,user_to_update){
    try{

        let  user_array = await db.get_users();  
        for(let user of user_array){
            if( !user.email.localeCompare(user_to_update) )
                user.status = new_status;
        }   
        await db.update_users(user_array);
        return;
    }
        catch(err){console.log(err);}
    }


/////////////////////send a messsage to all users

router.post("/send_messages", async (req,res)=>{
    try{

         
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        const users = await db.get_users();
    
        for(user of users)
            await db.add_message({
            text: req.body.text,
            from : "admin",
            to:user.email,
            ID : await msg.generate_id()
        });

        res.status(StatusCodes.OK).json("Message sent");

        
    }
    catch(err){console.log(err);}
})




////////////////////delete post
router.post("/delete_post", async(req,res)=>{
    try{
        const result = await authorize_admin(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        const post_id = req.body.id;
        await db.delete_post(post_id);
        res.status(StatusCodes.OK).json("Post " + req.body.id + ' deleted')

    }
    catch(err){console.log(err);}
})







module.exports = {
    router:router,
    change_status: change_status
}