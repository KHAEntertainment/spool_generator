# Spool Generator - Example Gallery

This directory contains example spool images generated with different parameters to showcase the variety and quality of outputs possible with the spool generator.

## Example Images

### 1. Polymaker PLA Pro (Orange)
- **File**: `polymaker_pla_pro.png`
- **Parameters**: 
  - Color: #FF5722 (Orange Red)
  - Top Text: POLYMAKER
  - Bottom Text: PLA PRO
- **Use Case**: Popular filament brand with signature orange branding

### 2. Hatchbox PETG (Green)
- **File**: `hatchbox_petg.png`
- **Parameters**:
  - Color: #4CAF50 (Green)
  - Top Text: HATCHBOX
  - Bottom Text: PETG
- **Use Case**: Clean green styling for PETG material

### 3. Prusament ABS (Blue)
- **File**: `prusament_abs.png`
- **Parameters**:
  - Color: #2196F3 (Blue)
  - Top Text: PRUSAMENT
  - Bottom Text: ABS
- **Use Case**: Professional blue theme for premium filament

### 4. Overture TPU (Orange)
- **File**: `overture_tpu.png`
- **Parameters**:
  - Color: #FF9800 (Orange)
  - Top Text: OVERTURE
  - Bottom Text: TPU
- **Use Case**: Bright orange for flexible filament identification

### 5. eSUN PLA+ (Purple)
- **File**: `esun_pla_plus.png`
- **Parameters**:
  - Color: #9C27B0 (Purple)
  - Top Text: ESUN
  - Bottom Text: PLA+
- **Use Case**: Distinctive purple for enhanced PLA variant

## Quality Features Demonstrated

✅ **Perfect Text Curvature**: All text follows the natural curve of the spool faceplate
✅ **Color Accuracy**: Precise hex color reproduction
✅ **Transparent Background**: Clean PNG output for easy integration
✅ **Consistent Sizing**: All images are 512x512 pixels
✅ **Professional Typography**: Clean, readable Roboto font
✅ **Brand Recognition**: Realistic representation of popular filament brands

## Usage in Projects

These examples can be used as:
- Reference images for testing
- Templates for common filament brands
- Quality benchmarks for your own generations
- Documentation examples

## API Calls Used

```bash
# Polymaker PLA Pro
curl "http://localhost:3001/generate-spool?color=%23FF5722&top=POLYMAKER&bottom=PLA%20PRO"

# Hatchbox PETG
curl "http://localhost:3001/generate-spool?color=%234CAF50&top=HATCHBOX&bottom=PETG"

# Prusament ABS
curl "http://localhost:3001/generate-spool?color=%232196F3&top=PRUSAMENT&bottom=ABS"

# Overture TPU
curl "http://localhost:3001/generate-spool?color=%23FF9800&top=OVERTURE&bottom=TPU"

# eSUN PLA+
curl "http://localhost:3001/generate-spool?color=%239C27B0&top=ESUN&bottom=PLA%2B"
```

## Integration Tips

- Use these examples to test your integration
- Modify colors to match your specific filament colors
- Combine with logos for branded spools
- Use as fallback images in your application

