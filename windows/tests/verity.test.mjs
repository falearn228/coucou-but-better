import { test } from "node:test";
import assert from "node:assert/strict";
import { BotEngine } from "../src/mochi/engine.ts";
import { VERITY_BODY } from "../src/mochi/outfits.ts";
import { parseOutfit, pillOutfit, withPillOutfit, OUTFIT_LABELS } from "../src/mochi/wardrobe.ts";
import { installCanvasRecorder, recordingContext } from "./canvas-recorder.mjs";

installCanvasRecorder();

test("Verity can be assigned and restored without changing another agent's skin", () => {
  assert.equal(parseOutfit("verity"), "verity");
  assert.equal(OUTFIT_LABELS.verity, "Verity");
  const saved = withPillOutfit({ mochiOutfit: "amongUs" }, "integration_claude", "agent_codex", "verity");
  const restored = JSON.parse(JSON.stringify(saved));
  assert.equal(pillOutfit(restored, "integration_claude", "agent_codex"), "verity");
  assert.equal(pillOutfit(restored, "agent_codex", "agent_codex"), "amongUs");
});

test("Verity draws the yellow body and both rows of teeth at both sizes and through a blink", () => {
  for (const mini of [false, true]) {
    for (const yaw of [-1.2, 0, 1.2]) {
      for (const open of [0.06, 1]) {
        const engine = new BotEngine();
        engine.isMini = mini;
        engine.yaw = yaw;
        engine.open = open;
        engine.setOutfit("verity", false);
        const { ctx, colors } = recordingContext();
        engine.draw(ctx, mini ? 40 : 100, mini ? 40 : 100);
        assert.ok(colors.has(VERITY_BODY[0]));
        assert.ok(colors.has(VERITY_BODY[1]));
        assert.ok(colors.has("#FFFFED"), "upper teeth");
        assert.ok(colors.has("#DDDECA"), "lower teeth");
      }
    }
  }
});

test("Verity's face stays off the back of the head and fades for the mailbox", () => {
  for (const [yaw, morph] of [[Math.PI, 0], [0, 1]]) {
    const engine = new BotEngine();
    engine.setOutfit("verity", false);
    engine.yaw = yaw;
    engine.morph = morph;
    const { ctx, colors } = recordingContext();
    engine.draw(ctx, 100, 100);
    assert.ok(!colors.has("#FFFFED"));
    assert.ok(!colors.has("#DDDECA"));
    if (morph === 1) assert.ok(!colors.has(VERITY_BODY[0]));
  }
});
