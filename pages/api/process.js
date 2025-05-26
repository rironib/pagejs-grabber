import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import fetch from "node-fetch";
import path from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import sharp from "sharp";

puppeteer.use(StealthPlugin());

const extractFavicon = async (url, page) => {
  const favicons = await page.$$eval(
    [
      'link[rel="apple-touch-icon"][href]',
      'link[rel="apple-touch-icon-precomposed"][href]',
      'link[rel~="icon"][href]',
      'link[rel="fluid-icon"][href]',
      'link[rel="mask-icon"][href]',
    ].join(", "),
    (links) =>
      links.map((link) => ({
        rel: link.rel.toLowerCase(),
        href: link.href,
      }))
  );

  const priorityOrder = [
    "apple-touch-icon",
    "apple-touch-icon-precomposed",
    "icon",
    "shortcut icon",
    "fluid-icon",
    "mask-icon",
  ];

  const selected = priorityOrder
    .map((rel) => favicons.find((f) => f.rel.includes(rel)))
    .find(Boolean);

  const faviconUrl = selected?.href
    ? new URL(selected.href, url).href
    : new URL("/favicon.ico", url).href;

  return faviconUrl;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const domain = req.query.domain?.trim().toLowerCase();

  if (!domain) {
    return res.status(400).json({ error: "Missing domain parameter" });
  }

  const fullUrl = `https://${domain}`;
  const publicDir = path.join(process.cwd(), "public");
  const imagesDir = path.join(publicDir, "images");

  if (!existsSync(imagesDir)) mkdirSync(imagesDir, { recursive: true });

  const screenshotPath = path.join(imagesDir, `${domain}.webp`);
  const faviconPath = path.join(imagesDir, `${domain}.png`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    );

    await page.goto(fullUrl, {
      waitUntil: "networkidle2",
      timeout: 0, // disables timeout
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const buffer = await page.screenshot({ type: "webp" });

    await sharp(buffer)
      .resize(1920, 1080, { fit: "contain", background: "#ffffff" })
      .webp()
      .toFile(screenshotPath);

    const faviconUrl = await extractFavicon(fullUrl, page);

    try {
      const response = await fetch(faviconUrl);
      if (!response.ok) throw new Error("Favicon fetch failed");

      const arrayBuffer = await response.arrayBuffer();
      const favBuffer = Buffer.from(arrayBuffer);

      if (faviconUrl.endsWith(".ico")) {
        await fs.writeFile(faviconPath, favBuffer);
      } else {
        try {
          await sharp(favBuffer)
            .resize(256, 256, { fit: "cover" })
            .png()
            .toFile(faviconPath);
        } catch (err) {
          console.error("Favicon resize failed:", err.message);
          await fs.writeFile(faviconPath, favBuffer);
        }
      }
    } catch (err) {
      console.error("Favicon error:", err.message);
    }

    await browser.close();

    return res.status(200).json({
      message: "Screenshot and favicon saved successfully",
      screenshot: `/images/${domain}.webp`,
      favicon: `/images/${domain}.png`,
    });
  } catch (error) {
    await browser.close();
    console.error("Processing failed:", error);
    return res.status(500).json({ error: "Failed to capture screenshot" });
  }
}
