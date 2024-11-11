const express = require('express');
const productsController = require('../Controllers/productsController');
const authController = require('../Controllers/authController');
const fileUpload = require('../Utils/fileUpload');

const router = express.Router(); //here productsRouter is a middleware

// router.param('id', productsController.checkId);  //param middleware will be applied when params are present like 'id'

router.route('/')
    .get(authController.protect, authController.restrict('admin'), productsController.getAllProducts) //authController.protect is for protecting the getAllProducts route frm unauthorized access
    // .post(productsController.validateBody, productsController.createProduct)
    // .post(fileUpload.single('image') ,productsController.createProduct) //single image
    .post(authController.protect, fileUpload.array('images', 5), productsController.createProduct) //multiple images
    .delete(productsController.deleteAllProducts)

router.route('/export')
    .get(authController.protect, authController.restrict('admin', 'user'), productsController.exportProducts);

router.route('/:id')
    .get(authController.protect, productsController.getProductById)
    .delete(authController.protect, authController.restrict('admin'), productsController.deleteProduct)
    .put(productsController.updateProduct)



module.exports = router;