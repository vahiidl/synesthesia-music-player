# Design Guideline: Synesthesia Player

## Design Philosophy

The player is a **skeuomorphic hardware device**. Every surface, shadow, and gradient must sell the illusion of a physical brushed-metal music player sitting on a dark table. Think JetAudio from the 2000s, but with a modern 3D concert stage where the equalizer used to be.

***

## Overall Layout

- Player width: **680px**, centered on a dark page.
- Dark page background: `#050505` with a subtle radial gradient to `#0a0a12`.
- Player body: rounded corners (10px), multi-layered brushed metal gradients.
- Power-on animation: fade in + slight scale-up over 0.8s.

***

## Surface Treatment: Brushed Metal

The metal texture is achieved through **two blended CSS gradients**:

1. **Horizontal grain:** `repeating-linear-gradient(90deg, ...)` with alternating tiny stripes of `rgba(255,255,255,0.018)` and `rgba(0,0,0,0.008)` at 1-6px intervals.
2. **Vertical shading:** `linear-gradient(180deg, ...)` from `#d4d4d4` down to `#a8a8a8` with multiple color stops creating realistic curvature.

Apply this pattern to: player body, title bar, bezel, and buttons.

### Shadows & Depth

- **Player body:** ambient cyan glow (`0 0 80px rgba(0,180,255,0.06)`), heavy drop shadows, top highlight (`inset 0 1px 0 rgba(255,255,255,0.6)`), bottom darken.
- **Recessed areas (viz window, progress bar):** `inset 0 2px 8px rgba(0,0,0,0.8)` for deep recess.
- **Raised elements (buttons, bezel):** `0 3px 6px rgba(0,0,0,0.3)` + top highlight `inset 0 1px 0 rgba(255,255,255,0.55)`.

***

## Typography

| Element | Font | Size | Style |
|---|---|---|---|
| Title bar text | Oswald | 13px | Gradient-clipped metallic text, 1.5px letter-spacing |
| Song title | Oswald | 13px | Color shifts between `#555` (cool) and `#884422` (warm) |
| Genre label | Barlow Condensed | 10px | Uppercase, 0.8px letter-spacing, color `#888` |
| Time display | Share Tech Mono | 12px | Monospace, with text shadow |
| Animation label | Share Tech Mono | 9px | Uppercase, 1.2px letter-spacing |
| Loading text | Share Tech Mono | 14px | Cyan glow, pulsing animation |

***

## Visualization Window

- **Bezel:** 3px padding, layered metallic gradient matching the body, with 6 box-shadow layers for a thick chrome frame effect.
- **Inner area:** border-radius 4px, black background, deep inset shadows.
- **Canvas:** 480px height, fills full width.
- **CRT scanlines:** pseudo-element overlay with `repeating-linear-gradient(0deg, transparent 0-2px, rgba(0,0,0,0.02) 2-4px)`.

### Character Selector (Glassmorphic Overlay)

Positioned top-left inside the visualization window. Vertical stack of 4 buttons:

- Background: `rgba(255,255,255,0.08)` with `backdrop-filter: blur(16px)`.
- Border: `1px solid rgba(255,255,255,0.18)`.
- Text: 12px uppercase, `rgba(255,255,255,0.65)`.
- Active state: brighter background (0.18 alpha), white text, subtle cyan glow shadow.
- 0.18s ease transition on all properties.

***

## Progress Bar

- Track: 7px height, recessed groove style with inset shadows + bottom highlight.
- Fill: gradient from dark to bright in the accent color.
  - **Cool:** `#005599` to `#00ccff`
  - **Warm:** `#993300` to `#ff6644`
- Thumb: metallic rectangle, 10x13px, rounded 3px, linear gradient from `#eee` to `#aaa`.

***

## Transport Buttons

- Standard size: **42px** circle, play button: **50px** circle.
- Convex gradient: `#ddd` at top, `#a0a0a0` at bottom, with a radial specular highlight at upper-left.
- Active (pressed): gradient inverts (dark at top, light at bottom), shadow changes to `inset 0 2px 5px rgba(0,0,0,0.35)`, 1px downward translate.
- Hover: slightly brighter gradient.
- Icon color: `#555`.
- Border: `1px solid rgba(0,0,0,0.22)`.

***

## Volume Controls

### Slider
- Track: 80px wide, 5px height, recessed groove.
- Fill: accent color gradient (cyan or orange depending on song).

### Knob
- Size: **56px** circle.
- Surface: `conic-gradient` creating a realistic metal knob with alternating light/dark bands.
- Border: 2.5px `rgba(0,0,0,0.18)`.
- Marker: 3x13px dark line at top.
- Specular highlight: radial gradient at upper-left.
- Rotation range: -135 to +135 degrees.
- Interaction: mouse drag to rotate.

***

## The 3D Stage

### LED Dot Wall
- 20 rows x 40 columns of small spheres behind the character.
- Colors: blue, purple, magenta palette with additive blending.
- Audio-reactive: columns map to frequency bins, dots light up when frequency exceeds row threshold.
- Paused state: faint greyscale breathing glow.

### Disco Floor
- 10x10 grid of metallic tiles at ground level.
- Purple/blue palette, high metalness (0.9), low roughness (0.15).
- Audio-reactive: ripple effect from center, brightness driven by frequency data.
- Paused state: greyscale, minimal emissive.

### Stage Lighting
- 3 overhead spots (always on): white, cool blue, warm orange.
- 1 front key light (always on): character illumination.
- 5 colored stage beams (play only): pink, gold, cyan, blue, magenta with bass-driven intensity and slow sweep.
- 1 main front spot (play only): intensity pulses with bass.

***

## Color Theming

Two song-based color themes applied via `.warm` CSS class:

| Element | Cool (default) | Warm |
|---|---|---|
| Accent color | `#00ccff` | `#ff6644` |
| Progress fill | Cyan gradient | Orange gradient |
| Volume fill | Cyan gradient | Orange gradient |
| Beat indicator | Cyan glow | Orange glow |
| Song title | `#555` | `#884422` |
| Time text | `#555` | `#884422` |
| Animation label | `#999` | `#996644` |