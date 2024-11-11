const express = require('express');
const adminController = require('../Controllers/adminController');
const authController = require('../Controllers/authController');

const router = express.Router();

router.get('/monthly-report', authController.protect, authController.restrict('admin'), adminController.getMonthlyReport);

module.exports = router;