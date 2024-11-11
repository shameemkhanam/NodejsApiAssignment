const User = require('../Models/userModel');
const Product = require('../Models/productModel');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');

exports.getMonthlyReport = asyncErrorHandler(async (req, res, next) => {
    const { year, month } = req.query;

    // Validate year and month inputs
    if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required." });
    }

    // Set start of month to the first day at 00:00:00
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    // Set end of month to the last day at 23:59:59
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // Logging date range
    console.log('Start of month:', startOfMonth);
    console.log('End of month:', endOfMonth);

    // Aggregate users created within the month
    const usersAdded = await User.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });
    console.log('Users added:', usersAdded);

    // Aggregate products added within the month
    const productsAdded = await Product.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });
    console.log('Products added:', productsAdded);

    res.status(200).json({
        status: 'success',
        data: {
            year,
            month,
            usersAdded,
            productsAdded
        }
    });
});
