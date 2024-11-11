const express = require('express');
const usersByAdminController = require('../Controllers/usersByAdminController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.route('/').post(authController.protect,authController.restrict('admin'),usersByAdminController.addUsers);
router.route('/:userId').patch(authController.protect, authController.restrict('admin'),usersByAdminController.updateUsers);

module.exports = router;