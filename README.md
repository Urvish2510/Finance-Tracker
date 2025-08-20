# Personal Finance Tracker

A modern, responsive personal finance tracking application built with Vue 3, featuring a dashboard layout with sidebar navigation and comprehensive expense management.

## Features

### 📊 Dashboard
- Overview of financial stats
- Quick expense summaries
- Recent activity feed
- Visual spending charts

### 💳 Expense Management
- Add, edit, and delete expenses
- Categorize transactions
- Date range filtering
- Search functionality

### 🏷️ Category Management
- Create custom expense categories
- Color-coded organization
- Category statistics
- Edit and manage categories

### 📈 Analytics
- Interactive spending charts
- Category breakdown
- Monthly trends
- Smart financial insights
- Data export functionality

### ⚙️ Settings
- Appearance customization
- Currency and format preferences
- Notification settings
- Data import/export
- Backup and restore

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Chart.js** - Interactive charts and visualizations
- **IndexedDB** - Browser-based database storage
- **Vite** - Fast build tool and development server

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── ExpensePieChart.vue
│   ├── MonthlyChart.vue
│   └── FinanceTracker.vue
├── composables/         # Vue composables for state management
│   └── useDatabase.js
├── database/           # Database services and configuration
│   ├── browserDb.js
│   └── browserServices.js
├── router/             # Vue Router configuration
│   └── index.js
├── views/              # Page components
│   ├── Dashboard.vue
│   ├── Expenses.vue
│   ├── Categories.vue
│   ├── Analytics.vue
│   ├── Settings.vue
│   └── SimpleDashboard.vue
├── App.vue             # Main application component
└── main.js            # Application entry point
```

## Data Storage

The application uses **IndexedDB** for client-side data persistence, providing:
- Offline functionality
- Fast local storage
- Automatic data synchronization
- Cross-browser compatibility

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Add new views in `src/views/`
3. Update router in `src/router/index.js`
4. Extend database services in `src/database/`

### Customization
- Modify color schemes in component styles
- Add new chart types using Chart.js
- Extend database schema in `browserDb.js`
- Customize dashboard widgets

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with IndexedDB support

## License

MIT License - feel free to use for personal or commercial projects.

---

**Start tracking your finances today! 💰**
