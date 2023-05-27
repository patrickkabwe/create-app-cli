import { randomUUID } from "crypto";

import { describe, expect, it, vi } from "vitest";

import { prisma } from "~/libs/__mocks__/prisma";
import { UsersService } from "~/modules/users/users.services";

vi.mock("~/libs/prisma");

describe("UsersService", () => {
  it("get user by email", async () => {
    const user = {
      id: randomUUID() as string,
      email: "test@gmail.com",
      password: "test",
      name: "Test",
    };

    prisma.user.findUnique.mockResolvedValue(user);
    const foundUser = await UsersService.getUserByEmail(user.email);

    expect(foundUser).toEqual(user);
  });
});
