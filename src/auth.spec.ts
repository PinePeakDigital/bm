import { describe, it, expect, beforeEach } from "vitest";
import { getCredentials, isAuthenticated, login, logout } from "./auth";

describe("session", () => {
  beforeEach(() => {
    localStorage.clear();
    // login/logout navigate via `window.location.href = "/"`. happy-dom can't
    // resolve that relative URL without a base, so stub location with a plain
    // writable object — this also lets us assert the redirect.
    Object.defineProperty(window, "location", {
      value: { href: "https://bm.test/" },
      writable: true,
      configurable: true,
    });
  });

  describe("getCredentials", () => {
    it("returns empty strings when nothing is stored", () => {
      expect(getCredentials()).toEqual({ username: "", apiKey: "" });
    });

    it("returns the stored username and api key", () => {
      localStorage.setItem("username", "alice");
      localStorage.setItem("api_key", "tok_123");
      expect(getCredentials()).toEqual({ username: "alice", apiKey: "tok_123" });
    });
  });

  describe("isAuthenticated", () => {
    it("is false when there is no api key", () => {
      expect(isAuthenticated()).toBe(false);
    });

    it("is false when only a username is stored", () => {
      localStorage.setItem("username", "alice");
      expect(isAuthenticated()).toBe(false);
    });

    it("is true once an api key is stored", () => {
      localStorage.setItem("api_key", "tok_123");
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe("login", () => {
    it("persists the credentials so getCredentials/isAuthenticated reflect them", () => {
      login("alice", "tok_123");

      expect(getCredentials()).toEqual({ username: "alice", apiKey: "tok_123" });
      expect(isAuthenticated()).toBe(true);
    });

    it("redirects to the root", () => {
      login("alice", "tok_123");

      expect(window.location.href).toBe("/");
    });
  });

  describe("logout", () => {
    it("clears the stored credentials", () => {
      login("alice", "tok_123");
      logout();

      expect(getCredentials()).toEqual({ username: "", apiKey: "" });
      expect(isAuthenticated()).toBe(false);
    });
  });
});
