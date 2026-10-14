import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { installFakeDom } from "./fakedom.mjs";
import { DEFAULT_SETTINGS, State } from "../src/core/state.ts";
import { buildWardrobe } from "../src/views/wardrobe.ts";
import { buildOverview } from "../src/views/views.ts";
import { OUTFIT_SELECTIONS, withPillOutfit } from "../src/mochi/wardrobe.ts";
import { setLanguage } from "../src/i18n/i18n.ts";

installFakeDom();
window.addEventListener = () => {};
const create = document.createElement;
document.createElement = (tag) => {
  const el = create(tag);
  if (tag === "canvas") el.getContext = () => null;
  return el;
};

beforeEach(() => {
  setLanguage("en");
  State.settings = { ...DEFAULT_SETTINGS, mainPill: "agent_codex", activeIntegrations: ["integration_claude"], mochiOutfit: "pumpkin", pillOutfits: {} };
  State.tasks = [];
  State.focusId = null;
  State.wardrobeTargetId = null;
  State.wardrobePreview = null;
  State.showingPlanDetail = false;
  State.loadIntegrationTasks();
});

test("the wardrobe edits the selected agent and restores both choices when reopened", () => {
  const actions = {
    previewOutfit: (outfit) => { State.wardrobePreview = outfit; },
    chooseOutfit: (outfit) => {
      State.settings = withPillOutfit(State.settings, State.wardrobeTargetId, State.mainPillId, outfit);
    },
  };
  const view = buildWardrobe(actions);
  view.sync();
  const target = view.el.find(".wardrobe-target-select")[0];
  assert.equal(target.value, "agent_codex");
  target.value = "integration_claude";
  target.fire("change");
  view.sync();
  view.el.find(".wardrobe-item")[OUTFIT_SELECTIONS.indexOf("beanie")].fire("click");
  assert.equal(State.settings.pillOutfits.integration_claude, "beanie");
  assert.equal(State.settings.mochiOutfit, "pumpkin");
  target.value = "agent_codex";
  target.fire("change");
  view.sync();
  assert.ok(view.el.find(".wardrobe-item")[OUTFIT_SELECTIONS.indexOf("pumpkin")].classList.contains("on"));
  view.el.find(".wardrobe-item")[OUTFIT_SELECTIONS.indexOf("crown")].fire("click");
  State.settings = JSON.parse(JSON.stringify(State.settings));
  State.wardrobeTargetId = "integration_claude";
  const reopened = buildWardrobe(actions);
  reopened.sync();
  assert.ok(reopened.el.find(".wardrobe-item")[OUTFIT_SELECTIONS.indexOf("beanie")].classList.contains("on"));
  assert.equal(State.settings.pillOutfits.agent_codex, "crown");
});

test("right-clicking the actual small agent pill opens its own wardrobe", () => {
  const opened = [];
  const actions = new Proxy({ setView: (view) => opened.push(view) }, { get: (obj, key) => obj[key] ?? (() => {}) });
  const view = buildOverview(actions);
  view.sync();
  const event = view.el.find(".pill")[0].fire("contextmenu");
  assert.equal(event.defaultPrevented, true);
  assert.equal(State.wardrobeTargetId, "integration_claude");
  assert.deepEqual(opened, ["wardrobe"]);
});
