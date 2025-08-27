# Design System Documentation

## Overview

This documentation covers the comprehensive design system implementation for the Finance Tracker application. The design system provides consistent styling across all components through CSS custom properties (variables) and utility classes.

## Architecture

The design system is built around CSS custom properties (CSS variables) defined in `/src/assets/styles/design-system.css` and imported globally through `App.vue`.

### File Structure

```
src/
├── assets/
│   └── styles/
│       └── design-system.css    # Main design system file
├── App.vue                      # Global imports and app-level styles
└── components/views/            # Components using design system
```

## CSS Variables Reference

### Colors

#### Primary Colors
```css
--color-primary-50 to --color-primary-900  /* Blue color scale */
--color-primary: var(--color-primary-600)  /* Main primary color */
```

#### Secondary Colors
```css
--color-secondary-50 to --color-secondary-900  /* Gray color scale */
--color-secondary: var(--color-secondary-600)  /* Main secondary color */
```

#### Surface Colors
```css
--color-surface-primary        /* Main background */
--color-surface-secondary      /* Cards, elevated surfaces */
--color-surface-tertiary       /* Subtle backgrounds */
--color-surface-elevated       /* Modals, dropdowns */
--color-surface-overlay        /* Modal overlays */
```

#### Text Colors
```css
--color-text-primary           /* Main text */
--color-text-secondary         /* Secondary text */
--color-text-tertiary          /* Muted text */
--color-text-inverse           /* White text on dark backgrounds */
--color-text-muted             /* Disabled/placeholder text */
```

#### Status Colors
```css
/* Success (Green) */
--color-success-50 to --color-success-900
--color-success-500            /* Main success color */

/* Error (Red) */
--color-error-50 to --color-error-900
--color-error-500              /* Main error color */

/* Warning (Yellow) */
--color-warning-50 to --color-warning-900
--color-warning-500            /* Main warning color */

/* Info (Blue) */
--color-info-50 to --color-info-900
--color-info-500               /* Main info color */
```

#### Border Colors
```css
--color-border-primary         /* Main borders */
--color-border-secondary       /* Subtle borders */
--color-border-focus           /* Focus states */
--color-border-error           /* Error states */
--color-border-success         /* Success states */
```

### Typography

#### Font Families
```css
--font-family-primary          /* Main UI font */
--font-family-secondary        /* Alternative font */
--font-family-mono             /* Monospace font */
```

#### Font Sizes
```css
--font-size-xs: 0.75rem        /* 12px */
--font-size-sm: 0.875rem       /* 14px */
--font-size-base: 1rem         /* 16px */
--font-size-lg: 1.125rem       /* 18px */
--font-size-xl: 1.25rem        /* 20px */
--font-size-2xl: 1.5rem        /* 24px */
--font-size-3xl: 1.875rem      /* 30px */
--font-size-4xl: 2.25rem       /* 36px */
--font-size-5xl: 3rem          /* 48px */
--font-size-6xl: 3.75rem       /* 60px */
```

#### Font Weights
```css
--font-weight-thin: 100
--font-weight-light: 300
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-extrabold: 800
--font-weight-black: 900
```

#### Line Heights
```css
--line-height-tight: 1.25
--line-height-normal: 1.5
--line-height-relaxed: 1.625
--line-height-loose: 2
```

### Spacing

#### Space Scale
```css
--space-0: 0                   /* 0px */
--space-1: 0.25rem             /* 4px */
--space-2: 0.5rem              /* 8px */
--space-3: 0.75rem             /* 12px */
--space-4: 1rem                /* 16px */
--space-5: 1.25rem             /* 20px */
--space-6: 1.5rem              /* 24px */
--space-8: 2rem                /* 32px */
--space-10: 2.5rem             /* 40px */
--space-12: 3rem               /* 48px */
--space-16: 4rem               /* 64px */
--space-20: 5rem               /* 80px */
--space-24: 6rem               /* 96px */
--space-32: 8rem               /* 128px */
```

