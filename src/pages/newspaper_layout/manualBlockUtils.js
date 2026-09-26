// export const PAGE_WIDTH = 1056;
// export const PAGE_HEIGHT = 2112;

// export const rectsOverlap = (a, b) =>
//   a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// // x,y,width,height ko hamesha page ke andar rakhta hai — kabhi bhi overflow nahi hone dega
// export const clampToPage = ({ x, y, width, height }) => {
//   const w = Math.min(Math.max(90, width), PAGE_WIDTH);
//   const h = Math.min(Math.max(90, height), PAGE_HEIGHT);
//   const clampedX = Math.max(0, Math.min(PAGE_WIDTH - w, x));
//   const clampedY = Math.max(0, Math.min(PAGE_HEIGHT - h, y));
//   return { x: Math.round(clampedX), y: Math.round(clampedY), width: Math.round(w), height: Math.round(h) };
// };

// const toRect = (l) => ({ left: l.x, top: l.y, right: l.x + l.width, bottom: l.y + l.height });

// // Naya block add karte waqt ya X/Y/Width/Height manually badalte waqt,
// // existing blocks ke against check karke pehli free jagah return karta hai.
// // Agar clash hota hai to niche (y + 20px) shift karke dobara try karta hai.
// export const findFreeSlot = (existingLayouts, desired) => {
//   let candidate = clampToPage(desired);
//   const obstacles = existingLayouts.map(toRect);
//   let guard = 0;
//   while (obstacles.some((o) => rectsOverlap(toRect(candidate), o)) && guard < 200) {
//     candidate = clampToPage({ ...candidate, y: candidate.y + 20 });
//     guard += 1;
//     if (candidate.y + candidate.height >= PAGE_HEIGHT) {
//       candidate = clampToPage({ ...candidate, x: candidate.x + 20, y: 0 });
//     }
//   }
//   return candidate;
// };

// // Manual resize/move ke waqt bhi isi se validate karo — obstacles ke against clash na ho
// export const resolveAgainstObstacles = (desired, obstacles) => {
//   const clamped = clampToPage(desired);
//   const rect = toRect(clamped);
//   const collides = obstacles.some((o) => rectsOverlap(rect, o));
//   return collides ? null : clamped;
// };