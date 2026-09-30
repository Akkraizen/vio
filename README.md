# VIO — URL Shortener Service

> [!NOTE]
> This project is a rewrite version of [k-ls](https://github.com/Akkraizen/k-ls/).

**VIO** is a fast, lightweight, and stylish client-side URL shortening service built entirely for the browser.

---

## Features

- **Instant URL Shortening**: Quick generation of compact links with 8-character Base62 hash.
- **Client-Side & Backendless**: Fully functional in the browser using `localStorage` with hash encoding support.
- **Interactive Redirection Screen**: Built-in 3-second countdown page with options to redirect immediately or cancel.
- **Shortening History**:
  - Automatically saves the last 20 shortened links in local storage.
  - Clickable links for both original and shortened URLs.
  - Ability to delete individual items or clear entire history.

---

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Native CSS with CSS Custom Properties (Variables)

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Package manager (`npm`, `pnpm`, or `yarn`)

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Akkraizen/vio.git
   cd vio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```text
src/
├── assets/          # Static assets (icons, images)
├── components/      # Vue components
│   ├── History.vue       # History list container component
│   ├── HistoryItem.vue   # Individual history item with actions
│   └── LatestResult.vue  # Card displaying the most recent shortened URL
├── composables/     # Vue Composables (useClipboard, etc.)
├── models/          # TypeScript interfaces and types
├── utils/           # Utility functions (hash, storage, url normalization)
├── App.vue          # Root application component
├── main.ts          # Application entry point
└── style.css        # Global design tokens, themes, and base styles
```