#### Sizing
```css
--size-xs: 0.5rem              /* 8px */
--size-sm: 0.75rem             /* 12px */
--size-base: 1rem              /* 16px */
--size-lg: 1.5rem              /* 24px */
--size-xl: 2rem                /* 32px */
--size-2xl: 2.5rem             /* 40px */
--size-3xl: 3rem               /* 48px */
--size-4xl: 4rem               /* 64px */
```

### Border Radius

```css
--radius-none: 0
--radius-sm: 0.125rem          /* 2px */
--radius-base: 0.25rem         /* 4px */
--radius-md: 0.375rem          /* 6px */
--radius-lg: 0.5rem            /* 8px */
--radius-xl: 0.75rem           /* 12px */
--radius-2xl: 1rem             /* 16px */
--radius-3xl: 1.5rem           /* 24px */
--radius-full: 9999px
```

### Shadows

```css
--shadow-xs                    /* Subtle shadow */
--shadow-sm                    /* Small shadow */
--shadow-base                  /* Base shadow */
--shadow-md                    /* Medium shadow */
--shadow-lg                    /* Large shadow */
--shadow-xl                    /* Extra large shadow */
--shadow-inner                 /* Inner shadow */
--shadow-none                  /* No shadow */
```

### Transitions

```css
--transition-fast: 150ms ease-in-out
--transition-base: 300ms ease-in-out
--transition-slow: 500ms ease-in-out
--transition-colors             /* Color transitions */
--transition-transform          /* Transform transitions */
--transition-opacity           /* Opacity transitions */
--transition-all               /* All properties */
```

### Component Specific Variables

#### Buttons
```css
--button-height-sm: 2rem       /* 32px */
--button-height-base: 2.5rem   /* 40px */
--button-height-lg: 3rem       /* 48px */
--button-padding-x-sm: 0.75rem
--button-padding-x-base: 1rem
--button-padding-x-lg: 1.5rem
```

#### Inputs
```css
--input-height-sm: 2rem        /* 32px */
--input-height-base: 2.5rem    /* 40px */
--input-height-lg: 3rem        /* 48px */
--input-padding-x: 0.75rem
--input-padding-y: 0.5rem
```

#### Cards
```css
--card-padding: 1.5rem
--card-radius: var(--radius-lg)
--card-shadow: var(--shadow-sm)
```

#### Layout
```css
--container-max-width: 1200px
--sidebar-width: 280px
--sidebar-width-collapsed: 70px
--header-height: 70px
```

### Z-Index Scale

```css
--z-index-dropdown: 1000
--z-index-sticky: 1020
--z-index-fixed: 1030
--z-index-modal-backdrop: 1040
--z-index-modal: 1050
--z-index-popover: 1060
--z-index-tooltip: 1070
--z-index-toast: 1080
```

## Dark Mode

The design system includes automatic dark mode support. Dark mode is controlled by adding the `dark` class to the `:root` element.

### Dark Mode Variables

Dark mode overrides specific variables:

```css
:root.dark {
  /* Surface colors are darker */
  --color-surface-primary: #0f172a;
  --color-surface-secondary: #1e293b;
  
  /* Text colors are lighter */
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #cbd5e1;
  
  /* Borders are lighter */
  --color-border-primary: #334155;
  
  /* Shadows are more pronounced */
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
}
```

### Dark Mode Toggle

The dark mode toggle is implemented in `App.vue`:

```javascript
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value));
  updateTheme();
};

const updateTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```

## Utility Classes

The design system includes comprehensive utility classes for common styling patterns.

### Typography Utilities

```css
/* Font Sizes */
.text-xs, .text-sm, .text-base, .text-lg, .text-xl
.text-2xl, .text-3xl, .text-4xl, .text-5xl, .text-6xl

/* Font Weights */
.font-thin, .font-light, .font-normal, .font-medium
.font-semibold, .font-bold, .font-extrabold, .font-black

/* Line Heights */
.leading-tight, .leading-normal, .leading-relaxed, .leading-loose

/* Text Colors */
.text-primary, .text-secondary, .text-tertiary
.text-quaternary, .text-muted, .text-inverse
```

