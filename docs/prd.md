# PRD: Synesthesia — The Dancing Body for Music

***

## Product Vision

A reimagined classic desktop media player — inspired by the iconic JetAudio interface — where the traditional visualization window is replaced by a 3D character that dances in real-time to the music. The character's movements are meaningfully synchronized to the rhythm, BPM, and frequency profile of the playing song. Behind the character, a real-time equalizer visualization responds to the audio frequencies, creating a layered stage effect. The whole experience is wrapped in a premium, skeuomorphic brushed-metal UI that looks and feels like a physical hardware device.

This prototype reimagines two iconic interactions simultaneously: the classic media player skin (an iconic UI pattern from the 2000s era) AND the music equalizer (the most unchanged interaction in music UI) — fusing nostalgic hardware aesthetics with a living, dancing 3D character that pushes the boundaries of what a web-based music player can be.

***

## Problem Statement

Classic media players like JetAudio, Winamp, and AIMP had personality — metal skins, custom knobs, glowing displays. Modern music apps have optimized that soul away into flat, minimal, interchangeable UIs. Meanwhile, the equalizer visualization hasn't changed in 30 years — it still just shows bars going up and down.

By fusing a faithfully recreated classic player aesthetic with a 3D dancing character that replaces the cold equalizer, we create something that is both a love letter to iconic UI design AND a boundary-pushing digital experience. You don't just listen to music — you watch it come to life.

***

## Technical Architecture & Foundation

### Core Principle: Lightweight Vanilla Stack

The entire prototype runs as a single-page application with **zero build step**. Plain HTML + CSS + vanilla JavaScript with ES module `<script type="module">` and browser-native `importmap` to load Three.js from CDN.

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Renderer | Three.js `@0.180.0` (CDN importmap) | Character rendering, equalizer bars, stage lighting |
| Model Loading | `GLTFLoader` (Three.js addons) | Load `.glb` character and animation clips |
| Animation | `THREE.AnimationMixer` + `THREE.AnimationUtils` | Crossfade base moves, blend additive moves |
| Audio Analysis | Web Audio API (`AudioContext` + `AnalyserNode`) | Real-time frequency extraction (512-bin FFT) |
| UI Shell | HTML + CSS | Skeuomorphic player chrome, LCD display, transport buttons |

### Import Map Setup

```html
<script type="importmap">
{
  "imports": {
    "three":         "https://unpkg.com/three@0.180.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.180.0/examples/jsm/"
  }
}
</script>
```

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

No bundler. No npm install. Open `index.html` and it works.

***

## Available Assets

### Characters (`.glb`, converted from Mixamo FBX)

| File | Size | Description |
|---|---|---|
| `asssets/characters/character-the-boss.glb` | 2.4 MB | The Boss — lightweight, clean silhouette (DEFAULT, loads first) |
| `asssets/characters/character-kachujin.glb` | 15.7 MB | Kachujin — martial arts style character |
| `asssets/characters/character-ch36.glb` | 29.7 MB | Ch36 — stylized character |
| `asssets/characters/character-remy.glb` | 29.3 MB | Remy — realistic male character |

**All 4 characters are available in the prototype.** The user can switch between them at any time via the character selector in the UI. `character-the-boss.glb` loads first by default (smallest file, fastest initial load). Other characters are lazy-loaded on selection and cached after first load.

All Mixamo characters share the same skeleton rig (`mixamorig`), so all animations work with all characters without retargeting.

### Animations (`.glb`, converted from Mixamo FBX)

**Hip-Hop / Urban animations (for Song 1 — Hip-Hop track):**

