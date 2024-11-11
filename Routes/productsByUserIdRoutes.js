const express = require('express');
const productsByUserIdController = require('../Controllers/productsByUserIdController');
const authController = require('../Controllers/authController');

const router = express.Router(); 

router.route('/:userid')
    .post(authController.protect, productsByUserIdController.createProductByUserId)
    .put(authController.protect, productsByUserIdController.updateProductByUserId)
    .delete(authController.protect, productsByUserIdController.deleteProductsByUserId)
    .get(authController.protect, productsByUserIdController.getAllProductsByUserId)

router.route('/:userid/:productid')
    .delete(authController.protect, productsByUserIdController.deleteProductByUserIdProductId)

module.exports = router;