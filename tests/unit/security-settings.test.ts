import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPinCode } from "../../lib/security-settings";

test("hashPinCode - determinism", () => {
  const pin = "123456";
  const hash1 = hashPinCode(pin);
  const hash2 = hashPinCode(pin);
  assert.equal(hash1, hash2, "Hashing the same PIN twice should yield the same result");
});

test("hashPinCode - known inputs", () => {
  assert.equal(hashPinCode(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  assert.equal(hashPinCode("1234"), "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");
  assert.equal(hashPinCode("0000"), "9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0");
  assert.equal(hashPinCode("abcd"), "88d4266fd4e6338d13b845fcf289579d209c897823b9217da3e161936f031589");
});

test("hashPinCode - different inputs produce different outputs", () => {
  const hash1 = hashPinCode("1234");
  const hash2 = hashPinCode("1235");
  const hash3 = hashPinCode("4321");
  assert.notEqual(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.notEqual(hash2, hash3);
});

test("hashPinCode - length", () => {
  const hash = hashPinCode("1234");
  assert.equal(hash.length, 64, "Hash length should be 64 characters for SHA-256");
});