| File | Size | Style |
|---|---|---|
| `asssets/animations/animation-hiphop.glb` | 0.1 MB | Basic hip-hop groove — head nod, bounce |
| `asssets/animations/animation-arms-hiphop.glb` | 0.6 MB | Arms-focused hip-hop — expressive hand/arm moves |
| `asssets/animations/animation-snake-hiphop.glb` | 0.4 MB | Snake hip-hop — fluid, flowing full-body |
| `asssets/animations/animation-step-hiphop-dance.glb` | 0.2 MB | Step-based hip-hop — footwork focused |
| `asssets/animations/animation-tut-hiphop.glb` | 0.4 MB | Tutting — geometric arm/hand positions |
| `asssets/animations/animation-wave-hiphop.glb` | 0.4 MB | Wave — rolling body wave motion |
| `asssets/animations/animation-breakdance-1990.glb` | 0.1 MB | Classic breakdance move |
| `asssets/animations/animation-breakdance-uprock.glb` | 0.2 MB | Breakdance uprock — standing aggressive moves |

**Jazz / Samba / Fun animations (for Song 2 — Fun/Dance track):**

| File | Size | Style |
|---|---|---|
| `asssets/animations/animation-samba.glb` | 0.5 MB | Samba dance — rhythmic, hip-driven |
| `asssets/animations/animation-jazz.glb` | 0.1 MB | Jazz dance — smooth, expressive |
| `asssets/animations/animation-bellydancing.glb` | 0.6 MB | Belly dancing — torso/hip isolation |
| `asssets/animations/animation-silly-dancing.glb` | 0.1 MB | Silly/fun dance — playful full-body |
| `asssets/animations/animation-rumba.glb` | 0.1 MB | Rumba — partner-style Latin moves |

### Audio Files

Audio files will be placed in `asssets/musics/` folder (2 tracks — one hip-hop, one fun/dance genre). Pending user-provided tracks.

***

## Music & Audio Strategy

### Two Songs, Two Genres

The prototype supports **2 songs** for a focused, polished experience:

| # | Genre | Dance Style | Primary Animations |
|---|---|---|---|
| 1 | **Hip-Hop** | Urban, bouncy, head-nod, arm gestures | hiphop, arms-hiphop, wave-hiphop, tut-hiphop, breakdance-uprock |
| 2 | **Fun/Dance** (Jazz/Samba/Silly) | Playful, rhythmic, full-body grooves | samba, jazz, silly-dancing, bellydancing, rumba |

### Hybrid Approach: Pre-Mapped Choreography + Real-Time Analysis

**Layer 1 — Pre-Mapped Choreography Cue Points**
Each song has a hand-authored timeline baked into its config. These define which base move plays at which song section (intro, verse, chorus, drop, breakdown):

```javascript
choreography: [
  { time: 0.0,  base: 'idle'   },  // intro
  { time: 8.0,  base: 'groove' },  // verse
  { time: 24.0, base: 'full'   },  // chorus
  { time: 40.0, base: 'groove' },  // verse 2
]
```

**Layer 2 — Real-Time Audio Analysis**
Web Audio API `AnalyserNode` feeds frequency data into additive move weights every frame. Bass → leg bounce, mid → arm gestures, treble → head nod. This creates organic, alive feel on top of scripted structure.

***

## Animation System

### Two Types of Moves

**1. Base Moves** — Full-body dance states
- One active at a time, crossfaded via `AnimationAction.crossFadeTo()` (0.5s blend).
- 3 states per song: idle (low energy), groove (medium energy), full dance (high energy).

**2. Additive Moves** — Partial-body overlays
- Layered on top of the base move with controllable weight (0.0–1.0).
- Filtered by bone groups:
  - `HEAD` = 1 → `Neck|Head*` bones
  - `ARMS` = 2 → `Spine*|*Shoulder|*Arm|*Hand*` bones
  - `LEGS` = 4 → `Hips|*Leg|*Foot|*Toe*` bones
- Created via `THREE.AnimationUtils.makeClipAdditive()`.

### subclipLoop — Seamless Loop Cutting

A utility function (~60 lines) cuts a long Mixamo animation into short, perfectly looping segments:
1. Extract a time range from the source clip.
2. Resample all tracks at 30fps.
3. Apply crossfade blending at loop boundary (10–20% of clip length) — `lerp` for positions, `slerp` for quaternions.
4. Result: seamless loop, zero visual stutter.

