const request = require('supertest');
const app = require('../app');

describe('Products route:', ()=>{
    describe('get product by id', ()=>{
        describe('if given product doesnot exist', ()=>{
            it('should return 404', async()=>{
                const productId = 'prod1234';
                await request(app).get(`/api/products/${productId}`).expect(404);
            });
        });
    });
});