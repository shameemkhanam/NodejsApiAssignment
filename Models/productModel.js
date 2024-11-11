const mongoose = require('mongoose');
const User = require('../Models/userModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description  is required!'],
        trim: true
    },
    published: {
        type: Boolean,
        required: [true, 'Published is required!'],

    },
    // image: {
    //     type: String,
    //     required: [true, 'Image  is required!'],
    // },
    images: [{
        type: String,
        required: [true, 'At least one image is required!'],
    }],
    price: {
        type: Number,
        required: [true, 'Price is required!']
    },
    rating: {
        type: Number,
        default: 1.0,
        required: [true, 'Rating  is required!'],
    },
    createdBy: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        // required: [true, 'Product must belong to a user']
    }, 
    addedByAdmin: { 
        type: Boolean, 
        default: false 
    },
    isNotified: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    });

//pre and post : these are the document middlewares, before and after the doc is saved or created
// productSchema.pre('save', function(next){
//     console.log(this);//it logs the doc which v r saving
//     this.createdBy = 'Shameem';
//     next();
// })

productSchema.pre('save', async function(next){
    console.log(this);
    if(this.userId){
        const user = await User.findById(this.userId);
        // Set createdBy to the user's name if user is found
        if (user) {
            this.createdBy = user.name;
        } 
        else{
            const error = new CustomError('User not found', 404);
            next(error);
        }
    }
    next();
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product;