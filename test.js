const { generateSpoolImage } = require('./src/generateSpool');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🧪 Starting Spool Generator Tests...\n');

  // Test 1: Basic spool generation
  console.log('Test 1: Basic spool generation');
  try {
    const { buffer, hash } = await generateSpoolImage({
      color: '#FF5722',
      top: 'POLYMAKER',
      bottom: 'PLA PRO'
    });
    
    // Save test image
    const testPath = path.join(__dirname, 'test_basic.png');
    fs.writeFileSync(testPath, buffer);
    
    console.log(`✅ Basic test passed`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Size: ${buffer.length} bytes`);
    console.log(`   Saved: ${testPath}\n`);
  } catch (error) {
    console.log(`❌ Basic test failed: ${error.message}\n`);
  }

  // Test 2: Spool with logo
  console.log('Test 2: Spool with logo');
  try {
    const logoSvg = `
      <circle cx="0" cy="0" r="40" fill="#00A8CC" opacity="0.9"/>
      <text x="0" y="8" text-anchor="middle" fill="white" font-size="24" font-family="Arial" font-weight="bold">P</text>
    `;
    
    const { buffer, hash } = await generateSpoolImage({
      color: '#00A8CC',
      top: 'POLYMAKER',
      bottom: 'PETG',
      logo: logoSvg
    });
    
    // Save test image
    const testPath = path.join(__dirname, 'test_logo.png');
    fs.writeFileSync(testPath, buffer);
    
    console.log(`✅ Logo test passed`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Size: ${buffer.length} bytes`);
    console.log(`   Saved: ${testPath}\n`);
  } catch (error) {
    console.log(`❌ Logo test failed: ${error.message}\n`);
  }

  // Test 3: Default values
  console.log('Test 3: Default values');
  try {
    const { buffer, hash } = await generateSpoolImage();
    
    // Save test image
    const testPath = path.join(__dirname, 'test_default.png');
    fs.writeFileSync(testPath, buffer);
    
    console.log(`✅ Default test passed`);
    console.log(`   Hash: ${hash}`);
    console.log(`   Size: ${buffer.length} bytes`);
    console.log(`   Saved: ${testPath}\n`);
  } catch (error) {
    console.log(`❌ Default test failed: ${error.message}\n`);
  }

  // Test 4: Different colors
  console.log('Test 4: Different colors');
  const colors = ['#E91E63', '#9C27B0', '#3F51B5', '#4CAF50', '#FF9800'];
  
  for (let i = 0; i < colors.length; i++) {
    try {
      const color = colors[i];
      const { buffer, hash } = await generateSpoolImage({
        color,
        top: `COLOR ${i + 1}`,
        bottom: 'TEST'
      });
      
      const testPath = path.join(__dirname, `test_color_${i + 1}.png`);
      fs.writeFileSync(testPath, buffer);
      
      console.log(`✅ Color ${color} test passed (${testPath})`);
    } catch (error) {
      console.log(`❌ Color ${colors[i]} test failed: ${error.message}`);
    }
  }

  console.log('\n🎉 All tests completed!');
  console.log('📁 Test images saved in the project directory');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

