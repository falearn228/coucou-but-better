import { beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { installFakeDom } from "./fakedom.mjs";
import { DEFAULT_SETTINGS, State } from "../src/core/state.ts";
import { buildOverview } from "../src/views/views.ts";
import { setLanguage } from "../src/i18n/i18n.ts";

installFakeDom();
window.addEventListener = () => {};
const actions = new Proxy({}, { get: () => () => {} });

beforeEach(() => {
  setLanguage("en");
  State.tasks = [];
  State.focusId = null;
  State.settings = { ...DEFAULT_SETTINGS, mainPill: "agent_codex", activeIntegrations: ["integration_claude"] };
  State.integrations = { integration_claude: { configured: true, loaded: true, error: null, data: {} } };
  State.showingPlanDetail = false;
  State.loadIntegrationTasks();
});

test("the actual overview pill says Claude Code even while its session is named after a project", () => {
  State.tasks.find((t) => t.id === "integration_claude").name = "netControl";
  const view = buildOverview(actions);
  view.sync();
  assert.deepEqual(view.el.find(".lbl").map((el) => el.textContent), ["Claude Code"]);
});

test("the actual idle card identifies Claude Code and never offers to launch VS Code", () => {
  State.focusId = "integration_claude";
  const view = buildOverview(actions);
  view.sync();
  const header = view.el.find(".int-head")[0];
  assert.ok(header.textContent.startsWith("Claude Code"));
  assert.ok(!view.el.textContent.includes("Visual Studio Code"));
});
