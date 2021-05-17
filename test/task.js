let chai = require('chai');
let server = require('../index');
let chaihttp = require('chai-HTTP');


//Assertion style
chai.should();

chai.use(chaihttp);
describe('Test API', () => {
    
    // test GET
    describe("GET /", ()=>{
        it("it should get all the tasks", (done) =>{
            chai.request(server)
            .get('/')
            .end((err, response) => {
                response.should.have.status(200);
                done();
            })
        })

        it("it should not get all the tasks", (done) =>{
            chai.request(server)
            .get('/:any')
            .end((err, response) => {
                response.should.have.status(404);
                done();
            })
        })
    })

    // test POST
    describe("POST /", ()=>{
        it("it should POST all the tasks", (done) =>{
            const data = {
                speech : "I am govind",
                lang : "hi"
            }
            chai.request(server)
            .post('/')
            .send(data)
            .end((err, response) => {
                response.should.have.status(200);
                response.should.be.a('object');
                done();
            })
        })

    })

})