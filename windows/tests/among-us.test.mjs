import { test } from "node:test";
import assert from "node:assert/strict";
import { BotEngine } from "../src/mochi/engine.ts";
import { AMONG_US_BODY } from "../src/mochi/outfits.ts";
import { parseOutfit, pillOutfit, withPillOutfit, OUTFIT_LABELS } from "../src/mochi/wardrobe.ts";

// Record the real renderer's canvas commands without a browser rasterizer.
// Reject non-finite geometry at miniature sizes, steep turns and blinking.
const finite = (args) => {
  for (const value of args) if (typeof value === "number") assert.ok(Number.isFinite(value));
};
globalThis.Path2D = class {
  moveTo(...args) { finite(args); }
  lineTo(...args) { finite(args); }
  closePath() {}
};
function context() {
  const colors = new Set();
  const gradient = (...args) => {
    finite(args);
    return { addColorStop: (offset, color) => { finite([offset]); colors.add(color); } };
  };
  const target = { canvas: { width: 200, height: 200 }, globalAlpha: 1, createLinearGradient: gradient, createRadialGradient: gradient };
  const ctx = new Proxy(target, {
    get: (obj, key) => key in obj ? obj[key] : (...args) => finite(args),
    set: (obj, key, value) => {
      if (key === "fillStyle" && typeof value === "string") colors.add(value);
      obj[key] = value;
      return true;
    },
  });
  return { ctx, colors };
}

test("Among Us is selectable and survives individual agent settings", () => {
  assert.equal(parseOutfit("amongUs"), "amongUs");
  assert.equal(OUTFIT_LABELS.amongUs, "Among Us");
  const saved = withPillOutfit({ mochiOutfit: "pumpkin" }, "integration_claude", "agent_codex", "amongUs");
  const restored = JSON.parse(JSON.stringify(saved));
  assert.equal(pillOutfit(restored, "integration_claude", "agent_codex"), "amongUs");
  assert.equal(pillOutfit(restored, "agent_codex", "agent_codex"), "pumpkin");
});

test("the suit renders red material and a blue visor on large and miniature Mochis", () => {
  for (const mini of [false, true]) {
    for (const yaw of [-1.3, 0, 1.3]) {
      for (const open of [0.06, 1]) {
        const engine = new BotEngine();
        engine.isMini = mini;
        engine.bodyColor = mini ? [0.18, 0.83, 0.75] : null;
        engine.yaw = yaw;
        engine.open = open;
        engine.setOutfit("amongUs", false);
        const { ctx, colors } = context();
        engine.draw(ctx, mini ? 40 : 100, mini ? 40 : 100);
        assert.ok(colors.has(AMONG_US_BODY[0]));
        assert.ok(colors.has(AMONG_US_BODY[1]));
        assert.ok(colors.has("#182B34"), "visor must be drawn");
      }
    }
  }
});

test("the full suit and visor disappear during Mochi's mailbox transformation", () => {
  const engine = new BotEngine();
  engine.setOutfit("amongUs", false);
  engine.morph = 1;
  const { ctx, colors } = context();
  engine.draw(ctx, 100, 100);
  assert.ok(!colors.has(AMONG_US_BODY[0]));
  assert.ok(!colors.has("#182B34"));
});
