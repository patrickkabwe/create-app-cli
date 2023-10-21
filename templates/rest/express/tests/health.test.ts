import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "~/app";

const agent = request.agent(app);


describe("Health", () => {
  it("health check", async () => {
    const response = await agent.get("/health");

    expect(response.status).toBe(200);
  });
});
