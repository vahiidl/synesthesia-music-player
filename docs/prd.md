# PRD: Synesthesia - The Dancing Body for Music

***

## Product Vision

A reimagined classic desktop media player inspired by the iconic JetAudio interface, where the traditional visualization window is replaced by a live concert stage featuring a 3D character that dances in real-time to the music. Behind the character, an LED dot wall and a disco floor respond to audio frequencies, creating an immersive stage effect. The whole experience is wrapped in a premium, skeuomorphic brushed-metal UI that looks and feels like a physical hardware device.

This prototype reimagines two iconic interactions simultaneously: the classic media player skin (an iconic UI pattern from the 2000s era) AND the music visualizer, fusing nostalgic hardware aesthetics with a living, dancing 3D character that pushes the boundaries of what a web-based music player can be.

***

## Technical Architecture & Foundation

### Core Principle: React + Vite + Three.js

The prototype is built as a React single-page application bundled with Vite. The 3D scene (Three.js) lives inside a single React component (`SynesthesiaPlayer.tsx`) that manages the entire player: 3D rendering, audio playback, animation cycling, and all UI controls.

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite 6 | Component architecture and fast dev builds |
| 3D Renderer | Three.js `@0.180.0` | Character rendering, LED wall, disco floor, stage lighting |
| Model Loading | `GLTFLoader` (Three.js addons) | Load `.glb` character and animation clips |
| Animation | `THREE.AnimationMixer` + sequential cycling | Crossfade between animation clips on a timed loop |
| Audio Playback | Howler.js | HTML5/WebAudio audio playback with caching |
| Audio Analysis | Web Audio API (`AnalyserNode` via Howler) | Real-time frequency extraction (512-bin FFT) |
| Styling | Tailwind CSS 4 + custom CSS | Skeuomorphic player chrome, brushed metal, beveled buttons |
| Fonts | Barlow Condensed, Oswald, Share Tech Mono | UI typography (via Google Fonts) |

### Key Dependencies (package.json)

```json
{
  "three": "^0.180.0",
  "howler": "^2.2.4",
  "react": "18.3.1",
  "tailwindcss": "4.1.12",
  "vite": "6.3.5"
}
```

***

## Available Assets

### Characters (`.glb`, converted from Mixamo FBX)

| File | Size | Description |
|---|---|---|
| `asssets/characters/character-ch36.glb` | 29.7 MB | Ch36 - stylized character (DEFAULT, loads first) |
| `asssets/characters/character-remy.glb` | 29.3 MB | Remy - realistic male character |
| `asssets/characters/character-kachujin.glb` | 15.7 MB | Kachujin - martial arts style character |
| `asssets/characters/character-the-boss.glb` | 2.4 MB | The Boss - lightweight, clean silhouette |

**All 4 characters are available in the prototype.** The user can switch between them at any time via glassmorphic character selector buttons overlaid on the visualization window. Ch36 loads first by default. Other characters are lazy-loaded on selection and cached after first load.

All Mixamo characters share the same skeleton rig (`mixamorig`), so all animations work with all characters without retargeting.

### Animations (`.glb`, converted from Mixamo FBX)

**Song 1 sequence (R&B / Dance track):**

| File | Size | Style |
|---|---|---|
| `asssets/animations/animation-hiphop.glb` | 0.1 MB | Basic hip-hop groove |
| `asssets/animations/animation-arms-hiphop.glb` | 0.6 MB | Arms-focused hip-hop |
| `asssets/animations/animation-snake-hiphop.glb` | 0.4 MB | Snake hip-hop - fluid body |
| `asssets/animations/animation-step-hiphop-dance.glb` | 0.2 MB | Step-based footwork |
| `asssets/animations/animation-tut-hiphop.glb` | 0.4 MB | Tutting - geometric arm positions |
| `asssets/animations/animation-wave-hiphop.glb` | 0.4 MB | Wave - rolling body motion |

**Song 2 sequence (Hip-Hop track):**

| File | Size | Style |
|---|---|---|
| `asssets/animations/animation-rumba.glb` | 0.1 MB | Rumba - Latin moves |
| `asssets/animations/animation-samba.glb` | 0.5 MB | Samba - rhythmic, hip-driven |
| `asssets/animations/animation-silly-dancing.glb` | 0.1 MB | Silly/fun dance |
| `asssets/animations/animation-bellydancing.glb` | 0.6 MB | Belly dancing - torso isolation |
| `asssets/animations/animation-breakdance-1990.glb` | 0.1 MB | Classic breakdance move |
| `asssets/animations/animation-breakdance-uprock.glb` | 0.2 MB | Breakdance uprock |

