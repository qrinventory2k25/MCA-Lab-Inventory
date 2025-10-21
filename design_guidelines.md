# College QR Inventory System - Design Guidelines

## Design Approach
**Utility-Focused Design System** with custom gradient theming inspired by modern data management platforms like Linear and Notion, adapted for an educational inventory context.

## Core Design Principles
- **No Black Colors**: Critical constraint - use deep purples/indigos for darkest tones
- **Gradient Flow**: Primary visual identity flows from blue → indigo → purple
- **High Contrast**: Ensure readability and accessibility across all components
- **Smooth Interactions**: All hover states transition smoothly (200-300ms)
- **Toast Feedback**: Every CRUD operation provides visual confirmation

## Color Palette

**Primary Gradient System:**
- Gradient Start (Blue): 220 85% 55%
- Gradient Mid (Indigo): 250 75% 60%
- Gradient End (Purple): 270 70% 65%

**Semantic Colors:**
- Background Base: 230 25% 98%
- Background Secondary: 235 30% 95%
- Text Primary: 250 50% 20%
- Text Secondary: 245 30% 45%
- Success: 145 65% 50%
- Warning: 35 85% 55%
- Error: 355 75% 55%

**Dark Tones (replacing black):**
- Darkest: 250 45% 15%
- Dark Mid: 245 35% 25%
- Card Borders: 240 20% 85%

## Typography

**Font System:**
- Primary: Inter (via Google Fonts CDN)
- Fallback: system-ui, -apple-system, sans-serif

**Scale:**
- Hero: text-5xl md:text-6xl font-bold
- Page Titles: text-3xl md:text-4xl font-semibold
- Section Headers: text-2xl font-semibold
- Card Titles: text-xl font-medium
- Body: text-base
- Labels: text-sm font-medium
- Captions: text-xs

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Element gaps: gap-4 to gap-8

**Container System:**
- Max width: max-w-7xl mx-auto
- Page padding: px-4 md:px-6 lg:px-8
- Card containers: max-w-4xl for forms

## Component Library

### Navigation
- Sticky header with gradient background overlay
- Logo/title on left, navigation links centered/right
- Active state: underline with gradient color
- Mobile: Hamburger menu with smooth slide-in drawer

### Hero Section (Home Page)
- Full-width gradient background (blue → purple diagonal)
- Hero title with white text and subtle text shadow
- Subheading with reduced opacity
- CTA buttons with glass morphism effect
- College badge/logo with subtle animation on load
- Minimum height: min-h-[60vh]

### Forms (AddSystem, EditSystem)
- Card-based layout with white/light background
- Gradient border accent on focus states
- Dropdown with custom styling matching theme
- Input fields: rounded-lg with focus:ring gradient
- Labels: positioned above inputs with required indicators
- Submit button: full gradient background with hover lift effect
- Spacing between fields: space-y-6

### Data Tables (ViewAll)
- Responsive table with horizontal scroll on mobile
- Alternating row colors: white/light purple tint
- Header row: gradient background with white text
- QR thumbnail: 48px × 48px with rounded corners
- Action buttons: icon buttons with gradient on hover
- Search/filter bar: sticky above table with gradient border
- Checkbox selection: custom styled with gradient check
- Bulk actions bar: appears on selection with slide-down animation

### Cards (System Details)
- White background with subtle shadow: shadow-lg
- Gradient border: 2px gradient stroke
- Rounded corners: rounded-xl
- QR code display: centered, max-w-xs with gradient border
- Info grid: 2-column layout on desktop, stacked on mobile
- Download button: gradient fill with icon

### Buttons
- Primary: Full gradient background, white text, shadow-md, hover:shadow-lg
- Secondary: Gradient border, gradient text, transparent background
- Danger: Red gradient for delete actions
- Icon buttons: circular with gradient on hover
- Disabled state: reduced opacity, grayscale
- All buttons: rounded-lg with 200ms transition

### Modals/Dialogs
- Backdrop: semi-transparent dark purple overlay
- Modal card: white background, max-w-lg, centered
- Close button: top-right with gradient on hover
- Actions: right-aligned with primary/secondary buttons

### Toast Notifications
- Position: top-right, stack vertically
- Success: green gradient left border
- Error: red gradient left border
- Info: blue gradient left border
- Auto-dismiss: 3-4 seconds with progress bar
- Icon + message + close button layout

### QR Code Display
- Container: white background with padding
- Border: 2px gradient border
- Download icon overlay on hover
- Size variations: thumbnail (64px), medium (256px), large (512px)

## Responsive Breakpoints
- Mobile: < 640px (single column layouts)
- Tablet: 640px - 1024px (2-column grids)
- Desktop: > 1024px (full layouts)

## Interactions & Animations
- Page transitions: fade-in on mount
- Hover effects: scale-105 or lift with shadow
- Loading states: gradient shimmer animation
- Form validation: shake animation on error
- Dropdown menus: slide-down with fade
- Modal entrance: scale + fade from center
- All transitions: duration-200 to duration-300

## Accessibility
- Focus rings: gradient outline with 2px offset
- Keyboard navigation: clear focus indicators
- ARIA labels on icon-only buttons
- Contrast ratios: minimum 4.5:1 for text
- Screen reader friendly table headers

## Images
**Hero Section:** Use a high-quality image of a modern computer lab with students/computers, overlaid with gradient (blue-purple, opacity 85%). Image should convey education, technology, and organization. Position: background, object-fit: cover.

**Optional Decorative Elements:** Abstract QR code pattern in background of cards (very low opacity gradient), circuit board texture in footer.

## Special Requirements
- CSV export: styled download button with file icon
- Bulk ZIP download: progress indicator during generation
- Lab color coding: each lab (MCA, BCA, etc.) gets a subtle gradient variation
- System count badges: gradient pills showing total systems per lab
- Empty states: gradient icon with helpful message