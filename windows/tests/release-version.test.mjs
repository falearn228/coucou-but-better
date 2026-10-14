import { test } from "node:test";
import assert from "node:assert/strict";
import { checkVersions, versionForTag } from "../scripts/check-release-version.mjs";

test("the public f tag maps to a valid Cargo/Tauri version", () => {
  assert.equal(versionForTag("0.4.1.f"), "0.4.1-f");
  assert.equal(versionForTag("windows-v0.4.0"), "0.4.0");
  assert.throws(() => versionForTag("windows-latest"));
  assert.throws(() => versionForTag("0.4.1.f; anything"));
});

test("an f release requires matching manifests and a numeric MSI version", () => {
  const versions = { tauri: "0.4.1-f", npm: "0.4.1-f", cargo: "0.4.1-f", msi: "0.4.1.0" };
  assert.equal(checkVersions("0.4.1.f", versions), "0.4.1-f");
  for (const key of ["tauri", "npm", "cargo"]) {
    assert.throws(() => checkVersions("0.4.1.f", { ...versions, [key]: "0.4.0" }), /requires/);
  }
  assert.throws(() => checkVersions("0.4.1.f", { ...versions, msi: "0.4.1.f" }), /numeric MSI/);
});
