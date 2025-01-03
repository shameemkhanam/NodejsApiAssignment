//THINGS NOT RELATED TO JUST NODE ARE IN SERVER.JS
const path = require('path');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Determine environment (default to 'development' if not specified)
// const environment = process.env.NODE_ENV || 'development';

// Load environment-specific .env file
// dotenv.config({
//     path: path.resolve(__dirname, `./config/${environment}.env`),
// });

const mongoose = require('mongoose');

process.on('uncaughtException', (err)=>{
    console.log(err.name, err.message);
    console.log('uncaught exception occured..shutting down..');
    process.exit(1);  //code '0'=success and '1'=uncaught exception
})

const app = require('./app');


console.log('current environment:',app.get('env')); //gives environment in which v r working 
// console.log(process.env);

mongoose.connect(process.env.LOCAL_CONN_STR).then((conn) => {
    // console.log(conn);
    console.log('DB connection successfull!');
})
// .catch((error) => {
//     console.log('Some error has occured');
// });

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server started at PORT: ${PORT}`);
})

process.on('unhandledRejection', (err)=>{
    console.log(err.name, err.message);
    console.log('unhandled rejection occured..shutting down..');
    server.close(()=>{
        process.exit(1);  //code '0'=success and '1'=uncaught exception
    });
})

module.exports = server;
//  console.log(x);// here x is not defined, this line is executing synchronously, so it is exception
// console.log(x);