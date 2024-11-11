const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('../Utils/email');
const crypto = require('crypto');
const authController = require('./authController');

const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((prop)=>{
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop];
        }
    })
    return newObj;
}

//This will give all users : active and inactive users
exports.getAllUsers = asyncErrorHandler(async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        count: users.length,
        data: {
            users
        }
    });
});

exports.updatePassword = asyncErrorHandler(async(req, res, next) => {
    //GET CURRENT USER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password');

    //CHECK IF THE SUPPLIED CURRENT PWD IS CORRECT
    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError('Current pwd u provided is wrong', 401));
    }

    //IF SUPPLIED PWD IS CORRECT , THEN UPDATE USER PWD WITH NEW VALUE
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //LOGIN USER AND SEND JWT
    
    authController.createSendResponse(user, 200,res);

});

exports.updateMe = asyncErrorHandler(async(req, res, next) => {
    //1. CHECK IF REQ CONTAINS PWD OR CONFIRM PWD
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('Cannot update your password using this endpoint', 400));
    }

    //UPDATE USER DETAILS
    const filterObj = filterReqObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators:true}, {new:true});

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = asyncErrorHandler(async(req, res, next) => {

    //NOT ACTUALLY DELETING THE USER FRM DB, JUST SETTING ACTIVE FIELD TO FALSE --> SOFT DELETE

    await User.findByIdAndUpdate(req.user.id, {active:false});

    res.status(204).json({
        status: 'success',
        data: null
    });
});

