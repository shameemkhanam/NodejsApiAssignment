const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); //for creating random hash not much tougher, as with bcrypt

//name, email, pwd, confirm pwd, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    photo: String,
    role:{
        type: String,
        enum:['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm password.'],
        validate: {
            //this validator will only work for save() and create()
            validator: function (val) {
                return val == this.password;
            },
            message: 'Password and confirm password does not match!'
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    wantsNotifications: { 
        type: Boolean, 
        default: true // assume users want notifications by default, or you can set it to false 
    }
}, {
    timestamps : true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    //encrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12); // here 12 is the value( cost ) for salting the password, higher the value , the more secure encryption is done.
    this.confirmPassword = undefined;
    next();
})

//query middleware : the below middleware, we want it to be executed every time when any query which starts with 'find'
userSchema.pre(/^find/, async function(next){
    //this keyword in the function will point to current query
    this.find({active:{$ne : false}});
    next();
})

//an instance method, means v can call it on instance ex user
userSchema.methods.comparePasswordInDb = async function(pwd, pwdDB){
    return await bcrypt.compare(pwd, pwdDB);
}

//an instance method
userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        // console.log(this.passwordChangedAt, JWTTimestamp);
        const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10); //converting frm ms to sec
        return JWTTimestamp < passwordChangedTimestamp;
    }
    return false;
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); //it is not encrypted, but a plain token

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log(resetToken, this.passwordResetToken);

    this.passwordResetTokenExpires = Date.now() + 10*60*1000; // in milliseconds

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;