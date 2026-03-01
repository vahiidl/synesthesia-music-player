This skill guides creation of a retro-modern skeuomorphic music player interface inspired by the attached `sample-gui.png` reference image (generated using Nano Banana Pro 2). The design must faithfully recreate the look and feel of a classic JetAudio-style media player — brushed metal surfaces, beveled buttons, realistic knobs, and a glowing visualization window — with a 3D dancing character in the center and real-time equalizer bars behind him.

## Design Direction: "Retro Hardware Revival"

The aesthetic is a faithful, award-winning recreation of a classic desktop music player skin. Reference `sample-gui.png` for exact proportions and surface treatment.

- **Tone**: Skeuomorphic, hardware-inspired, premium, tactile. Brushed aluminum, chrome bezels, machined knobs, embossed buttons.
- **Differentiation**: A 3D character dances in the visualization window in front of glowing equalizer bars. This is the iconic twist.
- **Purpose**: Re-imagine the classic media player interaction with a living, breathing 3D element at its core.

**CRITICAL**: Execute the skeuomorphic vision with obsessive precision. Use `sample-gui.png` as the ground truth for proportions, surfaces, and layout.

## Frontend Aesthetics Guidelines

### Surfaces & Materials
- **Brushed Metal Body**: CSS gradients simulating brushed aluminum. Use `linear-gradient` with subtle color stops (`#c0c0c0` → `#d0d0d0` → `#b4b4b4`) creating directional grain. Add a fine noise/grain overlay via a repeating CSS gradient or SVG pattern for realism. As visible in the reference image, the metal has a slight warm silver tone with horizontal brush direction.
- **Chrome Bezels**: The visualization window frame uses bright reflective gradients (`#e0e0e0` → `#ffffff` → `#999999`) simulating polished chrome trim. The bezel has visible rounded inner corners and a 3D beveled edge — lighter on top/left edges, darker on bottom/right.
- **Recessed Panels**: The visualization window and display panel sit in recessed bezels created with `inset box-shadow` (`inset 0 2px 6px rgba(0,0,0,0.5)`) and darker inner edge gradients.
- **Raised Elements**: Buttons and knobs use convex gradients (lighter at top, darker at bottom) with prominent outer `box-shadow` to feel raised and liftable.

### The Visualization Window (3D Canvas — Hero Element)

This is the dominant visual element. Based on the reference image:

- **Size**: Takes up approximately 60–65% of the player's total height. Wide landscape rectangle.
- **Frame**: Heavy chrome bezel with 3D edge (light highlight on top/left, dark shadow on bottom/right). Rounded inner corners (~6px radius).
- **Background**: Dark navy-blue/teal tone (`#0a1628` to `#122040`). NOT pure black — has a cool blue atmosphere.
- **Equalizer Bars**: Tall, narrow, rectangular bars filling the FULL HEIGHT of the window from bottom to top. Arranged as a dense grid across the entire width (~32–48 bars). Color is glowing cyan/teal (`#00ccee` to `#33eeff`). The bars have varying heights driven by audio frequency data, creating the classic equalizer look. They are slightly transparent (~70% opacity) so the background shows through. The bars should feel like a glowing grid pattern — some taller, some shorter, creating an organic wave pattern.
- **3D Character**: Positioned in the CENTER of the window, rendered IN FRONT of the equalizer bars (higher Z-index). The character is fully opaque and lit, clearly visible against the semi-transparent glowing bars behind.
- **Depth effect**: The equalizer bars create a "stage backdrop" behind the character, giving the scene depth and atmosphere. Combined they look like a performer on a glowing stage.
- **Floor**: The character stands on a slightly visible reflective dark floor surface, with subtle shadow beneath.
- **Frequency labels**: Along the bottom edge of the visualization window, small text labels showing frequency values (90, 200, 023, 108, 178, 78, 126, 13K, etc.) in dim cyan — mimicking a spectrum analyzer readout.

### LCD Display Panel (Below Visualization Window)

Based on the reference image, this is a dark display strip integrated into the metal body:

- **Background**: Near-black with slight blue tint (`#080c14`).
- **Layout**: Full width, approximately 50–60px tall. Contains two rows:
  - **Top row**: Song/status text — "SYNESTHESIA 2026 – NOW DANCING" on the left, "BEAT DETECTED" on the right. The text is in a glowing cyan/teal monospace font.
  - **Bottom row**: Timestamps in format `--:--:--` on both left and right sides.
