const Product = require('../Models/productModel');
const CustomError = require('../Utils/CustomError');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');

//by user id
exports.createProductByUserId = asyncErrorHandler(async (req, res, next)=>{
    const userid = req.params.userid;

    if(req.user.id !== userid){
        const error = new CustomError('You are not authorized to add products for this user!', 403);
        return next(error);
    }

    // Add user ID to the product data
    const newProduct = await Product.create({
        ...req.body,
        userId: req.user.id // Assign the user ID from req.user
    });

    res.status(201).json({
        status: 'success',
        data: {
            product: newProduct
        }
    });
});

exports.updateProductByUserId = asyncErrorHandler(async(req, res, next) => {
    const userid = req.params.userid;
    if(req.user.id !== userid){
        const error = new CustomError('You are not authorized to update product for this user!', 403);
        return next(error);
    }

    const product = await Product.findOne({ userId : userid });

    if (!product) {
        return next(new CustomError('Product not found for this user', 404));
    }

    // Update the product fields with request body data
    Object.keys(req.body).forEach(key => {
        product[key] = req.body[key];
    });

    // Save the updated product
    const updatedProduct = await product.save();

    res.status(200).json({
        status: 'success',
        data: {
            product: updatedProduct
        }
    });
});

exports.deleteProductsByUserId = asyncErrorHandler(async (req, res, next) => {
    const { userId } = req.params;
    if(req.user.id !== userId){
        const error = new CustomError('You are not authorized to delete products for this user!', 403);
        return next(error);
    }

        // Find and delete all products associated with the userId
        const result = await Product.deleteMany({ userId });

        if (result.deletedCount === 0) {
            return next(new CustomError('No products found for this user', 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'All products successfully deleted for this user',
            deletedCount: result.deletedCount
        });
});

exports.deleteProductByUserIdProductId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.params.userid;
    const productId = req.params.productid;

    if(req.user.id !== userId){
        const error = new CustomError('You are not authorized to delete product for this user!', 403);
        return next(error);
    }

    // Find and delete the product associated with the userId and productId
    const product = await Product.findOneAndDelete({ userId, _id: productId });
        
    if (!product) {
        return next(new CustomError('Product not found for this user and product ID', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Product successfully deleted',
    });
});

exports.getAllProductsByUserId = asyncErrorHandler(async (req, res, next) => {
    const userId = req.params.userid;
    if(req.user.id !== userId){
        const error = new CustomError('You are not authorized to get all products for this user!', 403);
        return next(error);
    }

    const products = await Product.find({ userId });

    if (!products.length) {
        return next(new CustomError('No products found for this user', 404));
    }

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });

});