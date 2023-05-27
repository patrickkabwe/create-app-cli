import { User } from "@prisma/client";
import { randomUUID } from "crypto";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { app } from "~/app";
import { prisma } from "~/libs/__mocks__/prisma";

const agent = request.agent(app);

vi.mock("~/libs/prisma");

describe("Login", () => {
  const testPathUrl = "/api/v1/auth/login";
  it("should fail if email is missing", async () => {
    const response = await agent.post(testPathUrl).send({
      password: "test",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email is required");
  });

  it("should fail if password is missing", async () => {
    const response = await agent.post(testPathUrl).send({
      email: "test@gmail.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Password is required");
  });

  it("should fail if password is incorrect", async () => {
    const response = await agent.post(testPathUrl).send({
      email: "test@gmail.com",
      password: "test1",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should login", async () => {
    const user: User = {
      id: randomUUID() as string,
      email: "test@gmail.com",
      password: "test",
      name: "Test",
    };

    prisma.user.findUnique.mockResolvedValue(user);
    const response = await agent.post(testPathUrl).send({
      email: "test@gmail.com",
      password: "test",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.headers).toHaveProperty("set-cookie");
  });
});
