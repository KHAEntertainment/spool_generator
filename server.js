const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { generateSpoolImage, generateEnhancedSpoolImage, generateCompleteSpoolImage } = require('./src/generateSpool');
const { generateLayeredSpoolImage } = require('./src/generateLayeredSpool');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from root as well

// Spool generation endpoint
app.get('/generate-spool', async (req, res) => {
  try {
    const { color, top, bottom, logo } = req.query;
    
    // Generate the spool image
    const { buffer, hash } = await generateSpoolImage({
      color: color || '#444',
      top: top || 'CUSTOM',
      bottom: bottom || 'MATERIAL',
      logo: logo || ''
    });

    // Set response headers
    res.set({
      'Content-Type': 'image/png',
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000',
      'Content-Length': buffer.length
    });

    // Send the image buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error generating spool image:', error);
    res.status(500).json({ 
      error: 'Failed to generate spool image',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'spool-generator'
  });
});

// Test endpoint with sample parameters
app.get('/test-spool', async (req, res) => {
  try {
    const { buffer, hash } = await generateSpoolImage({
      color: '#00A8CC',
      top: 'POLYMAKER',
      bottom: 'PLA PRO',
      logo: `<circle cx="0" cy="0" r="30" fill="#00A8CC" opacity="0.8"/>
             <text x="0" y="5" text-anchor="middle" fill="white" font-size="12" font-family="Arial">P</text>`
    });

    res.set({
      'Content-Type': 'image/png',
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Integrated positioning tool endpoint
app.get('/integrated-tool', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'integrated-tool.html'));
});

// Generate positioned spool with custom parameters
app.get('/generate-positioned-spool', async (req, res) => {
  try {
    const {
      color = '#00BFFF',
      top = 'POLYMAKER',
      bottom = 'PLA PRO',
      logo = '',
      topSkew = '-3',
      topX = '84',
      topY = '16',
      topSize = '37',
      bottomSkew = '-7',
      bottomX = '100',
      bottomY = '-4',
      bottomSize = '35',
      logoX = '210',
      logoY = '81',
      logoWidth = '252',
      logoHeight = '35'
    } = req.query;

    const buffer = await generateSpoolImage({
      color,
      top,
      bottom,
      logo,
      positioning: {
        topSkew: parseFloat(topSkew),
        topX: parseFloat(topX),
        topY: parseFloat(topY),
        topSize: parseFloat(topSize),
        bottomSkew: parseFloat(bottomSkew),
        bottomX: parseFloat(bottomX),
        bottomY: parseFloat(bottomY),
        bottomSize: parseFloat(bottomSize),
        logoX: parseFloat(logoX),
        logoY: parseFloat(logoY),
        logoWidth: parseFloat(logoWidth),
        logoHeight: parseFloat(logoHeight)
      }
    });

    const hash = crypto.createHash('md5').update(`${color}-${top}-${bottom}-${logo}-${topSkew}-${topX}-${topY}-${topSize}-${bottomSkew}-${bottomX}-${bottomY}-${bottomSize}-${logoX}-${logoY}-${logoWidth}-${logoHeight}`).digest('hex');

    res.set({
      'Content-Type': 'image/png',
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error generating positioned spool:', error);
    res.status(500).json({ error: 'Failed to generate spool image' });
  }
});

// Full controls positioning tool endpoint
app.get('/full-controls', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'full-controls.html'));
});

// Interactive positioning tool endpoint
app.get('/interactive-positioning', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'interactive-positioning.html'));
});

// Complete control tool endpoint
app.get('/complete-control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complete-control.html'));
});

