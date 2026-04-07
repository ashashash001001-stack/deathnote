# Draft: UI Upgrade - Zen & Elegant Bookstore Design System

## Requirements (confirmed)

### Core Aesthetic
- **Style**: Japanese Wabi-Sabi, Zen, Minimalist Literary
- **Philosophy**: Reduce cold tech feel, pursue warm paper book tactile experience
- **Design Principle**: Heavy whitespace/padding/margin for content separation, no heavy borders or strong shadows

### Design Tokens (CSS Variables)

**Background Colors (Warm Paper & Earth Tones):**
- `--bg-outer: #e9e6df` - Outermost web background
- `--bg-base: #f7f5f0` - Main interface/list background (cream white)
- `--bg-reading: #f2ebd9` - Reading area background (aged parchment)

**Text Colors (Reduced contrast for eye protection):**
- `--text-dark: #3b3a37` - Dark gray-brown for body text and titles (NEVER pure black)
- `--text-muted: #858178` - Light gray-brown for secondary info, time, TOC numbers

**Accent Color:**
- `--accent: #a39171` - Dried leaf/earth gold for hover states or accents

### Typography System

**Content/Title Fonts (Literary feel):**
- Variable: `--font-serif: "Noto Serif TC", "Songti TC", "PMingLiU", serif;`
- Usage: Novel titles, book covers, reading text, chapter names

**Interface/Navigation Fonts (Functional):**
- Variable: `--font-sans: "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif;`
- Usage: Top navigation, time, author names, metadata

**Reading Area Paragraph Rules (Zen Typography):**
- Font size: 18px
- Line-height: 2.4 (extremely relaxed)
- Letter-spacing: 1.8px
- Paragraph format: `text-indent: 2em;` (first line indent), `margin-bottom: 1.8em;`, `text-align: justify;`

### Component Library Rules

**CSS-Only Book Cover:**
- No external images - use CSS background (e.g., #d8cfc4)
- MUST use vertical text: `writing-mode: vertical-rl;`
- Left side needs 2px semi-transparent black overlay via ::after to simulate book spine fold
- Soft asymmetric shadow: `box-shadow: -6px 12px 20px rgba(0,0,0,0.06);`

**Immersive Navbar:**
- Background: downward linear gradient transparent (from --bg-base to transparent)
- Letter-spacing: 2px
- In reading mode: `CSS transform: translateY(-100%)` auto-hide for silent feel

**Lists & TOC:**
- Remove all list styles
- Items separated by faint underline: `border-bottom: 1px solid rgba(0,0,0,0.04);`

**Micro-interactions:**
- Page transitions: gentle easeIn (0.6s, 8px upward float)
- Feedback: avoid color jumps - subtle `transform: translateY(-5px)` or `scale(0.98)`

## Scope Boundaries
- IN: Global CSS design tokens, typography system, core UI components
- EX: Backend logic, database, server-side code

## Technical Decisions
- Framework to check: Need to verify from codebase exploration
- Implementation approach: CSS variables in :root, follow existing CSS organization

## Open Questions
- What framework is the current project using?
- Where are the current CSS files located?
- Are there existing CSS variables that need to be preserved or replaced?

## Research Findings

**Current Architecture:**
- Static site generator (vanilla HTML/CSS/JS, zero dependencies)
- Build tool: `generate.mjs` generates all 48+ HTML pages from data in `src/data.js`
- CSS location: `src/styles.css` (main design system) - gets inlined into all HTML during build
- Current design: Neo-Brutalism style with bold borders, hard shadows, orange (#FF6B00) primary color

**Key Finding:**
The CSS from `src/styles.css` is automatically embedded into EVERY generated HTML page during build. So updating `src/styles.css` + running `bun run generate.mjs` will propagate the new design system to all pages.

**Files to modify:**
- `src/styles.css`: Primary target - design tokens and component styles
- `src/data.js`: May need updates if generate.mjs has hardcoded styles

**Build command:**
`bun run generate.mjs` (or `node generate.mjs`)
