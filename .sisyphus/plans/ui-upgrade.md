# UI Upgrade Work Plan: Zen & Elegant Bookstore Design System

## Project: DeathNote - Design System Overhaul
**Target**: Neo-Brutalism → Japanese Wabi-Sabi / Zen Aesthetic

---

## Scope

### In Scope
- Global CSS design tokens (colors, fonts, spacing)
- Typography system (serif vs sans separation)
- Core UI components (header, footer, cards, book covers)
- Reader page typography
- Micro-interactions and transitions

### Out of Scope
- Backend logic / data structure
- JavaScript functionality
- SEO metadata
- Content (novels, chapters)

---

## Implementation Steps

### Phase 1: Design Tokens (Lines 10-135)
- [x] 1.1 Replace color palette with warm earth tones
- [x] 1.2 Update spacing system (keep but adjust values)
- [x] 1.3 Update typography scale
- [x] 1.4 Add new font variables (serif/sans)
- [x] 1.5 Update shadows (soft, asymmetric)
- [x] 1.6 Update motion (slower, gentler)
- [ ] 1.7 Keep theme support (night/sepia) but adapt colors

### Phase 2: Global Styles (Lines 169-246)
- [ ] 2.1 Update body background to --bg-outer
- [ ] 2.2 Update font-family to use new system
- [ ] 2.3 Update micro-interactions

### Phase 3: Header & Footer (Lines 252-307)
- [ ] 3.1 Remove bold borders
- [ ] 3.2 Add transparent gradient to header
- [ ] 3.3 Update footer to minimal style
- [ ] 3.4 Implement auto-hide navbar for reader

### Phase 4: Home Page Components (Lines 313-860)
- [ ] 4.1 Update hero section (no bold colors)
- [ ] 4.2 Update featured cards
- [ ] 4.3 Update ranking list
- [ ] 4.4 Update category grid
- [ ] 4.5 Update latest updates

### Phase 5: Book Covers (Lines 842-936)
- [ ] 5.1 CSS-only book cover with vertical text
- [ ] 5.2 Book spine overlay
- [ ] 5.3 Soft asymmetric shadow

### Phase 6: Book Detail & TOC (Lines 938-1094)
- [ ] 6.1 Update detail hero
- [ ] 6.2 Update sticky CTA
- [ ] 6.3 Update TOC (minimal borders)

### Phase 7: Reader Page (Lines 1096-1388)
- [ ] 7.1 Update reader typography (18px, 2.4 line-height, 1.8 letter-spacing)
- [ ] 7.2 Update reader toolbar (minimal)
- [ ] 7.3 Update reader content paragraphs
- [ ] 7.4 Implement navbar auto-hide in reading mode

### Phase 8: Other Pages (Lines 1630-1814)
- [ ] 8.1 Update search page
- [ ] 8.2 Update category page
- [ ] 8.3 Update legal page

### Phase 9: Build & QA
- [ ] 9.1 Run `bun run generate.mjs`
- [ ] 9.2 Verify no lint errors
- [ ] 9.3 Check sample pages render correctly

---

## Technical Notes

- CSS source: `src/styles.css` (1791 lines)
- Build command: `bun run generate.mjs`
- Generated pages inherit CSS inline during build

## Acceptance Criteria

1. All design tokens updated per spec
2. Typography uses Noto Serif TC for content, Noto Sans TC for interface
3. Reader has 18px font, 2.4 line-height, 1.8px letter-spacing
4. CSS book covers use vertical text (writing-mode: vertical-rl)
5. No harsh borders or strong shadows
6. Gentle micro-interactions (0.6s transitions)
7. All pages generate without errors
8. No TypeScript/lint errors in CSS
