//EXPRESS RELATED THINGS ARE IN APP.JS

const express = require('express');
require('./schedulers/scheduler');
const morgan = require('morgan');

const productsRouter = require('./Routes/productsRoutes');
const authRouter = require('./Routes/authRouter');
const userRoutes = require('./Routes/userRoutes'); 
const productsByUserIdRoutes = require('./Routes/productsByUserIdRoutes');
const usersByAdminRoutes = require('./Routes/usersByAdminRoutes');
const adminRoutes = require('./Routes/adminRoutes');

const CustomError = require('./Utils/CustomError');

const globalErrorHandler = require('./Controllers/errorController');

let app = express();

app.use(express.json()); //req body => json data

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