### Beat Synchronization

Each move has a `beats` property. Animation `timeScale` is calculated to match the song's BPM:

```
timeScale = clipDuration × (beatsPerCycle / moveBeats) × cyclesPerSecond
where cyclesPerSecond = BPM / 60 / beatsPerCycle
```

### Audio-Driven Additive Layer

```
Every frame (~60fps):
1. analyser.getByteFrequencyData(frequencyArray)  // Uint8Array[512]
2. Compute:
   bassEnergy   = average(frequencyArray[0..40])  / 255
   midEnergy    = average(frequencyArray[41..200]) / 255
   trebleEnergy = average(frequencyArray[201..512]) / 255
   overallRMS   = sqrt(sum(v²) / N) / 255
3. Smooth with exponential moving average (α = 0.15)
4. Map to additive weights:
   bassEnergy   → LEGS additive weight
   midEnergy    → ARMS additive weight
   trebleEnergy → HEAD additive weight
5. Check choreography timeline for base move switches
6. On bass spike > threshold → trigger "kick" event → UI pulse
```

### Frequency-to-Body-Part Mapping

| Frequency Band | Array Range | Body Part | Effect |
|---|---|---|---|
| Sub-bass (20–60Hz) | 0–15 | Hips, legs | Bounce amplitude |
| Bass (60–250Hz) | 16–60 | Torso, shoulders | Sway depth |
| Mid (500Hz–2kHz) | 121–250 | Arms, hands | Gesture intensity |
| Treble (6–20kHz) | 401–512 | Head | Nod speed |

***

## The Visualization Window

The 3D canvas serves double duty — it's both a character stage AND a real-time equalizer:

### Equalizer Bars (Behind Character)

A set of vertical bars positioned behind the 3D character, rendered within the Three.js scene:
- ~20–32 bars spanning the width of the canvas.
- Each bar's height is driven by the corresponding frequency bin from `getByteFrequencyData()`.
- Bars use emissive `MeshBasicMaterial` in the song's accent color (e.g., cyan or electric blue).
- Bars have slight transparency (`opacity: 0.6`) so they read as a "background visualization" behind the solid character.
- Bars respond smoothly — quick rise, gradual fall (multiply previous height by 0.92 decay factor, take max of current and decayed).

### Stage Environment

| Song | Background | Lighting | Floor |
|---|---|---|---|
| Hip-Hop Track | Dark navy-black | Cool blue `SpotLight` from above + rim light | Dark reflective floor (high metalness) |
| Fun/Dance Track | Dark warm purple | Warm amber/magenta dual `PointLight` | Soft warm floor with slight reflection |

### Character Material Engine

- **Low energy:** Standard `MeshStandardMaterial`, matte.
- **Medium energy:** `emissiveIntensity` ramps up, edges begin to glow in accent color.
- **High energy:** Full glow — `emissiveIntensity = 2.0`, character radiates.

### Camera

- Fixed 3/4 angle: `position(-1, 1.5, 3)`, lookAt `(0, 1, 0)`.
- Character fills ~70% of canvas height.
- No camera orbit — fixed and stable for the player aesthetic.

***

## UI Specification — The JetAudio Skin

> **CRITICAL:** All UI design MUST follow the rules in `design-guideline.md` and reference `sample-gui.png`. This is a skeuomorphic, hardware-inspired interface. Every surface, shadow, and gradient must sell the illusion of a physical device.

### Overall Layout

The player is a **self-contained rectangular panel** (~600×500px) centered on a dark page. It looks like a physical device — brushed metal body, chrome trim, recessed screen, raised buttons.

