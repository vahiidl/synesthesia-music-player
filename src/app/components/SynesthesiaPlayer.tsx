import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Howl, Howler } from 'howler';

// ===== CONSTANTS =====
const BASE_URL = 'https://vahiidl.github.io/synesthesia-music-player/';

const CHARACTERS = [
  { id: 'ch36', name: 'Ch36', path: 'asssets/characters/character-ch36.glb' },
  { id: 'remy', name: 'Remy', path: 'asssets/characters/character-remy.glb' },
  { id: 'kachujin', name: 'Kachujin', path: 'asssets/characters/character-kachujin.glb' },
  { id: 'the-boss', name: 'The Boss', path: 'asssets/characters/character-the-boss.glb' },
];

// Disco floor colors - purple/blue palette matching the background LED wall
const DISCO_COLORS = [
  0x4422cc, 0x3333dd, 0x6622ff, 0x2244cc,
  0x5500dd, 0x3355ee, 0x7733ff, 0x2255dd,
  0x4444ee, 0x6633dd, 0x3322cc, 0x5544ff,
  0x2233bb, 0x4455dd, 0x6644ee, 0x3344cc,
];

// LED wall dot colors - blues, purples, magentas
const LED_PALETTE = [
  0x4444ff, 0x6622ff, 0xaa00ff, 0xff00ff,
  0x2266ff, 0x0088ff, 0x00aaff, 0x8800ff,
  0xff44cc, 0xcc00ff, 0x5500ff, 0x0066ff,
];

const SEQ_DURATION = 3.0;
const SEQ_CROSSFADE = 0.5;

function stripRootMotion(clip: THREE.AnimationClip): THREE.AnimationClip {
  const stripped = clip.tracks.filter((track) => {
    const isPosition = track.name.endsWith('.position');
    const isRoot = /^(Hips|mixamorig:?Hips|Root)$/i.test(track.name.split('.')[0]);
    if (isPosition && isRoot) return false;
    return true;
  });
  return new THREE.AnimationClip(clip.name, clip.duration, stripped);
}

interface SongConfig {
  id: string; title: string; artist: string; genre: string; bpm: number;
  audioPath: string; stageColor: number;
  accentColor: string; accentHex: string;
  sequence: string[];
}

