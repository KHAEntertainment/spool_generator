const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate hash for caching purposes
const generateHash = (input) => crypto.createHash('md5').update(input).digest('hex');

/**
 * Generate a spool image with positioning parameters (original function)
 * @param {Object} options - Configuration options
 * @param {string} options.color - Text color (hex code)
 * @param {string} options.top - Top text
 * @param {string} options.bottom - Bottom text
 * @param {string} options.logo - Optional logo URL
 * @param {Object} options.positioning - Positioning parameters
 * @returns {Promise<{buffer: Buffer, hash: string}>} - Image buffer and hash
 */
async function generateSpoolImage({ color = '#00BFFF', top = 'POLYMAKER', bottom = 'PLA PRO', logo = '', positioning = null }) {
  // Use positioning parameters if provided, otherwise use defaults
  const pos = positioning || {
    topSkew: -3,
    topX: 84,
    topY: 16,
    topSize: 37,
    bottomSkew: -7,
    bottomX: 100,
    bottomY: -4,
    bottomSize: 35,
    logoX: 210,
    logoY: 81,
    logoWidth: 252,
    logoHeight: 35
  };

  // Generate hash for caching
  const hash = generateHash(`${color}-${top}-${bottom}-${logo}-${JSON.stringify(pos)}`);

  // Read the base image and convert to base64
  const baseImagePath = path.join(__dirname, '..', 'public', 'spool_base.png');
  
  if (!fs.existsSync(baseImagePath)) {
    throw new Error(`Base spool image not found at: ${baseImagePath}`);
  }
  
  const imageBuffer = fs.readFileSync(baseImagePath);
  const imageDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  // Create HTML template with positioning parameters
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
          <text fill="${color}" font-family="Arial" font-size="${pos.topSize}" transform="skewX(${pos.topSkew}) translate(${pos.topX}, ${pos.topY})">
            ${top}
          </text>
          <text fill="${color}" font-family="Arial" font-size="${pos.bottomSize}" transform="skewX(${pos.bottomSkew}) translate(${pos.bottomX}, ${pos.bottomY})">
            ${bottom}
          </text>
          ${logo ? `<image href="${logo}" x="${pos.logoX}" y="${pos.logoY}" width="${pos.logoWidth}" height="${pos.logoHeight}"/>` : ''}
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

/**
 * Generate a spool image with enhanced positioning parameters
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
  const baseImagePath = path.join(__dirname, '..', 'public', 'spool_base.png');
  
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

/**
 * Generate a spool image with complete control including spool front color
 * @param {Object} options - Configuration options
 * @param {string} options.spoolColor - Spool front color (hex code)
 * @param {number} options.colorIntensity - Color intensity (0-100)
 * @param {string} options.textColor - Text color (hex code)
 * @param {string} options.top - Top text
 * @param {string} options.bottom - Bottom text
 * @param {string} options.logo - Optional logo URL
 * @param {Object} options.positioning - Enhanced positioning parameters
 * @returns {Promise<{buffer: Buffer, hash: string}>} - Image buffer and hash
 */
async function generateCompleteSpoolImage({ 
  spoolColor = '#ffffff',
  colorIntensity = 50,
  textColor = '#00BFFF', 
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
  const hash = generateHash(`${spoolColor}-${colorIntensity}-${textColor}-${top}-${bottom}-${logo}-${JSON.stringify(pos)}`);

  // Read the base image and convert to base64
  const baseImagePath = path.join(__dirname, '..', 'public', 'spool_base.png');
  
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

  // Calculate color intensity
  const intensity = colorIntensity / 100;

  // Create HTML template with complete control
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
            
            <!-- Mask for spool front area -->
            <mask id="spoolFrontMask">
              <rect width="512" height="512" fill="black"/>
              <circle cx="256" cy="256" r="120" fill="white"/>
            </mask>
          </defs>
          
          <!-- Spool front color overlay -->
          <circle cx="256" cy="256" r="120" fill="${spoolColor}" opacity="${intensity}" mask="url(#spoolFrontMask)" mix-blend-mode="multiply"/>
          
          <!-- Top text with arch and skew support -->
          <text fill="${textColor}" font-family="Arial" font-size="${pos.topSize}" ${pos.topSkew != 0 ? `transform="skewX(${pos.topSkew})"` : ''}>
            <textPath href="#topArc" startOffset="50%" text-anchor="middle">
              ${top}
            </textPath>
          </text>
          
          <!-- Bottom text with arch and skew support -->
          <text fill="${textColor}" font-family="Arial" font-size="${pos.bottomSize}" ${pos.bottomSkew != 0 ? `transform="skewX(${pos.bottomSkew})"` : ''}>
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

module.exports = { generateSpoolImage, generateEnhancedSpoolImage, generateCompleteSpoolImage };

