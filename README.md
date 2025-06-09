# Layered Spool Generator

A modern, real-time spool label generator using layered images and CSS filters for instant preview with high-quality Puppeteer generation.

## 🎯 Features

- **Real-time Preview**: Instant visual feedback using CSS filters
- **Layered Images**: Background spool + foreground faceplate for better control
- **Mobile Optimized**: Perfect landscape experience with scrollable controls
- **High-Quality Output**: Puppeteer generation for final images
- **Filter Presets**: Quick access to common material colors
- **Complete Customization**: Text, colors, positioning, and effects

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Access the generator
http://localhost:3000/layered-generator
```

## 📁 Project Structure

```
spool-generator/
├── public/
│   ├── layered-generator.html      # Main interface
│   ├── spool_placeholder_bg.png    # Background spool image
│   ├── spool_placeholder_fg.png    # Foreground faceplate
│   └── ...
├── src/
│   ├── generateLayeredSpool.js     # Layered generation function
│   └── generateSpool.js            # Original functions
├── server.js                       # Express server
└── package.json
```

## 🎨 How It Works

### Layered Approach
1. **Background Image**: Full 3D spool with filament
2. **Foreground Image**: Isolated faceplate for color filtering
3. **CSS Filters**: Real-time color changes (hue-rotate, sepia, etc.)
4. **SVG Overlay**: Text with positioning and curve controls
5. **Puppeteer Generation**: High-quality final image rendering

### Filter System
- **Hue Rotate**: Change faceplate color
- **Sepia**: Vintage/warm tones
- **Saturate**: Color intensity
- **Brightness**: Light/dark adjustment
- **Contrast**: Visual contrast control

## 🔧 API Endpoints

### Main Interface
```
GET /layered-generator
```

### Image Generation
```
GET /generate-layered-spool?filter=hue-rotate(120deg)&topText=BRAND&bottomText=MATERIAL&textColor=%2300bfff
```

### Parameters
- `filter`: CSS filter string
- `topText`: Top text content
- `bottomText`: Bottom text content
- `textColor`: Text color (hex)
- `fontSize`: Font size (20-60)
- `topX`, `topY`: Top text position
- `bottomX`, `bottomY`: Bottom text position
- `skewX`: Text skew angle
- `archCurve`: Arch curve radius
- `logoUrl`: Logo image URL

## 🎯 Advantages

### Performance
- ✅ **Instant Preview**: CSS filters vs. server generation
- ✅ **Reduced Server Load**: Client-side preview
- ✅ **Better Caching**: Static images cached effectively

### User Experience
- ✅ **Real-time Feedback**: No waiting for preview updates
- ✅ **Intuitive Controls**: Visual sliders and color pickers
- ✅ **Mobile-Friendly**: Excellent landscape experience

### Technical Benefits
- ✅ **Simpler Maintenance**: Separate preview and generation concerns
- ✅ **Better Reliability**: CSS filters work consistently
- ✅ **Easier Extension**: Simple to add new filter types

## 📱 Mobile Support

The interface is optimized for mobile landscape use:
- Side-by-side layout (preview + controls)
- Scrollable controls panel
- Touch-friendly sliders and inputs
- Responsive design

## 🔄 Development

### Adding New Filter Presets
```javascript
<div class="filter-preset" data-filter="hue-rotate(300deg) saturate(1.5)">
  Custom Color
</div>
```

### Modifying Default Values
Edit the `currentState` object in `layered-generator.html`:
```javascript
let currentState = {
  filter: 'hue-rotate(180deg)',
  topText: 'YOUR_BRAND',
  bottomText: 'MATERIAL',
  // ... other defaults
};
```

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for the 3D printing community

