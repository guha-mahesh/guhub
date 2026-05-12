import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Moon.css';

// ──────────────────────────────────────────────────────────────────────
// Casper, the rubberhose crescent moon. Modular: every visual aspect
// can be overridden via props so meta-Caspers reuse this component
// without duplicating the SVG.
// ──────────────────────────────────────────────────────────────────────

export type CasperVariant = 'default' | 'meta1' | 'meta2' | 'meta3';

interface MoonProps {
  /** Visual variant, controls palette via CSS class. */
  variant?: CasperVariant;
  /** Text on the hanging brass plate. Default: "WHERE'S CRENSHAW?" */
  nameplateText?: string;
  /** Whether to show the chain + hanging nameplate. */
  showNameplate?: boolean;
  /** Whether to show the brass cog mount peeking behind upper-right. */
  showCog?: boolean;
  /** Whether to show the CASPER-spelled-out blob craters. */
  showCasperCraters?: boolean;
  /** Click handler for the eyeball. Receives the click event so callers can
   *  capture pointer position for a zoom-out-from-eye animation. */
  onEyeClick?: (e: React.MouseEvent) => void;
  /** Current meta-depth (used by the default onEyeClick to navigate deeper). */
  depth?: number;
  /** Casper is in mourning — Crenshaw has been freed. Triggers a dimmer,
   *  desaturated "quieter" appearance across all meta levels. */
  freed?: boolean;
}

