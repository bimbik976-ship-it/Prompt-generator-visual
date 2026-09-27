/**
 * High-craft SVG visual renderer that generates rich, photorealistic,
 * resolution-independent environmental zen garden water basin scenes.
 */

export function generatePhotorealisticZenImage(params: {
  prompt: string;
  aspectRatio: string;
  modelName: string;
}): string {
  const { prompt, aspectRatio } = params;

  // Aspect ratio dimensions
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  } else if (aspectRatio === '3:4') {
    width = 768;
    height = 1024;
  } else if (aspectRatio === '21:9') {
    width = 1344;
    height = 576;
  }

  // Detect visual tones from prompt
  const isGoldenHour = prompt.toLowerCase().includes('golden') || prompt.toLowerCase().includes('amber');
  const isTwilight = prompt.toLowerCase().includes('twilight') || prompt.toLowerCase().includes('moonlit');
  const isMisty = prompt.toLowerCase().includes('mist') || prompt.toLowerCase().includes('fog');
  const isLotus = prompt.toLowerCase().includes('lotus') || prompt.toLowerCase().includes('lily');
  const isCherry = prompt.toLowerCase().includes('cherry') || prompt.toLowerCase().includes('sakura');
  const isGranite = prompt.toLowerCase().includes('granite') || prompt.toLowerCase().includes('grey') || prompt.toLowerCase().includes('gray');
  const isBasalt = prompt.toLowerCase().includes('basalt') || prompt.toLowerCase().includes('dark') || prompt.toLowerCase().includes('black');

  // Palette calculation
  const bgGrad1 = isGoldenHour ? '#2d2417' : isTwilight ? '#111827' : isMisty ? '#202a28' : '#1a241b';
  const bgGrad2 = isGoldenHour ? '#1a140d' : isTwilight ? '#090d14' : isMisty ? '#111716' : '#0c120d';
  const lightGlow = isGoldenHour ? 'rgba(255, 190, 100, 0.25)' : isTwilight ? 'rgba(147, 197, 253, 0.15)' : 'rgba(210, 240, 220, 0.2)';

  const stoneBase = isBasalt ? '#242729' : isGranite ? '#52555a' : '#3d4043';
  const stoneHighlight = isBasalt ? '#3f4347' : isGranite ? '#70747a' : '#575b61';
  const flowerColor = isCherry ? '#fbcfe8' : isLotus ? '#ffffff' : '#fef08a';
  const flowerCenter = isCherry ? '#db2777' : '#f59e0b';

  const basinCx = width * 0.5;
  const basinCy = height * 0.65;
  const basinRx = width * 0.36;
  const basinRy = height * 0.22;

  const waterCx = basinCx;
  const waterCy = basinCy - 6;
  const waterRx = basinRx * 0.86;
  const waterRy = basinRy * 0.82;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad1}" />
        <stop offset="65%" stop-color="${bgGrad2}" />
        <stop offset="100%" stop-color="#070908" />
      </linearGradient>

      <radialGradient id="lightBeam" cx="45%" cy="30%" r="65%">
        <stop offset="0%" stop-color="${lightGlow}" />
        <stop offset="100%" stop-color="rgba(0,0,0,0)" />
      </radialGradient>

      <linearGradient id="stoneOuter" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${stoneHighlight}" />
        <stop offset="50%" stop-color="${stoneBase}" />
        <stop offset="100%" stop-color="#141517" />
      </linearGradient>

      <radialGradient id="waterGrad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#1b4332" />
        <stop offset="60%" stop-color="#0f2b20" />
        <stop offset="90%" stop-color="#081812" />
        <stop offset="100%" stop-color="#040d0a" />
      </radialGradient>

      <linearGradient id="bambooGrad" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#557a46" />
        <stop offset="40%" stop-color="#739055" />
        <stop offset="70%" stop-color="#476839" />
        <stop offset="100%" stop-color="#2a4022" />
      </linearGradient>

      <filter id="blurSoft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
      
      <filter id="waterGleam" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.2" specularExponent="20" result="spec">
          <fePointLight x="${basinCx + 50}" y="${basinCy - 60}" z="180" />
        </feSpecularLighting>
        <feComposite in="SourceGraphic" in2="spec" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>
    </defs>

    <!-- Background Environment -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#lightBeam)" />

    <!-- Soft Depth Background Bamboo Stalks -->
    <g opacity="0.35" filter="url(#blurSoft)">
      <rect x="${width * 0.12}" y="0" width="${width * 0.035}" height="${height * 0.75}" fill="#385437" rx="6" />
      <rect x="${width * 0.22}" y="0" width="${width * 0.04}" height="${height * 0.8}" fill="#2e472d" rx="8" />
      <rect x="${width * 0.80}" y="0" width="${width * 0.03}" height="${height * 0.7}" fill="#334f32" rx="5" />
      <rect x="${width * 0.88}" y="0" width="${width * 0.045}" height="${height * 0.82}" fill="#273e26" rx="9" />
    </g>

    <!-- Garden Floor: Moss and Stepping Stones -->
    <ellipse cx="${basinCx}" cy="${height * 0.85}" rx="${width * 0.55}" ry="${height * 0.26}" fill="#1e2c1e" opacity="0.9" />
    <ellipse cx="${basinCx - width * 0.3}" cy="${height * 0.82}" rx="${width * 0.18}" ry="${height * 0.1}" fill="#252e25" />
    <ellipse cx="${basinCx + width * 0.32}" cy="${height * 0.8}" rx="${width * 0.19}" ry="${height * 0.11}" fill="#222922" />

    <!-- Foreground Textured Rocks -->
    <path d="M ${width * 0.05} ${height * 0.75} Q ${width * 0.15} ${height * 0.65} ${width * 0.28} ${height * 0.78} Q ${width * 0.32} ${height * 0.95} ${width * 0.1} ${height * 0.98} Z" fill="#2d3238" />
    <path d="M ${width * 0.72} ${height * 0.77} Q ${width * 0.85} ${height * 0.68} ${width * 0.96} ${height * 0.82} Q ${width * 0.92} ${height * 0.98} ${width * 0.7} ${height * 0.95} Z" fill="#292e34" />

    <!-- Moss Clumps -->
    <ellipse cx="${width * 0.18}" cy="${height * 0.72}" rx="${width * 0.08}" ry="${height * 0.04}" fill="#405c31" opacity="0.8" />
    <ellipse cx="${width * 0.81}" cy="${height * 0.74}" rx="${width * 0.09}" ry="${height * 0.045}" fill="#3b572c" opacity="0.85" />

    <!-- The Master Basin (Main Outer Solid Stone) -->
    <ellipse cx="${basinCx}" cy="${basinCy + 14}" rx="${basinRx}" ry="${basinRy}" fill="#16181a" />
    <ellipse cx="${basinCx}" cy="${basinCy}" rx="${basinRx}" ry="${basinRy}" fill="url(#stoneOuter)" />
    
    <!-- Chiselled / Organic Rim Details -->
    <ellipse cx="${basinCx}" cy="${basinCy - 2}" rx="${basinRx * 0.95}" ry="${basinRy * 0.94}" fill="#1c1f21" />

    <!-- Still Mirrored Water Surface inside Basin -->
    <ellipse cx="${waterCx}" cy="${waterCy}" rx="${waterRx}" ry="${waterRy}" fill="url(#waterGrad)" filter="url(#waterGleam)" />

    <!-- Bamboo Spout (Kakehi) -->
    <g transform="rotate(18, ${width * 0.7}, ${height * 0.35})">
      <!-- Outer Bamboo Tube -->
      <rect x="${width * 0.52}" y="${height * 0.32}" width="${width * 0.32}" height="${height * 0.048}" fill="url(#bambooGrad)" rx="6" />
      <!-- Bamboo Node Ridge -->
      <rect x="${width * 0.64}" y="${height * 0.315}" width="${width * 0.012}" height="${height * 0.058}" fill="#2e4225" rx="3" />
      <!-- Bamboo Cut Lip -->
      <ellipse cx="${width * 0.52}" cy="${height * 0.344}" rx="${width * 0.015}" ry="${height * 0.024}" fill="#1a2b16" />
    </g>

    <!-- Continuous Water Stream pouring into basin -->
    <path d="M ${width * 0.58} ${height * 0.44} Q ${width * 0.57} ${basinCy - 10} ${width * 0.56} ${basinCy - 2}" 
          stroke="rgba(255, 255, 255, 0.75)" stroke-width="4.5" fill="none" stroke-linecap="round" />
    <path d="M ${width * 0.582} ${height * 0.44} Q ${width * 0.573} ${basinCy - 10} ${width * 0.564} ${basinCy - 2}" 
          stroke="rgba(200, 240, 255, 0.9)" stroke-width="2" fill="none" />

    <!-- Concentric Water Ripples -->
    <ellipse cx="${width * 0.56}" cy="${basinCy - 2}" rx="${width * 0.05}" ry="${height * 0.02}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <ellipse cx="${width * 0.56}" cy="${basinCy - 2}" rx="${width * 0.11}" ry="${height * 0.045}" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.6" />
    <ellipse cx="${width * 0.56}" cy="${basinCy - 2}" rx="${width * 0.18}" ry="${height * 0.075}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
    <ellipse cx="${width * 0.56}" cy="${basinCy - 2}" rx="${width * 0.26}" ry="${height * 0.11}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />

    <!-- Floating Lotus / Lily Flower Blossom on Water Surface -->
    <g transform="translate(${waterCx - width * 0.12}, ${waterCy + height * 0.03})">
      <!-- Petals Layer 1 (Outer) -->
      <ellipse cx="0" cy="-14" rx="10" ry="20" fill="${flowerColor}" opacity="0.95" />
      <ellipse cx="14" cy="-8" rx="10" ry="19" fill="${flowerColor}" transform="rotate(35 14 -8)" opacity="0.95" />
      <ellipse cx="-14" cy="-8" rx="10" ry="19" fill="${flowerColor}" transform="rotate(-35 -14 -8)" opacity="0.95" />
      <ellipse cx="18" cy="8" rx="10" ry="18" fill="${flowerColor}" transform="rotate(75 18 8)" opacity="0.9" />
      <ellipse cx="-18" cy="8" rx="10" ry="18" fill="${flowerColor}" transform="rotate(-75 -18 8)" opacity="0.9" />
      <!-- Petals Layer 2 (Inner) -->
      <ellipse cx="0" cy="-6" rx="7" ry="15" fill="#ffffff" />
      <ellipse cx="7" cy="-2" rx="7" ry="14" fill="#ffffff" transform="rotate(30 7 -2)" />
      <ellipse cx="-7" cy="-2" rx="7" ry="14" fill="#ffffff" transform="rotate(-30 -7 -2)" />
      <!-- Flower Center Stamen -->
      <circle cx="0" cy="0" r="7" fill="${flowerCenter}" />
      <circle cx="0" cy="0" r="4" fill="#fef08a" />
      <!-- Water Contact Shadow -->
      <ellipse cx="0" cy="18" rx="24" ry="7" fill="rgba(0,0,0,0.4)" />
    </g>

    <!-- Warm Ambient Candle / Stone Lantern Glow on the Right -->
    <g transform="translate(${width * 0.82}, ${basinCy - height * 0.08})">
      <ellipse cx="0" cy="22" rx="22" ry="8" fill="#1b1c1e" />
      <rect x="-18" y="-30" width="36" height="50" fill="#272a2e" rx="4" />
      <!-- Lantern Window Grid -->
      <rect x="-12" y="-22" width="24" height="34" fill="#fbbf24" opacity="0.85" rx="2" />
      <line x1="-12" y1="-5" x2="12" y2="-5" stroke="#1f2226" stroke-width="3" />
      <line x1="0" y1="-22" x2="0" y2="12" stroke="#1f2226" stroke-width="3" />
      <!-- Radial Lantern Glow -->
      <circle cx="0" cy="-5" r="45" fill="rgba(251, 191, 36, 0.25)" filter="url(#blurSoft)" />
      <!-- Roof Pyramid -->
      <polygon points="0,-48 -24,-30 24,-30" fill="#181a1c" />
    </g>

    <!-- Delicate Micro Droplets on Basin Rim -->
    <circle cx="${basinCx - basinRx * 0.7}" cy="${basinCy - basinRy * 0.6}" r="2" fill="rgba(255,255,255,0.85)" />
    <circle cx="${basinCx - basinRx * 0.65}" cy="${basinCy - basinRy * 0.62}" r="3" fill="rgba(255,255,255,0.9)" />
    <circle cx="${basinCx + basinRx * 0.5}" cy="${basinCy - basinRy * 0.7}" r="2.5" fill="rgba(255,255,255,0.85)" />
    <circle cx="${basinCx + basinRx * 0.54}" cy="${basinCy - basinRy * 0.68}" r="1.5" fill="rgba(255,255,255,0.75)" />

    <!-- Subtle Cinematic Vignette -->
    <rect width="${width}" height="${height}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="${Math.min(width, height) * 0.05}" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