### Audio Files

| File | Genre |
|---|---|
| `asssets/musics/drag-and-drop-heart.mp3` | R&B / Dance (Song 1) |
| `asssets/musics/make-it-move.mp3` | Hip-Hop (Song 2) |

***

## Music & Audio Strategy

### Two Songs with Howler.js

Audio is managed through Howler.js rather than raw Web Audio API. Howler handles playback, seeking, volume, and provides access to the underlying `AudioContext` for frequency analysis:

```javascript
const howl = new Howl({
  src: [BASE_URL + song.audioPath],
  html5: false,
  volume: 0.7,
  preload: true,
  onend: () => { /* auto-advance to next song */ },
});
```

### Real-Time Frequency Analysis

The `AnalyserNode` is attached to Howler's master gain node. Every frame:

```
1. analyser.getByteFrequencyData(frequencyData)   // Uint8Array[512]
2. Compute:
   subBass  = average(data[0..15])  / 255
   bass     = average(data[16..60]) / 255
   mid      = average(data[121..250]) / 255
   treble   = average(data[401..511]) / 255
   rms      = sqrt(sum(v^2) / 512) / 255
3. Smooth with exponential moving average (alpha = 0.15)
4. Beat detection: smoothBass > 0.35 AND delta > 0.06
```

### Song Configuration

```javascript
const SONGS = [
  {
    id: 'dance',
    title: 'Drag & Drop My Heart',
    artist: 'Synesthesia',
    genre: 'R&B / Dance',
    bpm: 115,
    audioPath: 'asssets/musics/drag-and-drop-heart.mp3',
    stageColor: 0x3d2860,
    accentColor: '#ff6644',
    sequence: [
      'asssets/animations/animation-hiphop.glb',
      'asssets/animations/animation-arms-hiphop.glb',
      'asssets/animations/animation-snake-hiphop.glb',
      'asssets/animations/animation-step-hiphop-dance.glb',
      'asssets/animations/animation-tut-hiphop.glb',
      'asssets/animations/animation-wave-hiphop.glb',
    ],
  },
  {
    id: 'hiphop',
    title: 'Make It Move',
    artist: 'Synesthesia',
    genre: 'Hip-Hop',
    bpm: 95,
    audioPath: 'asssets/musics/make-it-move.mp3',
    stageColor: 0x1e3050,
    accentColor: '#00ccff',
    sequence: [
      'asssets/animations/animation-rumba.glb',
      'asssets/animations/animation-samba.glb',
      'asssets/animations/animation-silly-dancing.glb',
      'asssets/animations/animation-bellydancing.glb',
      'asssets/animations/animation-breakdance-1990.glb',
      'asssets/animations/animation-breakdance-uprock.glb',
    ],
  },
];
```

***

## Animation System

### Sequential Move Cycling

Instead of choreography cue points with additive blending, the implementation uses a sequential cycling system:

- Each song has an ordered `sequence` of 6 animation clips.
- One animation plays at a time.
- Every **3 seconds** (`SEQ_DURATION`), the system crossfades to the next animation in the sequence using `crossFadeTo()` with a **0.5 second** blend.
- When the sequence reaches the end, it loops back to the first animation.
- Animation `timeScale` is adjusted based on the song's BPM: `bpmScale = song.bpm / 120`.

### Root Motion Stripping

A `stripRootMotion()` utility removes position tracks from root/hip bones to prevent the character from drifting across the stage:

```javascript
function stripRootMotion(clip) {
  const stripped = clip.tracks.filter((track) => {
    const isPosition = track.name.endsWith('.position');
    const isRoot = /^(Hips|mixamorig:?Hips|Root)$/i.test(track.name.split('.')[0]);
    return !(isPosition && isRoot);
  });
  return new THREE.AnimationClip(clip.name, clip.duration, stripped);
}
```

### Character Switching

- 4 characters available, selectable via glassmorphic buttons overlaid on the visualization window.
- Characters are lazy-loaded and cached in a `Map<string, Object3D>`.
- On switch: stop all actions, remove old model from scene, load new model (or clone from cache), set up the animation sequence on the new model.
- `SkeletonUtils.clone()` is used to create independent instances from cached models.

***

## The 3D Stage

### LED Dot Wall (Behind Character)

