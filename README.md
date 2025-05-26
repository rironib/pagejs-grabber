# SiteLike – Website Screenshot & Favicon Tool

A simple web utility that generates a **1920x1080 `.webp` screenshot** and fetches the **highest-quality favicon** of any website via its domain.

Built with **Next.js (Pages Router)**, **Puppeteer**, and **Tailwind CSS**.

---

## 🚀 Features

- ✅ Instant full-page screenshot of a website
- ✅ Auto-favicon extraction (prefers Apple Touch Icon or highest-resolution PNG)
- ✅ Clean and responsive UI
- ✅ No temp files — saves directly to `/public/images/`
- ✅ CORS restricted to specific origins (e.g. `localhost`, `www.sitelike.me`)

---

## 📦 Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/sitelike.git
cd sitelike
```

2. **Install dependencies:**

We recommend using `pnpm`, but `npm` or `yarn` also work.

```bash
pnpm install
# or
npm install
# or
yarn install
```

3. **Run the development server:**

```bash
pnpm dev
# or
npm run dev
```

Navigate to: `http://localhost:3000`

---

## 🔧 Configuration

### ✅ Puppeteer Setup

No special config is needed. Puppeteer is installed automatically and runs in headless mode to capture screenshots and parse favicons.

### ✅ CORS Configuration

The API is restricted to requests from:

- `http://localhost:3000`
- `https://www.sitelike.me`
- `https://admin.sitelike.me`

Adjust this in `pages/api/process.js` if needed.

---

## 🌐 How to Use

### 1. Paste or type a domain like `example.com`.

### 2. Click **Generate**.

- The app will:
  - Normalize the URL (add `https://` if missing)
  - Launch Puppeteer
  - Capture a 1920x1080 `.webp` screenshot
  - Extract the highest quality favicon available

### 3. View Results

- ✅ Screenshot: `/public/images/screenshot/example.com.webp`
- ✅ Favicon: `/public/images/icon/example.com.png`

You can also directly access them via:

```
http://localhost:3000/images/screenshot/example.com.webp
http://localhost:3000/images/icon/example.com.png
```

---

## 📁 Directory Structure

```bash
/public/
  images/
    screenshot/
      example.com.webp
    icon/
      example.com.png
/pages/
  api/
    process.js         # API route to handle screenshot + favicon
/pages/
  index.js             # Main UI
```

---

## 🧪 Example API Request (Manual)

```
GET /api/process?domain=example.com
```

Returns:

```json
{
  "favicon": "/images/icon/example.com.png",
  "screenshot": "/images/screenshot/example.com.webp"
}
```

---

## 📋 License

MIT — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built by [RONiB](https://github.com/rironib)