export default function Moon({
  variant = 'default',
  nameplateText = "WHERE'S CRENSHAW?",
  showNameplate = true,
  showCog = true,
  showCasperCraters = true,
  onEyeClick,
  depth = 0,
  freed = false,
}: MoonProps = {}) {
  const ref = useRef<SVGSVGElement>(null);
  const [open, setOpen] = useState(false);
  const [pupil, setPupil] = useState({ dx: 0, dy: 0 });
  const targetRef = useRef({ dx: 0, dy: 0 });
  const navigate = useNavigate();

  const onMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    // eye sits at viewBox (340, 320) inside viewBox -140..680 × -20..850.
    // That's ~58% across and ~40% down of the rendered SVG bounds.
    const cx = r.left + r.width * 0.58;
    const cy = r.top + r.height * 0.40;
    // Distance from eye, normalized by viewport so the eye looks "all the way"
    // when the cursor is at the opposite side of the screen.
    const dx = (e.clientX - cx) / window.innerWidth;
    const dy = (e.clientY - cy) / window.innerHeight;
    const max = 12;
    targetRef.current = {
      dx: Math.max(-max, Math.min(max, dx * 60)),
      dy: Math.max(-max, Math.min(max, dy * 60)),
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    let raf = 0;
    // Smoothly lerp current pupil position toward the target every frame.
    // Gives the eye a natural "rolling toward you" feel rather than snapping.
    const animate = () => {
      setPupil(p => {
        const t = targetRef.current;
        const lerp = 0.16;
        return { dx: p.dx + (t.dx - p.dx) * lerp, dy: p.dy + (t.dy - p.dy) * lerp };
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    const fade = setTimeout(() => setOpen(true), 600);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      clearTimeout(fade);
    };
  }, [onMove]);

  const eyeCx = 340, eyeCy = 320;
  const socketR = 42;
  const irisR = 28;
  const pupilR = 7;

  const handleEyeClick = onEyeClick ?? ((_e: React.MouseEvent) => navigate(`/inside/${depth + 1}`));

  return (
    <svg
      ref={ref}
      className={`moon moon-${variant}${freed ? ' moon-freed' : ''}`}
      viewBox="-140 -20 820 870"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="irisRealistic" cx="50%" cy="50%" r="55%">
          <stop offset="0%"  stopColor="#1a0a04" />
          <stop offset="22%" stopColor="#3a1f0a" />
          <stop offset="60%" stopColor="#6a3e18" />
          <stop offset="100%" stopColor="#2a1408" />
        </radialGradient>
        <radialGradient id="moonHalo" cx="55%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="rgba(139, 26, 26, 0.32)" />
          <stop offset="55%" stopColor="rgba(139, 26, 26, 0.12)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="moonScarGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="moonNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  0 0 0 0.55 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id="moonClip">
          <path d="M 30 30 C 360 60, 640 220, 640 410 C 640 600, 360 770, 30 790 C 230 700, 280 580, 280 410 C 280 240, 230 120, 30 30 Z" />
        </clipPath>
      </defs>

      {/* crimson halo behind the moon */}
      <ellipse cx="350" cy="410" rx="450" ry="380" fill="url(#moonHalo)" />

      {/* drop shadow */}
      <ellipse cx="280" cy="810" rx="240" ry="14" className="moonShadow" />

      {showNameplate && (<>
      {/* === chain hanging from the moon's lower belly === */}
      <g className="moonChain">
        {/* small alternating links forming a vertical chain */}
        <ellipse cx="218" cy="752" rx="3"   ry="5"   />
        <ellipse cx="220" cy="762" rx="5"   ry="3"   />
        <ellipse cx="222" cy="772" rx="3"   ry="5"   />
        <ellipse cx="220" cy="782" rx="5"   ry="3"   />
        <ellipse cx="218" cy="792" rx="3"   ry="5"   />
        {/* tiny hook ring at the top where it attaches to the moon */}
        <circle cx="220" cy="744" r="3.5" className="moonChainHook" />
      </g>

      {/* === plate hangs from chain, sways independently === */}
      {/* Outer <g> positions the hinge at (220, 798) */}
      <g transform="translate(220, 798)">
        {/* Inner <g> swings around (0,0), i.e. the hinge */}
        <g className="moonPlateSway">
          <rect x="-180" y="0"  width="360" height="52" rx="3" className="moonPlate" />
          <rect x="-170" y="8"  width="340" height="36" rx="2" className="moonPlateInner" />
          <circle cx="-162" cy="26" r="3.2" className="moonPlateRivet" />
          <circle cx="162"  cy="26" r="3.2" className="moonPlateRivet" />
          {/* two small chain-attachment loops at the top corners (so the
              chain visually connects on both sides for a hanging-sign feel) */}
          <circle cx="-150" cy="0" r="3" className="moonPlateHook" />
          <circle cx="150"  cy="0" r="3" className="moonPlateHook" />
          <text x="0" y="32" className="moonPlateText" textAnchor="middle">{nameplateText}</text>
        </g>
      </g>
      </>)}

      {showCog && (
      <g className="moonMount" transform="translate(605, 130)">
        <g className="moonCogSpin">
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i * 360) / 14;
            return (
              <rect key={i} x={-9} y={-92} width={18} height={26} className="moonCogTooth" transform={`rotate(${a})`} />
            );
          })}
          <circle cx="0" cy="0" r="72" className="moonCogRim" />
          <circle cx="0" cy="0" r="54" className="moonCogInner" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="0" y1="-44" x2="0" y2="-12" className="moonCogSpoke" transform={`rotate(${(i * 360) / 6})`} />
          ))}
          <circle cx="0" cy="0" r="14" className="moonCogHub" />
          <circle cx="0" cy="0" r="4" className="moonCogBolt" />
        </g>
      </g>
      )}

      {/* === crescent body, opens LEFT, dramatic curve === */}
      <path
        className="moonBody"
        d="M 30 30
           C 360 60, 640 220, 640 410
           C 640 600, 360 770, 30 790
           C 230 700, 280 580, 280 410
           C 280 240, 230 120, 30 30 Z"
      />

      {/* fractal-noise grit baked into the surface (clipped to body) */}
      <g clipPath="url(#moonClip)">
        <rect x="-140" y="-20" width="820" height="870" filter="url(#moonNoise)" opacity="0.35" />
      </g>

      {/* === craters === */}
      <g clipPath="url(#moonClip)" className="moonCraters">
        {/* regular elliptical craters scattered around the body */}
        <ellipse cx="510" cy="290" rx="18" ry="9" />
        <ellipse cx="510" cy="288" rx="18" ry="9" className="craterRim" />
        <ellipse cx="180" cy="600" rx="14" ry="7" />
        <ellipse cx="180" cy="598" rx="14" ry="7" className="craterRim" />
        <ellipse cx="540" cy="530" rx="11" ry="6" />
        <ellipse cx="300" cy="220" rx="10" ry="5" />
        <ellipse cx="540" cy="420" rx="9" ry="5" />

        {showCasperCraters && (<>
        {/*
          === CASPER spelled out as blobby crater shapes, top → bottom ===
          Each blob is a closed path roughly resembling its letter, but
          organic enough that it reads as a weird crater on first glance.
          Only obvious if you trace them vertically and squint.
        */}
        {/* C, open crescent opening right */}
        <path
          className="craterLetter"
          transform="translate(370, 150)"
          d="M -4 -14
             Q -18 -14 -18 0
             Q -18 14 -4 14
             Q 4 14 10 10
             Q -2 12 -10 6
             Q -14 0 -10 -6
             Q -2 -12 10 -10
             Q 4 -14 -4 -14 Z"
        />
        {/* A, peaked blob with crossbar dent */}
        <path
          className="craterLetter"
          transform="translate(450, 250)"
          d="M -12 14
             Q -10 -14 0 -14
             Q 10 -14 12 14
             Q 6 12 4 4
             Q 0 2 -4 4
             Q -6 12 -12 14 Z"
        />
        {/* S, sinuous double-loop */}
        <path
          className="craterLetter"
          transform="translate(480, 360)"
          d="M 10 -12
             Q -6 -14 -10 -6
             Q -10 -2 0 0
             Q 10 2 10 8
             Q 6 14 -10 12
             Q 2 12 6 8
             Q 6 2 -4 0
             Q -10 -4 -8 -8
             Q -2 -12 10 -12 Z"
        />
        {/* P, vertical with bulb on top */}
        <path
          className="craterLetter"
          transform="translate(460, 470)"
          d="M -10 -14
             Q 10 -14 10 -2
             Q 8 6 -2 6
             L -2 14
             Q -10 14 -10 -14 Z"
        />
        {/* E, vertical with three prongs */}
        <path
          className="craterLetter"
          transform="translate(400, 580)"
          d="M -10 -14
             Q 10 -14 12 -10
             Q 2 -8 -4 -6
             L -4 -2
             Q 6 -2 6 2
             Q -2 4 -4 6
             L -4 10
             Q 10 10 12 14
             Q -10 14 -10 -14 Z"
        />
        {/* R, like P with a leg kicking out (moved left to stay inside body silhouette at low y) */}
        <path
          className="craterLetter"
          transform="translate(370, 690)"
          d="M -10 -14
             Q 10 -14 10 -2
             Q 6 4 -2 4
             Q 6 8 12 14
             Q 0 14 -4 8
             L -4 14
             Q -10 14 -10 -14 Z"
        />
        </>)}
      </g>

      {/* === stipple dots === */}
      <g clipPath="url(#moonClip)" className="moonStipple">
        {[
          [400, 180, 2.5], [470, 220, 2], [355, 240, 1.8], [495, 350, 2.2],
          [560, 410, 1.8], [510, 470, 2.4], [460, 540, 2], [410, 580, 1.8],
          [340, 620, 2.5], [300, 480, 1.8], [320, 380, 2], [380, 320, 1.6],
          [435, 480, 2.6], [560, 580, 2], [430, 690, 2], [330, 710, 1.8],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>

      {/* === cracks === */}
      <g clipPath="url(#moonClip)" className="moonCracks">
        <path d="M 360 130 L 380 175 L 355 215 L 390 260 L 370 300" />
        <path d="M 470 470 L 500 510 L 480 555 L 515 595" />
        <path d="M 290 660 L 310 700 L 285 745" />
        <path d="M 540 230 L 560 265 L 545 290" />
      </g>

      {/* === heavy chin/jaw cross-hatching === */}
      <g clipPath="url(#moonClip)" className="moonHatch">
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`h1-${i}`}
            x1={350 + i * 8} y1={620 + i * 4}
            x2={420 + i * 8} y2={680 + i * 4}
          />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={`h2-${i}`}
            x1={500 + i * 6} y1={300 + i * 6}
            x2={550 + i * 6} y2={350 + i * 6}
          />
        ))}
      </g>

      {/* === face === */}
      <g className={`moonFace ${open ? 'open' : ''}`}>
        {/* long pinocchio stick nose */}
        <path
          className="moonNose"
          d="M 250 405
             L -130 411
             L -130 415
             L 250 421 Z"
        />
        <circle cx="-130" cy="413" r="3" className="moonNoseKnob" />
        <ellipse cx="220" cy="413" rx="3" ry="2" className="moonNostril" />
        <path className="moonNoseCrease" d="M 248 405 L 268 380 L 285 360" />

        {/* === clickable eye, zooms into the recursive meta-Casper === */}
        <g
          className="moonEyeClickable"
          onClick={handleEyeClick}
          role="button"
          aria-label="enter casper"
        >
          {/* sunburst petals around the eye */}
          <g className="moonEyePetals">
            {Array.from({ length: 12 }).map((_, i) => {
              const aDeg = i * 30;
              const a = (aDeg * Math.PI) / 180;
              const px = eyeCx + Math.cos(a) * 54;
              const py = eyeCy + Math.sin(a) * 54;
              return (
                <ellipse
                  key={i}
                  cx={px}
                  cy={py}
                  rx={18}
                  ry={9}
                  transform={`rotate(${aDeg} ${px} ${py})`}
                  className="moonPetal"
                />
              );
            })}
          </g>

          {/* recessed dark socket */}
          <circle cx={eyeCx} cy={eyeCy} r={socketR} className="moonEyeSocket" />
          <circle cx={eyeCx} cy={eyeCy} r={socketR - 4} className="moonEyeSocketInner" />

          {/* black iris, rolls toward cursor */}
          <circle
            cx={eyeCx + pupil.dx}
            cy={eyeCy + pupil.dy}
            r={irisR}
            className="moonEyeIris"
          />

          {/* white pupil dot */}
          <circle
            cx={eyeCx + pupil.dx}
            cy={eyeCy + pupil.dy}
            r={pupilR}
            className="moonEyePupilWhite"
          />

          {/* tiny black aperture in the center of the white pupil */}
          <circle
            cx={eyeCx + pupil.dx}
            cy={eyeCy + pupil.dy}
            r={2}
            className="moonEyePupilCore"
          />
        </g>

        {/* === sneering mouth, asymmetric, downturned, one peek tooth === */}
        <path
          className="moonMouthLine"
          d="M 220 545
             Q 290 580 360 555
             Q 400 547 430 532"
        />
        <path className="moonMouthCorner" d="M 220 545 Q 213 558 222 568" />
        {/* peek tooth */}
        <path className="moonPeekTooth" d="M 388 542 L 395 562 L 402 542 Z" />
        {/* cheek tension line */}
        <path className="moonCheekLine" d="M 230 540 Q 232 510 248 495" />
        <path className="moonCheekLine" d="M 415 545 Q 425 525 440 515" />

      </g>
    </svg>
  );
}