// Generate complete spool with color control
app.get('/generate-complete-spool', async (req, res) => {
  try {
    const {
      spoolColor = '#ffffff',
      colorIntensity = '50',
      textColor = '#00BFFF',
      top = 'POLYMAKER',
      bottom = 'PLA PRO',
      logo = '',
      
      // Center-based coordinates
      topX = '0',
      topY = '-56',
      topSize = '37',
      topSkew = '0',
      topArch = '100',
      topArchHeight = '50',
      
      bottomX = '0',
      bottomY = '56',
      bottomSize = '35',
      bottomSkew = '0',
      bottomArch = '100',
      bottomArchHeight = '50',
      
      logoX = '0',
      logoY = '0',
      logoWidth = '252',
      logoHeight = '35',
      logoSkewX = '0',
      logoSkewY = '0'
    } = req.query;

    const { buffer, hash } = await generateCompleteSpoolImage({
      spoolColor,
      colorIntensity: parseFloat(colorIntensity),
      textColor,
      top,
      bottom,
      logo,
      positioning: {
        topX: parseFloat(topX),
        topY: parseFloat(topY),
        topSize: parseFloat(topSize),
        topSkew: parseFloat(topSkew),
        topArch: parseFloat(topArch),
        topArchHeight: parseFloat(topArchHeight),
        
        bottomX: parseFloat(bottomX),
        bottomY: parseFloat(bottomY),
        bottomSize: parseFloat(bottomSize),
        bottomSkew: parseFloat(bottomSkew),
        bottomArch: parseFloat(bottomArch),
        bottomArchHeight: parseFloat(bottomArchHeight),
        
        logoX: parseFloat(logoX),
        logoY: parseFloat(logoY),
        logoWidth: parseFloat(logoWidth),
        logoHeight: parseFloat(logoHeight),
        logoSkewX: parseFloat(logoSkewX),
        logoSkewY: parseFloat(logoSkewY)
      }
    });

    res.set({
      'Content-Type': 'image/png',
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error generating complete spool:', error);
    res.status(500).json({ error: 'Failed to generate complete spool image' });
  }
});

// Layered generator tool endpoint
app.get('/layered-generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'layered-generator.html'));
});

// Generate layered spool with CSS filters
app.get('/generate-layered-spool', async (req, res) => {
  try {
    const {
      filter = 'hue-rotate(180deg)',
      topText = 'POLYMAKER',
      bottomText = 'PLA PRO',
      textColor = '#00bfff',
      fontSize = '37',
      topX = '0',
      topY = '-56',
      bottomX = '0',
      bottomY = '56',
      skewX = '0',
      archCurve = '100',
      logoUrl = ''
    } = req.query;

    const { buffer, hash } = await generateLayeredSpoolImage({
      filter,
      topText,
      bottomText,
      textColor,
      fontSize: parseInt(fontSize),
      topX: parseInt(topX),
      topY: parseInt(topY),
      bottomX: parseInt(bottomX),
      bottomY: parseInt(bottomY),
      skewX: parseInt(skewX),
      archCurve: parseInt(archCurve),
      logoUrl
    });

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error generating layered spool:', error);
    res.status(500).json({ error: 'Failed to generate layered spool image' });
  }
});

// Enhanced positioning tool endpoint
app.get('/enhanced-positioning', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'enhanced-positioning.html'));
});

// Generate enhanced spool with center-based coordinates and arch controls
app.get('/generate-enhanced-spool', async (req, res) => {
  try {
    const {
      color = '#00BFFF',
      top = 'POLYMAKER',
      bottom = 'PLA PRO',
      logo = '',
      
      // Center-based coordinates
      topX = '0',
      topY = '-56',
      topSize = '37',
      topSkew = '0',
      topArch = '100',
      topArchHeight = '50',
      
      bottomX = '0',
      bottomY = '56',
      bottomSize = '35',
      bottomSkew = '0',
      bottomArch = '100',
      bottomArchHeight = '50',
      
      logoX = '0',
      logoY = '0',
      logoWidth = '252',
      logoHeight = '35',
      logoSkewX = '0',
      logoSkewY = '0'
    } = req.query;

    const { buffer, hash } = await generateEnhancedSpoolImage({
      color,
      top,
      bottom,
      logo,
      positioning: {
        topX: parseFloat(topX),
        topY: parseFloat(topY),
        topSize: parseFloat(topSize),
        topSkew: parseFloat(topSkew),
        topArch: parseFloat(topArch),
        topArchHeight: parseFloat(topArchHeight),
        
        bottomX: parseFloat(bottomX),
        bottomY: parseFloat(bottomY),
        bottomSize: parseFloat(bottomSize),
        bottomSkew: parseFloat(bottomSkew),
        bottomArch: parseFloat(bottomArch),
        bottomArchHeight: parseFloat(bottomArchHeight),
        
        logoX: parseFloat(logoX),
        logoY: parseFloat(logoY),
        logoWidth: parseFloat(logoWidth),
        logoHeight: parseFloat(logoHeight),
        logoSkewX: parseFloat(logoSkewX),
        logoSkewY: parseFloat(logoSkewY)
      }
    });

    res.set({
      'Content-Type': 'image/png',
      'X-Image-Hash': hash,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error generating enhanced spool:', error);
    res.status(500).json({ error: 'Failed to generate enhanced spool image' });
  }
});

// Positioning tool endpoint
app.get('/positioning-tool', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'positioning-tool.html'));
});

// Serve spool base image
app.get('/spool_base.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spool_base.png'));
});

// Root endpoint with HTML interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Spool Generator API running on http://localhost:${PORT}`);
  console.log(`📸 Test endpoint: http://localhost:${PORT}/test-spool`);
  console.log(`🔧 Generate endpoint: http://localhost:${PORT}/generate-spool?color=%23FF5722&top=TEST&bottom=MATERIAL`);
});

module.exports = app;

