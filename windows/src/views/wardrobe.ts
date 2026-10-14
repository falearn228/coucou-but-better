// Wardrobe view — port of WardrobeView (IslandViewContent.swift). Opened with a
// right-click on Mochi or from the tray menu. Resting the pointer on a button
// tries the outfit on Mochi; a click keeps it.

import { h, clear } from "./dom";
import { State } from "../core/state";
import { availablePills, pillDefinition } from "../core/pills";
import { drawWardrobeIcon } from "../mochi/outfits";
import {
  OUTFIT_KEYS, OUTFIT_SELECTIONS, WARDROBE_STRINGS, pillOutfit, resolveOutfit, seasonalOutfit,
  wardrobeHeader, type Outfit, type OutfitSelection,
} from "../mochi/wardrobe";
import type { ViewActions, ViewHost } from "./views";
import { language, tl } from "../i18n/i18n";

const ICON = 28;

export function buildWardrobe(actions: ViewActions): ViewHost {
  const note = h("span", { class: "wardrobe-note" });
  const grid = h("div", { class: "wardrobe-grid" });
  const target = h("select", { class: "wardrobe-target-select", "aria-label": tl("Agent") });
  const el = h(
    "div",
    { class: "view wardrobe" },
    h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "stack wardrobe-stack" },
        h("div", { class: "wardrobe-head" }, h("span", { class: "wardrobe-title", text: tl("Wardrobe") }), note),
        h("label", { class: "wardrobe-target" }, h("span", { text: tl("Agent") }), target),
        grid,
      ),
    ),
  );

  let hovered: OutfitSelection | null = null;
  let drawnSeason: Outfit | null = null;
  let drawnLanguage = language();
  const items = new Map<OutfitSelection, { button: HTMLButtonElement; canvas: HTMLCanvasElement }>();
  let targetsKey = "";
  const selection = () => pillOutfit(State.settings, State.wardrobeTargetId ?? State.mainPillId, State.mainPillId);

  target.addEventListener("change", () => {
    State.wardrobeTargetId = target.value;
    hovered = null;
    actions.previewOutfit(null);
    State.notify();
  });

  const updateNote = () => {
    note.textContent = wardrobeHeader(hovered, selection(), new Date());
  };

  for (const sel of OUTFIT_SELECTIONS) {
    const canvas = h("canvas");
    const button = h(
      "button",
      { class: "wardrobe-item", title: tl(OUTFIT_KEYS[sel]), "aria-label": tl(OUTFIT_KEYS[sel]) },
      canvas,
    );
    button.addEventListener("mouseenter", () => {
      hovered = sel;
      actions.previewOutfit(resolveOutfit(sel, new Date()));
      updateNote();
    });
    button.addEventListener("mouseleave", () => {
      if (hovered !== sel) return;
      hovered = null;
      actions.previewOutfit(null);
      updateNote();
    });
    button.addEventListener("click", () => actions.chooseOutfit(sel));
    items.set(sel, { button, canvas });
    grid.append(button);
  }

  /** Icons are drawn once; only "auto" changes, with the season and its badge's language. */
  const drawIcons = () => {
    const season = seasonalOutfit(new Date());
    if (season === drawnSeason && drawnLanguage === language()) return;
    const first = drawnSeason == null;
    drawnSeason = season;
    drawnLanguage = language();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const [sel, { canvas }] of items) {
      if (!first && sel !== "auto") continue;
      canvas.width = Math.round(ICON * dpr);
      canvas.height = Math.round(ICON * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawWardrobeIcon(ctx, ICON, sel, season, WARDROBE_STRINGS.autoBadge);
    }
  };

  return {
    el,
    sync() {
      const choices = new Map(availablePills()
        .filter((p) => p.category === "workspace" || p.category === "agent")
        .map((p) => [p.id, p.name]));
      for (const task of State.tasks) choices.set(task.id, pillDefinition(task.id)?.name ?? task.name);
      const id = State.wardrobeTargetId ?? State.focusTask?.id ?? State.mainPillId;
      State.wardrobeTargetId = choices.has(id) ? id : State.mainPillId;
      const key = JSON.stringify([...choices]);
      if (key !== targetsKey) {
        targetsKey = key;
        clear(target);
        for (const [id, name] of choices) target.append(h("option", { value: id, text: name }));
      }
      target.value = State.wardrobeTargetId;
      drawIcons();
      // The island drops the preview when the view closes: so does the hover.
      if (State.wardrobePreview == null) hovered = null;
      const current = selection();
      for (const [sel, { button }] of items) button.classList.toggle("on", sel === current);
      updateNote();
    },
  };
}
