import { useState, useEffect, useRef, useCallback } from 'react';
import './Moon.css';

// ──────────────────────────────────────────────────────────────────────
// Big rubberhose crescent — opens LEFT, dramatically curved, weathered.
// Cracks, craters, jaw hatch, bloodshot eye, sneering mouth, red-glowing
// scar. Brass cog mount peeks out behind upper-right.
// ──────────────────────────────────────────────────────────────────────

export default function Moon() {
  const ref = useRef<SVGSVGElement>(null);
  const [open, setOpen] = useState(false);
  const [pupil, setPupil] = useState({ dx: 0, dy: 0 });
  const targetRef = useRef({ dx: 0, dy: 0 });

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

  return (
    <svg
      ref={ref}
      className="moon"
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

      {/* brass specimen nameplate — "WHERE'S CRENSHAW?" — sits below the lower tip */}
      <g className="moonNameplate" transform="translate(220, 818)">
        <rect x="-180" y="-26" width="360" height="52" rx="3" className="moonPlate" />
        <rect x="-170" y="-18" width="340" height="36" rx="2" className="moonPlateInner" />
        <circle cx="-162" cy="0" r="3.2" className="moonPlateRivet" />
        <circle cx="162"  cy="0" r="3.2" className="moonPlateRivet" />
        <text x="0" y="6" className="moonPlateText" textAnchor="middle">WHERE'S CRENSHAW?</text>
      </g>


      {/* === brass cog mount, peeks behind upper-right === */}
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

      {/* === crescent body — opens LEFT, dramatic curve === */}
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
        <ellipse cx="445" cy="400" rx="32" ry="14" />
        <ellipse cx="445" cy="397" rx="32" ry="14" className="craterRim" />
        <ellipse cx="510" cy="290" rx="18" ry="9" />
        <ellipse cx="510" cy="288" rx="18" ry="9" className="craterRim" />
        <ellipse cx="380" cy="660" rx="26" ry="12" />
        <ellipse cx="380" cy="657" rx="26" ry="12" className="craterRim" />
        <ellipse cx="180" cy="600" rx="14" ry="7" />
        <ellipse cx="180" cy="598" rx="14" ry="7" className="craterRim" />
        <ellipse cx="540" cy="530" rx="11" ry="6" />
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

        {/* black iris — rolls toward cursor */}
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

        {/* === sneering mouth — asymmetric, downturned, one peek tooth === */}
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