- **Text style**: Monospace font with glowing effect — `text-shadow: 0 0 6px #00ccff, 0 0 12px #00ccff`. Color: `#00ddff`.
- **"BEAT DETECTED" indicator**: Pulses/flashes brighter on each detected kick drum hit.

### Progress Bar

- Sits below the LCD display panel, on the metal body surface.
- Recessed groove appearance: `inset box-shadow` creating a channel in the metal.
- Fill color: glowing accent blue/cyan gradient.
- Thumb: small square or rectangular metallic drag handle (matching the reference image's shape — it's a small square block, not a circle).
- Overall proportions: thin (4–6px height), full width of player body minus padding.

### Transport Buttons

Based on the reference image — 6 round metallic buttons in a row:

- **Buttons (left to right)**: |◀ (Previous), ◀◀ (Rewind), ■ (Stop), ▶|| (Play/Pause), ▶▶ (Forward), ▶| (Next)
- **Shape**: Circular, ~40–44px diameter.
- **Surface**: Metallic convex gradient — brighter silver at top, darker gray at bottom. Subtle beveled border ring.
- **Icons**: Dark gray/charcoal inset icons (triangles, squares, double triangles). Icons appear engraved into the button face.
- **Pressed state**: Gradient inverts (dark top, light bottom), shadow becomes `inset` — simulates physical depression in ~100ms.
- **Spacing**: Evenly spaced in a horizontal row, left-aligned with some gap before the volume controls.

### Volume Controls

Based on the reference image — positioned to the RIGHT of the transport buttons:

- **Volume Slider**: A vertical slider (~60px tall) with a small metallic thumb. Recessed groove track. The filled portion glows with accent color. A small "+" label above and "–" below (or a speaker icon).
- **Volume Knob**: Large circular knob (~70–80px diameter) with realistic metallic radial gradient, a center highlight spot, and a small indicator notch/line. Uses `conic-gradient` or radial gradient for the brushed metal look. Rotates on drag.

### Bottom Edge

The reference image shows a subtle decorative bottom trim:
- A small metallic logo/emblem area at the bottom center of the player.
- Slight recessed line separating the control area from the bottom edge.

### Typography
- **LCD/Display text**: "Share Tech Mono", "VT323", or "Courier New". Glowing cyan/teal color with text-shadow glow.
- **Labels**: "Barlow Condensed" or "Oswald" — dark embossed style on the metal surface.
- **Frequency labels**: Very small (8–9px), monospace, dim cyan.
- **NEVER** use Inter, Roboto, Arial, or generic system fonts.

### Color Palette
- **Metal body**: Warm silver grays (`#b8b8b8` to `#d4d4d4`)
- **Display background**: `#080c14`
- **Accent / Glow**: Electric cyan/teal (`#00ccff` to `#00eeff`) — used for equalizer bars, LCD text, progress fill, beat indicator, active button highlights
- **Button face**: Chrome silver gradients
- **Visualization background**: Dark navy-blue (`#0a1628`)
- **Shadows**: Multiple layers — outer shadows for raised elements, inset shadows for recessed panels

### Motion & Animation
- **Button presses**: Fast, snappy (100–150ms) — gradient inversion + shadow inset. NO bouncy spring animations.
- **Volume knob**: Smooth rotation following drag, no jitter.
- **Progress bar**: Smooth fill with glowing leading edge.
- **Equalizer bars**: Smooth vertical scaling from audio data. Fast rise, gradual decay (previous × 0.92 falloff).
- **Beat indicator**: "BEAT DETECTED" text flashes bright on kick drum hits, fades over 200ms.
- **Song title marquee**: Scrolls horizontally if text overflows, classic style.
- **Page load**: Player fades in as a single unit — like powering on a device. No staggered element reveals.

### Layout & Proportions

Based on the reference image, the player is nearly SQUARE — approximately 1:1 aspect ratio or slightly wider:

- **Total size**: ~550×520px or ~600×560px
- **Visualization window**: ~85% of player width, ~55% of player height
- **LCD display**: Full width, ~50px tall
- **Controls area**: ~120px tall, containing progress bar + transport buttons + volume
- **Centered on page**: Dark background (`#0a0a0a`) with subtle ambient glow from the player
- **The player does NOT fill the browser** — it sits centered like a physical device on a dark surface

**IMPORTANT**: Skeuomorphic design requires extensive CSS — many layers of gradients, shadows, borders, and pseudo-elements. Do not simplify. Reference `sample-gui.png` for every detail. The detail IS the design.