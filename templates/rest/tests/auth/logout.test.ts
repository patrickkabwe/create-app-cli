import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { app } from "~/app";

const agent = request.agent(app);

vi.mock("~/libs/prisma");

describe("Login", () => {
  it("should logout", async () => {
    const testPathUrl = "/api/v1/auth/logout";
    const response = await agent.delete(testPathUrl);
    const authToken = response.headers["set-cookie"][0].split(";").toString();
    expect(authToken).toBe(
      "auth=, Path=/, Expires=Thu, 01 Jan 1970 00:00:00 GMT, HttpOnly"
    );
    expect(response.status).toBe(205);
  });
});
