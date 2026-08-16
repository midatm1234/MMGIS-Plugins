import { test, expect } from "@playwright/test";
import {
  isPublicNoAuthMode,
  createAgentGuestGate,
  getAgentAuthMiddlewares,
} from "../auth";

test.describe("@unit Copilot authentication gate", () => {
  test("permits guest access in MMGIS AUTH=none/off no-login modes", () => {
    expect(isPublicNoAuthMode("none")).toBe(true);
    expect(isPublicNoAuthMode(" NONE ")).toBe(true);
    expect(isPublicNoAuthMode("off")).toBe(true);
    expect(isPublicNoAuthMode(" OFF ")).toBe(true);
    expect(isPublicNoAuthMode("local")).toBe(false);
    expect(isPublicNoAuthMode("")).toBe(false);
  });

  test("always installs ensureUser and adds the typed protected-mode gate", () => {
    const ensure = (_req, _res, next) => next();
    const stop = (_req, _res, next) => next();
    const server = {
      ensureUser: () => ensure,
      stopGuests: stop,
    };
    expect(getAgentAuthMiddlewares(server, "none")).toEqual([ensure]);
    expect(getAgentAuthMiddlewares(server, "off")).toEqual([ensure]);
    const protectedMiddlewares = getAgentAuthMiddlewares(server, "local");
    expect(protectedMiddlewares[0].name).toBe("stopAgentGuests");
    expect(protectedMiddlewares[1]).toBe(ensure);
    expect(protectedMiddlewares[2]).toBe(stop);
  });

  test("returns HTTP 401 JSON for guests and permits authenticated users", () => {
    const gate = createAgentGuestGate("local");
    const response = {
      statusCode: null,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return this;
      },
    };
    let nextCalled = false;
    gate({ user: "guest" }, response, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(response.statusCode).toBe(401);
    expect(response.payload).toEqual({
      error: "Sign in to use MMGIS Copilot.",
      code: "AgentAuthenticationRequired",
    });

    gate(
      { user: "guest", headers: { authorization: "Bearer token" } },
      response,
      () => {
        nextCalled = true;
      },
    );
    expect(nextCalled).toBe(true);

    nextCalled = false;
    gate({ user: "alice" }, response, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
