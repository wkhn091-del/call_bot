import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./origin";

describe("isSameOrigin", () => {
  it("accepts the exact same host", () => {
    expect(isSameOrigin("https://afterhours.ai", "afterhours.ai")).toBe(true);
    expect(isSameOrigin("http://localhost:3200", "localhost:3200")).toBe(true);
  });

  it("rejects a missing Origin or Host", () => {
    expect(isSameOrigin(null, "afterhours.ai")).toBe(false);
    expect(isSameOrigin("https://afterhours.ai", null)).toBe(false);
    expect(isSameOrigin("", "afterhours.ai")).toBe(false);
  });

  it("rejects look-alike hosts that a substring check would let through", () => {
    expect(isSameOrigin("https://afterhours.ai.evil.com", "afterhours.ai")).toBe(false);
    expect(isSameOrigin("https://evilafterhours.ai", "afterhours.ai")).toBe(false);
    expect(isSameOrigin("https://sub.afterhours.ai", "afterhours.ai")).toBe(false);
  });

  it("treats a different port as a different origin", () => {
    expect(isSameOrigin("http://localhost:4000", "localhost:3200")).toBe(false);
  });

  it("rejects malformed and opaque origins", () => {
    expect(isSameOrigin("null", "afterhours.ai")).toBe(false);
    expect(isSameOrigin("not a url", "afterhours.ai")).toBe(false);
  });
});