```text
┌══════════════════════════════════════════════════════┐
│  ⊙ SYNESTHESIA 2026                        ─  □  ✕  │  ← Title bar
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │                                                  │ │
│ │           [3D CHARACTER + EQUALIZER]              │ │  ← Visualization window
│ │           Character dances center stage           │ │     Chrome bezel frame
│ │           Equalizer bars glow behind              │ │     Recessed with inset shadow
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│  SYNESTHESIA 2026 - NOW DANCING    BEAT DETECTED    │  ← LCD display panel
│  --:--:--                              --:--:--      │     Monospace, glowing cyan text
│                                                      │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬●▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  │  ← Progress bar (recessed groove)
│                                                      │
│  ⏮  ⏪  ⏹  ▶⏸  ⏩  ⏭          ─●─    🔊         │  ← Transport buttons + volume knob
│                                                      │
│  [Song 1: Hip-Hop]  [Song 2: Fun Dance]             │  ← Song selector tabs
│  [The Boss] [Kachujin] [Ch36] [Remy]                 │  ← Character selector
│                                                      │
└══════════════════════════════════════════════════════┘
```

### Component Specifications

**Title Bar:**
- Brushed metal gradient background.
- Player name "SYNESTHESIA 2026" in embossed/engraved style text (dark inner shadow, light outer highlight).
- Window controls (minimize, maximize, close) in classic style — small metallic circles.

**Visualization Window (3D Canvas):**
- Largest element — hero visual.
- Chrome/silver bezel frame: bright metallic gradient border with rounded inner corners.
- Recessed appearance: `inset box-shadow: 0 2px 8px rgba(0,0,0,0.5)`.
- Contains the Three.js `<canvas>` rendering both the character AND the equalizer bars.
- Optional: subtle CRT scanlines overlay via CSS pseudo-element (`repeating-linear-gradient` at 2px spacing, ~3% opacity).

**LCD Display Panel:**
- Dark background (`#0a0e14`).
- Monospace glowing text — song title (scrolling marquee if overflow), playback status, timestamps.
- "BEAT DETECTED" indicator: a small LED-like dot or text that pulses bright on kick drum hits.
- Accent color glow on text: `text-shadow: 0 0 8px var(--accent)`.

**Progress Bar:**
- A recessed groove in the metal surface (`inset box-shadow`).
- Filled portion glows with accent color.
- Draggable thumb (small metallic circle).

**Transport Buttons:**
- 6 metallic circle/pill buttons: |◀ ◀◀ ■ ▶|| ▶▶ ▶|
- Raised convex metallic gradient.
- On press: gradient inverts, shadow becomes inset — simulates physical button depression.
- 100–150ms transition, no bouncy animation.

**Volume Knob:**
- Circular metallic knob with radial gradient and a visible indicator dot/line.
- Rotates on drag to control volume.
- Positioned right-side of the controls area.

**Song Selector:**
- Two tab-style buttons at the bottom for switching between Song 1 (Hip-Hop) and Song 2 (Fun/Dance).
- Active tab: slightly raised, brighter, with accent-colored underline glow.
- Switching songs triggers the full transition sequence.

**Character Selector:**
- A row of 4 small metallic tab buttons below the song selector: [The Boss] [Kachujin] [Ch36] [Remy].
- Active character tab: raised, accent-colored underline glow.
- Clicking a different character: the current character fades out (scale to 0 or opacity fade over 300ms), the new character model loads (show a small loading indicator on the LCD if not cached), the new character fades in and immediately starts the current dance animation.
- Characters are lazy-loaded on first selection and cached in memory. Default: The Boss (smallest file, loads with the page).
- All 4 characters share the same Mixamo skeleton, so all animations retarget automatically.

***

## Song-Specific Move Configuration

### Song 1 — Hip-Hop Track