### Layout Utilities

```css
/* Flexbox */
.flex, .flex-col, .flex-row, .flex-wrap, .flex-nowrap
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-around
.justify-evenly, .justify-start, .justify-end
.flex-1

/* Grid */
.grid, .grid-cols-1, .grid-cols-2, .grid-cols-3, .grid-cols-4
.gap-1, .gap-2, .gap-3, .gap-4, .gap-5, .gap-6, .gap-8
```

### Spacing Utilities

```css
/* Padding */
.p-0, .p-1, .p-2, .p-3, .p-4, .p-5, .p-6, .p-8, .p-10, .p-12
.px-1, .px-2, .px-3, .px-4, .px-5, .px-6, .px-8
.py-1, .py-2, .py-3, .py-4, .py-5, .py-6, .py-8

/* Margin */
.m-0, .m-1, .m-2, .m-3, .m-4, .m-5, .m-6, .m-8
.mx-1, .mx-2, .mx-3, .mx-4, .mx-auto
.my-1, .my-2, .my-3, .my-4, .my-6, .my-8
.mt-0, .mt-1, .mt-2, .mt-3, .mt-4, .mt-6, .mt-8
.mb-0, .mb-1, .mb-2, .mb-3, .mb-4, .mb-6, .mb-8
```

## Component Classes

### Buttons

The design system provides a comprehensive button component system:

```css
/* Base button class */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--button-padding-x-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-all);
  height: var(--button-height-base);
}

/* Button variants */
.btn-primary { /* Primary blue button */ }
.btn-secondary { /* Secondary gray button */ }
.btn-success { /* Success green button */ }
.btn-danger { /* Danger red button */ }
.btn-ghost { /* Transparent button */ }

/* Button sizes */
.btn-sm { height: var(--button-height-sm); }
.btn-lg { height: var(--button-height-lg); }
```

Usage example:
```html
<button class="btn btn-primary">Save</button>
<button class="btn btn-secondary btn-sm">Cancel</button>
<button class="btn btn-success btn-lg">Submit</button>
```

### Form Controls

```css
.form-control {
  display: block;
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  transition: var(--transition-colors);
  height: var(--input-height-base);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

Usage example:
```html
<input type="text" class="form-control" placeholder="Enter text">
<select class="form-control">
  <option>Option 1</option>
</select>
<textarea class="form-control"></textarea>
```

### Cards

```css
.card {
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: var(--transition-all);
  padding: var(--card-padding);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header {
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-primary);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

Usage example:
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Card subtitle</p>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
</div>
```

### Tables

```css
.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table th,
.table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--color-border-primary);
}

.table th {
  background-color: var(--color-surface-secondary);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-success {
  background-color: var(--color-success-100);
  color: var(--color-success-700);
}

.badge-error {
  background-color: var(--color-error-100);
  color: var(--color-error-700);
}
```

## Responsive Design

The design system includes responsive breakpoints and utilities:

### Breakpoints

```css
/* Mobile portrait */
@media (max-width: 480px) { }

/* Mobile landscape and tablet portrait */
@media (max-width: 768px) { }

/* Tablet landscape */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1200px) { }
```

### Responsive Behavior

Components automatically adjust for different screen sizes:

- Containers use responsive padding
- Cards adjust padding on mobile
- Grid layouts collapse to single column on mobile
- Button sizes adjust for touch targets
- Typography scales appropriately

## Animation System

### Transition Variables

```css
--transition-fast: 150ms ease-in-out
--transition-base: 300ms ease-in-out
--transition-slow: 500ms ease-in-out
```

### Built-in Animations

```css
/* Loading spinner */
.spinner {
  animation: spin 0.8s linear infinite;
}

/* Pulse effect */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Vue transition classes */
.fade-enter-active, .fade-leave-active {
  transition: var(--transition-opacity);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: var(--transition-transform);
}