const SONGS: SongConfig[] = [
  {
    id: 'dance', title: 'Drag & Drop My Heart', artist: 'Synesthesia', genre: 'R&B / Dance', bpm: 115,
    audioPath: 'asssets/musics/drag-and-drop-heart.mp3',
    stageColor: 0x3d2860, accentColor: '#ff6644', accentHex: '#ff6644',
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
    id: 'hiphop', title: 'Make It Move', artist: 'Synesthesia', genre: 'Hip-Hop', bpm: 95,
    audioPath: 'asssets/musics/make-it-move.mp3',
    stageColor: 0x1e3050, accentColor: '#00ccff', accentHex: '#00ccff',
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

// ===== TRANSPORT ICON SVGS =====
function PrevIcon() {
  return (<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="5" width="3" height="14" fill="currentColor" /><polygon points="20,5 9,12 20,19" fill="currentColor" /></svg>);
}
function RewIcon() {
  return (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12,5 2,12 12,19" fill="currentColor" /><polygon points="22,5 12,12 22,19" fill="currentColor" /></svg>);
}
function PlayIcon() {
  return (<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="7,4 21,12 7,20" fill="currentColor" /></svg>);
}
function PauseIcon() {
  return (<svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" /><rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" /></svg>);
}
function FwdIcon() {
  return (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="2,5 12,12 2,19" fill="currentColor" /><polygon points="12,5 22,12 12,19" fill="currentColor" /></svg>);
}
function NextIcon() {
  return (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="4,5 15,12 4,19" fill="currentColor" /><rect x="17" y="5" width="3" height="14" fill="currentColor" /></svg>);
}
function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15" fill="#666" /><line x1="16" y1="9" x2="22" y2="15" stroke="#666" strokeWidth="2" /><line x1="22" y1="9" x2="16" y2="15" stroke="#666" strokeWidth="2" /></svg>);
  }
  return (<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="3,9 7,9 12,4 12,20 7,15 3,15" fill="#666" /><path d="M16,8 C18,10 18,14 16,16" fill="none" stroke="#666" strokeWidth="1.5" /><path d="M19,6 C22,9 22,15 19,18" fill="none" stroke="#666" strokeWidth="1.5" /></svg>);
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface CharInstance {
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  sequenceActions: THREE.AnimationAction[];
  currentSeqIdx: number;
  seqTimer: number;
  moveSystemReady: boolean;
}

interface DiscoTile {
  mesh: THREE.Mesh;
  baseColor: THREE.Color;
  row: number;
  col: number;
}

interface LedDot {
  baseColor: THREE.Color;
  row: number;
  col: number;
}

interface EngineState {
  scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
  characters: CharInstance[];
  characterCache: Map<string, THREE.Object3D>;
  animationCache: Map<string, THREE.AnimationClip[]>;
  spotLight: THREE.SpotLight; ambientLight: THREE.HemisphereLight;
  overheadSpots: THREE.SpotLight[];
  stageLights: THREE.SpotLight[];
  ledWall: THREE.InstancedMesh;
  ledDots: LedDot[];
  ledRows: number;
  ledCols: number;
  ledDummy: THREE.Object3D;
  backWall: THREE.Mesh;
  discoTiles: DiscoTile[];
  discoGroup: THREE.Group;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array;
  currentSongIdx: number;
  smoothBass: number; smoothMid: number; smoothTreble: number; smoothRMS: number; prevBass: number;
  animFrameId: number; disposed: boolean; loader: GLTFLoader;
}

export default function SynesthesiaPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIdx, setCurrentSongIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [beatDetected, setBeatDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingChar, setLoadingChar] = useState(false);
  const [currentAnimName, setCurrentAnimName] = useState('');

  const engineRef = useRef<EngineState | null>(null);
  const howlRef = useRef<Howl | null>(null);
  const howlCache = useRef<Map<string, Howl>>(new Map());
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const isPlayingRef = useRef(false);
  // Ref for auto-advance callback so Howl onend can access latest version
  const autoAdvanceRef = useRef<(nextIdx: number) => void>(() => {});

  const ensureAnalyser = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.analyser) return;
    try {
      const ctx = Howler.ctx;
      if (!ctx) return;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      (Howler as any).masterGain.connect(analyser);
      e.analyser = analyser;
      e.frequencyData = new Uint8Array(analyser.frequencyBinCount);
    } catch (err) {
      console.warn('Could not create analyser:', err);
    }
  }, []);

  // ===== CREATE LED DOT WALL =====
  const createLedWall = useCallback((scene: THREE.Scene): {
    mesh: THREE.InstancedMesh; dots: LedDot[]; rows: number; cols: number;
  } => {
    const rows = 20;
    const cols = 40;
    const dotRadius = 0.035;
    const spacingX = 0.14;
    const spacingY = 0.14;
    const totalCount = rows * cols;

    const geo = new THREE.SphereGeometry(dotRadius, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, totalCount);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(totalCount * 3), 3
    );

    const gridW = cols * spacingX;
    const dummy = new THREE.Object3D();
    const dots: LedDot[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = c * spacingX - gridW / 2 + spacingX / 2;
        const y = r * spacingY + 0.1;
        dummy.position.set(x, y, -3.8);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);

        const colorIdx = (r + c * 3) % LED_PALETTE.length;
        const baseColor = new THREE.Color(LED_PALETTE[colorIdx]);
        dots.push({ baseColor, row: r, col: c });

        mesh.instanceColor!.setXYZ(idx, baseColor.r * 0.05, baseColor.g * 0.05, baseColor.b * 0.05);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    (mesh.instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;
    scene.add(mesh);

    return { mesh, dots, rows, cols };
  }, []);

  // ===== CREATE DISCO FLOOR =====
  const createDiscoFloor = useCallback((scene: THREE.Scene): { tiles: DiscoTile[]; group: THREE.Group } => {
    const group = new THREE.Group();
    const tiles: DiscoTile[] = [];
    const gridSize = 10;
    const tileSize = 0.55;
    const gap = 0.04;
    const totalStep = tileSize + gap;
    const offset = (gridSize * totalStep) / 2 - totalStep / 2;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const colorIdx = (row * gridSize + col + row) % DISCO_COLORS.length;
        const baseColor = new THREE.Color(DISCO_COLORS[colorIdx]);

        const geo = new THREE.BoxGeometry(tileSize, 0.04, tileSize);
        const mat = new THREE.MeshStandardMaterial({
          color: baseColor.clone().multiplyScalar(0.3),
          emissive: baseColor.clone().multiplyScalar(0.08),
          emissiveIntensity: 0.3,
          metalness: 0.9,
          roughness: 0.15,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(col * totalStep - offset, -0.02, row * totalStep - offset);
        mesh.receiveShadow = true;
        group.add(mesh);
        tiles.push({ mesh, baseColor, row, col });
      }
    }

    scene.add(group);
    return { tiles, group };
  }, []);

  // ===== THREE.JS SETUP =====
  const initThreeScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    if (w === 0 || h === 0) { w = 596; h = 480; }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.2, 3.5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Ambient light
    const ambient = new THREE.HemisphereLight(0x333344, 0x111122, 0.6);
    scene.add(ambient);

    // Main front spotlight - starts OFF when not playing
    const spot = new THREE.SpotLight(0xffffff, 0, 25, Math.PI / 3.5, 0.4, 0.8);
    spot.position.set(0, 6, 3);
    spot.target.position.set(0, 0, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.set(1024, 1024);
    scene.add(spot);
    scene.add(spot.target);

    // Front key light - always on, highlights character details from the front
    const frontKey = new THREE.SpotLight(0xeeeeff, 2.5, 15, Math.PI / 4, 0.5, 0.8);
    frontKey.position.set(0, 2.5, 3.5);
    frontKey.target.position.set(0, 1.0, 0);
    frontKey.castShadow = false;
    scene.add(frontKey);
    scene.add(frontKey.target);

    // Minimal side fills
    const fillLight = new THREE.PointLight(0x666688, 0.4, 12);
    fillLight.position.set(2, 2, 2);
    scene.add(fillLight);

    const backFill = new THREE.PointLight(0x444466, 0.3, 10);
    backFill.position.set(-2, 1, -2);
    scene.add(backFill);

    // Overhead character spotlights - ALWAYS ON for character illumination
    const overheadSpots: THREE.SpotLight[] = [];
    const overheadConfigs = [
      { color: 0xffeedd, pos: [0, 7, 0] as [number, number, number], intensity: 3.0 },
      { color: 0xddddff, pos: [-2, 6, -1] as [number, number, number], intensity: 1.8 },
      { color: 0xffddcc, pos: [2, 6, -1] as [number, number, number], intensity: 1.8 },
    ];
    for (const cfg of overheadConfigs) {
      const oSpot = new THREE.SpotLight(cfg.color, cfg.intensity, 15, Math.PI / 6, 0.6, 1.0);
      oSpot.position.set(...cfg.pos);
      oSpot.target.position.set(0, 0.5, 0);
      oSpot.castShadow = false;
      scene.add(oSpot);
      scene.add(oSpot.target);
      overheadSpots.push(oSpot);
    }

    // Colored stage spotlights - dramatic beams, OFF when not playing
    const stageLights: THREE.SpotLight[] = [];
    const stageConfigs = [
      { color: 0xff1493, pos: [-3.5, 8, -2] as [number, number, number], target: [-1, 0, 0.5] as [number, number, number], intensity: 6.0 },
      { color: 0xffd700, pos: [-1.5, 9, -2.5] as [number, number, number], target: [0, 0, 0] as [number, number, number], intensity: 5.0 },
      { color: 0x00ffff, pos: [0, 9, -3] as [number, number, number], target: [0, 0, 0.5] as [number, number, number], intensity: 6.0 },
      { color: 0x4444ff, pos: [1.5, 9, -2.5] as [number, number, number], target: [0, 0, 0] as [number, number, number], intensity: 5.0 },
      { color: 0xff00ff, pos: [3.5, 8, -2] as [number, number, number], target: [1, 0, 0.5] as [number, number, number], intensity: 6.0 },
    ];
    for (const cfg of stageConfigs) {
      const sLight = new THREE.SpotLight(cfg.color, 0, 20, Math.PI / 8, 0.3, 1.2);
      sLight.position.set(...cfg.pos);
      sLight.target.position.set(...cfg.target);
      sLight.castShadow = false;
      scene.add(sLight);
      scene.add(sLight.target);
      stageLights.push(sLight);
    }

    // Dark back wall
    const backWallGeo = new THREE.PlaneGeometry(12, 6);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a12, metalness: 0.3, roughness: 0.8,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 2.5, -4.0);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // LED dot wall
    const led = createLedWall(scene);

    // Disco floor
    const disco = createDiscoFloor(scene);

    const loader = new GLTFLoader();

    const stageLightIntensities = stageConfigs.map(c => c.intensity);
    const overheadIntensities = overheadConfigs.map(c => c.intensity);

    engineRef.current = {
      scene, camera, renderer, clock: new THREE.Clock(),
      characters: [], characterCache: new Map(), animationCache: new Map(),
      spotLight: spot, ambientLight: ambient,
      overheadSpots, stageLights,
      ledWall: led.mesh, ledDots: led.dots, ledRows: led.rows, ledCols: led.cols,
      ledDummy: new THREE.Object3D(),
      backWall,
      discoTiles: disco.tiles, discoGroup: disco.group,
      analyser: null, frequencyData: new Uint8Array(512),
      currentSongIdx: 0,
      smoothBass: 0, smoothMid: 0, smoothTreble: 0, smoothRMS: 0, prevBass: 0,
      animFrameId: 0, disposed: false, loader,
    };

    // ===== RENDER LOOP =====
    const animate = () => {
      const e = engineRef.current;
      if (!e || e.disposed) return;
      e.animFrameId = requestAnimationFrame(animate);
      const delta = e.clock.getDelta();
      const time = e.clock.getElapsedTime();
      const playing = isPlayingRef.current;

      // Overhead spots always on at base intensity
      for (let i = 0; i < e.overheadSpots.length; i++) {
        e.overheadSpots[i].intensity = overheadIntensities[i];
      }

      if (e.analyser && playing) {
        e.analyser.getByteFrequencyData(e.frequencyData);
        const data = e.frequencyData;

        let subBassSum = 0, bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
        for (let i = 0; i < 16; i++) subBassSum += data[i];
        for (let i = 16; i < 61; i++) bassSum += data[i];
        for (let i = 121; i < 251; i++) midSum += data[i];
        for (let i = 401; i < 512; i++) trebleSum += data[i];
        for (let i = 0; i < 512; i++) totalSum += data[i] * data[i];

        const bass = (subBassSum / (16 * 255) + bassSum / (45 * 255)) / 2;
        const mid = midSum / (130 * 255);
        const treble = trebleSum / (111 * 255);
        const rms = Math.sqrt(totalSum / 512) / 255;

        const a = 0.15;
        e.smoothBass += a * (bass - e.smoothBass);
        e.smoothMid += a * (mid - e.smoothMid);
        e.smoothTreble += a * (treble - e.smoothTreble);
        e.smoothRMS += a * (rms - e.smoothRMS);

        if (e.smoothBass > 0.35 && e.smoothBass - e.prevBass > 0.06) {
          setBeatDetected(true);
          setTimeout(() => setBeatDetected(false), 200);
        }
        e.prevBass = e.smoothBass;

        const song = SONGS[e.currentSongIdx];

        // Disco floor - colorful audio reactive
        for (const tile of e.discoTiles) {
          const tMat = tile.mesh.material as THREE.MeshStandardMaterial;
          const freqIndex = Math.floor(((tile.row * 10 + tile.col) / 100) * 256);
          const freqVal = data[Math.min(freqIndex, 511)] / 255;
          const cx = tile.col - 4.5;
          const cz = tile.row - 4.5;
          const dist = Math.sqrt(cx * cx + cz * cz);
          const ripple = Math.sin(time * 4 - dist * 1.2) * 0.5 + 0.5;
          const intensity = Math.max(0.05, freqVal * ripple * e.smoothRMS * 3.0);
          tMat.emissive.copy(tile.baseColor);
          tMat.emissiveIntensity = intensity;
          tMat.color.copy(tile.baseColor).multiplyScalar(0.15 + intensity * 0.5);
        }

        // LED wall - audio reactive columns
        const instanceColor = e.ledWall.instanceColor!;
        for (let r = 0; r < e.ledRows; r++) {
          for (let c = 0; c < e.ledCols; c++) {
            const idx = r * e.ledCols + c;
            const dot = e.ledDots[idx];
            const freqBin = Math.floor((c / e.ledCols) * 256);
            const freqVal = data[Math.min(freqBin, 511)] / 255;
            const rowNorm = r / e.ledRows;
            const lit = freqVal > (rowNorm * 0.8) ? 1 : 0;
            const shimmer = Math.sin(time * 3 + c * 0.5 + r * 0.3) * 0.15 + 0.85;
            const brightness = lit * shimmer * (0.5 + e.smoothRMS * 1.5);
            instanceColor.setXYZ(idx,
              dot.baseColor.r * brightness,
              dot.baseColor.g * brightness,
              dot.baseColor.b * brightness
            );
          }
        }
        (instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;

        // Main spot and overhead boost when playing
        e.spotLight.intensity = 4.0 + e.smoothBass * 2.0;
        for (let i = 0; i < e.overheadSpots.length; i++) {
          e.overheadSpots[i].intensity = overheadIntensities[i] * (0.8 + e.smoothRMS * 0.5);
        }

        // Stage lights - animate with audio and slow sweep
        for (let i = 0; i < e.stageLights.length; i++) {
          const baseIntensity = stageLightIntensities[i];
          const pulse = 0.5 + e.smoothBass * 0.5;
          const sweep = Math.sin(time * 0.8 + i * 1.2) * 0.3;
          e.stageLights[i].intensity = baseIntensity * pulse;
          e.stageLights[i].target.position.x = stageConfigs[i].target[0] + sweep;
        }

        // Sequential animation system
        for (const ci of e.characters) {
          if (!ci.moveSystemReady || ci.sequenceActions.length === 0) continue;
          ci.seqTimer += delta;
          if (ci.seqTimer >= SEQ_DURATION) {
            ci.seqTimer = 0;
            const prevIdx = ci.currentSeqIdx;
            const nextIdx = (ci.currentSeqIdx + 1) % ci.sequenceActions.length;
            ci.currentSeqIdx = nextIdx;
            const prevAction = ci.sequenceActions[prevIdx];
            const nextAction = ci.sequenceActions[nextIdx];
            if (prevAction && nextAction) {
              nextAction.enabled = true;
              nextAction.setEffectiveTimeScale(1);
              nextAction.setEffectiveWeight(1);
              nextAction.time = 0;
              nextAction.play();
              prevAction.crossFadeTo(nextAction, SEQ_CROSSFADE, true);
            }
            const seqPath = song.sequence[nextIdx];
            const animLabel = seqPath.split('/').pop()?.replace('animation-', '').replace('.glb', '') ?? '';
            setCurrentAnimName(animLabel.toUpperCase());
          }
          const bpmScale = song.bpm / 120;
          for (const action of ci.sequenceActions) {
            if (action.enabled && action.getEffectiveWeight() > 0.01) {
              action.timeScale = bpmScale;
            }
          }
        }

      } else {
        // ===== NOT PLAYING =====

        // Disco floor - greyscale when paused
        for (const tile of e.discoTiles) {
          const tMat = tile.mesh.material as THREE.MeshStandardMaterial;
          const grey = tile.baseColor.r * 0.299 + tile.baseColor.g * 0.587 + tile.baseColor.b * 0.114;
          const greyColor = new THREE.Color(grey * 0.15, grey * 0.15, grey * 0.15);
          const greyEmissive = new THREE.Color(grey * 0.08, grey * 0.08, grey * 0.08);
          tMat.color.copy(greyColor);
          tMat.emissive.copy(greyEmissive);
          tMat.emissiveIntensity = 0.3;
        }

        // LED wall - faint breathing glow when paused
        const instanceColor = e.ledWall.instanceColor!;
        for (let r = 0; r < e.ledRows; r++) {
          for (let c = 0; c < e.ledCols; c++) {
            const idx = r * e.ledCols + c;
            const dot = e.ledDots[idx];
            const breath = Math.sin(time * 0.3 + c * 0.1 + r * 0.15) * 0.02 + 0.03;
            const grey = dot.baseColor.r * 0.299 + dot.baseColor.g * 0.587 + dot.baseColor.b * 0.114;
            instanceColor.setXYZ(idx, grey * breath, grey * breath, grey * breath);
          }
        }
        (instanceColor as THREE.InstancedBufferAttribute).needsUpdate = true;

        // Main spot and stage lights OFF when paused
        e.spotLight.intensity = 0;
        for (const sLight of e.stageLights) {
          sLight.intensity = 0;
        }
      }

      // Update mixers when playing
      if (playing) {
        for (const ci of e.characters) {
          ci.mixer.update(delta);
          const baseX = (ci.model.userData as any)?.baseX ?? 0;
          if (Math.abs(ci.model.position.x - baseX) > 0.3) ci.model.position.x = baseX;
          if (ci.model.position.z > 0.5) ci.model.position.z = 0.5;
          if (ci.model.position.z < -0.5) ci.model.position.z = -0.5;
        }
      }

      e.renderer.render(e.scene, e.camera);
    };

    animate();

    requestAnimationFrame(() => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw > 0 && ch > 0 && (cw !== w || ch !== h)) {
        renderer.setSize(cw, ch, false);
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
      }
    });
  }, [createDiscoFloor, createLedWall]);

  // ===== LOAD CHARACTER MODEL =====
  const loadCharacterModel = useCallback(async (charId: string, charPath: string): Promise<THREE.Object3D | null> => {
    const e = engineRef.current;
    if (!e) return null;
    const url = BASE_URL + charPath;

    if (e.characterCache.has(charId)) {
      const cached = e.characterCache.get(charId)!;
      const cloned = skeletonClone(cached) as THREE.Object3D;
      cloned.traverse((child: any) => {
        if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; }
      });
      return cloned;
    }

    try {
      const gltf = await new Promise<any>((resolve, reject) => {
        e.loader.load(url, resolve, undefined, reject);
      });
      const model = gltf.scene;
      model.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true; child.receiveShadow = true;
          if (child.material) child.material = child.material.clone();
        }
      });
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 2.0 / size.y;
      model.scale.setScalar(scale);
      const newBox = new THREE.Box3().setFromObject(model);
      model.position.y = -newBox.min.y;
      e.characterCache.set(charId, model);
      if (gltf.animations?.length > 0) e.animationCache.set(charId, gltf.animations);
      const freshClone = skeletonClone(model) as THREE.Object3D;
      freshClone.traverse((child: any) => {
        if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true; }
      });
      return freshClone;
    } catch (err) {
      console.error('Failed to load character:', charId, err);
      return null;
    }
  }, []);

  // ===== SETUP SEQUENTIAL MOVE SYSTEM =====
  const setupMoveSystem = useCallback(async (ci: CharInstance) => {
    const e = engineRef.current;
    if (!e) return;
    const song = SONGS[e.currentSongIdx];
    const sequenceActions: THREE.AnimationAction[] = [];

    for (let i = 0; i < song.sequence.length; i++) {
      const animPath = song.sequence[i];
      const cacheKey = `seq_${song.id}_${i}`;
      let clips: THREE.AnimationClip[];

      if (e.animationCache.has(cacheKey)) {
        clips = e.animationCache.get(cacheKey)!;
      } else {
        try {
          const gltf = await new Promise<any>((resolve, reject) => {
            e.loader.load(BASE_URL + animPath, resolve, undefined, reject);
          });
          clips = gltf.animations;
          e.animationCache.set(cacheKey, clips);
        } catch (err) {
          console.error(`Failed to load sequence animation ${animPath}:`, err);
          continue;
        }
      }

      if (clips.length > 0) {
        const processed = stripRootMotion(clips[0]);
        const action = ci.mixer.clipAction(processed);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = song.bpm / 120;
        if (i === 0) { action.setEffectiveWeight(1); action.play(); }
        else { action.setEffectiveWeight(0); action.play(); }
        sequenceActions.push(action);
      }
    }

    if (e.disposed) return;

    ci.sequenceActions = sequenceActions;
    ci.currentSeqIdx = 0;
    ci.seqTimer = 0;
    ci.moveSystemReady = true;

    if (song.sequence.length > 0) {
      const animLabel = song.sequence[0].split('/').pop()?.replace('animation-', '').replace('.glb', '') ?? '';
      setCurrentAnimName(animLabel.toUpperCase());
    }

    ci.mixer.update(0.016);
  }, []);

  // ===== SWAP CHARACTERS =====
  const swapToCharacter = useCallback(async (charIdx: number) => {
    const e = engineRef.current;
    if (!e) return;

    for (const ci of e.characters) {
      ci.mixer.stopAllAction();
      ci.sequenceActions.forEach((a) => { a.stop(); });
      ci.sequenceActions = [];
      ci.mixer.uncacheRoot(ci.model);
      e.scene.remove(ci.model);
    }
    e.characters = [];

    e.camera.position.set(0, 1.2, 3.5);
    e.camera.lookAt(0, 1, 0);

    const cfg = CHARACTERS[charIdx];
    setLoadingChar(true);
    const model = await loadCharacterModel(cfg.id, cfg.path);
    if (model && !e.disposed) {
      model.position.x = 0;
      (model.userData as any).baseX = 0;
      e.scene.add(model);
      const mixer = new THREE.AnimationMixer(model);
      const ci: CharInstance = {
        model, mixer, sequenceActions: [], currentSeqIdx: 0, seqTimer: 0, moveSystemReady: false,
      };
      e.characters.push(ci);
      await setupMoveSystem(ci);
    }
    setLoadingChar(false);
  }, [loadCharacterModel, setupMoveSystem]);

  // ===== HOWLER =====
  const getHowl = useCallback((songIdx: number): Howl => {
    const song = SONGS[songIdx];
    if (howlCache.current.has(song.id)) return howlCache.current.get(song.id)!;
    const howl = new Howl({
      src: [BASE_URL + song.audioPath],
      html5: false, volume: volumeRef.current, preload: true,
      onend: () => {
        // Auto-advance to the next song
        const e = engineRef.current;
        if (e) {
          const nextIdx = (e.currentSongIdx + 1) % SONGS.length;
          autoAdvanceRef.current(nextIdx);
        }
      },
      onload: () => { setDuration(howl.duration()); },
    });
    howlCache.current.set(song.id, howl);
    return howl;
  }, []);

  // ===== SONG SWITCH =====
  const handleSongSwitch = useCallback(async (idx: number) => {
    const e = engineRef.current;
    if (!e || idx === e.currentSongIdx) return;
    const wasPlaying = isPlayingRef.current;
    if (howlRef.current) howlRef.current.stop();
    isPlayingRef.current = false;
    setIsPlaying(false); setProgress(0); setCurrentTime(0);
    e.currentSongIdx = idx;
    setCurrentSongIdx(idx);

    const song = SONGS[idx];
    e.scene.background = new THREE.Color(0x050508);
    e.spotLight.color.set(0xffffff);

    for (const ci of e.characters) {
      ci.mixer.stopAllAction();
      ci.sequenceActions = [];
      ci.moveSystemReady = false;
      ci.currentSeqIdx = 0; ci.seqTimer = 0;
    }
    setCurrentAnimName('');

    await Promise.all(e.characters.map((ci) => setupMoveSystem(ci)));

    if (wasPlaying) {
      const howl = getHowl(idx);
      howlRef.current = howl;
      howl.volume(volumeRef.current);
      howl.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
      setDuration(howl.duration());
      setTimeout(() => ensureAnalyser(), 100);
    } else {
      getHowl(idx);
    }
  }, [setupMoveSystem, getHowl, ensureAnalyser]);

  // Keep autoAdvanceRef updated with the latest song switch logic
  useEffect(() => {
    autoAdvanceRef.current = async (nextIdx: number) => {
      const e = engineRef.current;
      if (!e) return;
      // Pretend we were playing so handleSongSwitch auto-plays the next song
      isPlayingRef.current = true;
      await handleSongSwitch(nextIdx);
    };
  }, [handleSongSwitch]);

  const handleCharSwitch = useCallback(async (idx: number) => {
    if (idx === currentCharIdx) return;
    setCurrentCharIdx(idx);
    await swapToCharacter(idx);
  }, [currentCharIdx, swapToCharacter]);

  const handlePlayPause = useCallback(async () => {
    if (isPlayingRef.current) {
      const howl = howlRef.current;
      if (howl) howl.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      const howl = getHowl(engineRef.current?.currentSongIdx ?? 0);
      howlRef.current = howl;
      howl.volume(volumeRef.current);
      howl.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
      setDuration(howl.duration());
      setTimeout(() => ensureAnalyser(), 100);
    }
  }, [getHowl, ensureAnalyser]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const howl = howlRef.current;
      if (howl && isPlayingRef.current && howl.playing()) {
        const seek = howl.seek() as number;
        const dur = howl.duration();
        setCurrentTime(seek);
        setProgress(dur > 0 ? seek / dur : 0);
        setDuration(dur);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleSeek = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    const howl = howlRef.current;
    if (!howl) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
    const seekTime = x * howl.duration();
    howl.seek(seekTime); setCurrentTime(seekTime); setProgress(x);
  }, []);

  useEffect(() => {
    Howler.volume(volume);
    if (howlRef.current) howlRef.current.volume(volume);
  }, [volume]);

  const handleVolumeChange = useCallback((ev: React.MouseEvent<HTMLDivElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    setVolume(Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)));
  }, []);

  const knobRef = useRef<HTMLDivElement>(null);
  const knobDragging = useRef(false);
  const knobStartAngle = useRef(0);
  const knobStartVolume = useRef(0);

  const handleKnobMouseDown = useCallback((ev: React.MouseEvent) => {
    knobDragging.current = true;
    const rect = knobRef.current!.getBoundingClientRect();
    knobStartAngle.current = Math.atan2(ev.clientY - (rect.top + rect.height / 2), ev.clientX - (rect.left + rect.width / 2));
    knobStartVolume.current = volumeRef.current;
    ev.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!knobDragging.current || !knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const angle = Math.atan2(ev.clientY - (rect.top + rect.height / 2), ev.clientX - (rect.left + rect.width / 2));
      setVolume(Math.max(0, Math.min(1, knobStartVolume.current + (angle - knobStartAngle.current) / Math.PI)));
    };
    const onUp = () => { knobDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    const cur = (howl.seek() as number) + seconds;
    const clamped = Math.max(0, Math.min(cur, howl.duration()));
    howl.seek(clamped); setCurrentTime(clamped); setProgress(clamped / howl.duration());
  }, []);

  const handlePrev = useCallback(() => {
    const howl = howlRef.current;
    const elapsed = howl ? (howl.seek() as number) : 0;
    const e = engineRef.current;
    if (!e) return;
    if (elapsed > 3) { howl?.seek(0); setCurrentTime(0); setProgress(0); }
    else { handleSongSwitch((e.currentSongIdx === 0) ? SONGS.length - 1 : e.currentSongIdx - 1); }
  }, [handleSongSwitch]);

  const handleNext = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    handleSongSwitch((e.currentSongIdx + 1) % SONGS.length);
  }, [handleSongSwitch]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      initThreeScene();
      (async () => {
        setLoadProgress(20);
        await swapToCharacter(0);
        setLoadProgress(80);
        getHowl(0);
        setLoadProgress(100);
        setLoading(false);
      })();
    });
    return () => {
      cancelAnimationFrame(frameId);
      const e = engineRef.current;
      if (e) { e.disposed = true; cancelAnimationFrame(e.animFrameId); e.renderer.dispose(); }
      howlCache.current.forEach((h) => h.unload());
      howlCache.current.clear();
    };
  }, [initThreeScene, swapToCharacter, getHowl]);

  useEffect(() => {
    const onResize = () => {
      const e = engineRef.current;
      const c = canvasRef.current;
      if (!e || !c) return;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (w > 0 && h > 0) {
        e.camera.aspect = w / h;
        e.camera.updateProjectionMatrix();
        e.renderer.setSize(w, h, false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const song = SONGS[currentSongIdx];
  const isWarm = currentSongIdx === 0;
  const knobRotation = -135 + volume * 270;

  return (
    <div className="syn-page">
      <div className="syn-player">
        <div className="syn-titlebar">
          <div className="syn-titlebar-left">
            <span className="syn-logo-icon">&#9678;</span>
            <span className="syn-titlebar-text">Synesthesia</span>
          </div>
          <div className="syn-window-controls">
            <button className="syn-window-btn" title="Minimize">&#8722;</button>
            <button className="syn-window-btn syn-window-close" title="Close">&#10005;</button>
          </div>
        </div>

        <div className="syn-viz-container" ref={containerRef}>
          <div className="syn-viz-bezel">
            <div className="syn-viz-inner">
              <canvas ref={canvasRef} className="syn-canvas" />
              <div className="syn-scanlines" />

              <div className="syn-char-overlay">
                {CHARACTERS.map((c, i) => (
                  <button
                    key={c.id}
                    className={`syn-char-btn ${currentCharIdx === i ? 'active' : ''}`}
                    onClick={() => handleCharSwitch(i)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {(loading || loadingChar) && (
                <div className="syn-loading-overlay">
                  <div className="syn-loading-text">{loadingChar ? 'LOADING CHARACTER...' : 'INITIALIZING...'}</div>
                  <div className="syn-loading-bar">
                    <div className="syn-loading-bar-fill" style={{ width: `${loadingChar ? 50 : loadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="syn-progress-container">
          <div className="syn-progress-track" onClick={handleSeek}>
            <div className={`syn-progress-fill ${isWarm ? 'warm' : ''}`} style={{ width: `${progress * 100}%` }}>
              <div className="syn-progress-thumb" />
            </div>
          </div>
        </div>

        <div className="syn-track-info-row">
          <div className="syn-track-info-left">
            <span className={`syn-track-title ${isWarm ? 'warm' : ''}`}>{song.title}</span>
            <span className="syn-track-genre">{song.genre}</span>
          </div>
          <div className="syn-track-info-center">
            {isPlaying && currentAnimName && <span className={`syn-track-energy ${isWarm ? 'warm' : ''}`}>{currentAnimName}</span>}
            <span className={`syn-track-beat ${beatDetected ? (isWarm ? 'active-warm' : 'active') : ''}`}>&#9679;</span>
          </div>
          <div className="syn-track-info-right">
            <span className={`syn-track-time ${isWarm ? 'warm' : ''}`}>{formatTime(currentTime)}</span>
            <span className="syn-track-sep">/</span>
            <span className={`syn-track-time dim ${isWarm ? 'warm' : ''}`}>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="syn-controls">
          <div className="syn-transport">
            <button className="syn-transport-btn" onClick={handlePrev} title="Previous"><PrevIcon /></button>
            <button className="syn-transport-btn" onClick={() => handleSkip(-10)} title="Rewind"><RewIcon /></button>
            <button className="syn-transport-btn play-btn" onClick={handlePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button className="syn-transport-btn" onClick={() => handleSkip(10)} title="Forward"><FwdIcon /></button>
            <button className="syn-transport-btn" onClick={handleNext} title="Next"><NextIcon /></button>
          </div>

          <div className="syn-volume-area">
            <div className="syn-volume-slider-wrap">
              <div className="syn-volume-track" onClick={handleVolumeChange}>
                <div className={`syn-volume-fill ${isWarm ? 'warm' : ''}`} style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
            <SpeakerIcon muted={volume === 0} />
            <div
              className="syn-knob"
              ref={knobRef}
              onMouseDown={handleKnobMouseDown}
              style={{ transform: `rotate(${knobRotation}deg)` }}
              title={`Volume: ${Math.round(volume * 100)}%`}
            >
              <div className="syn-knob-marker" />
              <div className="syn-knob-highlight" />
            </div>
          </div>
        </div>

        <div className="syn-bottom-trim">
          <div className="syn-emblem-line" />
          <div className="syn-emblem-v">&#9662;</div>
          <div className="syn-emblem-line" />
        </div>
      </div>
    </div>
  );
}
