import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { providersInternals } from "@/lib/ai/providers";

describe("providersInternals.normalizeModelId", () => {
  test("normalizes prefixed ids and applies FS aliases", () => {
    assert.equal(providersInternals.normalizeModelId("gpt-5"), "gpt-5.4");
    assert.equal(
      providersInternals.normalizeModelId("openai/gpt-5-mini"),
      "gpt-5.4-mini"
    );
  });

  test("keeps unknown ids unchanged", () => {
    assert.equal(
      providersInternals.normalizeModelId("openai/gpt-4.1-mini"),
      "gpt-4.1-mini"
    );
  });
});

describe("providersInternals.shouldUseFsChatApi", () => {
  test("returns true for chat-only FS models after normalization", () => {
    assert.equal(providersInternals.shouldUseFsChatApi("gpt-5.5"), true);
    assert.equal(
      providersInternals.shouldUseFsChatApi("openai/gpt-5.5"),
      true
    );
  });

  test("returns false for responses-compatible models", () => {
    assert.equal(providersInternals.shouldUseFsChatApi("gpt-5"), false);
    assert.equal(providersInternals.shouldUseFsChatApi("gpt-4.1"), false);
  });
});
