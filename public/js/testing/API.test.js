import http from "http";
import request from "supertest";
import { requestHandler } from "../../../server/server.js";

const server = http.createServer(requestHandler);

//  GET requests 

test("GET / successfully returns the landing page", async () => {
  const res = await request(server).get("/");

  // we expect to receive a full HTML file, so we check for something that we know must be in an HTML file.
  // we receive an object from the server so we specify to look at the html part of the object ".text"
  expect(res.text).toContain("<!DOCTYPE html>");
});

test("GET /get-products returns product list", async () => {
  const res = await request(server).get("/get-products");

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("GET /get-events returns event list", async () => {
  const res = await request(server).get("/get-events");

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("GET /get-event returns single event", async () => {
  // assuming that there is an id = 10, if not will fail. 
  const res = await request(server).get("/get-event?id=10");

  expect(res.statusCode).toBe(200);
  expect(typeof res.body).toBe("object");
});

test("GET /get-product returns single event", async () => {
  // assuming that there is an id = 569, if not will fail. 
  const res = await request(server).get("/get-product?id=569");

  expect(res.statusCode).toBe(200);
  expect(typeof res.body).toBe("object");
});

// POST requests:
// TODO: change login to correct one given mock data
test("POST posting a login returns success and JWT token", async () => {
  const response = await request(server)
    .post("/login")
    .send({
      email: "pikken@gmail.com",
      password: "123"
    })
    .set("Content-Type", "application/json");

  // asserting that the server responds success
  expect(response.statusCode).toBe(200);

  // asserting that JSON response has a message and token
  expect(response.body).toHaveProperty("message");
  expect(response.body).toHaveProperty("token");
  expect(typeof response.body.token).toBe("string");
});

/*
test('', async ()=>{
  const response = await request(server)
    .post("/save-events")
    .send({
      price: "99",
      place: "Aalborg",
      picture: "event_09.jpg",
      info: "Test",
      name: "testname",
      time: "testtime"
    })
    .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(200);
}) */