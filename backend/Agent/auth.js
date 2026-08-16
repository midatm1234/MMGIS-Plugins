"use strict";

function isPublicNoAuthMode(authMode = process.env.AUTH) {
  const normalized = String(authMode || "").trim().toLowerCase();
  return normalized === "none" || normalized === "off";
}

function isAgentGuestRequest(req, authMode = process.env.AUTH) {
  return (
    !req ||
    !req.user ||
    req.user === "guest" ||
    String(authMode || "").trim().toLowerCase() === "off"
  );
}

function createAgentGuestGate(authMode = process.env.AUTH) {
  return function stopAgentGuests(req, res, next) {
    // Long-term tokens are validated by ensureUser. Do not reject the request
    // merely because global session middleware still identifies it as guest.
    if (req?.headers?.authorization) {
      next();
      return;
    }
    if (!isAgentGuestRequest(req, authMode)) {
      next();
      return;
    }
    res.status(401).json({
      error: "Sign in to use MMGIS Copilot.",
      code: "AgentAuthenticationRequired",
    });
  };
}

function getAgentAuthMiddlewares(server, authMode = process.env.AUTH) {
  if (!server || typeof server.ensureUser !== "function") {
    throw new TypeError("Agent routes require the MMGIS ensureUser middleware.");
  }

  const ensureUser = server.ensureUser();
  if (!isPublicNoAuthMode(authMode)) {
    if (typeof server.stopGuests !== "function") {
      throw new TypeError(
        "Authenticated Agent routes require the MMGIS stopGuests middleware.",
      );
    }
    // Keep the same guest policy as MMGIS stopGuests, but use a real HTTP
    // status and typed JSON for this API instead of its legacy HTTP-200
    // failure envelope.
    // The typed gate must run first: ensureUser renders legacy login HTML (or
    // an HTTP-200 token failure) before later middleware can correct it.
    return [createAgentGuestGate(authMode), ensureUser, server.stopGuests];
  }
  return [ensureUser];
}

module.exports = {
  isPublicNoAuthMode,
  isAgentGuestRequest,
  createAgentGuestGate,
  getAgentAuthMiddlewares,
};
