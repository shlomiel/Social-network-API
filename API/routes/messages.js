const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const db = require("../models/database");
const auth = require("./auth");

//send message

router.post("/sendmessage",async (req,res) => {
    try{
    const result = await auth.validate_user(req,res);
    if(result){
        res.status(StatusCodes.UNAUTHORIZED).json("Unauthorized");
        return;
    }


    const msg_id = await generate_id();
    const new_msg = {
        text : req.body.text,
        from : req.body.from,
        to : req.body.to,
        ID : msg_id,
        createion_date : new Date().toString()
    }
        await db.add_message(JSON.stringify(new_msg));

        res.status(StatusCodes.OK).json({ "message id" : msg_id });
        }
        catch(err){
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);

        }
    })






async function generate_id() {
    try{
        const messages = await db.get_messages().catch(result => {result = 1; return result;});
        if(messages == 1) {
            return messages;
        }
        const res = messages[messages.length - 1].ID + 1;
        return res;
    }
    catch(err) {
        console.log(err);
    }
 }


 module.exports = {
    router:router,
    generate_id:generate_id
}
