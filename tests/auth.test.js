const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../Models/userModel');

jest.mock('../Utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true) // Mock sendEmail function
}));

const testUser = {
    name: "testuser1",
    email: "testuser1@test.com",
    password: "testuser123",
    confirmPassword: "testuser123"
}

jest.setTimeout(10000); // Set timeout to 10 seconds

beforeAll(async () => {
    // Make sure to connect to the database before running tests
    await mongoose.connect(process.env.LOCAL_CONN_STR || 'mongodb://localhost:27017/e-comm-test');
});

afterAll(async () => {
    // Close the Mongoose connection after all tests
    await mongoose.connection.close();
});

beforeEach(async()=>{
    await User.deleteMany({});
    await User(testUser).save();
});

afterEach(() => {
    jest.clearAllMocks();
});

describe('Auth routes:', ()=>{
    it('should signup user', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({
                name: "testUser",
                email: "testUser@test.com",
                password: "pass1234",
                confirmPassword: "pass1234"
            })
            .expect(201);
    });
    
    it('should login user', async()=>{
        await request(app)
        .post('/api/auth/login')
        .send({
            email: testUser.email,
            password: testUser.password
        })
        .expect(200);
    });

    describe('forgot password:', ()=>{

        it('should send a reset password email if email exists', async () => {
            const res = await request(app)
                .post('/api/auth/forgotPassword')
                .send({ email: testUser.email })
                .expect(200);
            
            expect(res.body.status).toBe('success');
            expect(res.body.message).toBe('Password reset link sent to the user email.');
        });

        // it('should return 404 if email does not exist', async () => {
        //     const res = await request(app)
        //         .post('/api/auth/forgotPassword')
        //         .send({ email: 'nonexistent@example.com' })
        //         .expect(404); // Expect a 404 error
        
        //     expect(res.body.message).toBe('Could not find the user with this email..'); // Verify the error message
        // });
        
    
        // it('should handle errors in email sending and reset token fields', async () => {
        //     const { sendEmail } = require('../Utils/email');
        //     sendEmail.mockRejectedValueOnce(new Error('Email sending failed'));
    
        //     const res = await request(app)
        //         .post('/api/auth/forgotPassword')
        //         .send({ email: testUser.email })
        //         .expect(500);
    
        //     expect(res.body.message).toBe('There was an error while sending password reset link..plz try again later');
        // });

    });

});
