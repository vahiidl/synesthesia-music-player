# Synesthesia — The Dancing Body for Music

**Live Demo:** [trust-adjust-40491506.figma.site](https://trust-adjust-40491506.figma.site) &nbsp;|&nbsp; **Repo:** [github.com/vahiidl/synesthesia-music-player](https://github.com/vahiidl/synesthesia-music-player)

A reimagined classic media player where the traditional equalizer visualization is replaced by a 3D character that dances in real-time to the music.

## Demo

https://github.com/user-attachments/assets/77cb352c-8466-4a77-b633-891d7cfeaf3a

[**Watch the demo video**](https://vahiidl.github.io/synesthesia-music-player/docs/demo.mp4) &nbsp;|&nbsp; [**Try it live**](https://trust-adjust-40491506.figma.site)

## What Is This?

A JetAudio-inspired skeuomorphic music player with a twist: inside the visualization window, a 3D character dances on a concert stage with an LED dot wall and disco floor that react to the music in real-time. Switch between 4 characters, 2 songs, and watch the stage come alive.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| 3D Engine | [Three.js](https://threejs.org/) v0.180 |
| Animation | `THREE.AnimationMixer` with sequential crossfade cycling |
| Audio | [Howler.js](https://howlerjs.com/) + Web Audio API `AnalyserNode` for frequency analysis |
| Styling | Tailwind CSS 4 + custom skeuomorphic CSS |

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
├── package.json                <- Dependencies (React, Three.js, Howler, Vite, Tailwind)
├── vite.config.ts              <- Vite build config
├── src/
│   ├── app/
│   │   ├── App.tsx             <- Root component
│   │   └── components/
│   │       └── SynesthesiaPlayer.tsx  <- The entire player (~1000 lines)
│   └── styles/
│       ├── synesthesia.css     <- Skeuomorphic player styles
│       └── theme.css           <- Design tokens
├── asssets/
│   ├── animations/             <- 13 Mixamo dance animations (.glb)
│   ├── characters/             <- 4 Mixamo characters (.glb)
│   └── musics/                 <- Audio tracks (.mp3)
└── docs/
    ├── prd.md                  <- Product requirements document
    ├── design-guideline.md     <- Skeuomorphic design specifications
    ├── song.md                 <- Song lyrics
    └── sample-gui.png          <- UI reference image
```

## How to Run

**Option A: Use hosted version (no setup)**
Open [trust-adjust-40491506.figma.site](https://trust-adjust-40491506.figma.site) in your browser.

**Option B: Run locally**
1. Clone this repo
2. `npm install`
3. `npm run dev`
4. Open in browser

## License

This project Built for the [Figma Makeathon](https://contra.com/community/topic/figmamakeathon) on Contra. 3D assets are from Mixamo (free, no attribution required). Music is AI-generated using Gemini. Reference image is AI-generated using Nano Banana Pro 2.
