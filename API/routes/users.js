const res = require("express/lib/response");
const { StatusCodes } = require("http-status-codes");
const admin = require("./admin");
const auth = require("./auth");
const router = require("express").Router();
const db = require("../models/database");


router.post("/deleteaccount",async (req,res)  =>{
    try{
    const result = await auth.validate_user(req,res);
    if(result)
    {
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }
    
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];
    const user = db.get_token_map(token);
    await admin.change_status("deleted",user);

    res.status(StatusCodes.OK).json("User deleted");
    
}
catch(err){
    console.log(err);
}

});


module.exports = router