.scale-enter-active, .scale-leave-active {
  transition: var(--transition-transform);
}
```

## Usage Examples

### Basic Component Styling

```vue
<template>
  <div class="card p-6">
    <h2 class="text-xl font-semibold text-primary mb-4">Component Title</h2>
    <p class="text-secondary mb-6">Component description goes here.</p>
    
    <form class="flex flex-col gap-4">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Enter your name"
      />
      <button type="submit" class="btn btn-primary">
        Submit
      </button>
    </form>
  </div>
</template>

<style scoped>
.custom-component {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: var(--transition-all);
}

.custom-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
```

### Creating Custom Components

When creating new components, follow these guidelines:

1. **Use CSS variables** instead of hardcoded values
2. **Apply consistent spacing** using the space scale
3. **Follow color semantics** (primary, secondary, success, error)
4. **Include responsive behavior** for different screen sizes
5. **Add appropriate transitions** for interactive elements

Example:
```css
.my-custom-card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  transition: var(--transition-all);
}

.my-custom-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .my-custom-card {
    padding: var(--space-4);
  }
}
```

## Accessibility

The design system includes accessibility features:

### Focus Management

```css
.focus-outline:focus,
.btn:focus,
.form-control:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### High Contrast

```css
@media (prefers-contrast: high) {
  :root {
    --color-border-primary: #000000;
    --color-text-primary: #000000;
  }
  
  :root.dark {
    --color-border-primary: #ffffff;
    --color-text-primary: #ffffff;
  }
}
```

### Screen Reader Support

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Best Practices

### 1. Use Semantic Colors

```css
/* Good */
color: var(--color-error-600);
background: var(--color-success-100);

/* Avoid */
color: #dc2626;
background: #dcfce7;
```

### 2. Consistent Spacing

```css
/* Good */
padding: var(--space-4) var(--space-6);
margin-bottom: var(--space-3);

/* Avoid */
padding: 16px 24px;
margin-bottom: 12px;
```

### 3. Use Transition Variables

```css
/* Good */
transition: var(--transition-all);

/* Avoid */
transition: all 300ms ease-in-out;
```

### 4. Follow the Type Scale

```css
/* Good */
font-size: var(--font-size-lg);
font-weight: var(--font-weight-semibold);

/* Avoid */
font-size: 18px;
font-weight: 600;
```

### 5. Responsive Design

```css
/* Good - Use consistent breakpoints */
@media (max-width: 768px) {
  .component {
    padding: var(--space-4);
  }
}

/* Avoid - Random breakpoints */
@media (max-width: 850px) {
  .component {
    padding: 16px;
  }
}
```

## Migration Guide

### From Hardcoded Values to Design System

1. **Replace colors** with semantic variables
2. **Use spacing scale** instead of arbitrary values
3. **Apply typography scale** consistently
4. **Use component classes** for common patterns
5. **Add responsive behavior** using standard breakpoints

### Example Migration

Before:
```css
.old-button {
  background: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.old-button:hover {
  background: #2563eb;
}
```

After:
```html
<button class="btn btn-primary">Button Text</button>
```

Or with custom styling:
```css
.new-button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--button-padding-x-base);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-all);
}

.new-button:hover {
  background: var(--color-primary-700);
}
```

## Conclusion

This design system provides a comprehensive foundation for building consistent, accessible, and maintainable user interfaces. By following the guidelines and using the provided variables and classes, you can ensure your components integrate seamlessly with the overall design language while maintaining flexibility for customization.

The system is designed to be:
- **Consistent**: All components follow the same design principles
- **Scalable**: Easy to extend with new components and variations
- **Accessible**: Built-in support for screen readers, high contrast, and reduced motion
- **Responsive**: Mobile-first approach with consistent breakpoints
- **Maintainable**: CSS variables make theme changes and updates simple

For questions or contributions to the design system, please refer to the component examples in the codebase and follow the established patterns.
