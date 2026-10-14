// Mini Mochis (pills + compact grid) — port of MiniBotCanvasView.
// Each canvas owns a BotEngine; the island's frame loop ticks every live one.

import { BotEngine, hexToRGB } from "./engine";
import { beginBotFrame } from "./frame";
import type { AgentTask } from "../core/state";
import { State } from "../core/state";
import { SeasonCache, pillOutfit } from "./wardrobe";

interface MiniBot {
  canvas: HTMLCanvasElement;
  engine: BotEngine;
  cssSize: number;
  padding: number;
  taskId: string;
  /** Asked every frame: whether this one dances (the music pill's, MiniBotCanvasView). */
  dancing?: () => boolean;
}

const live = new Map<HTMLCanvasElement, MiniBot>();
const seasons = new SeasonCache();

function outfitFor(id: string) {
  const preview = State.mode === "expanded" && State.view === "wardrobe" && State.wardrobeTargetId === id;
  return preview && State.wardrobePreview != null
    ? State.wardrobePreview : seasons.get(pillOutfit(State.settings, id, State.mainPillId));
}

/**
 * Creates a mini Mochi whose **body** is `bodySize` CSS pixels across.
 *
 * The engine draws the body at 60 % of its canvas, so the canvas is
 * `bodySize / 0.6` and is centred in a `bodySize` slot, overflowing it — the
 * same thing SwiftUI does with a `.frame(width: 22/0.6)` inside a
 * `.frame(width: 22)`. Sizing the canvas itself to `bodySize` would shrink the
 * whole drawing to 60 %, which is what used to happen.
 */
export function createMiniBot(task: AgentTask, bodySize: number, dancing?: () => boolean): HTMLElement {
  const slot = document.createElement("span");
  slot.className = "mini";
  slot.style.width = `${bodySize}px`;
  slot.style.height = `${bodySize}px`;

  const canvas = document.createElement("canvas");
  const engineSize = bodySize / 0.6;
  // Hats and ears may extend beyond the original body canvas. Extra transparent
  // space keeps them intact without changing the body's position in its slot.
  const padding = bodySize * 0.8;
  const canvasSize = engineSize + padding * 2;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(canvasSize * dpr);
  canvas.height = Math.round(canvasSize * dpr);
  canvas.style.width = `${canvasSize}px`;
  canvas.style.height = `${canvasSize}px`;
  slot.append(canvas);

  const engine = new BotEngine();
  engine.isMini = true;
  engine.setOutfit(outfitFor(task.id), false);
  engine.bodyColor = hexToRGB(task.color);
  engine.setState(task.state, true);
  if (task.emote) engine.setPermanentEmote(task.emote);
  if (task.miniEye) {
    engine.permanentEye = task.miniEye;
    engine.eyeOverride = task.miniEye;
    engine.eyeOverrideUntil = Number.POSITIVE_INFINITY;
  }

  live.set(canvas, { canvas, engine, cssSize: engineSize, padding, taskId: task.id, dancing });
  return slot;
}

export function releaseMiniBot(canvas: HTMLCanvasElement) {
  live.delete(canvas);
}

/** Drops every canvas no longer in the document (views are rebuilt wholesale). */
export function pruneMiniBots() {
  for (const [canvas] of live) {
    if (!canvas.isConnected) live.delete(canvas);
  }
}

export function syncMiniBotStates(tasks: AgentTask[]) {
  for (const mb of live.values()) {
    const task = tasks.find((t) => t.id === mb.taskId);
    if (!task) continue;
    mb.engine.setState(task.state);
    mb.engine.bodyColor = hexToRGB(task.color);
    mb.engine.setOutfit(outfitFor(task.id), !(State.mode === "expanded" && State.view === "wardrobe"));
  }
}

export function tickMiniBots(dt: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  for (const mb of live.values()) {
    mb.engine.setDancing(mb.dancing?.() ?? false);
    mb.engine.setOutfit(outfitFor(mb.taskId));
    mb.engine.update(dt);
    const size = mb.cssSize + mb.padding * 2;
    const ctx = beginBotFrame(mb.canvas, mb.engine.outfit, size, size, dpr);
    if (!ctx) continue;
    ctx.save();
    ctx.translate(mb.padding, mb.padding);
    mb.engine.applyDance(ctx, mb.cssSize, mb.cssSize);
    mb.engine.draw(ctx, mb.cssSize, mb.cssSize);
    ctx.restore();
  }
}

export const miniBotCount = () => live.size;
