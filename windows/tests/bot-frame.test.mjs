import { test } from "node:test";
import assert from "node:assert/strict";
import { beginBotFrame } from "../src/mochi/frame.ts";

function canvasRecorder() {
  let width = 0, height = 0, resets = 0;
  const calls = [];
  const ctx = {
    setTransform: (...args) => calls.push(["transform", ...args]),
    clearRect: (...args) => calls.push(["clear", ...args]),
  };
  return {
    get width() { return width; },
    set width(value) { width = value; resets++; },
    get height() { return height; },
    set height(value) { height = value; resets++; },
    getContext: () => ctx,
    get resets() { return resets; }, calls, ctx,
  };
}

test("changing Among Us to Verity replaces the backing store once, including the old boots", () => {
  const canvas = canvasRecorder();
  beginBotFrame(canvas, "amongUs", 90, 80, 2);
  const initial = canvas.resets;
  beginBotFrame(canvas, "amongUs", 90, 80, 2);
  assert.equal(canvas.resets, initial, "ordinary animation reuses its bitmap");
  beginBotFrame(canvas, "verity", 90, 80, 2);
  assert.equal(canvas.resets, initial + 1, "same dimensions still get a fresh bitmap");
  beginBotFrame(canvas, "verity", 90, 80, 2);
  assert.equal(canvas.resets, initial + 1);
  beginBotFrame(canvas, "amongUs", 90, 80, 2);
  assert.equal(canvas.resets, initial + 2);
});

test("every frame clears the physical canvas before restoring scale and drawing origin", () => {
  const canvas = canvasRecorder();
  assert.equal(beginBotFrame(canvas, "verity", 77.3, 60.5, 1.25, 24), canvas.ctx);
  assert.deepEqual(canvas.calls, [
    ["transform", 1, 0, 0, 1, 0, 0],
    ["clear", 0, 0, 97, 76],
    ["transform", 1.25, 0, 0, 1.25, 30, 0],
  ]);
  const initial = canvas.resets;
  beginBotFrame(canvas, "verity", 77.3, 60.5, 2, 24);
  assert.ok(canvas.resets > initial, "moving to another scale reallocates the bitmap");
});

test("each Mochi owns its skin invalidation independently", () => {
  const main = canvasRecorder(), mini = canvasRecorder();
  beginBotFrame(main, "amongUs", 100, 100, 1);
  beginBotFrame(mini, "verity", 40, 40, 1);
  const initial = main.resets;
  beginBotFrame(main, "amongUs", 100, 100, 1);
  assert.equal(main.resets, initial);
});
