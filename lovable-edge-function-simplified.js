// Next.js Edge Function for Lovable.dev - SIMPLIFIED VERSION
// Updated to use direct text positioning without textPath elements

import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const generateHash = (input) =>
  crypto.createHash("md5").update(input).digest("hex");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const color = searchParams.get("color") || "#00BFFF";
  const top = searchParams.get("top") || "POLYMAKER";
  const bottom = searchParams.get("bottom") || "PLA PRO";
  const logo = searchParams.get("logo") || "";

  const hash = generateHash(`${color}-${top}-${bottom}-${logo}`);

  // Read the base image and convert to base64
  const baseImagePath = path.join(process.cwd(), "public", "assets", "spool_base.png");
  const imageBuffer = fs.readFileSync(baseImagePath);
  const imageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  // Create HTML template with simplified SVG structure
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
          <!-- Simplified SVG structure without textPath - direct text positioning -->
          <text fill="${color}" font-family="Arial" font-size="37" transform="skewX(-3) translate(84, 16)">
            ${top}
          </text>
          <text fill="${color}" font-family="Arial" font-size="35" transform="skewX(-7) translate(100, -4)">
            ${bottom}
          </text>
          ${logo ? `<image href="${logo}" x="210" y="81" width="252" height="35"/>` : ''}
        </svg>
      </div>
    </body>
  </html>`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: "new",
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512 });
  await page.setContent(html);
  
  // Wait for image to load
  await page.waitForTimeout(1000);
  
  // Take screenshot with transparent background and clip to exact size
  const buffer = await page.screenshot({ 
    type: 'png', 
    omitBackground: true,
    clip: { x: 0, y: 0, width: 512, height: 512 }
  });
  
  await browser.close();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "X-Image-Hash": hash,
      "Cache-Control": "public, max-age=31536000",
    },
  });
}

