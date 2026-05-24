/**
 * HEjar — Refined Kurdish character SVG.
 *
 * Style guide (matches reference sticker art):
 *  • Chibi proportions — big head, short barrel body
 *  • Thick 2px cartoon outlines on every shape
 *  • Flat colours + subtle gradient shading
 *  • Grey → White → Character sticker ring via SVG filter
 *  • 5 animated poses that cross-fade at 0.45s
 *
 * ViewBox : 0 0 140 182
 * Displayed: 112 × 145 CSS px
 */

const POSES = ["idle", "greeting", "thinking", "talking", "excited"];
const OL = "#1A1A22";   // outline colour
const OW = 1.8;         // outline strokeWidth

export function HEjarSVG({ pose = "idle" }) {
  return (
    <svg
      width="112"
      height="145"
      viewBox="0 0 140 182"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {/* ── Sticker ring: grey outer → white inner → character ── */}
        <filter id="hj-sticker" x="-16%" y="-12%" width="132%" height="126%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="8" result="big" />
          <feFlood floodColor="#BBBBC4" result="grey" />
          <feComposite in="grey" in2="big" operator="in" result="greyRing" />

          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="med" />
          <feFlood floodColor="white" result="white" />
          <feComposite in="white" in2="med" operator="in" result="whiteRing" />

          <feMerge>
            <feMergeNode in="greyRing" />
            <feMergeNode in="whiteRing" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Skin — radial gradient, highlight top-left */}
        <radialGradient id="hj-skin" cx="36%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#F8EACE" />
          <stop offset="70%" stopColor="#EDD9B0" />
          <stop offset="100%" stopColor="#D4BC90" />
        </radialGradient>

        {/* Turban — subtle side-to-side highlight */}
        <linearGradient id="hj-turban" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#141418" />
          <stop offset="40%"  stopColor="#26262E" />
          <stop offset="60%"  stopColor="#26262E" />
          <stop offset="100%" stopColor="#141418" />
        </linearGradient>

        {/* Jacket — warm brown */}
        <linearGradient id="hj-jacket" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3A2616" />
          <stop offset="50%"  stopColor="#5C3C22" />
          <stop offset="100%" stopColor="#3A2616" />
        </linearGradient>

        {/* Sash — near-black with slight variation */}
        <linearGradient id="hj-sash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#222228" />
          <stop offset="100%" stopColor="#18181E" />
        </linearGradient>

        {/* Trousers — brown */}
        <linearGradient id="hj-pants" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#46301E" />
          <stop offset="55%"  stopColor="#5C3E28" />
          <stop offset="100%" stopColor="#46301E" />
        </linearGradient>

        {/* Moustache */}
        <radialGradient id="hj-stache" cx="50%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#5A1414" />
          <stop offset="100%" stopColor="#2C0808" />
        </radialGradient>
      </defs>

      {/* ═══════════════════════════════════════════════════════
          Everything inside the sticker filter
          ═══════════════════════════════════════════════════════ */}
      <g filter="url(#hj-sticker)">

        {/* Ground shadow */}
        <ellipse cx="70" cy="179" rx="36" ry="5" fill="rgba(0,0,0,0.16)" />

        {/* Legs & shoes — drawn first, below body */}
        <Legs />

        {/* Arms BEHIND body */}
        {POSES.map((p) => (
          <g key={p} style={{ opacity: p === pose ? 1 : 0, transition: "opacity 0.45s ease" }}>
            <BackArms pose={p} />
          </g>
        ))}

        {/* Body */}
        <Body />

        {/* Arms IN FRONT of body */}
        {POSES.map((p) => (
          <g key={p} style={{ opacity: p === pose ? 1 : 0, transition: "opacity 0.45s ease" }}>
            <FrontArms pose={p} />
          </g>
        ))}

        {/* Head — per-pose tilt applied here */}
        {POSES.map((p) => (
          <g
            key={p}
            style={{
              opacity: p === pose ? 1 : 0,
              transition: "opacity 0.45s ease",
            }}
          >
            <Head pose={p} />
          </g>
        ))}

      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEGS & SHOES
   ═══════════════════════════════════════════════════════════════════════════ */
function Legs() {
  return (
    <g>
      {/* Left trouser leg — baggy, tapers slightly at ankle */}
      <path
        d="M 36 150 Q 33 163 32 174 L 50 174 Q 52 163 56 150 Z"
        fill="url(#hj-pants)" stroke={OL} strokeWidth={OW}
      />
      {/* Left leg highlight */}
      <path d="M 38 150 Q 36 162 35 172 L 44 172 Q 45 162 47 150 Z"
        fill="#7A5838" opacity="0.25" />

      {/* Right trouser leg */}
      <path
        d="M 84 150 Q 88 163 88 174 L 108 174 Q 107 163 104 150 Z"
        fill="url(#hj-pants)" stroke={OL} strokeWidth={OW}
      />
      {/* Right leg highlight */}
      <path d="M 86 150 Q 89 162 90 172 L 100 172 Q 99 162 97 150 Z"
        fill="#7A5838" opacity="0.25" />

      {/* ── Left shoe ── */}
      <path
        d="M 22 171 Q 23 165 41 163 Q 54 165 56 171 Q 54 178 41 178 Q 24 178 22 171 Z"
        fill="#E8E4DE" stroke={OL} strokeWidth={OW}
      />
      {/* Sole stripes */}
      <path d="M 24 171 Q 41 168 55 171" stroke="#CC2222" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 23 174 Q 41 171 55 174" stroke="#2233BB" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Toe cap */}
      <path d="M 22 171 Q 28 165 34 164" stroke="#D0CCC6" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ── Right shoe ── */}
      <path
        d="M 84 171 Q 86 165 99 163 Q 116 165 118 171 Q 116 178 99 178 Q 82 178 84 171 Z"
        fill="#E8E4DE" stroke={OL} strokeWidth={OW}
      />
      {/* Sole stripes */}
      <path d="M 85 171 Q 99 168 117 171" stroke="#CC2222" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 85 174 Q 99 171 117 174" stroke="#2233BB" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Toe cap */}
      <path d="M 118 171 Q 112 165 106 164" stroke="#D0CCC6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BODY — jacket collar + dominant sash
   ═══════════════════════════════════════════════════════════════════════════ */
function Body() {
  return (
    <g>
      {/* ── Jacket base — barrel shape ── */}
      {/* The body is a wide rounded barrel */}
      <path
        d="M 20 102 C 12 118 12 140 18 154 L 122 154 C 128 140 128 118 120 102 C 102 94 82 90 70 90 C 58 90 38 94 20 102 Z"
        fill="url(#hj-jacket)" stroke={OL} strokeWidth={OW}
      />
      {/* Jacket body highlight (centre chest) */}
      <path
        d="M 20 102 C 16 116 16 136 20 150 L 38 150 C 36 136 36 116 32 106 Z"
        fill="#7A5030" opacity="0.30"
      />
      <path
        d="M 120 102 C 124 116 124 136 120 150 L 102 150 C 104 136 104 116 108 106 Z"
        fill="#7A5030" opacity="0.30"
      />

      {/* Collar / lapels */}
      <path
        d="M 60 90 L 57 104 L 70 98 L 83 104 L 80 90"
        fill="#4A3020" stroke={OL} strokeWidth="1.2"
      />
      <path d="M 60 90 L 70 98 L 80 90" stroke="#2A1808" strokeWidth="0.8" fill="none" />

      {/* White shirt visible at collar */}
      <path d="M 63 90 L 70 95 L 77 90" fill="white" stroke={OL} strokeWidth="0.8" />

      {/* Jacket buttons */}
      <circle cx="64" cy="96" r="2.6" fill="#2A1C10" stroke={OL} strokeWidth="0.8" />
      <circle cx="76" cy="96" r="2.6" fill="#2A1C10" stroke={OL} strokeWidth="0.8" />

      {/* ── Black sash — the dominant feature ── */}
      {/* Sash shape covers most of the body */}
      <path
        d="M 16 112 C 12 122 14 142 18 154 L 122 154 C 126 142 128 122 124 112 C 106 106 88 102 70 102 C 52 102 34 106 16 112 Z"
        fill="url(#hj-sash)" stroke={OL} strokeWidth={OW}
      />

      {/* Sash wrap lines — horizontal curved bands */}
      <path d="M 18 120 C 44 115 96 115 122 120" stroke="#30303A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 17 129 C 44 124 96 124 123 129" stroke="#28282E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 17 138 C 44 133 96 133 123 138" stroke="#30303A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M 17 147 C 44 142 96 142 123 147" stroke="#28282E" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* Sash top highlight strip */}
      <path
        d="M 16 112 C 44 107 96 107 124 112 C 96 116 44 116 16 112 Z"
        fill="#3C3C48" opacity="0.65"
      />

      {/* Sash bottom / trouser transition */}
      <path
        d="M 18 154 C 44 150 96 150 122 154"
        stroke="#0E0E14" strokeWidth="1.4" fill="none"
      />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARMS — behind body
   ═══════════════════════════════════════════════════════════════════════════ */
const SLEEVE = "#4A3020";
const CUFF   = "#F2F0EA";
const SKIN   = "#EEDDBA";
const AW     = 14;   // arm stroke width

function BackArms({ pose }) {
  if (pose === "idle") {
    return (
      <g>
        <Arm path="M 22 106 Q 14 122 14 138" cuffAt={[13,141]} handAt={[12,148]} handRx={10} handRy={8.5} />
        <Arm path="M 118 106 Q 126 122 126 138" cuffAt={[127,141]} handAt={[128,148]} handRx={10} handRy={8.5} />
      </g>
    );
  }
  if (pose === "greeting") {
    // right arm hangs, left is raised (front)
    return <Arm path="M 118 106 Q 126 122 126 138" cuffAt={[127,141]} handAt={[128,148]} handRx={10} handRy={8.5} />;
  }
  if (pose === "thinking") {
    // left arm hangs, right is raised (front)
    return <Arm path="M 22 106 Q 14 124 14 142" cuffAt={[13,145]} handAt={[12,152]} handRx={10} handRy={8.5} />;
  }
  if (pose === "talking") {
    // right arm hangs
    return <Arm path="M 118 106 Q 126 122 126 138" cuffAt={[127,141]} handAt={[128,148]} handRx={10} handRy={8.5} />;
  }
  // excited — both arms raised, all front
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARMS — in front of body
   ═══════════════════════════════════════════════════════════════════════════ */
function FrontArms({ pose }) {
  if (pose === "idle") return null;

  if (pose === "greeting") {
    return (
      <g className="hj-wave-arm">
        {/* Left arm raised high */}
        <Arm path="M 22 106 Q 12 86 10 64" cuffAt={[9,60]} handAt={[7,52]} handRx={11} handRy={9.5} />
        <WavingFingers cx={6} cy={48} />
      </g>
    );
  }

  if (pose === "thinking") {
    return (
      <g>
        {/* Right arm bent — hand near chin */}
        <path
          d="M 118 106 C 130 114 132 96 116 82"
          stroke={SLEEVE} strokeWidth={AW} strokeLinecap="round" fill="none"
        />
        {/* Cuff */}
        <circle cx="113" cy="79" r="7.5" fill={CUFF} stroke={OL} strokeWidth="1.2" />
        {/* Hand at chin area */}
        <ellipse cx="108" cy="75" rx="11" ry="9"
          fill={SKIN} stroke={OL} strokeWidth="1.2"
          transform="rotate(-30, 108, 75)" />
        {/* Knuckle hint */}
        <path d="M 103 71 Q 107 67 112 69" stroke="#C8A878" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M 108 68 Q 113 64 117 66" stroke="#C8A878" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    );
  }

  if (pose === "talking") {
    return (
      <g className="hj-talk-arm">
        {/* Left arm gesturing outward */}
        <Arm path="M 22 106 Q 6 92 4 74" cuffAt={[3,70]} handAt={[1,62]} handRx={11} handRy={9.5} />
        <OpenPalmFingers cx={0} cy={57} dir="left" />
      </g>
    );
  }

  if (pose === "excited") {
    return (
      <g>
        {/* Both arms raised */}
        <Arm path="M 22 106 Q 12 86 10 64" cuffAt={[9,60]} handAt={[7,52]} handRx={11} handRy={9.5} />
        <WavingFingers cx={6} cy={48} />
        <Arm path="M 118 106 Q 128 86 130 64" cuffAt={[131,60]} handAt={[133,52]} handRx={11} handRy={9.5} />
        <WavingFingers cx={134} cy={48} flip />
      </g>
    );
  }

  return null;
}

/* ─── Arm helper: sleeve path + cuff circle + hand ellipse ─── */
function Arm({ path, cuffAt, handAt, handRx, handRy }) {
  return (
    <>
      {/* Sleeve */}
      <path d={path} stroke={SLEEVE} strokeWidth={AW} strokeLinecap="round" fill="none" />
      {/* Sleeve outline — faint darker edge */}
      <path d={path} stroke="#2A1A0E" strokeWidth={AW + 2} strokeLinecap="round" fill="none" opacity="0.18" />
      {/* Cuff */}
      <circle cx={cuffAt[0]} cy={cuffAt[1]} r="7.5" fill={CUFF} stroke={OL} strokeWidth="1.2" />
      {/* Hand */}
      <ellipse cx={handAt[0]} cy={handAt[1]} rx={handRx} ry={handRy}
        fill={SKIN} stroke={OL} strokeWidth="1.2" />
    </>
  );
}

/* ─── Open waving hand with 4 stubby fingers ─── */
function WavingFingers({ cx, cy, flip }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${s}, 1)`}>
      {/* Palm */}
      <ellipse cx="0" cy="0" rx="10" ry="9" fill={SKIN} stroke={OL} strokeWidth="1.2" />
      {/* 4 fingers */}
      <path d="M -7 -5 Q -9 -12 -6 -13 Q -3 -14 -3 -7" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M -3 -7 Q -4 -14 -1 -15 Q  2 -15  2 -8" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M  2 -8 Q  2 -15  5 -15 Q  8 -14  7 -7" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M  6 -6 Q  8 -12 11 -11 Q 13  -9 10  -4" fill={SKIN} stroke={OL} strokeWidth="1" />
    </g>
  );
}

/* ─── Open palm (talking gesture) ─── */
function OpenPalmFingers({ cx, cy, dir }) {
  const angle = dir === "left" ? 20 : -20;
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
      <ellipse cx="0" cy="0" rx="10" ry="9" fill={SKIN} stroke={OL} strokeWidth="1.2" />
      <path d="M -7 -4 Q -8 -11 -5 -12 Q -2 -13 -2 -6" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M -2 -6 Q -3 -13  0 -14 Q  3 -14  3 -7" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M  3 -7 Q  3 -14  6 -14 Q  9 -13  8 -6" fill={SKIN} stroke={OL} strokeWidth="1" />
      <path d="M  7 -5 Q  9 -11 12 -10 Q 13  -8 11  -3" fill={SKIN} stroke={OL} strokeWidth="1" />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEAD — turban + face, with per-pose tilt
   ═══════════════════════════════════════════════════════════════════════════ */
function Head({ pose }) {
  const tilt =
    pose === "thinking" ? 9 :
    pose === "excited"  ? -5 :
    pose === "greeting" ? -4 : 0;

  return (
    /* Rotate around base of neck */
    <g style={{ transformOrigin: "70px 92px", transform: `rotate(${tilt}deg)`, transition: "transform 0.5s ease" }}>
      <Turban />
      <Face pose={pose} />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TURBAN (Jemadani)
   ═══════════════════════════════════════════════════════════════════════════ */
function Turban() {
  return (
    <g>
      {/* Main dome body */}
      <path
        d="M 14 56 C 10 38 14 16 26 8 Q 44 2 70 2 Q 96 2 114 8 C 126 16 130 38 126 56 Q 100 64 70 64 Q 40 64 14 56 Z"
        fill="url(#hj-turban)" stroke={OL} strokeWidth={OW}
      />

      {/* Wrap texture lines — 5 horizontal arcs suggesting coiled cloth */}
      <path d="M 16 50 C 42 44 98 44 124 50" stroke="#2E2E3A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 15 42 C 42 36 98 36 125 42" stroke="#2A2A36" strokeWidth="2"   fill="none" strokeLinecap="round" />
      <path d="M 16 34 C 42 28 98 28 124 34" stroke="#2E2E3A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 20 26 C 44 20 96 20 120 26" stroke="#2A2A36" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 26 18 C 46 13 94 13 114 18" stroke="#282830" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* Top highlight — subtle sheen */}
      <ellipse cx="60" cy="18" rx="22" ry="9" fill="white" opacity="0.05" />

      {/* Bottom edge shadow where turban meets face */}
      <path
        d="M 14 56 C 40 64 100 64 126 56"
        stroke="#0A0A10" strokeWidth="1.6" fill="none"
      />
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FACE
   ═══════════════════════════════════════════════════════════════════════════ */
function Face({ pose }) {
  const isThinking = pose === "thinking";
  const isTalking  = pose === "talking";
  const isExcited  = pose === "excited";
  const isGreeting = pose === "greeting";

  return (
    <g>
      {/* Face oval */}
      <ellipse
        cx="70" cy="76" rx="28" ry="26"
        fill="url(#hj-skin)" stroke={OL} strokeWidth={OW}
      />

      {/* Face highlight */}
      <ellipse cx="61" cy="66" rx="17" ry="13" fill="white" opacity="0.10" />

      {/* Cheeks */}
      <ellipse cx="48" cy="78" rx="9"  ry="7"  fill="#E09070" opacity="0.26" />
      <ellipse cx="92" cy="78" rx="9"  ry="7"  fill="#E09070" opacity="0.26" />

      {/* Ears */}
      <path d="M 42 68 Q 37 76 42 84 Q 46 80 46 76 Q 46 72 42 68 Z"
        fill="#DEC890" stroke={OL} strokeWidth="1.3" />
      <path d="M 98 68 Q 103 76 98 84 Q 94 80 94 76 Q 94 72 98 68 Z"
        fill="#DEC890" stroke={OL} strokeWidth="1.3" />
      <path d="M 42 70 Q 39 76 42 82 Q 44 78 44 76 Q 44 74 42 70 Z"
        fill="#C8AE7C" />
      <path d="M 98 70 Q 101 76 98 82 Q 96 78 96 76 Q 96 74 98 70 Z"
        fill="#C8AE7C" />

      {/* ── Eyebrows — thick and expressive ── */}
      <path
        d={isThinking
          ? "M 52 61 Q 59 56 66 60"   // furrowed inward
          : isGreeting
            ? "M 52 59 Q 59 55 66 58" // raised happy
            : "M 52 62 Q 59 58 66 62" // normal
        }
        stroke="#2A1A08" strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      <path
        d={isThinking
          ? "M 74 60 Q 81 56 88 61"
          : isGreeting
            ? "M 74 58 Q 81 55 88 59"
            : "M 74 62 Q 81 58 88 62"
        }
        stroke="#2A1A08" strokeWidth="3.5" strokeLinecap="round" fill="none"
      />

      {/* ── Eyes ── */}
      {isExcited ? (
        /* Happy closed eyes */
        <>
          <path d="M 53 68 Q 59 63 65 68" stroke={OL} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 75 68 Q 81 63 87 68" stroke={OL} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Sclera */}
          <circle cx="59" cy="70" r="6"   fill="white" stroke={OL} strokeWidth="1" />
          <circle cx="81" cy="70" r="6"   fill="white" stroke={OL} strokeWidth="1" />
          {/* Iris + pupil */}
          <circle cx="59" cy="70" r="3.8" fill="#181010" />
          <circle cx="81" cy="70" r="3.8" fill="#181010" />
          {/* Catchlights */}
          <circle cx="61"  cy="68.2" r="1.5" fill="white" />
          <circle cx="83"  cy="68.2" r="1.5" fill="white" />
          {/* Upper eyelid fold */}
          <path d="M 53 70 Q 59 65 65 70" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" fill="none" />
          <path d="M 75 70 Q 81 65 87 70" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" fill="none" />
          {/* Eyelash dots (cartoon style) */}
          <circle cx="54" cy="67" r="1" fill={OL} opacity="0.5" />
          <circle cx="86" cy="67" r="1" fill={OL} opacity="0.5" />
        </>
      )}

      {/* Nose — subtle curved bump */}
      <path d="M 67 78 Q 70 82 73 78" stroke="#C09868" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Nostril dots */}
      <circle cx="67.5" cy="79.5" r="1.4" fill="#B88858" opacity="0.7" />
      <circle cx="72.5" cy="79.5" r="1.4" fill="#B88858" opacity="0.7" />

      {/* ══════════════════════════════════════════════════
          THE MOUSTACHE — the character's signature feature
          ══════════════════════════════════════════════════ */}
      {/* Main moustache body */}
      <path
        d="
          M 40 85
          Q 50 80 62 84
          Q 66 82 70 85
          Q 74 82 78 84
          Q 90 80 100 85
          Q 108 92 102 99
          Q 96 105 88 103
          Q 80 101 74 95
          Q 72 93 70 94
          Q 68 93 66 95
          Q 60 101 52 103
          Q 44 105 38 99
          Q 32 92 40 85 Z
        "
        fill="url(#hj-stache)" stroke={OL} strokeWidth="1.6"
      />
      {/* Moustache top highlight — lighter strip */}
      <path
        d="
          M 42 86
          Q 53 82 63 85
          Q 66 83 70 86
          Q 74 83 77 85
          Q 87 82 98 86
          Q 104 91 98 96
          Q 90 90 78 90
          Q 74 88 70 90
          Q 66 88 62 90
          Q 50 90 42 96
          Q 36 91 42 86 Z
        "
        fill="#6A2020" opacity="0.45"
      />
      {/* Moustache sheen — subtle shine line across top */}
      <path d="M 50 85 Q 62 82 70 84 Q 78 82 90 85"
        stroke="#8A3030" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* ── Mouth — below the moustache ── */}
      {isTalking ? (
        <>
          {/* Open mouth */}
          <path d="M 60 101 Q 70 109 80 101" stroke="#8A4020" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 60 101 Q 70 108 80 101 Q 78 113 70 114 Q 62 113 60 101 Z"
            fill="#B84828" opacity="0.88" />
          {/* Teeth hint */}
          <path d="M 63 102 Q 70 105 77 102" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : isExcited || isGreeting ? (
        /* Big smile */
        <path d="M 58 101 Q 70 111 82 101" stroke="#8A4020" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      ) : isThinking ? (
        /* Hmm — slight pursed look */
        <path d="M 62 102 Q 70 104 78 102" stroke="#8A4020" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        /* Neutral pleasant */
        <path d="M 60 102 Q 70 108 80 102" stroke="#8A4020" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}
