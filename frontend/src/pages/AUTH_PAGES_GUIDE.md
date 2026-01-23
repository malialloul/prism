# Cloud API Builder - Authentication Pages

## Overview

Modern, enterprise-grade Sign In and Sign Up pages designed for the Cloud API Builder SaaS platform. Built with React, MUI, Formik, and TypeScript.

## Pages Created

### 1. Sign In Page (`/src/pages/SignIn/`)

**Files:**
- `SignIn.tsx` - Main component
- `SignIn.styles.ts` - Styled components

**Features:**
- Email & password input fields
- Form validation with error messages
- "Forgot password" link
- "Create an account" link
- Social authentication (Google, GitHub)
- Features panel on desktop (right sidebar)
- Loading states with spinner
- Animated card entrance
- Dark/light mode support

**Form Fields:**
- Email (validated)
- Password (6+ characters minimum)

**Styling Features:**
- Glassmorphism effect with blur backdrop
- Gradient background with animated blobs
- Soft shadows and rounded corners
- Smooth transitions on focus/hover
- Responsive mobile-first design

### 2. Sign Up Page (`/src/pages/SignUp/`)

**Files:**
- `SignUp.tsx` - Main component
- `SignUp.styles.ts` - Styled components

**Features:**
- Full name input
- Email input with validation
- Password input with strength indicator
- Confirm password field
- Terms & Privacy checkbox
- Social authentication (Google, GitHub)
- Real-time password strength calculation
- Form validation with Yup
- Loading states
- Animated card entrance
- Dark/light mode support

**Form Fields:**
- Full Name (2+ characters)
- Email (valid email format)
- Password (8+ characters, uppercase, numbers required)
- Confirm Password (must match)
- Terms & Privacy checkbox (required)

**Password Strength Indicator:**
- Visual progress bar with color coding
- Strength levels: Weak, Fair, Good, Strong
- Color gradient: Red → Orange → Yellow → Green
- Real-time calculation based on:
  - Length (8+, 12+ characters)
  - Uppercase letters
  - Numbers
  - Special characters

## Component Structure

### Sign In Component Structure

```
SignIn.tsx
├── AuthWrapper (full-screen background)
├── Container (2-column layout on desktop)
│   ├── CardWrapper (left side - form)
│   │   ├── Logo & Brand
│   │   ├── Formik Form
│   │   │   ├── Email Field
│   │   │   ├── Password Field
│   │   │   ├── Forgot Password Link
│   │   │   ├── Primary Button (Sign In)
│   │   │   ├── Divider
│   │   │   ├── OAuth Buttons (Google, GitHub)
│   │   │   └── Sign Up Link
│   │   └── Loading State
│   └── FeaturePanel (right side - desktop only)
│       ├── Feature 1: Zero Setup
│       ├── Feature 2: Privacy First
│       └── Feature 3: Ship Faster
```

### Sign Up Component Structure

```
SignUp.tsx
├── AuthWrapper (full-screen background)
└── CardWrapper
    ├── Logo & Brand
    └── Formik Form
        ├── Full Name Field
        ├── Email Field
        ├── Password Field
        ├── Password Strength Indicator
        ├── Confirm Password Field
        ├── Terms & Privacy Checkbox
        ├── Primary Button (Create Account)
        ├── Divider
        ├── OAuth Buttons (Google, GitHub)
        └── Sign In Link
```

## Styling Philosophy

### Theme Integration
- Uses MUI's `styled()` API with automatic theme injection
- No explicit prop types needed
- Full dark/light mode support
- Theme colors accessed via `theme.palette`
- Responsive breakpoints via `theme.breakpoints`

### Visual Design Elements
- **Gradients**: Purple to Blue linear gradients for primary CTA
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Shadows**: Soft, multi-layered shadows for depth
- **Rounded Corners**: Consistent 0.75rem (12px) border radius
- **Animations**: Smooth transitions on focus/hover/entry
- **Color Coding**: Error (red), Success (green), Warning (orange)

### Responsive Design
- **Mobile**: Single column, full-width cards
- **Tablet**: Adjusts padding and spacing
- **Desktop**: 2-column layout with feature panel (Sign In only)

## Form Management

### Using Formik for:
- Form state management
- Validation with Yup schema
- Error handling and display
- Touch state tracking
- Submit handling

### Using Yup for:
- Email validation
- Password strength requirements
- Confirmation matching
- Custom validation rules

## Integration Points

### TODO: Implementation Required
- `/SignIn.tsx` Line 56: Sign in logic
- `/SignIn.tsx` Line 111: "Forgot password" navigation
- `/SignIn.tsx` Line 156: "Create an account" navigation
- `/SignUp.tsx` Line 97: Sign up logic
- OAuth handlers for Google & GitHub

### Router Integration
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn/SignIn';
import SignUp from './pages/SignUp/SignUp';

<Routes>
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />
</Routes>
```

## Accessibility Features

- Large input fields (0.875rem padding)
- Clear, descriptive labels
- Error messages tied to fields
- Proper focus states with visible outlines
- Semantic HTML structure
- Checkbox with custom styling but native functionality
- ARIA-compatible form structure

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox support required
- Backdrop filter support (graceful degradation in unsupported browsers)

## Customization

### Change Brand Name
```tsx
// In both SignIn.tsx and SignUp.tsx
<BrandName>Your App Name</BrandName>
```

### Change Colors
Edit `/src/styles/theme.ts`:
```tsx
palette: {
  primary: {
    main: '#your-color',
    light: '#lighter-shade',
  },
}
```

### Change Password Requirements
Edit validation schema in component:
```tsx
password: Yup.string()
  .min(10, 'Custom message')
  .matches(/[A-Z]/, 'Custom uppercase message')
  .required('Custom required message'),
```

## Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| `SignIn.tsx` | Sign In page component | ~180 |
| `SignIn.styles.ts` | Styled components for Sign In | ~200 |
| `SignUp.tsx` | Sign Up page component with strength indicator | ~280 |
| `SignUp.styles.ts` | Styled components for Sign Up | ~220 |

## Dependencies

- React 18+
- MUI Material 5.14+
- Formik 2.x
- Yup (validation)
- Motion/React (animations)
- TypeScript

## Testing Checklist

- [ ] Sign In form submits with valid data
- [ ] Sign In form shows errors for invalid data
- [ ] Sign Up form validates password strength
- [ ] Sign Up form confirms password matching
- [ ] OAuth buttons are clickable
- [ ] Dark/light mode toggle works
- [ ] Mobile responsive layout works
- [ ] Form fields focus states visible
- [ ] Loading spinners display
- [ ] Links navigate correctly

---

**Created**: January 2026
**Framework**: React 18 with Vite
**UI Library**: MUI v5
**Form Management**: Formik + Yup
**Styling**: MUI styled API with theme injection
