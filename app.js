//EXPRESS RELATED THINGS ARE IN APP.JS

const express = require('express');
require('./schedulers/scheduler');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit'); 
const helmet = require('helmet'); //adds security headers
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const productsRouter = require('./Routes/productsRoutes');
const authRouter = require('./Routes/authRouter');
const userRoutes = require('./Routes/userRoutes'); 
const productsByUserIdRoutes = require('./Routes/productsByUserIdRoutes');
const usersByAdminRoutes = require('./Routes/usersByAdminRoutes');
const adminRoutes = require('./Routes/adminRoutes');

const CustomError = require('./Utils/CustomError');

const globalErrorHandler = require('./Controllers/errorController');

let app = express();

app.use(helmet());

let limiter = ratelimit({
    max: 1000,
    windowMs : 60*60*1000,   //no. of millisec in one hour
    message: 'We have received too many requests from this IP address. Plz try after one hour'
});
app.use('/api', limiter);

// app.use(express.json()); //req body => json data
app.use(express.json({limit:'10kb'})); //req body => json data

app.use(sanitize());
app.use(xss()); //cleans any user input from malitious html code

app.use(hpp({whitelist:['price', 'rating']})); //prevents any parameter pollution: ex: passing 2 sorts as in  /api/products?sort=price&sort=ratings ==> here 
//hpp will take the last param sort=ratings and sort the result

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: false }));  //req body => For URL encoded data , form submissions/ html from FE

app.use(express.static('./public')); //go to localhost:/8000/templates/demo.html

// app.use((req, res, next) => {
//     req.requestedAt = new Date().toISOString();
//     next();
// });

//apis
// app.get('/api/products', getAllProducts);
// app.get('/api/products/:id', getProductById);
// app.post('/api/products', createProduct);
// app.delete('/api/products/:id', deleteProduct);

//using routes
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);
app.use('/api/products/user', productsByUserIdRoutes);
app.use('/api/users', usersByAdminRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message: `Cannot find ${req.originalUrl} url..`
    // });
    //-----------or--------
    // const err = new Error(`Cannot find ${req.originalUrl} url..`);
    // err.status = 'fail';
    // err.statusCode = 404;
    //-----------or---------
    const err = new CustomError(`Cannot find ${req.originalUrl} url..`, 404);
    next(err);
});

app.use(globalErrorHandler);

module.exports = app;