import puppeteer from "puppeteer-core";
import crypto from "crypto";
import { NextResponse } from "next/server";

const generateHash = (input) =>
  crypto.createHash("md5").update(input).digest("hex");

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const color = searchParams.get("color") || "#444";
  const top = searchParams.get("top") || "CUSTOM";
  const bottom = searchParams.get("bottom") || "MATERIAL";
  const logo = searchParams.get("logo") || "";

  const hash = generateHash(`${color}-${top}-${bottom}-${logo}`);

  const html = `
  <!DOCTYPE html>
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
        
        .spool-container {
          position: relative;
          width: 512px;
          height: 512px;
          background-image: url("file://${process.cwd()}/public/assets/spool_base.png");
          background-size: cover;
          background-position: center;
        }
        
        .spool-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 512px;
          height: 512px;
        }
        
        /* Color the white faceplate */
        .spool-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 512px;
          height: 512px;
          background: ${color};
          mix-blend-mode: multiply;
          opacity: 0.3;
          mask: url("file://${process.cwd()}/public/assets/spool_base.png");
          mask-size: cover;
        }
      </style>
    </head>
    <body>
      <div class="spool-container">
        <svg class="spool-overlay" width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="topPath" d="M 150,200 A 106,106 0 0,1 362,200" />
            <path id="bottomPath" d="M 362,312 A 106,106 0 0,1 150,312" />
          </defs>
          
          <text fill="white" font-size="22" font-family="Roboto, Arial, sans-serif" font-weight="700" text-anchor="middle">
            <textPath href="#topPath" startOffset="50%">${top}</textPath>
          </text>
          
          <text fill="white" font-size="22" font-family="Roboto, Arial, sans-serif" font-weight="700" text-anchor="middle">
            <textPath href="#bottomPath" startOffset="50%">${bottom}</textPath>
          </text>
          
          ${logo}
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
  const buffer = await page.screenshot({ type: "png", omitBackground: true });
  await browser.close();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "X-Image-Hash": hash,
      "Cache-Control": "public, max-age=31536000",
    },
  });
}

