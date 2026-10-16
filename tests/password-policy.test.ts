import assert from "node:assert/strict";
import test from "node:test";
import { isValidPassword } from "../lib/password-policy";

test("password policy accepts passwords with every required character type", () => {
  assert.equal(isValidPassword("Abcdefgh1!"), true);
  assert.equal(isValidPassword("Longer-password2A"), true);
});

test("password policy rejects each missing requirement", () => {
  for (const password of [
    "Abcdefg1!",
    "Abcdefghi!",
    "Abcdefghi1",
    "abcdefghi1!",
    "ABCDEFGHI1!",
    "Abcdefghi1 ",
    "Aa1!" + "a".repeat(125),
    undefined,
  ]) {
    assert.equal(isValidPassword(password), false, String(password));
  }
});
