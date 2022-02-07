
External packeges i've used:

"jsonwebtoken" -
JWT is used for stateless authentication mechanisms for users, i've used this packge to easily maintain a user secured session within the backend server.
within the the backend server a .env file contains the JWT "secrets" for generating valid tokens.
The package creates a "bearer token", which i've set its experation for 20 minutes once logged in, beyond this time the user wont be able to perform any action before relogin.
i've added a refresh token to provide a better user experience in the future.
the main advantage is that there is no need to store any special data, besides the "secrets"


"bcrypt" -
bcrypt package has a password hashing function that allows you to easily create a hash out of a password string.
i've used this package in order to save encrypted password within the server DB, when users logged in the packge function compares the password provides by user with the encrypted password in the DB, if there is a match then the user is authnticated.
the main adavnatge is that if for some reason the backend server DB is compramized, passwords wont be availabe to the attacker.
when users first signup, the package stores its hashed password within the backend DB.


About the project:
The server runs on localhost, port 2718.

Admin is created upon launch.
The server uses 3 Files as a Database: messages.json, posts.json, users.json. all 3 files will be created in the directory:  'c:\\temp\\JsEx2ApiFiles';
So be sure to delete it after.


1. first use "npm install" to install dependecies.
2. In order to run the server use "node server.js
3. postman scripts to check most of the api calls have been added.
