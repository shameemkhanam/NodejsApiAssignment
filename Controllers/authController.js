const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('../Utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id: id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    const options = {
        maxAge: process.env.LOGIN_EXPIRES,
        // secure: true, //secure: true, means cookie will be created and sent only with https url
        httpOnly: true
    };

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.cookie('jwt', token, options);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,                      //here token : token
        data: {
            user
        }
    });
}

exports.signup = asyncErrorHandler(async(req, res, next) => {
    // console.log('User from req:', req.user); // Debug log to check the user object

    const newUser = await User.create(req.body);

    // const token = signToken(newUser._id);

    // res.status(201).json({
    //     status: 'success',
    //     token,                      //here token : token
    //     data: {
    //         User: newUser
    //     }
    // });

    createSendResponse(newUser, 201, res);
});

exports.login = asyncErrorHandler(async(req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;

    // const { email, password} = req.body;

    //check if email and password are present in request body
    if(!email || !password){
        const error = new CustomError('Please provide emil & password for login!',400);
        return next(error);
    }

    //check if user exists with the given email
    const user = await User.findOne({email : email}).select('+password'); 
    // const user = await User.findOne({email});

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    //check if user exists and password matches
    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError('Incorrect email or password', 400);
        return next(error);
    }

    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token,
    //     // user ==> just for checking we kept user
    // });

    createSendResponse(user, 200, res);

});

exports.protect = asyncErrorHandler(async(req, res, next) => {

    //1. read the token and check if it exists
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        return next(new CustomError('You are not logged in!', 401)); 
    }

    //2. validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR); //jwt.verify is asynchronous, but it'll not return a promise so need to promisify it
    console.log('user exists',decodedToken);
    //for this v use util lib by nodejs


    //3. if the user exists
    const user = await User.findById(decodedToken.id);
    if(!user){
        return next(new CustomError('User with this token does not exist', 401));
    }

    const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    // //4. if the user changed the password after the token was issued
    if(isPasswordChanged){
        const error = new CustomError('Password has been changed recently, Please login again..', 401);
        return next(error);
    }

    //5. allow the user to access the route
    req.user = user;
    next();

});

exports.restrict = (role) => {  //a wrapper function which returns a middleware
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new CustomError('You do not have permission to perform this action', 403);
            return next(error);
        }
        next();
    }
}

//if v give multiple roles for an action:
// exports.restrict = (...role) => {  //a wrapper function which returns a middleware
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You do not have permission to perform this action', 403);
//             next(error);
//         }
//         next();
//     }
// }

exports.forgotPassword = asyncErrorHandler(async(req, res, next) => { 
    //1. GET USER BASED ON POSTED EMAIL
    const user = await User.findOne({email : req.body.email});
    if(!user){
        const error = new CustomError('Could not find the user with this email..',404);
        next(error);
    }

    //2. GENERATE RANDOM RESET TOKEN
    const resetToken = user.createResetPasswordToken();
    await user.save({validateBeforeSave: false});

    //3. SEND TOKEN BACK TO THE USER EMAIL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
    const message = `Please use below link to reset your password\n${resetUrl}, valid for only 10 min.`;
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password change request is received',
            message: message
        });
        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to the user email.'
        });
    }
    catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        user.save({validateBeforeSave:false});
        return next(new CustomError('There was an error while sending password reset link..plz try again later', 500));
    }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => { 
    //1. IF THE USER EXISTS WITH GIVEN TOKEN & TOKEN HAS NOT EXPIRED.
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken : token, passwordResetTokenExpires: {$gt : Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or is expired.', 400);
        next(error);
    }

    //2. RESETTING THE USER PASSWORD.
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    //3. LOGIN THE USER AUTOMATICALLY.
    // const logintoken = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token: logintoken
    // });
    createSendResponse(user, 200, res);

});