```javascript
{
  bpm: 90,  // typical hip-hop BPM (to be adjusted to actual track)
  animations: {
    primary: 'asssets/animations/animation-hiphop.glb',
    arms:    'asssets/animations/animation-arms-hiphop.glb',
    wave:    'asssets/animations/animation-wave-hiphop.glb',
    tut:     'asssets/animations/animation-tut-hiphop.glb',
    uprock:  'asssets/animations/animation-breakdance-uprock.glb',
  },
  stageColor: 0x0a0a1e,
  lightColor: 0x3399ff,
  accentColor: '#3399ff',
  baseMoves: {
    idle:   { clip: 'hiphop', cut: [/* to be tuned */], beats: 4 },
    groove: { clip: 'hiphop', cut: [/* to be tuned */], beats: 8 },
    full:   { clip: 'breakdance-uprock', cut: [/* to be tuned */], beats: 16 },
  },
  additiveMoves: {
    head: { clip: 'wave-hiphop', tracks: HEAD, beats: 8 },
    arms: { clip: 'arms-hiphop', tracks: ARMS, beats: 4 },
    legs: { clip: 'step-hiphop-dance', tracks: LEGS, beats: 8 },
  },
  choreography: [/* to be mapped to actual track timestamps */]
}
```

### Song 2 — Fun/Dance Track

```javascript
{
  bpm: 120,  // typical dance BPM (to be adjusted to actual track)
  animations: {
    primary: 'asssets/animations/animation-samba.glb',
    jazz:    'asssets/animations/animation-jazz.glb',
    silly:   'asssets/animations/animation-silly-dancing.glb',
    belly:   'asssets/animations/animation-bellydancing.glb',
    rumba:   'asssets/animations/animation-rumba.glb',
  },
  stageColor: 0x1a0a2e,
  lightColor: 0xff6644,
  accentColor: '#ff6644',
  baseMoves: {
    idle:   { clip: 'jazz', cut: [/* to be tuned */], beats: 4 },
    groove: { clip: 'samba', cut: [/* to be tuned */], beats: 8 },
    full:   { clip: 'silly-dancing', cut: [/* to be tuned */], beats: 16 },
  },
  additiveMoves: {
    head: { clip: 'bellydancing', tracks: HEAD, beats: 8 },
    arms: { clip: 'jazz', tracks: ARMS, beats: 4 },
    legs: { clip: 'rumba', tracks: LEGS, beats: 8 },
  },
  choreography: [/* to be mapped to actual track timestamps */]
}
```

*Note: `cut` ranges and `choreography` timestamps will be tuned after the actual audio tracks are provided.*

### Global Characters Config

Character selection is independent of song — any character can dance to any song.

```javascript
const CHARACTERS = [
  { id: 'the-boss',  name: 'The Boss',  path: 'asssets/characters/character-the-boss.glb',  size: '2.4 MB'  },
  { id: 'kachujin',  name: 'Kachujin',  path: 'asssets/characters/character-kachujin.glb',  size: '15.7 MB' },
  { id: 'ch36',      name: 'Ch36',      path: 'asssets/characters/character-ch36.glb',      size: '29.7 MB' },
  { id: 'remy',      name: 'Remy',      path: 'asssets/characters/character-remy.glb',      size: '29.3 MB' },
];
// Default: CHARACTERS[0] (The Boss) — loaded on page init
// Others: lazy-loaded on first selection, cached in a Map<id, Object3D>
```

***

## Transition: Switching Songs

When a user clicks the other song tab:

1. **0–100ms:** Current dance crossfades to neutral standing pose.
2. **100–400ms:** Stage background/lights interpolate via `THREE.Color.lerp()`. Equalizer bar color transitions. LCD display text crossfades.
3. **400ms:** Previous audio stops. New audio starts.
4. **400–900ms:** Character holds neutral. New animation clips load. LCD display shows new song title.
5. **900ms+:** Choreography starts. Dance begins in idle state, energy builds.

***

## File Structure

