# Synesthesia 2026 — The Dancing Body for Music

A reimagined classic media player where the traditional equalizer visualization is replaced by a 3D character that dances in real-time to the music. Built for the [Figma Makeathon](https://contra.com/community/topic/figmamakeathon) on Contra.

## What Is This?

A JetAudio-inspired skeuomorphic music player with a twist: inside the visualization window, a 3D character performs genre-appropriate choreography synchronized to the song's rhythm, BPM, and frequency bands. Glowing equalizer bars animate behind the character, creating a layered stage effect.

## Tech Stack

| Layer | Technology |
|---|---|
| 3D Engine | [Three.js](https://threejs.org/) — loaded via CDN import maps, zero build step |
| Animation | `THREE.AnimationMixer` — crossfade base moves, blend additive body-part overlays |
| Audio | Web Audio API — `AnalyserNode` for real-time frequency analysis and beat detection |
| UI | Vanilla HTML + CSS — skeuomorphic brushed-metal player skin |
| Architecture | Single `index.html` + ES modules — no React, no bundler, no npm |

## Assets & Credits

### 3D Character & Animations
- **Source**: [Mixamo](https://www.mixamo.com/) (Adobe) — free, no attribution required
- **Characters**: Downloaded as `.fbx`, converted to `.glb` using [FBX2glTF](https://github.com/godotengine/FBX2glTF) v0.13.1
- **Animations**: 13 dance animations covering hip-hop, samba, jazz, belly dancing, rumba, breakdance, and more

### Music
- **Generated with**: Google Gemini (AI music generation)
- **Tracks**: 2 songs, ~30 seconds each:
  - *"Make It Move"* — Latin Pop (for hip-hop dance animations)
  - *"Drag & Drop My Heart"* — R&B (for samba/jazz/fun dance animations)

### Reference Design Image
- **Generated with**: Nano Banana Pro 2 (AI image generation)
- **File**: `docs/sample-gui.png` — used as the visual reference for the skeuomorphic player UI

## Project Structure

```
├── index.html                  ← Entry point (importmap + module script)
├── style.css                   ← Skeuomorphic player styles
├── constants.js                ← Body part bitmasks, config
├── setup-songs.js              ← Per-song animation/stage/choreography config
├── audio-engine.js             ← Web Audio API + frequency analysis
├── animation-engine.js         ← subclipLoop, move system, blending
├── asssets/
│   ├── animations/             ← 13 Mixamo dance animations (.glb)
│   ├── characters/             ← 4 Mixamo characters (.glb)
│   └── musics/                 ← Audio tracks (.mp3)
└── docs/
    ├── prd.md                  ← Full product requirements document
    ├── design-guideline.md     ← Skeuomorphic design specifications
    ├── prompt.md               ← AI developer prompt
    ├── song.md                 ← Song lyrics for music generation
    └── sample-gui.png          ← UI reference image
```

## How to Run

1. Clone this repo
2. Serve with any local HTTP server (e.g. `npx serve .` or VS Code Live Server)
3. Open in browser — no build step required

## License

This project was created for the Figma Makeathon on Contra. 3D assets are from Mixamo (free, no attribution required). Music is AI-generated. Reference image is AI-generated.