Instead of traditional equalizer bars, the visualization uses an **LED dot wall**: a grid of 800 colored spheres (20 rows x 40 columns) rendered as a `THREE.InstancedMesh`:

- Each dot is a small sphere (`radius: 0.035`) with additive blending.
- Colors come from a curated blue/purple/magenta palette.
- **When playing:** dots light up as a column-based frequency visualizer. Each column maps to a frequency bin. Dots in a column light up if the frequency value exceeds the row's threshold. A shimmer effect adds organic movement.
- **When paused:** dots show a faint greyscale breathing glow.

### Disco Floor

A 10x10 grid of metallic tiles on the ground plane:

- Each tile is a `BoxGeometry` with `MeshStandardMaterial` (high metalness, low roughness).
- Colors from a purple/blue disco palette.
- **When playing:** tiles pulse with audio energy. A ripple effect radiates outward based on distance from center. Brightness driven by frequency data and overall RMS energy.
- **When paused:** tiles go greyscale with minimal emissive.

### Stage Lighting System

| Light | Type | Behavior |
|---|---|---|
| Overhead spots (3) | SpotLight | Always on, illuminate character from above |
| Front key light | SpotLight | Always on, highlights character details |
| Side fills (2) | PointLight | Subtle ambient fill |
| Main front spot | SpotLight | OFF when paused, intensity pulses with bass when playing |
| Colored stage beams (5) | SpotLight | OFF when paused. When playing: pink, gold, cyan, blue, magenta beams with intensity driven by bass and slow sweep animation |

### Camera

- Fixed front view: `position(0, 1.2, 3.5)`, lookAt `(0, 1, 0)`.
- Character fills ~70% of canvas height.
- No orbit or animation. Fixed and stable.

***

## UI Specification

> **CRITICAL:** All UI follows the `design-guideline.md` and `synesthesia.css`. This is a skeuomorphic, hardware-inspired interface.

### Overall Layout

The player is a **680px wide panel** centered on a dark page. It looks like a physical device with brushed metal body, chrome trim, recessed screen, and raised buttons.

```text
+======================================================+
|  @ Synesthesia                              -  X      |  <- Title bar
+------------------------------------------------------+
| +--------------------------------------------------+ |
| |                                                    | |
| |  [Ch36]    [3D CHARACTER ON STAGE]                 | |  <- Visualization window
| |  [Remy]    LED wall + disco floor behind           | |     Chrome bezel
| |  [Kachujin] Stage spotlights animate               | |     Character selector overlay
| |  [The Boss]                                        | |
| |                                                    | |
| +--------------------------------------------------+ |
|                                                        |
|  =========================o=========================   |  <- Progress bar
|                                                        |
|  Drag & Drop My Heart   R&B / Dance   HIPHOP  o  00:12 / 00:30  |  <- Track info row
|                                                        |
|  |<  <<  [>]  >>  >|          [===]  ))  (@)          |  <- Transport + volume + knob
|                                                        |
|  --------- v ---------                                 |  <- Bottom trim
+======================================================+
```

### Component Specifications

**Title Bar:**
- Brushed metal gradient with horizontal grain texture.
- "Synesthesia" in Oswald font, gradient-clipped metallic text.
- Window controls: small 16px metallic circles (minimize, close). Close turns red on hover.

**Visualization Window:**
- Chrome bezel: layered metallic gradients with brushed texture, multiple box-shadows for depth.
- Inner area: recessed with deep inset shadows (`inset 0 2px 8px rgba(0,0,0,0.8)`).
- Canvas: 480px tall, renders the full 3D scene.
- CRT scanlines overlay: 4px repeating linear gradient at 2% opacity.
- Character selector: glassmorphic buttons (`backdrop-filter: blur(16px)`) stacked vertically in the top-left corner of the canvas. Active button has accent glow.
- Loading overlay: semi-transparent dark overlay with pulsing cyan "INITIALIZING..." text and a loading bar.

**Progress Bar:**
- Recessed groove (`inset box-shadow`).
- Fill gradient changes per song: cyan for cool songs, orange for warm songs.
- Metallic rectangular thumb (10x13px, rounded 3px).
- Click to seek.

**Track Info Row:**
- Left: song title (Oswald font) + genre label (small uppercase).
- Center: current animation name in monospace + beat indicator dot (pulses cyan or orange on kick detection).
- Right: elapsed / total time in Share Tech Mono monospace.

