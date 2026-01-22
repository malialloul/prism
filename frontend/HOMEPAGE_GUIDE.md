# APIBuilder - Modern SaaS Homepage

A beautiful, production-ready SaaS homepage for an API builder platform that allows non-technical users to create APIs visually.

## Component Structure

Each component follows this folder structure:
```
components/
  ├── ComponentName/
  │   ├── ComponentName.tsx      # Main component
  │   └── ComponentName.styles.ts # Styled-components styles
```

## Components

### 1. **Header** (`Header/`)
- Navigation bar with logo
- Links: Home, Features, Pricing, Docs
- Login and Sign Up buttons
- Sticky positioning with gradient background

### 2. **Hero** (`Hero/`)
- Main headline: "Build APIs Visually Without Writing Code"
- Compelling subtitle
- Call-to-action buttons: "Get Started Free" and "Watch Demo"
- Visual illustration placeholder
- Responsive grid layout

### 3. **Features** (`Features/`)
- Section showcasing 4 core features:
  1. Connect or Create Databases (PostgreSQL/MySQL)
  2. Visual Schema & ER Diagrams
  3. Automatic CRUD APIs
  4. Custom API Builder (Drag & Drop)
- Feature cards with icons and descriptions
- Hover effects for interactivity

### 4. **Benefits** (`Benefits/`)
- Two sections:
  - **Why Choose APIBuilder**: 3 key metrics (100% Code-Free, 10x Faster, ∞ Scalable)
  - **Testimonials**: 3 user testimonials with avatars and roles
- Cards with hover effects
- Responsive grid (3 columns on desktop, 1 on mobile)

### 5. **Footer** (`Footer/`)
- 4-column footer layout:
  - Product
  - Docs
  - Company
  - Legal
- Social links (Twitter, LinkedIn, GitHub, Discord)
- Copyright notice
- Dark theme with gradient background

## Design System

### Colors
- **Primary Blue**: `#2563eb` - `#3b82f6` (gradient)
- **Dark Text**: `#0f172a`
- **Gray Text**: `#64748b`, `#475569`
- **Light Background**: `#f8f9ff`, `#f0f9ff`
- **White**: `#ffffff`
- **Borders**: `#e2e8f0`, `#e0e7ff`

### Typography
- **Titles**: Font size 2.5rem-3rem, weight 800
- **Subtitles**: Font size 1.1rem-1.2rem, weight 500-600
- **Body**: Font size 0.9rem-1rem, weight 400-500

### Spacing & Layout
- Max container width: 1200px
- Gap between sections: 6rem desktop, 4rem mobile
- Card padding: 2rem
- Border radius: 12px-20px

### Interactions
- Smooth transitions (0.3s ease)
- Hover effects:
  - Card lift (translateY -4px)
  - Border color change to primary blue
  - Box shadow enhancement
- Active/focus states for buttons

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (@mui/material)** - Component library
- **Material-UI Icons (@mui/icons-material)** - Icon set
- **Styled-components** - CSS-in-JS styling
- **Vite** - Build tool

## Usage

```tsx
import { Header } from './components/Header/Header'
import { Hero } from './components/Hero/Hero'
import { Features } from './components/Features/Features'
import { Benefits } from './components/Benefits/Benefits'
import { Footer } from './components/Footer/Footer'

export default function App() {
  return (
    <>
      <Header onSignUp={() => {}} onLogin={() => {}} />
      <Hero onGetStarted={() => {}} onSignUp={() => {}} />
      <Features />
      <Benefits />
      <Footer />
    </>
  )
}
```

## Features Highlights

✅ **Responsive Design**
- Mobile-first approach
- Breakpoint at 768px for tablet/desktop
- Flexible grid layouts

✅ **Accessibility**
- Semantic HTML
- Proper heading hierarchy
- ARIA-friendly components

✅ **Performance**
- Optimized images and icons
- CSS-in-JS for better code splitting
- Lazy-loadable sections

✅ **User-Friendly**
- Clear CTAs and navigation
- Intuitive visual hierarchy
- Friendly, approachable messaging

## Customization

To customize:

1. **Colors**: Update the gradient colors in each component's `.styles.ts` file
2. **Text**: Update content in the `.tsx` files
3. **Icons**: Replace with different Material-UI icons
4. **Layout**: Modify grid columns and spacing in `.styles.ts`
5. **Animations**: Adjust transition values in styled components

## Next Steps

- Add authentication modal/page
- Implement pricing page
- Add blog section
- Integrate with backend API
- Add analytics tracking
- Deploy to production
