const res = require("express/lib/response");
const router = require("express").Router();
const fsp = require('fs').promises;

const users_path = 'c:\\temp\\JsEx2ApiFiles\\users.json';
const posts_path = 'c:\\temp\\JsEx2ApiFiles\\posts.json';
const messages_path = 'c:\\temp\\JsEx2ApiFiles\\messages.json';


const token_map = new Map();  //Maps token to email
 

function get_token_map(key)
{
    return token_map.get(key);
}

function set_token_map(key,val){
    token_map.set(key,val);
}


async function get_users() {
    //Return value: array of json objects
    const data = await fsp.readFile(users_path, 'utf8');
    let user_array = data.split('\n');
    let res_array = [];

    for (user of user_array) {
        if (user.localeCompare("")) {
            user.trimEnd();
            res_array.push(JSON.parse(user));
        }

    }
    return res_array;

}




 async function add_user(user_to_add) {
    //Input parameter is string
    await fsp.appendFile(users_path, user_to_add + '\n', 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
        }

    });
    console.log("New user added to JSON file.");
}


 async function update_users (users) {

    try{
    string_users = [];
    for(user of users){
        string_users.push(JSON.stringify(user)+'\n');
    }

    await fsp.writeFile(users_path, '', 'utf8', function (err) {
        if (err) 
            console.log("An error occured while writing JSON Object to File.");
    });    

    for(user of string_users){
        await fsp.appendFile(users_path, user, 'utf8', function (err) {
            if (err) 
                console.log("An error occured while writing JSON Object to File.");
            });
        }
        
    console.log("JSON file has been updated.");
    }

    catch(err){
        console.log(err);
    }
}



async function find_user(email){
    const users = await get_users().catch(res => {return null;});
    if(!res)
        return null;

    for(user of users){
        if(!user.email.localeCompare(email)){
            return user;
        }
    }
    return null;
}



async function get_posts() {
    //Return value: array of json objects
    const data = await fsp.readFile(posts_path, 'utf8');
    let post_array = data.split('\n');
    let res_array = [];

    for (post of post_array) {
        if (post.localeCompare("")) {
            post.trimEnd();
            res_array.push(JSON.parse(post));
        }

    }
    return res_array;
}

async function find_post(id) {// return json object of post
    try{
    const posts = await get_posts();
    for(post of posts){
        if(post.ID == id){
            return post;
        }
    }
    return null;
}
catch(err){
    console.log(err);
}
}


 async function add_post(post_to_add) {
    //Input parameter is string
    await fsp.appendFile(posts_path, post_to_add + '\n', 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
        }

    });

    console.log("New post added to JSON file.");
}



async function delete_post(id){
    let posts = await get_posts();
    posts = posts.filter(function (ele){
        return ele.ID != id;
    });

    await fsp.writeFile(posts_path, "", 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
        }
        
    });
    
    for(post of posts){
        await fsp.appendFile(posts_path, JSON.stringify(post)+'\n', 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing post to File.");
            }
            
        });
    }

    
}



async function add_message(msg_to_add) {
    //Input parameter is string
    await fsp.appendFile(messages_path, JSON.stringify(msg_to_add) + '\n', 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing message to File.");
        }

    });

    console.log("New message added to JSON file.");
}




async function get_messages() {
    //Return value: array of json objects
    const data = await fsp.readFile(messages_path, 'utf8');
    let msg_array = data.split('\n');
    let res_array = [];

    for (msg of msg_array) {
        if (msg.localeCompare("")) {
            msg.trimEnd();
            res_array.push(JSON.parse(msg));
        }

    }
    return res_array;
}


module.exports = {
    get_users : get_users,
    add_user : add_user,
    update_users : update_users,
    find_user : find_user,
    add_post : add_post,
    delete_post : delete_post,
    get_posts : get_posts,
    find_post : find_post,
    get_token_map : get_token_map,
    set_token_map : set_token_map,
    get_messages : get_messages,
    add_message : add_message
}

