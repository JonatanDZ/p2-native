import http from "http";
import request from "supertest";
import { requestHandler } from "../../../server/server.js";

// creating an auxilliary server in order to create a testing environment. This server runs separately from the main server, and is only run
//  when using script "test". This will be referred to as the "aux" or "auxilliary" server. 
const server = http.createServer(requestHandler);

// all tests follow the philosophy of arrange, act and assert. 

//  GET requests 

test("GET / successfully returns the landing page", async () => {
    const res = await request(server).get("/");

    // we expect to receive a full HTML file, so we check for something that we know must be in an HTML file.
    // we receive an object from the server so we specifically look at the html part of the object ".text"
    expect(res.text).toContain("<!DOCTYPE html>");
});

test("GET /get-products returns product list", async () => {
    const res = await request(server).get("/get-products");

    //  simply expecting endpoint to return success and that the response is an array of objects. 
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
});

test("GET /get-events returns event list", async () => {
    const res = await request(server).get("/get-events");

    //  simply expecting endpoint to return success and that the response is an array of objects. 
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
});

test("GET /get-event returns single event", async () => {
    // assuming that there is an id = 10, if not will fail. 
    const res = await request(server).get("/get-event?id=1");

    //  simply expecting endpoint to return success and that the response is a single object.
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe("object");
});

test("GET /get-product returns single product", async () => {
    // assuming that there is an id = 569, if not will fail. 
    const res = await request(server).get("/get-product?id=1");

    //  simply expecting endpoint to return success and that the response is a single object.
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe("object");
});

// POST requests:
// TODO: change login to correct one given mock data
test("POST posting a login returns success and JWT token", async () => {
    //  sending POST request to aux server with JSON body .send. This message is an existing login with the password exposed.
    const response = await request(server)
        .post("/login")
        .send({
            email: "Niels@niels.com",
            password: "niels"
        })
        .set("Content-Type", "application/json");

    // asserting that the server responds success
    expect(response.statusCode).toBe(200);

    // asserting that JSON response has a message and token
    // only asserting that the token is sent with the message since this is essential to assert. 
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
});


test('POST posting an array of one event object to endpoint /save-events, expecting to receive 200 from server', async () => {
    // sending POST request to aux server 
    const response = await request(server)
        .post("/save-events")
        .send([{
            price: "99",
            place: "Aalborg",
            picture: "event_09.jpg",
            info: "Test",
            name: "testname",
            time: "10"
        }])
        .set("Content-Type", "application/json");

    // asserting that the server sends success. It also sends a message but that is subject to change. 
    expect(response.statusCode).toBe(200);
}) 