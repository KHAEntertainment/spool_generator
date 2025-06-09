const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate hash for caching purposes
const generateHash = (input) =>
  crypto.createHash("md5").update(input).digest("hex");

/**
 * Generate a layered spool image using Sharp for image compositing and Canvas for text
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
  try {
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

    console.log('📸 Starting Sharp-based image generation...');
    console.log('🖼️ Background image:', bgImagePath);
    console.log('🎨 Foreground image:', fgImagePath);

    // Load background image
    let compositeImage = sharp(bgImagePath)
      .resize(512, 512, { fit: 'cover' });

    // Process foreground image with color filter
    let foregroundBuffer;
    
    // Parse filter to apply color transformations
    if (filter.includes('hue-rotate')) {
      const degrees = parseInt(filter.match(/hue-rotate\((\d+)deg\)/)?.[1] || '0');
      foregroundBuffer = await sharp(fgImagePath)
        .resize(512, 512, { fit: 'cover' })
        .modulate({
          hue: degrees
        })
        .png()
        .toBuffer();
    } else if (filter.includes('sepia')) {
      const amount = parseFloat(filter.match(/sepia\(([0-9.]+)\)/)?.[1] || '1');
      foregroundBuffer = await sharp(fgImagePath)
        .resize(512, 512, { fit: 'cover' })
        .tint({ r: 196, g: 165, b: 132 }) // Sepia tone
        .png()
        .toBuffer();
    } else {
      // Default - no filter
      foregroundBuffer = await sharp(fgImagePath)
        .resize(512, 512, { fit: 'cover' })
        .png()
        .toBuffer();
    }

    // Composite background and foreground
    const baseComposite = await compositeImage
      .composite([{
        input: foregroundBuffer,
        blend: 'over'
      }])
      .png()
      .toBuffer();

    console.log('✅ Base composite created successfully');

    // Create canvas for text overlay
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    // Make canvas transparent
    ctx.clearRect(0, 0, 512, 512);

    // Set text properties
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate positioning (center-based coordinates)
    const centerX = 256;
    const centerY = 256;

    // Draw curved text function
    function drawCurvedText(text, startX, centerY, endX, curve) {
      const chars = text.split('');
      if (chars.length === 0) return;

      const totalWidth = Math.abs(endX - startX);
      const charSpacing = totalWidth / Math.max(chars.length - 1, 1);

      chars.forEach((char, i) => {
        const progress = chars.length > 1 ? i / (chars.length - 1) : 0.5;
        const x = startX + (progress * totalWidth);
        
        // Create curve effect
        const curveProgress = (progress - 0.5) * 2; // -1 to 1
        const y = centerY + (curveProgress * curveProgress * (curve / 10));

        ctx.save();
        ctx.translate(x, y);
        
        // Apply skew if specified
        if (skewX !== 0) {
          ctx.transform(1, 0, Math.tan(skewX * Math.PI / 180), 1, 0, 0);
        }
        
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
    }

    // Draw top text (curved)
    if (topText) {
      const topStartX = centerX + topX - archCurve;
      const topEndX = centerX + topX + archCurve;
      const topCenterY = centerY + topY;
      drawCurvedText(topText, topStartX, topCenterY, topEndX, archCurve);
    }

    // Draw bottom text (curved, inverted)
    if (bottomText) {
      const bottomStartX = centerX + bottomX + archCurve;
      const bottomEndX = centerX + bottomX - archCurve;
      const bottomCenterY = centerY + bottomY;
      drawCurvedText(bottomText, bottomStartX, bottomCenterY, bottomEndX, -archCurve);
    }

    console.log('✅ Text overlay created successfully');

    // Convert canvas to buffer
    const textBuffer = canvas.toBuffer('image/png');

    // Final composite with text overlay
    const finalBuffer = await sharp(baseComposite)
      .composite([{
        input: textBuffer,
        blend: 'over'
      }])
      .png()
      .toBuffer();

    console.log('🎉 Final image generation complete!');

    return { buffer: finalBuffer, hash };

  } catch (error) {
    console.error('❌ Error in Sharp-based generation:', error);
    throw error;
  }
}

module.exports = { 
  generateSpoolImage: generateLayeredSpoolImage, // Keep original export name for compatibility
  generateLayeredSpoolImage 
};