**Transport Buttons:**
- 5 metallic circle buttons: Previous, Rewind (-10s), Play/Pause, Forward (+10s), Next.
- Convex metallic gradient with specular highlight.
- Active: gradient inverts, shadow becomes inset.
- Play button is larger (50px vs 42px for others).

**Volume Controls:**
- Horizontal slider track (80px wide) with accent fill.
- Speaker icon (muted/unmuted states).
- Large rotatable metal knob (56px) with `conic-gradient` for realistic metal look. Drag to rotate. Position marker line at top.

**Bottom Trim:**
- Thin metallic strip at the very bottom with centered chevron emblem.

### Song Theming

Each song applies a "warm" or "cool" color theme:

| Song | Theme | Accent Color | Progress/Volume Fill |
|---|---|---|---|
| Drag & Drop My Heart | Warm | `#ff6644` | Orange gradient |
| Make It Move | Cool | `#00ccff` | Cyan gradient |

The song title text color, beat indicator dot, and track time color all shift to match. The stage lights and LED wall also respond to the song's `stageColor`.

***

## Song Switching & Auto-Advance

- **Next/Prev buttons:** Switch between songs. Previous restarts current song if more than 3 seconds in; otherwise goes to previous song.
- **Auto-advance:** When a song ends (Howler `onend` callback), automatically switches to the next song and continues playing.
- On switch: stop audio, reset state, rebuild animation sequence for all active characters, start playing the new song if previously playing.

***

## File Structure

```text
project/
+-- package.json               <- Dependencies (React, Three.js, Howler, Vite, Tailwind)
+-- vite.config.ts             <- Vite build config with React plugin
+-- postcss.config.mjs         <- PostCSS config for Tailwind
+-- src/
|   +-- app/
|   |   +-- App.tsx            <- Root component, renders SynesthesiaPlayer
|   |   +-- components/
|   |       +-- SynesthesiaPlayer.tsx  <- The entire player (1067 lines)
|   +-- styles/
|       +-- index.css          <- CSS entry point
|       +-- fonts.css          <- Google Fonts imports
|       +-- tailwind.css       <- Tailwind base imports
|       +-- theme.css          <- Design token variables
|       +-- synesthesia.css    <- All player-specific styles (604 lines)
+-- asssets/
|   +-- characters/            <- 4 Mixamo characters (.glb)
|   +-- animations/            <- 13 Mixamo dance animations (.glb)
|   +-- musics/                <- 2 audio tracks (.mp3)
+-- docs/
|   +-- prd.md                 <- This file
|   +-- design-guideline.md    <- Frontend design specs
|   +-- song.md                <- Song lyrics
|   +-- sample-gui.png         <- UI reference image
+-- README.md
```

***

## Asset URLs

> **Base URL:** `https://vahiidl.github.io/synesthesia-music-player/`
> All assets are served via GitHub Pages.

| Asset | Public URL |
|---|---|
| Character: Ch36 (default) | `https://vahiidl.github.io/synesthesia-music-player/asssets/characters/character-ch36.glb` |
| Character: Remy | `https://vahiidl.github.io/synesthesia-music-player/asssets/characters/character-remy.glb` |
| Character: Kachujin | `https://vahiidl.github.io/synesthesia-music-player/asssets/characters/character-kachujin.glb` |
| Character: The Boss | `https://vahiidl.github.io/synesthesia-music-player/asssets/characters/character-the-boss.glb` |
| Animation: Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-hiphop.glb` |
| Animation: Arms Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-arms-hiphop.glb` |
| Animation: Snake Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-snake-hiphop.glb` |
| Animation: Step Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-step-hiphop-dance.glb` |
| Animation: Tut Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-tut-hiphop.glb` |
| Animation: Wave Hip-Hop | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-wave-hiphop.glb` |
| Animation: Rumba | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-rumba.glb` |
| Animation: Samba | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-samba.glb` |
| Animation: Silly Dancing | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-silly-dancing.glb` |
| Animation: Belly Dancing | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-bellydancing.glb` |
| Animation: Breakdance 1990 | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-breakdance-1990.glb` |
| Animation: Breakdance Uprock | `https://vahiidl.github.io/synesthesia-music-player/asssets/animations/animation-breakdance-uprock.glb` |
| Audio: Drag & Drop My Heart | `https://vahiidl.github.io/synesthesia-music-player/asssets/musics/drag-and-drop-heart.mp3` |
| Audio: Make It Move | `https://vahiidl.github.io/synesthesia-music-player/asssets/musics/make-it-move.mp3` |
