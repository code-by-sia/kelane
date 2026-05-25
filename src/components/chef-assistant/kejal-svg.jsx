/**
 * ToqueSVG — minimal round character, Kodama-style.
 * Just a circle with a face: soft gradient body, dot eyes, simple mouth.
 * ViewBox : 0 0 110 110   Display: 110 × 110 CSS px
 */

import { useId } from "react";

const OL = "#1A1A22";

export function KejalSVG({ pose = "idle" }) {
  const uid = useId().replace(/:/g, "");
  const fid = `tqs-${uid}`;
  const gid = `tqg-${uid}`;

  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      data-pose={pose}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Sticker ring */}
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="7"  result="big" />
          <feFlood floodColor="#B8B8C0" result="grey" />
          <feComposite in="grey"  in2="big" operator="in" result="greyRing" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="3.5" result="med" />
          <feFlood floodColor="white" result="white" />
          <feComposite in="white" in2="med" operator="in" result="whiteRing" />
          <feMerge>
            <feMergeNode in="greyRing" />
            <feMergeNode in="whiteRing" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft radial gradient — bright centre, warm cream edge */}
        <radialGradient id={gid} cx="42%" cy="36%" r="66%">
          <stop offset="0%"   stopColor="#FFFFFF" />
          <stop offset="55%"  stopColor="#F7F3EC" />
          <stop offset="100%" stopColor="#E8E0D0" />
        </radialGradient>

        <style>{`
          .tq-pose { opacity: 0; transition: opacity 0.35s ease; }
          [data-pose="idle"]     .tq-pose--idle     { opacity: 1; }
          [data-pose="thinking"] .tq-pose--thinking { opacity: 1; }
          [data-pose="talking"]  .tq-pose--talking  { opacity: 1; }
          [data-pose="greeting"] .tq-pose--greeting { opacity: 1; }
          [data-pose="excited"]  .tq-pose--excited  { opacity: 1; }

          .tq-blink {
            transform-box: fill-box;
            transform-origin: center;
            animation: tqblink 5s ease-in-out infinite;
          }
          @keyframes tqblink {
            0%, 88%, 100% { transform: scaleY(1); }
            92%           { transform: scaleY(0.06); }
          }
        `}</style>
      </defs>

      <g filter={`url(#${fid})`}>

        {/* Body — squircle (superellipse-style rounded square) */}
        <rect x="5" y="5" width="100" height="100" rx="30" ry="30"
          fill={`url(#${gid})`} />

        {/* Gloss highlight */}
        <ellipse cx="36" cy="28" rx="18" ry="11"
          fill="white" opacity="0.28" transform="rotate(-15 36 28)" />

        {/* ════ POSE LAYERS ════
            Eyes:  L cx=37 cy=47  R cx=73 cy=47  (r≈8)
            Mouth: cy ≈ 70–78                              */}

        {/* ── IDLE — calm dot eyes, gentle smile ── */}
        <g className="tq-pose tq-pose--idle">
          {/* brows — neutral soft arch */}
          <path d="M 28 36 Q 37 31 46 36" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 64 36 Q 73 31 82 36" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <g className="tq-blink">
            <circle cx="37" cy="47" r="8" fill={OL} />
            <circle cx="73" cy="47" r="8" fill={OL} />
          </g>
          <circle cx="40" cy="44" r="2.8" fill="white" />
          <circle cx="76" cy="44" r="2.8" fill="white" />
          <path d="M 36 70 Q 55 80 74 70"
            stroke={OL} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* ── THINKING — eyes up-right, wavy mouth, thought dots ── */}
        <g className="tq-pose tq-pose--thinking">
          {/* brows — left slightly furrowed inward, right raised */}
          <path d="M 28 36 Q 37 33 46 37" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 64 33 Q 73 28 82 34" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="37" cy="47" r="8" fill={OL} />
          <circle cx="73" cy="47" r="8" fill={OL} />
          {/* pupils shifted up-right */}
          <circle cx="42" cy="43" r="2.8" fill="white" />
          <circle cx="78" cy="43" r="2.8" fill="white" />
          <path d="M 37 70 Q 46 67 55 70 Q 64 73 73 70"
            stroke={OL} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          {/* thought dots */}
          <circle cx="87" cy="26" r="4.5" fill="#ECEAE5" />
          <circle cx="94" cy="17" r="3.2" fill="#ECEAE5" />
          <circle cx="100" cy="10" r="2.2" fill="#ECEAE5" />
        </g>

        {/* ── TALKING — eyes open, oval mouth ── */}
        <g className="tq-pose tq-pose--talking">
          {/* brows — neutral, same as idle */}
          <path d="M 28 36 Q 37 31 46 36" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 64 36 Q 73 31 82 36" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <g className="tq-blink" style={{ animationDuration: "7s" }}>
            <circle cx="37" cy="47" r="8" fill={OL} />
            <circle cx="73" cy="47" r="8" fill={OL} />
          </g>
          <circle cx="40" cy="43" r="2.8" fill="white" />
          <circle cx="76" cy="43" r="2.8" fill="white" />
          <ellipse cx="55" cy="73" rx="9" ry="7.5" fill={OL} />
          <ellipse cx="55" cy="74" rx="6.5" ry="5.5" fill="#C04848" />
        </g>

        {/* ── GREETING — happy squint, big smile, blush ── */}
        <g className="tq-pose tq-pose--greeting">
          {/* brows — raised and arched, cheerful */}
          <path d="M 27 33 Q 37 27 47 33" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 63 33 Q 73 27 83 33" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="37" cy="47" r="8" fill={OL} />
          <circle cx="73" cy="47" r="8" fill={OL} />
          {/* squint — cover top half */}
          <path d="M 29 47 A 8 8 0 0 0 45 47 Z" fill={OL} />
          <path d="M 65 47 A 8 8 0 0 0 81 47 Z" fill={OL} />
          <path d="M 32 64 Q 55 80 78 64"
            stroke={OL} strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <ellipse cx="20" cy="62" rx="9" ry="5.5" fill="#FFB0B0" opacity="0.55" />
          <ellipse cx="90" cy="62" rx="9" ry="5.5" fill="#FFB0B0" opacity="0.55" />
        </g>

        {/* ── EXCITED — big eyes, wide open grin, blush, sparkles ── */}
        <g className="tq-pose tq-pose--excited">
          {/* brows — high and wide, very expressive */}
          <path d="M 26 31 Q 37 24 48 31" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 62 31 Q 73 24 84 31" stroke={OL} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="37" cy="47" r="10" fill={OL} />
          <circle cx="73" cy="47" r="10" fill={OL} />
          <circle cx="42" cy="42" r="3.5" fill="white" />
          <circle cx="78" cy="42" r="3.5" fill="white" />
          <circle cx="31" cy="53" r="1.8" fill="white" />
          <circle cx="67" cy="53" r="1.8" fill="white" />
          <path d="M 30 64 Q 55 82 80 64 Z" fill={OL} />
          <path d="M 31 65 Q 55 81 79 65 Z" fill="#C04848" />
          <path d="M 37 67 Q 55 76 73 67" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="18" cy="62" rx="10" ry="6" fill="#FFB0B0" opacity="0.6" />
          <ellipse cx="92" cy="62" rx="10" ry="6" fill="#FFB0B0" opacity="0.6" />
          {/* sparkles */}
          <path d="M -4 20 L -2 13 L 0 20 L 7 22 L 0 24 L -2 31 L -4 24 L -11 22 Z"
            fill="#FFD600" stroke="#C8A000" strokeWidth="0.7" />
          <path d="M 106 16 L 108 9 L 110 16 L 117 18 L 110 20 L 108 27 L 106 20 L 99 18 Z"
            fill="#FFD600" stroke="#C8A000" strokeWidth="0.7" />
        </g>

      </g>
    </svg>
  );
}
