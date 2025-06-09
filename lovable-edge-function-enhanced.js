const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate hash for caching purposes
const generateHash = (input) => crypto.createHash('md5').update(input).digest('hex');

/**
 * Generate a spool image with enhanced positioning for lovable.dev
 * @param {Object} options - Configuration options
 * @param {string} options.color - Text color (hex code)
 * @param {string} options.top - Top text
 * @param {string} options.bottom - Bottom text
 * @param {string} options.logo - Optional logo URL
 * @param {Object} options.positioning - Enhanced positioning parameters
 * @returns {Promise<{buffer: Buffer, hash: string}>} - Image buffer and hash
 */
async function generateEnhancedSpoolImage({ 
  color = '#00BFFF', 
  top = 'POLYMAKER', 
  bottom = 'PLA PRO', 
  logo = '', 
  positioning = null 
}) {
  // Use enhanced positioning parameters with center-based coordinates
  const pos = positioning || {
    // Top text (center-based coordinates)
    topX: 0,
    topY: -56,
    topSize: 37,
    topSkew: 0,
    topArch: 100,
    topArchHeight: 50,
    
    // Bottom text (center-based coordinates)
    bottomX: 0,
    bottomY: 56,
    bottomSize: 35,
    bottomSkew: 0,
    bottomArch: 100,
    bottomArchHeight: 50,
    
    // Logo (center-based coordinates)
    logoX: 0,
    logoY: 0,
    logoWidth: 252,
    logoHeight: 35,
    logoSkewX: 0,
    logoSkewY: 0
  };

  // Generate hash for caching
  const hash = generateHash(`${color}-${top}-${bottom}-${logo}-${JSON.stringify(pos)}`);

  // Read the base image and convert to base64
  const baseImagePath = path.join(process.cwd(), 'public', 'assets', 'spool_base.png');
  
  if (!fs.existsSync(baseImagePath)) {
    throw new Error(`Base spool image not found at: ${baseImagePath}`);
  }
  
  const imageBuffer = fs.readFileSync(baseImagePath);
  const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  // Convert center-based coordinates to SVG coordinates
  const centerX = 256;
  const centerY = 256;
  
  const topSvgX = centerX + parseInt(pos.topX);
  const topSvgY = centerY + parseInt(pos.topY);
  const bottomSvgX = centerX + parseInt(pos.bottomX);
  const bottomSvgY = centerY + parseInt(pos.bottomY);
  const logoSvgX = centerX + parseInt(pos.logoX);
  const logoSvgY = centerY + parseInt(pos.logoY);

  // Create arch paths
  const topStartX = topSvgX - parseInt(pos.topArch);
  const topEndX = topSvgX + parseInt(pos.topArch);
  const topArcPath = `M ${topStartX},${topSvgY} A ${pos.topArch},${pos.topArchHeight} 0 0,1 ${topEndX},${topSvgY}`;

  const bottomStartX = bottomSvgX + parseInt(pos.bottomArch);
  const bottomEndX = bottomSvgX - parseInt(pos.bottomArch);
  const bottomArcPath = `M ${bottomStartX},${bottomSvgY} A ${pos.bottomArch},${pos.bottomArchHeight} 0 0,1 ${bottomEndX},${bottomSvgY}`;

  // Create HTML template with enhanced positioning
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Arial&display=swap');
        body {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          overflow: hidden;
          background: transparent;
        }
        .spool-container {
          position: relative;
          width: 512px;
          height: 512px;
          background-image: url("${imageDataUrl}");
          background-size: 512px 512px;
          background-repeat: no-repeat;
          background-position: center;
        }
        .spool-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 512px;
          height: 512px;
        }
      </style>
    </head>
    <body>
      <div class="spool-container">
        <svg class="spool-overlay" width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Top arc path for curved text -->
            <path id="topArc" d="${topArcPath}" fill="none" />
            <!-- Bottom arc path for curved text -->
            <path id="bottomArc" d="${bottomArcPath}" fill="none" />
          </defs>
          
          <!-- Top text with arch and skew support -->
          <text fill="${color}" font-family="Arial" font-size="${pos.topSize}" ${pos.topSkew != 0 ? `transform="skewX(${pos.topSkew})"` : ''}>
            <textPath href="#topArc" startOffset="50%" text-anchor="middle">
              ${top}
            </textPath>
          </text>
          
          <!-- Bottom text with arch and skew support -->
          <text fill="${color}" font-family="Arial" font-size="${pos.bottomSize}" ${pos.bottomSkew != 0 ? `transform="skewX(${pos.bottomSkew})"` : ''}>
            <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
              ${bottom}
            </textPath>
          </text>
          
          <!-- Logo with center-based positioning and skew support -->
          ${logo ? `
          <g transform="translate(${logoSvgX}, ${logoSvgY}) ${pos.logoSkewX != 0 || pos.logoSkewY != 0 ? `skewX(${pos.logoSkewX}) skewY(${pos.logoSkewY})` : ''}">
            <image href="${logo}" x="${-pos.logoWidth/2}" y="${-pos.logoHeight/2}" width="${pos.logoWidth}" height="${pos.logoHeight}"/>
          </g>
          ` : ''}
        </svg>
      </div>
    </body>
  </html>`;

  // Launch browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  try {
    // Create new page and set viewport
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });
    
    // Set content and wait for images to load
    await page.setContent(html);
    await page.waitForTimeout(1000); // Wait for base64 image to load
    
    // Take screenshot with transparent background
    const buffer = await page.screenshot({ 
      type: 'png', 
      omitBackground: true,
      clip: { x: 0, y: 0, width: 512, height: 512 }
    });
    
    return { buffer, hash };
  } finally {
    // Always close the browser
    await browser.close();
  }
}

// Next.js Edge Function Export
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  // Extract parameters with defaults
  const color = searchParams.get("color") || "#00BFFF";
  const top = searchParams.get("top") || "POLYMAKER";
  const bottom = searchParams.get("bottom") || "PLA PRO";
  const logo = searchParams.get("logo") || "";
  
  // Enhanced positioning parameters (center-based)
  const positioning = {
    topX: parseFloat(searchParams.get("topX") || "0"),
    topY: parseFloat(searchParams.get("topY") || "-56"),
    topSize: parseFloat(searchParams.get("topSize") || "37"),
    topSkew: parseFloat(searchParams.get("topSkew") || "0"),
    topArch: parseFloat(searchParams.get("topArch") || "100"),
    topArchHeight: parseFloat(searchParams.get("topArchHeight") || "50"),
    
    bottomX: parseFloat(searchParams.get("bottomX") || "0"),
    bottomY: parseFloat(searchParams.get("bottomY") || "56"),
    bottomSize: parseFloat(searchParams.get("bottomSize") || "35"),
    bottomSkew: parseFloat(searchParams.get("bottomSkew") || "0"),
    bottomArch: parseFloat(searchParams.get("bottomArch") || "100"),
    bottomArchHeight: parseFloat(searchParams.get("bottomArchHeight") || "50"),
    
    logoX: parseFloat(searchParams.get("logoX") || "0"),
    logoY: parseFloat(searchParams.get("logoY") || "0"),
    logoWidth: parseFloat(searchParams.get("logoWidth") || "252"),
    logoHeight: parseFloat(searchParams.get("logoHeight") || "35"),
    logoSkewX: parseFloat(searchParams.get("logoSkewX") || "0"),
    logoSkewY: parseFloat(searchParams.get("logoSkewY") || "0")
  };

  try {
    const { buffer, hash } = await generateEnhancedSpoolImage({
      color,
      top,
      bottom,
      logo,
      positioning
    });

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "X-Image-Hash": hash,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error('Enhanced spool generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate enhanced spool image' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

