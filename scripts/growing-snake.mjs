// Generates a growing-snake animation from a GitHub contribution calendar.
// Usage: GITHUB_TOKEN=... node scripts/growing-snake.mjs <username> <outDir>
//        node scripts/growing-snake.mjs --fixture <calendar.json> <outDir>
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CELL = 12, GAP = 3, PITCH = CELL + GAP, PAD = 16, BAR_H = 8;
const STEP = 0.09;           // seconds per grid move
const START_LEN = 4;         // initial body length
const MAX_LEN = 48;          // cap so the snake stays readable
const HOLD_STEPS = 8;        // short pause off-board before the loop restarts

const THEMES = {
  "github-snake.svg": {
    bg: "#ffffff", empty: "#ebedf0",
    levels: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    head: "#0b7285", body: "#1a8c9c", bar: "#d0d7de", barFill: "#2f9fb3",
  },
  "github-snake-dark.svg": {
    bg: "#0d1117", empty: "#161b22",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    head: "#7ee0cf", body: "#4ec9b0", bar: "#21262d", barFill: "#4ec9b0",
  },
};

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function fetchCalendar(user, token) {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{weekday contributionLevel}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "growing-snake" },
    body: JSON.stringify({ query, variables: { login: user } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL request failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data.user.contributionsCollection.contributionCalendar.weeks;
}

function toGrid(weeks) {
  const cells = [];
  weeks.forEach((w, x) => w.contributionDays.forEach((d) =>
    cells.push({ x, y: d.weekday, level: LEVEL[d.contributionLevel] ?? 0 })));
  return { cells, cols: weeks.length };
}

// Greedy nearest-food walk on the grid, then an exit to the right; returns head positions and the step each food is eaten.
function planPath(cells, cols) {
  const food = cells.filter((c) => c.level > 0);
  const path = [{ x: -2, y: 3 }];
  const eatenAt = new Map();
  let cur = path[0];
  const left = new Set(food);
  while (left.size) {
    let best = null, bestD = Infinity;
    for (const f of left) {
      const d = Math.abs(f.x - cur.x) + Math.abs(f.y - cur.y);
      if (d < bestD || (d === bestD && f.x < best.x)) { best = f; bestD = d; }
    }
    while (cur.x !== best.x || cur.y !== best.y) {
      cur = cur.x !== best.x ? { x: cur.x + Math.sign(best.x - cur.x), y: cur.y }
                             : { x: cur.x, y: cur.y + Math.sign(best.y - cur.y) };
      path.push(cur);
    }
    eatenAt.set(best, path.length - 1);
    left.delete(best);
  }
  // Leave the board to the right so the full-length snake slides out before the loop restarts.
  while (cur.x < cols + MAX_LEN + 1) { cur = { x: cur.x + 1, y: cur.y }; path.push(cur); }
  return { path, eatenAt };
}

const px = (v) => PAD + v * PITCH;
const pct = (step, total) => `${((step / total) * 100).toFixed(3)}%`;

function render(theme, { cells, cols }, { path, eatenAt }) {
  const foodCount = eatenAt.size;
  const maxLen = Math.min(MAX_LEN, START_LEN + foodCount);
  // Prefix lets every body segment share the head keyframes with a time offset.
  const lead = maxLen;
  const moves = path.length - 1;
  const total = lead + moves + HOLD_STEPS;
  const dur = (total * STEP).toFixed(2);
  const W = PAD * 2 + cols * PITCH - GAP;
  const gridH = 7 * PITCH - GAP;
  const H = PAD * 2 + gridH + 14 + BAR_H;

  // Head track: lead steps parked at start, then the walk, then hold at the end.
  const track = [];
  for (let i = 0; i < lead; i++) track.push(path[0]);
  for (const p of path) track.push(p);
  while (track.length <= total) track.push(path[path.length - 1]);
  const frames = track.map((p, i) => `${pct(i, total)}{transform:translate(${px(p.x)}px,${px(p.y)}px)}`).join("");

  // Length after each step, used to reveal body segments as food is eaten.
  const eatSteps = [...eatenAt.values()].sort((a, b) => a - b);
  const growStep = (seg) => {
    if (seg < START_LEN) return 0;
    const k = seg - START_LEN;          // needs k+1 foods eaten
    return k < eatSteps.length ? eatSteps[k] : Infinity;
  };

  let css = `.s{animation:mv ${dur}s linear infinite}@keyframes mv{${frames}}`;
  let body = "";
  for (let seg = maxLen - 1; seg >= 0; seg--) {
    const delay = (-(lead - seg) * STEP).toFixed(2);
    const g = growStep(seg);
    const size = seg === 0 ? CELL : CELL - 2;
    const off = (CELL - size) / 2;
    const fill = seg === 0 ? theme.head : theme.body;
    const op = Math.max(0.45, 1 - seg * 0.012).toFixed(2);
    let vis = "";
    if (g > 0) {
      // Visible from the moment the k-th food is eaten (in timeline steps incl. lead + segment lag).
      const at = g;
      css += `@keyframes g${seg}{0%,${pct(at - 0.01, total)}{opacity:0}${pct(at, total)},100%{opacity:${op}}}`;
      vis = ` style="animation:g${seg} ${dur}s step-end infinite"`;
    } else if (seg > 0) {
      vis = ` opacity="${op}"`;
    }
    body += `<g class="s" style="animation-delay:${delay}s"><rect${vis} x="${off}" y="${off}" width="${size}" height="${size}" rx="${seg === 0 ? 4 : 3}" fill="${fill}"/></g>`;
  }

  // Grid: food cells vanish when eaten and respawn once the snake has left the board.
  let grid = "";
  let i = 0;
  for (const c of cells) {
    const step = eatenAt.get(c);
    const fill = theme.levels[c.level];
    if (step === undefined) {
      grid += `<rect x="${px(c.x)}" y="${px(c.y)}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`;
      continue;
    }
    const at = step;
    css += `@keyframes f${i}{0%,${pct(at - 0.01, total)}{fill:${fill}}${pct(at, total)},${pct(moves - 0.01, total)}{fill:${theme.empty}}${pct(moves, total)},100%{fill:${fill}}}`;
    grid += `<rect x="${px(c.x)}" y="${px(c.y)}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}" style="animation:f${i} ${dur}s step-end infinite"/>`;
    i++;
  }

  // Progress bar fills as the snake eats and resets when the board respawns.
  const barY = PAD + gridH + 14;
  const barW = W - PAD * 2;
  const barFrames = [`0%{transform:scaleX(0)}`, `${pct(0.01, total)}{transform:scaleX(0)}`]
    .concat(eatSteps.map((s, k) => `${pct(s, total)}{transform:scaleX(${((k + 1) / foodCount).toFixed(4)})}`))
    .concat([`${pct(moves, total)},100%{transform:scaleX(0)}`]).join("");
  css += `.bar{transform-origin:${PAD}px 0;animation:bar ${dur}s step-end infinite}@keyframes bar{${barFrames}}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<style>${css}</style>`
    + `<rect width="${W}" height="${H}" fill="${theme.bg}" rx="6"/>`
    + grid
    + `<rect x="${PAD}" y="${barY}" width="${barW}" height="${BAR_H}" rx="4" fill="${theme.bar}"/>`
    + `<rect class="bar" x="${PAD}" y="${barY}" width="${barW}" height="${BAR_H}" rx="4" fill="${theme.barFill}"/>`
    + body
    + `</svg>`;
}

async function main() {
  const [a, b, c] = process.argv.slice(2);
  let weeks, outDir;
  if (a === "--fixture") { weeks = JSON.parse(await readFile(b, "utf8")); outDir = c; }
  else {
    const token = process.env.GITHUB_TOKEN;
    if (!a || !b || !token) throw new Error("Usage: GITHUB_TOKEN=... node scripts/growing-snake.mjs <username> <outDir>");
    weeks = await fetchCalendar(a, token); outDir = b;
  }
  const grid = toGrid(weeks);
  const plan = planPath(grid.cells, grid.cols);
  await mkdir(outDir, { recursive: true });
  for (const [file, theme] of Object.entries(THEMES)) {
    await writeFile(join(outDir, file), render(theme, grid, plan));
  }
  console.log(`food=${plan.eatenAt.size} moves=${plan.path.length - 1}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
