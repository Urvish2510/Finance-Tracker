# Design System Quick Reference

## 🎨 Using the Design System

The Finance Tracker application uses a comprehensive design system with CSS variables for consistent theming across all components.

## 📁 File Structure

- **`/src/assets/styles/design-system.css`** - Main design system file (imported globally)
- **`/src/App.vue`** - Imports design system and manages dark mode
- **Components** - Use design system variables and utility classes

## 🌓 Theme Support

### Light & Dark Mode
The application automatically supports light and dark modes:

```javascript
// Theme toggle (already implemented in App.vue)
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark');
};
```

### CSS Variables Usage

```css
/* Instead of hardcoded colors */
/* ❌ Bad */
background-color: #ffffff;
color: #000000;
border: 1px solid #e5e7eb;

/* ✅ Good */
background-color: var(--color-surface-elevated);
color: var(--color-text-primary);
border: 1px solid var(--color-border-primary);
```

## 🎯 Common Patterns

### 1. Cards
```vue
<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Title</h3>
      <p class="card-subtitle">Subtitle</p>
    </div>
    <div class="card-body">
      Content goes here
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  box-shadow: var(--card-shadow);
  transition: var(--transition-all);
}
</style>
```

### 2. Buttons
```vue
<template>
  <!-- Use predefined button classes -->
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-secondary btn-sm">Cancel</button>
  
  <!-- Or custom styling -->
  <button class="custom-btn">Custom Button</button>
</template>

<style scoped>
.custom-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: var(--button-padding-x-base);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-all);
  height: var(--button-height-base);
}

.custom-btn:hover {
  background: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
</style>
```

### 3. Form Controls
```vue
<template>
  <form class="form-container">
    <div class="form-group">
      <label>Name</label>
      <input type="text" class="form-control" placeholder="Enter name">
    </div>
    
    <div class="form-group">
      <label>Category</label>
      <select class="form-control">
        <option>Option 1</option>
      </select>
    </div>
    
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Submit</button>
      <button type="button" class="btn btn-secondary">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
</style>
```

### 4. Tables
```vue
<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Item 1</td>
          <td class="amount">$100.00</td>
          <td>
            <button class="btn-icon edit-btn">✏️</button>
            <button class="btn-icon delete-btn">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
}

.amount {
  font-weight: var(--font-weight-bold);
  color: var(--color-success-600);
}

.btn-icon {
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: var(--transition-colors);
  margin-right: var(--space-1);
}

.edit-btn {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.delete-btn {
  background: var(--color-error-100);
  color: var(--color-error-700);
}
</style>
```

## 📏 Spacing & Layout

### Quick Reference
```css
/* Padding */
padding: var(--space-4);           /* 16px */
padding: var(--space-6);           /* 24px */
padding: var(--card-padding);      /* 24px - semantic for cards */

/* Margins */
margin-bottom: var(--space-3);     /* 12px */
margin-top: var(--space-8);        /* 32px */

/* Gaps in flexbox/grid */
gap: var(--space-4);               /* 16px */
gap: var(--space-5);               /* 20px */
```

### Utility Classes
```html
<!-- Typography -->
<h1 class="text-2xl font-bold text-primary">Title</h1>
<p class="text-sm text-secondary">Description</p>

<!-- Layout -->
<div class="flex items-center justify-between p-6">
  <div class="flex-1">Content</div>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Grid -->
<div class="grid grid-cols-2 gap-4">
  <div class="card p-4">Card 1</div>
  <div class="card p-4">Card 2</div>
</div>
```

## 🎨 Color Usage

### Semantic Colors
```css
/* Text */
color: var(--color-text-primary);      /* Main text */
color: var(--color-text-secondary);    /* Secondary text */
color: var(--color-text-muted);        /* Muted/disabled text */

/* Backgrounds */
background: var(--color-surface-primary);    /* Main background */
background: var(--color-surface-elevated);   /* Cards, modals */
background: var(--color-surface-secondary);  /* Subtle backgrounds */

/* Status Colors */
color: var(--color-success-600);       /* Success text */
color: var(--color-error-600);         /* Error text */
color: var(--color-warning-600);       /* Warning text */
background: var(--color-success-100);  /* Success background */
background: var(--color-error-100);    /* Error background */

/* Interactive */
border-color: var(--color-border-focus);    /* Focus states */
background: var(--color-primary);           /* Primary actions */
background: var(--color-primary-700);       /* Hover states */
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile Portrait */
@media (max-width: 480px) {
  .component {
    padding: var(--space-3);
    font-size: var(--font-size-sm);
  }
}

/* Mobile Landscape / Tablet Portrait */
@media (max-width: 768px) {
  .component {
    padding: var(--space-4);
  }
}

/* Tablet Landscape */
@media (max-width: 1024px) {
  .component {
    padding: var(--space-5);
  }
}

/* Desktop */
@media (min-width: 1200px) {
  .component {
    padding: var(--space-8);
  }
}
```

## ⚡ Quick Tips

### 1. Always Use Variables
```css
/* ✅ Good */
font-size: var(--font-size-lg);
padding: var(--space-4) var(--space-6);
border-radius: var(--radius-lg);

/* ❌ Avoid */
font-size: 18px;
padding: 16px 24px;
border-radius: 8px;
```

### 2. Follow the Component Pattern
```css
.my-component {
  /* Use design system variables */
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  
  /* Add consistent transitions */
  transition: var(--transition-all);
}

.my-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### 3. Responsive First
```css
.responsive-component {
  /* Mobile first (base styles) */
  padding: var(--space-4);
  font-size: var(--font-size-sm);
  
  /* Desktop enhancement */
  @media (min-width: 768px) {
    padding: var(--space-6);
    font-size: var(--font-size-base);
  }
}
```

### 4. Use Utility Classes When Possible
```html
<!-- Instead of writing custom CSS -->
<div class="flex items-center justify-between p-6 bg-surface-elevated rounded-lg shadow-sm">
  <h3 class="text-lg font-semibold text-primary">Title</h3>
  <button class="btn btn-primary btn-sm">Action</button>
</div>
```

## 🚨 Common Mistakes to Avoid

### 1. Hardcoded Values
```css
/* ❌ Don't do this */
.bad-component {
  background: #ffffff;
  color: #000000;
  padding: 20px;
  font-size: 16px;
  border-radius: 10px;
}

/* ✅ Do this instead */
.good-component {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  padding: var(--space-5);
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
}
```

### 2. Inconsistent Spacing
```css
/* ❌ Random spacing */
.inconsistent {
  margin: 15px;
  padding: 18px 22px;
  gap: 14px;
}

/* ✅ Use the spacing scale */
.consistent {
  margin: var(--space-4);
  padding: var(--space-5) var(--space-6);
  gap: var(--space-4);
}
```

### 3. Missing Dark Mode Support
```css
/* ❌ Won't work in dark mode */
.light-only {
  background: #ffffff;
  color: #000000;
  border: 1px solid #e5e7eb;
}

/* ✅ Works in both themes */
.theme-aware {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

## 📚 Need More Details?

- **Full Documentation**: See `/docs/DESIGN_SYSTEM.md`
- **Design System File**: `/src/assets/styles/design-system.css`
- **Component Examples**: Check existing components in `/src/views/` and `/src/components/`

## 🎉 You're Ready!

The design system is already imported globally, so you can start using variables and utility classes immediately in any component. Just remember to use semantic variables instead of hardcoded values, and your components will automatically support dark mode and maintain consistency across the application!
