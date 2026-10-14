import assert from "node:assert/strict";

const finite = (args) => {
  for (const value of args) if (typeof value === "number") assert.ok(Number.isFinite(value));
};

export function installCanvasRecorder() {
  globalThis.Path2D = class {
    moveTo(...args) { finite(args); }
    lineTo(...args) { finite(args); }
    bezierCurveTo(...args) { finite(args); }
    quadraticCurveTo(...args) { finite(args); }
    closePath() {}
  };
}

/** Exercise the real drawing code, rejecting invalid geometry without a rasterizer. */
export function recordingContext() {
  const colors = new Set();
  const gradient = (...args) => {
    finite(args);
    return { addColorStop: (offset, color) => { finite([offset]); colors.add(color); } };
  };
  const target = { canvas: { width: 200, height: 200 }, globalAlpha: 1, createLinearGradient: gradient, createRadialGradient: gradient };
  const ctx = new Proxy(target, {
    get: (obj, key) => key in obj ? obj[key] : (...args) => finite(args),
    set: (obj, key, value) => {
      if ((key === "fillStyle" || key === "strokeStyle") && typeof value === "string") colors.add(value);
      obj[key] = value;
      return true;
    },
  });
  return { ctx, colors };
}
