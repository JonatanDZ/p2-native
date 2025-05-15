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

