// Next.js Edge Function for Lovable.dev Integration
import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const generateHash = (input) =>
  crypto.createHash("md5").update(input).digest("hex");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const color = searchParams.get("color") || "#444";
  const topText = searchParams.get("top") || "CUSTOM";
  const bottomText = searchParams.get("bottom") || "MATERIAL";
  const logo = searchParams.get("logo") || "";

  const hash = generateHash(`${color}-${topText}-${bottomText}-${logo}`);

  // Get absolute path to the base spool image
  const spoolBasePath = `${process.cwd()}/public/assets/spool_base.png`;

  const html = `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          background: transparent;
          position: relative;
        }
        .spool {
          background-image: url("file://${spoolBasePath}");
          background-size: cover;
          width: 512px;
          height: 512px;
          position: absolute;
        }
        svg {
          position: absolute;
          top: 0;
          left: 0;
        }
      </style>
    </head>
    <body>
      <div class="spool"></div>
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path id="topArc" d="M 156,256 A 100,100 0 0,1 356,256" fill="none"/>
          <path id="bottomArc" d="M 356,256 A 100,100 0 0,1 156,256" fill="none"/>
        </defs>
        <text fill="${color}" font-size="28" font-family="Roboto, Arial, sans-serif" font-weight="bold" text-anchor="middle">
          <textPath href="#topArc" startOffset="50%">${topText}</textPath>
        </text>
        <text fill="${color}" font-size="28" font-family="Roboto, Arial, sans-serif" font-weight="bold" text-anchor="middle">
          <textPath href="#bottomArc" startOffset="50%">${bottomText}</textPath>
        </text>
        ${logo ? `<g transform="translate(256, 256) scale(0.5)">${logo}</g>` : ''}
      </svg>
    </body>
  </html>`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });
    await page.setContent(html);
    
    // Wait for images to load
    await page.evaluate(() => {
      return new Promise(resolve => {
        const images = document.querySelectorAll('img');
        if (images.length === 0) return resolve();
        
        let loaded = 0;
        images.forEach(img => {
          if (img.complete) {
            loaded++;
            if (loaded === images.length) resolve();
          } else {
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
            img.addEventListener('error', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
          }
        });
      });
    });
    
    const buffer = await page.screenshot({ type: "png", omitBackground: true });
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "X-Image-Hash": hash,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } finally {
    await browser.close();
  }
}

export const config = {
  runtime: 'edge',
};

