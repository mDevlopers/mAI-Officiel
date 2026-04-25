import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePlanKey } from "@/lib/subscription";

test("parsePlanKey returns 'free' for falsy and nullish values", () => {
  assert.equal(parsePlanKey(null), "free");
  assert.equal(parsePlanKey(undefined), "free");
  assert.equal(parsePlanKey(""), "free");
});

test("parsePlanKey returns exactly matching plan keys", () => {
  assert.equal(parsePlanKey("free"), "free");
  assert.equal(parsePlanKey("plus"), "plus");
  assert.equal(parsePlanKey("pro"), "pro");
  assert.equal(parsePlanKey("max"), "max");
});

test("parsePlanKey returns 'free' for invalid and unknown values", () => {
  assert.equal(parsePlanKey("unknown"), "free");
  assert.equal(parsePlanKey("random"), "free");
});
