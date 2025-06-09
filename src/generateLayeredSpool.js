const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate hash for caching purposes
const generateHash = (input) =>
  crypto.createHash("md5").update(input).digest("hex");

/**
 * Generate a layered spool image using the new approach
 * @param {Object} options - Configuration options
 * @param {string} options.filter - CSS filter for faceplate
 * @param {string} options.topText - Top text
 * @param {string} options.bottomText - Bottom text
 * @param {string} options.textColor - Text color
 * @param {number} options.fontSize - Font size
 * @param {number} options.topX - Top text X position
 * @param {number} options.topY - Top text Y position
 * @param {number} options.bottomX - Bottom text X position
 * @param {number} options.bottomY - Bottom text Y position
 * @param {number} options.skewX - Text skew
 * @param {number} options.archCurve - Arch curve radius
 * @param {string} options.logoUrl - Logo URL
 * @returns {Promise<{buffer: Buffer, hash: string}>} - Image buffer and hash
 */
async function generateLayeredSpoolImage({
  filter = 'hue-rotate(180deg)',
  topText = 'POLYMAKER',
  bottomText = 'PLA PRO',
  textColor = '#00bfff',
  fontSize = 37,
  topX = 0,
  topY = -56,
  bottomX = 0,
  bottomY = 56,
  skewX = 0,
  archCurve = 100,
  logoUrl = ''
}) {
  // Generate hash for caching
  const hash = generateHash(
    `${filter}-${topText}-${bottomText}-${textColor}-${fontSize}-${topX}-${topY}-${bottomX}-${bottomY}-${skewX}-${archCurve}-${logoUrl}`
  );

  // Get absolute paths to images
  const bgImagePath = path.join(__dirname, '../public/spool_placeholder_bg.png');
  const fgImagePath = path.join(__dirname, '../public/spool_placeholder_fg.png');

  // Verify images exist
  if (!fs.existsSync(bgImagePath)) {
    throw new Error(`Background image not found: ${bgImagePath}`);
  }
  if (!fs.existsSync(fgImagePath)) {
    throw new Error(`Foreground image not found: ${fgImagePath}`);
  }

  // Convert to base64 data URLs for better Puppeteer compatibility
  const bgImageData = fs.readFileSync(bgImagePath);
  const fgImageData = fs.readFileSync(fgImagePath);
  const bgImageBase64 = `data:image/png;base64,${bgImageData.toString('base64')}`;
  const fgImageBase64 = `data:image/png;base64,${fgImageData.toString('base64')}`;

  // Calculate positioning
  const centerX = 256;
  const centerY = 256;
  
  const topStartX = centerX + topX - archCurve;
  const topEndX = centerX + topX + archCurve;
  const topCenterY = centerY + topY;
  
  const bottomStartX = centerX + bottomX + archCurve;
  const bottomEndX = centerX + bottomX - archCurve;
  const bottomCenterY = centerY + bottomY;

  // Create HTML template with base64 images
  const html = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          overflow: hidden;
          background: transparent;
        }
        .container {
          position: relative;
          width: 512px;
          height: 512px;
        }
        .spool-bg, .spool-fg {
          position: absolute;
          top: 0;
          left: 0;
          width: 512px;
          height: 512px;
          object-fit: cover;
        }
        .spool-fg {
          filter: ${filter};
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
      <div class="container">
        <img src="${bgImageBase64}" class="spool-bg" alt="Spool Background">
        <img src="${fgImageBase64}" class="spool-fg" alt="Spool Faceplate">
        <svg class="spool-overlay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <defs>
            <path id="topArc" d="M ${topStartX} ${topCenterY} A ${archCurve} 50 0 0 1 ${topEndX} ${topCenterY}" fill="none" />
            <path id="bottomArc" d="M ${bottomStartX} ${bottomCenterY} A ${archCurve} 50 0 0 1 ${bottomEndX} ${bottomCenterY}" fill="none" />
          </defs>
          
          <!-- Top text with arch -->
          <text fill="${textColor}" font-family="Arial" font-size="${fontSize}" font-weight="bold" ${skewX !== 0 ? `transform="skewX(${skewX})"` : ''}>
            <textPath href="#topArc" startOffset="50%" text-anchor="middle">
              ${topText}
            </textPath>
          </text>
          
          <!-- Bottom text with arch -->
          <text fill="${textColor}" font-family="Arial" font-size="${fontSize}" font-weight="bold" ${skewX !== 0 ? `transform="skewX(${skewX})"` : ''}>
            <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">
              ${bottomText}
            </textPath>
          </text>
          
          <!-- Logo -->
          ${logoUrl ? `
          <g transform="translate(${centerX}, ${centerY})">
            <image href="${logoUrl}" x="-126" y="-17.5" width="252" height="35"/>
          </g>
          ` : ''}
        </svg>
      </div>
    </body>
  </html>`;

  // Launch browser
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });

  try {
    // Create new page and set viewport
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });

    // Set content and wait for images to load
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait a bit more for images to fully render
    await page.waitForTimeout(1000);

    // Take screenshot with white background (not transparent) to ensure images show
    const buffer = await page.screenshot({
      type: "png",
      omitBackground: false,
      clip: { x: 0, y: 0, width: 512, height: 512 },
    });

    return { buffer, hash };
  } finally {
    // Always close the browser
    await browser.close();
  }
}

module.exports = { 
  generateSpoolImage: generateLayeredSpoolImage, // Keep original export name for compatibility
  generateLayeredSpoolImage 
};

