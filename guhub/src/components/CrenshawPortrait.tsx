import { motion } from 'framer-motion';
import './CrenshawPortrait.css';

// ──────────────────────────────────────────────────────────────────────
// Big stationary Crenshaw for the RPG dialog. Same silhouette as the
// hiding Anteater but larger, no escape, gentle idle breathing.
// ──────────────────────────────────────────────────────────────────────

export default function CrenshawPortrait() {
  return (
    <motion.div
      className="crenshawPortrait"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      >
        <svg viewBox="0 0 280 150" preserveAspectRatio="xMidYMid meet" className="crenshawPortraitSvg">
          {/* tail */}
          <path
            className="cpTail"
            d="M 200 80 C 220 64, 250 56, 268 72 C 280 88, 270 110, 250 110 C 232 110, 215 102, 205 96 C 200 92, 198 86, 200 80 Z"
          />
          <g className="cpTailFur">
            <line x1="218" y1="74" x2="222" y2="62" />
            <line x1="232" y1="68" x2="236" y2="56" />
            <line x1="248" y1="65" x2="254" y2="54" />
            <line x1="262" y1="68" x2="270" y2="60" />
            <line x1="266" y1="80" x2="276" y2="80" />
            <line x1="262" y1="94" x2="272" y2="100" />
            <line x1="248" y1="105" x2="254" y2="116" />
          </g>

          {/* body */}
          <path
            className="cpBody"
            d="M 8 78
               C 26 76, 50 74, 75 74
               C 82 73, 88 70, 92 64
               C 100 54, 115 48, 135 50
               C 158 52, 178 60, 192 70
               C 200 74, 206 80, 208 88
               C 208 96, 206 104, 200 110
               C 190 114, 178 114, 168 113
               C 154 113, 142 112, 130 113
               C 130 124, 130 132, 130 132
               L 140 132
               L 140 118
               C 140 112, 134 108, 124 108
               C 110 110, 92 112, 80 110
               C 80 122, 80 132, 80 132
               L 90 132
               L 90 118
               C 88 110, 82 104, 72 98
               C 64 94, 56 90, 50 87
               C 36 87, 22 86, 8 84
               Q 4 81, 8 78 Z"
          />

          <path className="cpEar" d="M 110 56 L 116 47 L 118 58 Z" />
          {/* bigger eye + brass monocle */}
          <circle cx="98" cy="62" r="5.5" className="cpGoggle" />
          <line x1="103" y1="63" x2="108" y2="59" className="cpGoggleArm" />
          <circle cx="98" cy="62" r="3.5" className="cpEye" />
          <circle cx="96.5" cy="60.5" r="1" className="cpGlint" />
          <ellipse cx="13" cy="80" rx="1.6" ry="1.1" className="cpNostril" />

          {/* shoulder stripe: dramatic diagonal black wedge with white borders */}
          <path className="cpStripeBlack" d="M 85 110 L 95 95 L 165 58 L 175 73 Z" />
          <path className="cpStripeWhite" d="M 95 95 L 165 58" />
          <path className="cpStripeWhite" d="M 85 110 L 175 73" />

          <g className="cpFur">
            {[[125, 55], [145, 56], [165, 62], [180, 66], [195, 72],
              [110, 78], [130, 80], [150, 82], [170, 84]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.1" />
            ))}
          </g>

          <g className="cpClaws">
            <path d="M 80 132 Q 78 138 76 142" />
            <path d="M 85 132 Q 85 139 86 144" />
            <path d="M 90 132 Q 92 138 95 142" />
          </g>
          <g className="cpClaws">
            <path d="M 130 132 Q 128 138 127 142" />
            <path d="M 135 132 Q 135 139 135 144" />
            <path d="M 140 132 Q 142 138 144 142" />
          </g>

          {/* gear, slowly turning */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '152px 76px' }}
          >
            <g transform="translate(152, 76)">
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x={-1.4} y={-9} width={2.8} height={3.5}
                      className="cpGearTooth" transform={`rotate(${i * 45})`} />
              ))}
              <circle r="6.5" className="cpGearRim" />
              <circle r="3.5" className="cpGearInner" />
              <circle r="1" className="cpGearBolt" />
            </g>
          </motion.g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