```text
project/
├── index.html              ← Single entry point: importmap, inline module script
├── style.css               ← Skeuomorphic player UI: metal surfaces, bezels, buttons, LCD
├── constants.js            ← Body part bitmasks (HEAD=1, ARMS=2, LEGS=4), CDN URL
├── setup-songs.js          ← Per-song config: BPM, animations, stage colors, moves, choreography
├── audio-engine.js         ← Web Audio API, AnalyserNode, frequency analysis, beat detection
├── animation-engine.js     ← subclipLoop, move system, crossfade logic, additive blending
├── asssets/
│   ├── characters/
│   │   └── character-the-boss.glb
│   ├── animations/
│   │   ├── animation-hiphop.glb
│   │   ├── animation-arms-hiphop.glb
│   │   ├── animation-wave-hiphop.glb
│   │   ├── animation-tut-hiphop.glb
│   │   ├── animation-breakdance-uprock.glb
│   │   ├── animation-samba.glb
│   │   ├── animation-jazz.glb
│   │   ├── animation-silly-dancing.glb
│   │   ├── animation-bellydancing.glb
│   │   └── animation-rumba.glb
│   └── musics/
│       ├── make-it-move.mp3          ← Song 1: Hip-Hop (Latin Pop)
│       └── drag-and-drop-heart.mp3   ← Song 2: Fun/Dance (R&B)
├── docs/
│   ├── prd.md                  ← This file
│   ├── design-guideline.md     ← Frontend design specs
│   ├── prompt.md               ← AI developer prompt
│   ├── song.md                 ← Song lyrics
│   └── sample-gui.png          ← UI reference image
└── README.md
```

### Data Flow

```text
Audio (.mp3)
  → AudioContext → AudioBufferSourceNode → AnalyserNode
  → getByteFrequencyData() every frame
  → Compute: bassEnergy, midEnergy, trebleEnergy, RMS, kickDetected
  ↓
Choreography Timeline (pre-mapped cues)
  → Base move switches at song-section timestamps
  ↓
Audio Analysis (real-time)
  → Additive move weights: LEGS=bass, ARMS=mid, HEAD=treble
  → Equalizer bar heights (per-frequency-bin)
  → Character material emissive intensity
  → UI beat events
  ↓
3D Scene:
  → AnimationMixer.update(delta) → blended moves
  → Equalizer bars scale to frequency data
  → Lights pulse with energy
  ↓
2D UI Shell:
  → LCD "BEAT DETECTED" flash
  → Progress bar fill update
  → Any micro-reactions on buttons
```

***

## Implementation Steps

### Step 1: Scaffold the HTML Shell and 3D Scene

Create `index.html` with the importmap loading Three.js from CDN. Set up two layers: `<div id="player">` for the entire skeuomorphic UI and a `<canvas>` positioned inside the visualization window area. Initialize Three.js: scene, camera at `(-1, 1.5, 3)` looking at `(0, 1, 0)`, hemisphere light, spot light with shadows, dark reflective ground plane, and WebGL renderer. Style the canvas to fit inside the visualization window bezel. Verify: an empty lit stage renders inside the player frame.

### Step 2: Build the Skeuomorphic Player UI

Following `design-guideline.md` precisely, create `style.css` and the HTML for the full JetAudio-inspired player skin. This is the most important visual step. Build: brushed metal body with layered CSS gradients, chrome bezel around the visualization window with inset shadow, LCD display panel with dark background and glowing monospace text, recessed progress bar groove, 6 metallic transport buttons with press states, a volume knob with radial gradient, song selector tabs, and title bar with embossed text. The player sits centered on a dark page with ambient glow. Verify: the player looks like a premium hardware device screenshot even before any 3D content loads. Reference the attached JetAudio design image for proportions, layout, and surface treatment.

### Step 3: Load Character and Play a Dance

Use `GLTFLoader` to load the default character (`asssets/characters/character-the-boss.glb`). Add to scene. Create `AnimationMixer`. Load one animation `.glb` (e.g., `asssets/animations/animation-hiphop.glb`), extract clips, play at full weight. Adjust character scale/position to fill ~70% of canvas. Create a `characterCache` Map to store loaded models. Verify: character dances inside the visualization window.

### Step 4: Implement subclipLoop and Move System

Implement the `subclipLoop()` utility (~60 lines). Create `constants.js` with body part bitmasks and track filter patterns. Define move config for Song 1: 3 base moves + 3 additive moves cut from the hip-hop animations. Initialize all moves with `AnimationAction` instances and `makeClipAdditive()`. Add temporary buttons to test crossfades and additive weights. Verify: smooth blending between idle/groove/full states, and additive overlays affect only their targeted body parts.

