import assert from "node:assert/strict";
import { test } from "node:test";

import { extractJsonObjectsFromStream } from "@/lib/json-stream-parser";

test("extractJsonObjectsFromStream - parse des objets JSON concaténés", () => {
  const raw =
    '{"type":"response.created","response":{"id":"resp_1"}}' +
    '{"type":"response.output_text.delta","delta":"Salut"}' +
    '{"type":"response.output_text.delta","delta":" !"}' +
    '{"type":"response.completed"}';

  const events = extractJsonObjectsFromStream(raw);
  assert.equal(events.length, 4);
  assert.deepEqual(events[0], {
    type: "response.created",
    response: { id: "resp_1" },
  });
  assert.deepEqual(events[1], {
    type: "response.output_text.delta",
    delta: "Salut",
  });
  assert.deepEqual(events[3], { type: "response.completed" });
});

test("extractJsonObjectsFromStream - gère les strings avec accolades échappées", () => {
  const raw = '{"text":"un objet {imbriqué} dans une string"}{"other":true}';
  const events = extractJsonObjectsFromStream(raw);
  assert.equal(events.length, 2);
  assert.deepEqual(events[0], {
    text: "un objet {imbriqué} dans une string",
  });
  assert.deepEqual(events[1], { other: true });
});

test("extractJsonObjectsFromStream - ignore les chunks malformés", () => {
  const raw = '{"valid":true}{invalid json}{"also_valid":true}';
  const events = extractJsonObjectsFromStream(raw);
  assert.equal(events.length, 2);
  assert.deepEqual(events[0], { valid: true });
  assert.deepEqual(events[1], { also_valid: true });
});

test("extractJsonObjectsFromStream - retourne un tableau vide pour une chaîne vide", () => {
  assert.deepEqual(extractJsonObjectsFromStream(""), []);
});

test("extractJsonObjectsFromStream - gère les objets imbriqués", () => {
  const raw = '{"a":{"b":{"c":1}}}{"d":2}';
  const events = extractJsonObjectsFromStream(raw);
  assert.equal(events.length, 2);
  assert.deepEqual(events[0], { a: { b: { c: 1 } } });
  assert.deepEqual(events[1], { d: 2 });
});

test("extractJsonObjectsFromStream - gère les backslash échappés dans les strings", () => {
  const raw = '{"path":"C:\\\\Users\\\\test"}{"next":true}';
  const events = extractJsonObjectsFromStream(raw);
  assert.equal(events.length, 2);
  assert.deepEqual(events[0], { path: "C:\\Users\\test" });
  assert.deepEqual(events[1], { next: true });
});
