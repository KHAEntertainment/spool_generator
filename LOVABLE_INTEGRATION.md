# Integration Guide for Lovable.dev

## Quick Integration Steps

### 1. File Setup

Copy these files to your Lovable.dev project:

```
/public/assets/spool_base.png    # Base spool image
/api/generate-spool/route.js     # Edge function (rename lovable-edge-function.js)
```

### 2. Dependencies

Add to your `package.json`:
```json
{
  "dependencies": {
    "puppeteer-core": "^21.0.0"
  }
}
```

### 3. Edge Function Implementation

Place `lovable-edge-function.js` content in `/api/generate-spool/route.js`:

```javascript
// /api/generate-spool/route.js
import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// ... (copy the complete lovable-edge-function.js content)
```

### 4. Usage in Components

```jsx
// React component example
import { useState } from 'react';

export default function SpoolGenerator() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSpool = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      color: '#FF5722',
      top: 'POLYMAKER',
      bottom: 'PLA PRO'
    });
    
    const url = `/api/generate-spool?${params}`;
    setImageUrl(url);
    setLoading(false);
  };

  return (
    <div className="spool-generator">
      <button onClick={generateSpool} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Spool'}
      </button>
      
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt="Generated Spool" 
          className="w-64 h-64 object-contain"
        />
      )}
    </div>
  );
}
```

### 5. Advanced Usage with Form

```jsx
import { useState } from 'react';

export default function SpoolCustomizer() {
  const [config, setConfig] = useState({
    color: '#444444',
    top: 'CUSTOM',
    bottom: 'MATERIAL',
    logo: ''
  });

  const generateImageUrl = () => {
    const params = new URLSearchParams(config);
    return `/api/generate-spool?${params}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Color</label>
        <input
          type="color"
          value={config.color}
          onChange={(e) => setConfig({...config, color: e.target.value})}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Top Text</label>
        <input
          type="text"
          value={config.top}
          onChange={(e) => setConfig({...config, top: e.target.value})}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Bottom Text</label>
        <input
          type="text"
          value={config.bottom}
          onChange={(e) => setConfig({...config, bottom: e.target.value})}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div className="mt-4">
        <img 
          src={generateImageUrl()} 
          alt="Custom Spool" 
          className="w-64 h-64 object-contain border rounded"
        />
      </div>
    </div>
  );
}
```

## Configuration Options

### Environment Variables

```env
# .env.local
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # For production
```

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "api/generate-spool/route.js": {
      "maxDuration": 30
    }
  }
}
```

## Performance Optimization

### 1. Caching Strategy

```jsx
// Use React Query for caching
import { useQuery } from '@tanstack/react-query';

function useSpoolImage(config) {
  return useQuery({
    queryKey: ['spool', config],
    queryFn: () => generateImageUrl(config),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
```

### 2. Preloading

```jsx
// Preload common configurations
useEffect(() => {
  const commonConfigs = [
    { color: '#FF5722', top: 'PLA', bottom: 'BASIC' },
    { color: '#4CAF50', top: 'PETG', bottom: 'PRO' },
    { color: '#2196F3', top: 'ABS', bottom: 'PREMIUM' }
  ];
  
  commonConfigs.forEach(config => {
    const img = new Image();
    img.src = generateImageUrl(config);
  });
}, []);
```

## Error Handling

```jsx
import { useState } from 'react';

export default function SpoolWithErrorHandling() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageError = () => {
    setError('Failed to generate spool image');
  };

  const handleImageLoad = () => {
    setError(null);
    setLoading(false);
  };

  return (
    <div>
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}
      
      <img
        src={generateImageUrl()}
        alt="Spool"
        onError={handleImageError}
        onLoad={handleImageLoad}
        className="w-64 h-64 object-contain"
      />
    </div>
  );
}
```

## Testing in Lovable.dev

### 1. Test the Edge Function

```javascript
// Test in browser console
fetch('/api/generate-spool?color=%23FF5722&top=TEST&bottom=SPOOL')
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
  });
```

### 2. Component Testing

```jsx
// Simple test component
export default function SpoolTest() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <img src="/api/generate-spool?color=%23FF5722&top=RED&bottom=SPOOL" alt="Red" />
      <img src="/api/generate-spool?color=%234CAF50&top=GREEN&bottom=SPOOL" alt="Green" />
      <img src="/api/generate-spool?color=%232196F3&top=BLUE&bottom=SPOOL" alt="Blue" />
      <img src="/api/generate-spool?color=%23FF9800&top=ORANGE&bottom=SPOOL" alt="Orange" />
    </div>
  );
}
```

## Deployment Checklist

- [ ] `spool_base.png` uploaded to `/public/assets/`
- [ ] Edge function placed in `/api/generate-spool/route.js`
- [ ] `puppeteer-core` added to dependencies
- [ ] Test endpoint responds correctly
- [ ] Images render with proper quality
- [ ] Caching headers working
- [ ] Error handling implemented
- [ ] Performance optimized for your use case

## Common Issues & Solutions

### Issue: Puppeteer fails to launch
**Solution**: Add environment variable for Chromium path in production

### Issue: Fonts not loading
**Solution**: Ensure Google Fonts import is accessible from your domain

### Issue: Base image not found
**Solution**: Verify file path and ensure image is in `/public/assets/`

### Issue: Slow generation
**Solution**: Implement caching and consider browser instance pooling

## Support

If you encounter issues during integration:
1. Check the browser console for errors
2. Verify all files are in correct locations
3. Test the edge function endpoint directly
4. Review the generated images for quality issues

