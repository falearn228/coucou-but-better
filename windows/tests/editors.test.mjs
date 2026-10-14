import { installFakeDom } from "./fakedom.mjs";
import { buildDiffCard } from "../src/views/diff.ts";
import { fromNew } from "../src/core/diff.ts";
import { renderIntegrationCard } from "../src/views/integrations.ts";
import { DEFAULT_SETTINGS, State } from "../src/core/state.ts";
import { setLanguage } from "../src/i18n/i18n.ts";
import { test } from "node:test";
import assert from "node:assert/strict";
import { editorForTask } from "../src/core/editors.ts";
import { Bridge } from "../src/core/bridge.ts";
import { sent } from "./tauri.mjs";

test("the session host wins over the main workspace, including tagged agents", () => {
  assert.equal(editorForTask({ id: "agent_codex", sessionEditor: "zed" }, "integration_claude"), "zed");
  assert.equal(editorForTask({ id: "integration_claude", sessionEditor: "code" }, "agent_zed"), "code");
  assert.equal(editorForTask({ id: "agent_zed" }, "integration_claude"), "zed");
  assert.equal(editorForTask(null, "agent_zed"), "zed");
  assert.equal(editorForTask(null, "integration_claude"), "code");
});

test("a diff file goes to the selected editor through the bridge", async () => {
  await Bridge.openFileInEditor("/work/a.ts", "zed");
  assert.deepEqual(sent("open_file_in_editor"), [{ path: "/work/a.ts", editor: "zed" }]);
});

installFakeDom();

test("the diff button names Zed and hands its exact path to the action", () => {
  setLanguage("en");
  const opened = [];
  const card = buildDiffCard(fromNew("", "/work/a.ts"), { editor: "zed", dismiss() {}, open: (path) => opened.push(path) });
  const button = card.find(".icon-btn")[0];
  assert.equal(button.getAttribute("title"), "Open in Zed");
  button.fire("click");
  assert.deepEqual(opened, ["/work/a.ts"]);
});

test("an idle Zed pill can launch Zed before any session arrives", () => {
  State.tasks = [];
  State.settings = { ...DEFAULT_SETTINGS, mainPill: "agent_zed" };
  State.loadIntegrationTasks();
  const card = renderIntegrationCard(State.tasks.find((task) => task.id === "agent_zed"), { openSettings() {} });
  const button = card.find(".link-btn").find((el) => el.textContent === "Open Zed");
  assert.ok(button);
  button.fire("click");
  assert.deepEqual(sent("open_session"), [{ sessionId: null, path: null, editor: "zed" }]);
});
