// A skin can extend beyond the body (boots, backpacks, hats). On transparent
// WebKitGTK/X11 surfaces a clearRect alone can leave the old canvas texture on
// screen. Replacing its backing store once when the drawn skin changes forces
// the whole layer to be repainted, including newly transparent pixels.
const outfits = new WeakMap<HTMLCanvasElement, string>();

export function beginBotFrame(
  canvas: HTMLCanvasElement, outfit: string, width: number, height: number, dpr: number, originX = 0,
): CanvasRenderingContext2D | null {
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h || outfits.get(canvas) !== outfit) {
    // Assigning width resets the bitmap and drawing state even at the same size.
    canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    outfits.set(canvas, outfit);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // Clear the exact physical bitmap, including fractional-DPR edge pixels.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.setTransform(dpr, 0, 0, dpr, originX * dpr, 0);
  return ctx;
}
