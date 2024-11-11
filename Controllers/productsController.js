const Product = require('../Models/productModel');
const ApiFeatures = require('../Utils/ApiFeatures');
const CustomError = require('../Utils/CustomError');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const { parse } = require('json2csv');  

// exports.checkId = (req, res, next, value)=>{
//     console.log('product id is :', value);
//     let product = '';
//     if (!product) {
//         return res.status(404).json({
//             status: 'failed',
//             message: `Product with ${value} is not found.`
//         });
//     }
//     next();
// }

// exports.validateBody = (req, res, next)=>{
//     if(!req.body.name || !req.body.description){
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Not a valid product data.'
//         });
//     }
//     next();
// }



//route handler functions
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {
    // const products = await Product.find(req.query); but it's not ideal while using sort=1 page=1 ie sorting and pagination

    const features = new ApiFeatures(Product.find(), req.query).filter().sort().paginate();
    let products = await features.query;

    // const excludeFields = ['sort', 'page', 'limit', 'fields']; 

    // const queryObj = {...req.query};

    // excludeFields.forEach((el)=>{
    //     delete  queryObj[el];
    // });

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Product.find(JSON.parse(queryStr));

    //SORT:
    // if(req.query.sort){
    //     const sortBy = req.query.sort.split(',').join(' ');
    //     console.log(sortBy);
    //     query = query.sort(sortBy);
    // }
    // else{
    //     query = query.sort('-createdAt');
    // }

    //PAGINATION:
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || 10;
    // const skip = (page-1)*limit;
    // query = query.skip(skip).limit(limit);

    // if(req.query.page){
    //     const productsCount = await Product.countDocuments();
    //     if(skip >= productsCount){
    //         throw new Error('Page not found!');
    //     }
    // }

    // const products = await query;

    // const products = await Product.find(req.query).sort("-price");

    res.status(200).json({
        status: 'success',
        count: products.length,
        // createdAt: req.requestedAt,
        data: {
            products: products
        }
    });

});

exports.getProductById = asyncErrorHandler(async (req, res, next) => {
    // const products = await Product.find({_id : req.params.id});

    const product = await Product.findById(req.params.id);
    if (!product) {
        const error = new CustomError('Product with this id is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });

});

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    //for uploading single image:--
    // const productData = {
    //     ...req.body,
    //     image: req.file ? req.file.path : undefined // Use uploaded image path if available
    // };    
    // const product = await Product.create(productData);

    //for uploading multiple images:--
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract image paths for storing in the database
    const imagePaths = files.map(file => file.path);

    // Create the product with image paths
    const product = await Product.create({
        ...req.body,
        addedByAdmin: req.user.role === 'admin',
        images: imagePaths  // Store image paths in your database as an array
    });

    res.status(201).json({
        status: 'success',
        data: {
            product: product
        }
    });
});

exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const productToDelete = await Product.findByIdAndDelete(req.params.id);
    if (!productToDelete) {
        const error = new CustomError('Product with this id is not found!', 404);
        return next(error);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.deleteAllProducts = asyncErrorHandler(async (req, res, next) => {
    await Product.deleteMany();
    console.log('data deleted successfully');
    res.status(200).json({
        status: 'success',
        data: null
    });

});

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedProduct) {
        const error = new CustomError('Product with this id is not found!', 404);
        return next(error);
    }

    res.status(200).json({
        status: 'success',
        data: {
            product: updatedProduct
        }
    });

});

exports.exportProducts = asyncErrorHandler(async(req, res, next) => {
    // Fetch all products from the database
    const products = await Product.find(); 
    console.log('prods:',products);

    // Convert products to CSV format
    const csvData = parse(products); // This will automatically map all fields in the product model
    console.log('csv data:',csvData);
    // Set headers to indicate that the response is a downloadable CSV file
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');  // The file name will be 'products.csv'

    // Send the CSV data as the response
    res.send(csvData);
});

