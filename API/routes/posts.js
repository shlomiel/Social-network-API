const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const db = require("../models/database");
const auth = require("./auth");

//create a post

router.post("/newpost",async (req,res) => {
    try{
    const result = await auth.validate_user(req,res);
    if(result){
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }

    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    const post_author = await db.get_token_map(token);
    const post_id = await generate_id();

   const new_post = {
    text : req.body.text,
    author : post_author,
    ID : post_id,
    createion_date : new Date().toString()
 }
    await db.add_post(JSON.stringify(new_post));
    res.status(StatusCodes.OK).json({"Post_id:" : new_post.ID});
    }
    catch(err){
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);

    }
})





//delete a post
router.post("/deletepost",async (req,res) => {
try{
    const result = await auth.validate_user(req,res);
    if(result)
    {
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }
    const post = await db.find_post(req.body.id)
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    const post_author = db.get_token_map(token);

   // const user = await db.find_user(post_author);
    if(  post_author.localeCompare(post.author)) {
        res.status(StatusCodes.UNAUTHORIZED).json("its not possible to delete someone elses post ");
        return;
   }
    
   await db.delete_post(req.body.id);
   res.status(StatusCodes.OK).json("Post " + req.body.id +" deleted.");
        
 }

   catch(err){
       console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);

}
});


//get a post
router.get("/getpost",async (req,res) => {
    try{
        const result = await auth.validate_user(req,res);
        if(result){
            res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
            return;
        }
        const post = await db.find_post(req.body.id);
        res.status(StatusCodes.OK).json(post);
       }
    catch(err){
           console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
});



//get all posts
router.get("/getallposts",async (req,res) => {
    try{
          const result = await auth.validate_user(req,res);
            if(result)
            {
                res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
                return;
            }
            const posts = await db.get_posts();
            res.status(StatusCodes.OK).json(posts);
           }   
    catch(err){
            console.log(err);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
        }
});



async function generate_id() {
    try{
        const posts = await db.get_posts().catch(result => {result = 1; return result;});
        if(posts == 1) {
            return posts;
        }
        const res = posts[posts.length - 1].ID + 1;
        
        return res;
    }
    catch(err) {
        console.log(err);
    }
 }


module.exports = router
