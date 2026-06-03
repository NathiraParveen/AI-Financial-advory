# UI Design Specifications - Investment Advisor MVP

## Color Palette

### Primary Colors
- **Primary Blue:** #1976D2 (Actions, highlights)
- **Secondary Blue:** #0D47A1 (Darker backgrounds)
- **Success Green:** #43A047 (Positive metrics, gains)
- **Warning Orange:** #FB8C00 (Alerts, attention)
- **Error Red:** #E53935 (Negative metrics, losses)
- **Neutral Gray:** #9E9E9E (Disabled, secondary text)

### Background Colors
- **Primary Bg:** #FFFFFF (Main content areas)
- **Secondary Bg:** #F5F5F5 (Cards, containers)
- **Dark Bg:** #212121 (Footer, headers - optional)

---

## Typography

**Font Family:** Inter, Segoe UI, Roboto, sans-serif

### Font Sizes
- **H1:** 32px (600 weight) - Page titles
- **H2:** 28px (600 weight) - Section headers
- **H3:** 24px (600 weight) - Subsection headers
- **Body:** 16px (400 weight) - Regular text
- **Caption:** 14px (500 weight) - Labels, secondary text
- **Small:** 12px (400 weight) - Smallest text

### Line Heights
- **Headings:** 1.2
- **Body:** 1.5
- **Captions:** 1.4

---

## Layout Grid System

**Grid:** 12 columns
**Breakpoints:**
- Mobile: 320px - 640px (4 cols)
- Tablet: 641px - 1024px (8 cols)
- Desktop: 1025px+ (12 cols)

**Spacing Unit:** 8px
- Spacing scale: 8px, 16px, 24px, 32px, 48px, 64px

---

## Component Specifications

### Metric Card
```
┌─────────────────────────┐
│ Total Savings      ↗    │
│ $50,000           +5%   │
│ Last updated: Today     │
└─────────────────────────┘
```
- Width: 240px (on desktop)
- Padding: 16px
- Border radius: 8px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)
- Hover: Shadow 0 4px 8px rgba(0,0,0,0.15)

### Button Styles
```
Primary Button
┌──────────────┐
│ Continue →   │ (Blue bg, white text, 16px height)
└──────────────┘

Secondary Button
┌──────────────┐
│ Cancel       │ (Gray border, dark text)
└──────────────┘

Danger Button
┌──────────────┐
│ Delete       │ (Red bg, white text)
└──────────────┘
```

### Form Input
```
Monthly Income
[________________] ← Placeholder: "Enter amount"
Error: Must be positive number (if applicable)
```
- Height: 40px
- Padding: 8px 12px
- Border: 1px solid #E0E0E0
- Border radius: 4px
- Focus: Border color → Primary Blue

### Data Table
```
| Ticker | Quantity | Value   | Gain/Loss | % Return |
|--------|----------|---------|-----------|----------|
| VTI    | 100      | $22,000 | +$2,000   | +9.1%    |
| BND    | 200      | $15,600 | -$400     | -2.5%    |
```
- Row height: 48px
- Hover: Background #F5F5F5
- Sortable headers: Cursor: pointer
- Positive values: Green text
- Negative values: Red text

---

## Page Layouts

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│                DASHBOARD                │
├─────────────────────────────────────────┤
│ Metrics (4 cards in 2x2 grid)           │
│ ┌─────────┐ ┌─────────┐                 │
│ │Savings  │ │Portfolio│                 │
│ └─────────┘ └─────────┘                 │
│ ┌─────────┐ ┌─────────┐                 │
│ │Rate     │ │Goals    │                 │
│ └─────────┘ └─────────┘                 │
├─────────────────────────────────────────┤
│ Allocation Chart (50% width)            │
│ ┌──────────────────────┐                │
│ │     Pie Chart        │                │
│ │  Stocks: 70%         │                │
│ │  Bonds: 20%          │                │
│ │  Real Estate: 10%    │                │
│ └──────────────────────┘                │
│ Top Recommendations (50% width)         │
│ ┌──────────────────────┐                │
│ │ Recommendation Cards │                │
│ └──────────────────────┘                │
└─────────────────────────────────────────┘
```

### Portfolio Page Layout
```
┌─────────────────────────────────────────┐
│              PORTFOLIO                  │
├─────────────────────────────────────────┤
│ Action Buttons: [ Add Holding ] [Upload]│
├─────────────────────────────────────────┤
│ Holdings Table (100% width)             │
│ ┌─────────────────────────────────────┐ │
│ │ Sortable holdings with actions      │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Allocation Chart (sidebar on mobile)    │
│ ┌──────────────────────┐                │
│ │     Pie Chart        │                │
│ └──────────────────────┘                │
└─────────────────────────────────────────┘
```

---

## Responsive Design Breakpoints

### Mobile (320px - 640px)
- Single column layout
- Stack cards vertically
- Full-width forms
- Hamburger menu for navigation
- Font size: 14px body

### Tablet (641px - 1024px)
- 2-column layout
- Grid: 8 columns
- Side-by-side content where possible
- Font size: 15px body

### Desktop (1025px+)
- 3+ column layout
- Grid: 12 columns
- Full layouts with sidebars
- Font size: 16px body

---

## Accessibility Standards

**WCAG 2.1 AA Compliance:**
- Color contrast: 4.5:1 minimum for text
- Focus indicators: Visible focus outlines (2px)
- Keyboard navigation: Tab order follows visual flow
- Form labels: Associated with inputs via <label>
- Alt text: All images have descriptive alt text
- Aria roles: Proper ARIA attributes for complex components

### Focus Ring Style
```css
:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}
```

---

## Interaction Patterns

### Loading State
- Skeleton screens for table/list content
- Spinner for full-page loads
- Progress bar for file uploads
- Minimum display: 300ms

### Error States
- Red border on invalid form fields
- Error message below field
- Toast notification for API errors
- Validation happens on blur + submit

### Success States
- Green checkmark icon
- Toast notification: "Successfully saved"
- Brief celebration animation (optional)
- Auto-dismiss after 3 seconds

---

## Animation Guidelines

**Duration:** 300ms for most interactions
**Easing:** ease-in-out

### Examples:
- Button hover: Slight scale (1.02) + shadow increase
- Card entrance: Fade-in + slight slide-up
- Loading spinner: 1s rotation loop
- Toast notification: Slide-in from top, fade-out

---

## Dark Mode (Future)

If implementing dark mode:
- Primary Bg (dark): #121212
- Secondary Bg (dark): #1E1E1E
- Text (dark): #FFFFFF
- Text secondary (dark): #B0B0B0

---

## Icon Set

Using Material Icons by default:
- 24px for most UI icons
- 32px for large buttons
- 16px for small indicators
- Consistent weight and style

---

*Created: 2026-05-08*  
*For: Investment Advisor MVP - Sprint 1*
