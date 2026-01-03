const request = require("supertest");
const app = require("../server");

test("Analyze segmentation fault", async () => {
  const res = await request(app)
    .post("/api/analyze")
    .send({ errorLog: "Segmentation fault" });

  expect(res.body.normalized).toBe("SEGMENTATION_FAULT");
});