### Step 5: Add Equalizer Bars Behind Character

Inside the Three.js scene, create ~20–32 vertical `BoxGeometry` meshes positioned in a row behind the character (further from camera). Use emissive `MeshBasicMaterial` in the accent color with partial transparency. In the animation loop, read `frequencyArray` and set each bar's `scale.y` to the corresponding frequency bin value (with decay smoothing). Verify: glowing bars animate behind the dancing character, creating the classic equalizer-in-a-player effect.

### Step 6: Wire Audio Engine

Create `audio-engine.js`. Initialize `AudioContext` + `AnalyserNode` (fftSize: 1024). Load `.mp3` into `AudioBufferSourceNode` → `GainNode` → `AnalyserNode` → destination. Compute frequency bands and smoothed energy every frame. Detect kick hits. Wire play/pause transport button to start/stop audio + animation. Wire progress bar to scrub position. Verify: audio plays, and the character dances + equalizer bars respond in sync.

### Step 7: Connect Audio to Animation State Machine

Read smoothed energy values. Check choreography timeline for base move switches. Map frequency bands to additive weights. Calculate animation timeScale from BPM. Update character material emissive intensity. Verify: character changes dance intensity at verse/chorus boundaries AND body parts react organically to the live audio.

### Step 8: Implement Song Switching and LCD Display

Wire song tabs to switch between Song 1 and Song 2. Implement the 5-phase transition sequence (fade dance → blend stage → swap audio → hold neutral → start new dance). Wire character selector tabs: on click, fade out current character, load new character (lazy-load + cache), fade in, and re-apply current animation state. Update LCD display: song title (scrolling marquee if needed), timestamps, and "BEAT DETECTED" flash. Wire volume knob rotation to gain control. Verify: switching songs produces distinct stages, dance styles, and equalizer colors. Switching characters swaps the 3D model while keeping the current dance.

### Step 9: Polish and Final Tuning

Fine-tune per-song: choreography cue timestamps, bass thresholds, animation cut ranges. Ensure transport button press states feel snappy and tactile. Add CRT scanlines overlay on visualization window. Verify 60fps. Test the full experience: page load → first song plays → character dances → switch songs → second style → buttons feel premium. Final design review against `design-guideline.md` and the JetAudio reference image.

***

## Asset URLs

> Assets are local files in the project directory. No CDN hosting needed — reference them with relative paths.

| Asset | Relative Path |
|---|---|
| Character: The Boss (default) | `asssets/characters/character-the-boss.glb` |
| Character: Kachujin | `asssets/characters/character-kachujin.glb` |
| Character: Ch36 | `asssets/characters/character-ch36.glb` |
| Character: Remy | `asssets/characters/character-remy.glb` |
| Animation: Hip-Hop | `asssets/animations/animation-hiphop.glb` |
| Animation: Arms Hip-Hop | `asssets/animations/animation-arms-hiphop.glb` |
| Animation: Wave Hip-Hop | `asssets/animations/animation-wave-hiphop.glb` |
| Animation: Tut Hip-Hop | `asssets/animations/animation-tut-hiphop.glb` |
| Animation: Breakdance Uprock | `asssets/animations/animation-breakdance-uprock.glb` |
| Animation: Samba | `asssets/animations/animation-samba.glb` |
| Animation: Jazz | `asssets/animations/animation-jazz.glb` |
| Animation: Silly Dancing | `asssets/animations/animation-silly-dancing.glb` |
| Animation: Belly Dancing | `asssets/animations/animation-bellydancing.glb` |
| Animation: Rumba | `asssets/animations/animation-rumba.glb` |
| Audio: Song 1 (Make It Move) | `asssets/musics/make-it-move.mp3` |
| Audio: Song 2 (Drag & Drop My Heart) | `asssets/musics/drag-and-drop-heart.mp3` |
