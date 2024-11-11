const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const User = require('../Models/userModel');
const CustomError = require('../Utils/CustomError');

exports.addUsers = asyncErrorHandler(async(req, res, next) => {

    const { name, email, password, confirmPassword, photo } = req.body;

        // Validate required fields
        if (!name || !email || !password || !confirmPassword) {
            return next(new CustomError('Please provide name, email, password, and confirm password.', 400));
        }

        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new CustomError('Email is already registered.', 400));
        }

        // Create the new user
        const newUser = await User.create({
            name,
            email,
            password,
            confirmPassword,
            photo            
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });

});

exports.updateUsers = asyncErrorHandler(async(req, res, next) => {
    const { userId } = req.params; // Get the ID from the route parameter
        const updates = req.body; // Get the updates from the request body

        // Find the user by ID and update
        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true, // Return the updated document
            runValidators: true, // Ensure the new data meets validation requirements
        });

        // If user is not found, return an error
        if (!user) {
            return next(new CustomError('User not found', 404));
        }

        // Send the updated user as response
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
});