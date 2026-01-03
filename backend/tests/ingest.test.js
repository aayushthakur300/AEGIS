const request = require("supertest");
const app = require("../server");

test("Ingest logs", async () => {
  const res = await request(app)
    .post("/api/ingest")
    .send({ logs: "Out of memory" });

  expect(res.body.status).toBe("ingested");
});
