const cron = require('node-cron');
const Product = require('../Models/productModel');
const User = require('../Models/userModel');
const sendNotification = require('../Utils/email');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');

// Scheduler function to check for new products and notify users
const notifyUsersOfNewProducts = async () => {
    try {
        console.log('Scheduler running - checking for new products.');

        // Step 1: Find all products that are new and not yet notified
        const newProducts = await Product.find({
            isNotified: false,
            addedByAdmin: true
        });

        if (newProducts.length === 0) {
            console.log('No new products to notify users about.');
            return;
        }

        // Step 2: Get the list of users to notify
        const users = await User.find({ wantsNotifications: true });

        if (users.length === 0) {
            console.log('No users to notify.');
            return;
        }

        // Step 3: Notify each user
        for (const user of users) {
            const message = `Hello ${user.name}, new products have been added! Check them out on our platform.`;

            // await sendNotification(user.email, 'New Products Available', message);
            sendNotification({
                email: user.email,
                subject: 'New products availabe!',
                message
            })
        }

        // Step 4: Update notified status for each product
        for (const product of newProducts) {
            product.isNotified = true;
            await product.save();
        }

        console.log(`Notified ${users.length} users about ${newProducts.length} new products.`);

    } catch (error) {
        console.error("Error in notifyUsersOfNewProducts:", error);
    }
};


// Schedule the task to run every day at 8 AM
// cron.schedule('0 8 * * *', 
// console.log('Cron job triggered'),

// notifyUsersOfNewProducts, {
//     scheduled: true
//     // timezone: 'America/New_York' // adjust timezone as necessary
// });

if(process.env.NODE_ENV !== 'test'){
    cron.schedule('* * * * *', () => {
        console.log('running every minute..', Date.now());
        notifyUsersOfNewProducts();
    });
}
