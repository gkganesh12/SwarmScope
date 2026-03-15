import { useEffect, useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789αβγδεθλπσφψω∂∫∑√∞<>{}[]@#$%&*~01';
const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

const FONT_SIZE = 14;
const CELL_W = 10;
const CELL_H = 16;

/* ═══════════════════════════════════════════════════════
   SPRITES — large, detailed, recognizable silhouettes
   ═══════════════════════════════════════════════════════ */

function parseSprite(lines: string[]): number[][] {
  return lines.map(row => [...row].map(c => c === '#' ? 1 : 0));
}

// RUNNING MAN — mid-stride, dynamic pose
const RUNNING_MAN = parseSprite([
  '..............####..........',
  '.............######.........',
  '.............######.........',
  '.............######.........',
  '..............####..........',
  '...............##...........',
  '..............####..........',
  '........###.######.........',
  '.......####.#######........',
  '......##############.......',
  '.....####..########........',
  '....###.....#######........',
  '...##.......#######........',
  '............######.........',
  '...........###.###.........',
  '..........###...###........',
  '.........###.....###.......',
  '........###.......###......',
  '.......###.........###.....',
  '......####.........####....',
  '.....#####.........#####...',
]);

// SHIELD — protection / defense
const SHIELD = parseSprite([
  '.....##############.....',
  '....##################..',
  '...####################.',
  '..######################',
  '..######################',
  '..######################',
  '..######################',
  '..######################',
  '..######################',
  '...####################.',
  '....##################..',
  '.....################...',
  '......##############....',
  '.......############.....',
  '........##########......',
  '.........########.......',
  '..........######........',
  '...........####.........',
  '............##..........',
]);

// DIAMOND — precision / clarity
const DIAMOND = parseSprite([
  '............##............',
  '...........####...........',
  '..........######..........',
  '.........########.........',
  '........##########........',
  '.......############.......',
  '......##############......',
  '.....################.....',
  '....##################....',
  '...####################...',
  '..######################..',
  '.########################.',
  '##########################',
  '.########################.',
  '..######################..',
  '...####################...',
  '....##################....',
  '.....################.....',
  '......##############......',
  '.......############.......',
  '........##########........',
  '.........########.........',
  '..........######..........',
  '...........####...........',
  '............##............',
]);

// HEXAGON — network / hive
const HEXAGON = parseSprite([
  '........############........',
  '.......##############.......',
  '......################......',
  '.....##################.....',
  '....####################....',
  '...######################...',
  '..########################..',
  '.##########################.',
  '############################',
  '############################',
  '############################',
  '############################',
  '############################',
  '############################',
  '.##########################.',
  '..########################..',
  '...######################...',
  '....####################....',
  '.....##################.....',
  '......################......',
  '.......##############.......',
  '........############........',
]);

const ALL_SPRITES = [RUNNING_MAN, SHIELD, DIAMOND, HEXAGON];
const SPRITE_NAMES = ['AGENT', 'SHIELD', 'DIAMOND', 'HIVEMIND'];

/* ═══════════════════════════════════════════════════════
   ANIMATION STATE
   Shapes stay FIXED in place (like Inception Labs Mercury).
   They materialize → hold with shimmer → dissolve → next.
   ═══════════════════════════════════════════════════════ */

type Phase = 'idle' | 'fade_in' | 'hold' | 'fade_out';

interface ShapeState {
  sprite: number[][];
  spriteW: number;
  spriteH: number;
  spriteIdx: number;
  // Fixed grid offset (top-left in grid cells)
  ox: number;
  oy: number;
  // Per-cell random value for staggered animation
  cellNoise: Float32Array;
  // Phase
  phase: Phase;
  phaseT: number;
  phaseSpeed: number;
  // Timing
  holdDuration: number;
  holdElapsed: number;
  idleDuration: number;
  idleElapsed: number;
  // Queue
  queueIdx: number;
}

export default function SwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    cols: number;
    rows: number;
    grid: { char: string; phase: number; speed: number; drift: number }[];
    shape: ShapeState;
    w: number;
    h: number;
    time: number;
  } | null>(null);

  function shuffledOrder(): number[] {
    const arr = ALL_SPRITES.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const orderRef = useRef<number[]>(shuffledOrder());

  function makeCellNoise(maxCells: number): Float32Array {
    const m = new Float32Array(maxCells);
    for (let i = 0; i < maxCells; i++) m[i] = Math.random();
    return m;
  }

  function setupShape(w: number, h: number, _cols: number, _rows: number, queueIdx: number): ShapeState {
    if (queueIdx >= orderRef.current.length) {
      orderRef.current = shuffledOrder();
      queueIdx = 0;
    }
    const spriteIdx = orderRef.current[queueIdx];
    const sprite = ALL_SPRITES[spriteIdx];
    const spriteW = sprite[0].length;
    const spriteH = sprite.length;

    // Fixed center position — right side of canvas
    const cx = w * 0.72;
    const cy = h * 0.45;
    const ox = Math.floor(cx / CELL_W) - Math.floor(spriteW / 2);
    const oy = Math.floor(cy / CELL_H) - Math.floor(spriteH / 2);

    return {
      sprite,
      spriteW,
      spriteH,
      spriteIdx,
      ox,
      oy,
      cellNoise: makeCellNoise(60 * 60),
      phase: 'idle',
      phaseT: 0,
      phaseSpeed: 0.025,
      holdDuration: 150,   // ~2.5 sec hold
      holdElapsed: 0,
      idleDuration: 30,    // ~0.5 sec gap
      idleElapsed: 0,
      queueIdx,
    };
  }

  const initState = useCallback((w: number, h: number) => {
    const cols = Math.ceil(w / CELL_W) + 2;
    const rows = Math.ceil(h / CELL_H) + 2;

    const grid: { char: string; phase: number; speed: number; drift: number }[] = [];
    for (let i = 0; i < cols * rows; i++) {
      grid.push({
        char: randChar(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        drift: 0.2 + Math.random() * 0.8,
      });
    }

    const shape = setupShape(w, h, cols, rows, 0);
    stateRef.current = { cols, rows, grid, shape, w, h, time: 0 };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const s = stateRef.current;
    if (!canvas || !s) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    s.time += 0.01;
    const { cols, rows, grid, w, h, time } = s;
    const sh = s.shape;

    // ── Phase state machine ──
    switch (sh.phase) {
      case 'idle':
        sh.idleElapsed++;
        if (sh.idleElapsed >= sh.idleDuration) {
          sh.phase = 'fade_in';
          sh.phaseT = 0;
        }
        break;

      case 'fade_in':
        sh.phaseT += sh.phaseSpeed;
        if (sh.phaseT >= 1) {
          sh.phaseT = 1;
          sh.phase = 'hold';
          sh.holdElapsed = 0;
        }
        break;

      case 'hold':
        sh.holdElapsed++;
        if (sh.holdElapsed >= sh.holdDuration) {
          sh.phase = 'fade_out';
          sh.phaseT = 0;
          sh.cellNoise = makeCellNoise(60 * 60); // fresh noise for dissolve
        }
        break;

      case 'fade_out':
        sh.phaseT += sh.phaseSpeed;
        if (sh.phaseT >= 1) {
          const nextIdx = sh.queueIdx + 1;
          s.shape = setupShape(w, h, cols, rows, nextIdx);
        }
        break;
    }

    const { ox, oy } = sh;

    // ── Clear ──
    ctx.fillStyle = '#05070A';
    ctx.fillRect(0, 0, w, h);

    ctx.font = `${FONT_SIZE}px "JetBrains Mono","Fira Code",monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // ── Build shape visibility map ──
    const shapeMap = new Float32Array(cols * rows);

    if (sh.phase !== 'idle') {
      const { sprite, spriteW, spriteH, cellNoise, phaseT } = sh;

      const scx = spriteW / 2;
      const scy = spriteH / 2;
      const maxDist = Math.sqrt(scx * scx + scy * scy);

      for (let sy = 0; sy < spriteH; sy++) {
        for (let sx = 0; sx < spriteW; sx++) {
          const val = sprite[sy][sx];
          if (val === 0) continue;

          const gx = ox + sx;
          const gy = oy + sy;
          if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;

          const noise = cellNoise[sy * 60 + sx] || 0;

          let cellAlpha = 0;

          if (sh.phase === 'fade_in') {
            // Radial sweep from center + stagger noise
            const dx = sx - scx;
            const dy = sy - scy;
            const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
            const threshold = dist * 0.5 + noise * 0.3;
            const localT = Math.max(0, Math.min(1, (phaseT - threshold) / 0.25));
            cellAlpha = localT * val;
          } else if (sh.phase === 'hold') {
            cellAlpha = val;
          } else if (sh.phase === 'fade_out') {
            // Dissolve: random cells disappear at different rates
            const threshold = noise * 0.6;
            const localT = Math.max(0, Math.min(1, (phaseT - threshold) / 0.35));
            cellAlpha = (1 - localT) * val;
          }

          if (cellAlpha <= 0) continue;

          const idx = gy * cols + gx;
          // Pulse brightness during hold for "alive" feeling
          const pulse = sh.phase === 'hold'
            ? 0.2 + Math.sin(time * 3.0 + noise * 10) * 0.04
            : 0.2 + Math.sin(time * 2.5 + noise * 8) * 0.03;
          const brightness = cellAlpha * pulse;
          if (brightness > shapeMap[idx]) shapeMap[idx] = brightness;
        }
      }

      // Edge glow — 2-cell radius around visible body
      for (let sy = -2; sy < spriteH + 2; sy++) {
        for (let sx = -2; sx < spriteW + 2; sx++) {
          const gx = ox + sx;
          const gy = oy + sy;
          if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
          const idx = gy * cols + gx;
          if (shapeMap[idx] > 0.04) continue;

          let nearBody = false;
          for (let dy = -1; dy <= 1 && !nearBody; dy++) {
            for (let dx = -1; dx <= 1 && !nearBody; dx++) {
              const nx = sx + dx;
              const ny = sy + dy;
              if (nx >= 0 && nx < spriteW && ny >= 0 && ny < spriteH && sprite[ny][nx] > 0) {
                const adjNoise = cellNoise[ny * 60 + nx] || 0;
                let adjVisible = false;
                if (sh.phase === 'hold') adjVisible = true;
                else if (sh.phase === 'fade_in') {
                  const d2 = Math.sqrt((nx - spriteW/2)**2 + (ny - spriteH/2)**2) / maxDist;
                  adjVisible = phaseT > d2 * 0.5 + adjNoise * 0.3;
                } else if (sh.phase === 'fade_out') {
                  adjVisible = phaseT < adjNoise * 0.6 + 0.35;
                }
                if (adjVisible) nearBody = true;
              }
            }
          }
          if (nearBody) {
            const glowVal = 0.04 + Math.sin(time * 2 + gx * 0.3) * 0.015;
            if (glowVal > shapeMap[idx]) shapeMap[idx] = glowVal;
          }
        }
      }
    }

    // ── Render grid ──
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const cell = grid[idx];
        const x = col * CELL_W + CELL_W * 0.5;
        const y = row * CELL_H + CELL_H * 0.5;

        const shapeVal = shapeMap[idx];

        // ── Character cycling ──
        if (shapeVal > 0.08) {
          // Shape body: rapid shimmer
          if (Math.random() < 0.22) cell.char = randChar();
        } else if (shapeVal > 0.02) {
          // Edge glow: moderate
          if (Math.random() < 0.08) cell.char = randChar();
        } else {
          // Background: per-cell speed-driven cycling
          const cycleChance = 0.008 + cell.speed * 0.012;
          if (Math.random() < cycleChance) cell.char = randChar();
        }

        // ── Background alpha: solid, visible code texture ──
        const cascade = Math.sin(y * 0.012 - time * cell.drift * 1.5 + col * 0.3) * 0.5 + 0.5;
        const wave1 = Math.sin(x * 0.006 + y * 0.003 + time * 0.6) * 0.5 + 0.5;
        const shimmer = Math.sin(time * cell.speed * 1.2 + cell.phase) * 0.5 + 0.5;
        const diag = Math.sin((x + y) * 0.004 - time * 0.5) * 0.5 + 0.5;

        // Much higher base alpha — solid visible background
        const bgAlpha = 0.12 + cascade * 0.08 + wave1 * 0.05 + shimmer * 0.06 + diag * 0.03;

        let alpha = bgAlpha + shapeVal * 1.5;
        alpha = Math.min(alpha, 0.7);

        // ── Color ──
        let r: number, g: number, b: number;
        if (shapeVal > 0.12) {
          // Shape body: bright white-teal
          const w2 = Math.min(1, shapeVal * 4);
          r = Math.floor(40 + w2 * 200);
          g = Math.floor(170 + w2 * 85);
          b = Math.floor(140 + w2 * 115);
        } else if (shapeVal > 0.03) {
          // Edge glow
          r = Math.floor(20 + shapeVal * 180);
          g = Math.floor(155 + shapeVal * 70);
          b = Math.floor(125 + shapeVal * 90);
        } else {
          // Background — dark teal/green code, solid and visible
          const bright = cascade * 0.3 + shimmer * 0.15;
          r = Math.floor(10 + bright * 12);
          g = Math.floor(50 + bright * 35 + wave1 * 15);
          b = Math.floor(40 + bright * 25 + diag * 10);
        }

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillText(cell.char, x, y);
      }
    }

    // ── Shape label ──
    if (sh.phase !== 'idle') {
      let labelAlpha = 0;
      if (sh.phase === 'fade_in') labelAlpha = Math.min(1, sh.phaseT * 2) * 0.3;
      else if (sh.phase === 'hold') labelAlpha = 0.3;
      else if (sh.phase === 'fade_out') labelAlpha = Math.max(0, 1 - sh.phaseT * 1.5) * 0.3;

      if (labelAlpha > 0.01) {
        const labelX = (ox + sh.spriteW / 2) * CELL_W;
        const labelY = (oy + sh.spriteH + 3) * CELL_H;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(16, 185, 129, ${labelAlpha})`;
        ctx.fillText(`[ ${SPRITE_NAMES[sh.spriteIdx]} ]`, labelX, labelY);

        const tw = ctx.measureText(`[ ${SPRITE_NAMES[sh.spriteIdx]} ]`).width;
        ctx.fillRect(labelX - tw / 2, labelY + 7, tw, 0.5);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = '#05070A';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
      initState(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initState, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
