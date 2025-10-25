# XC Dashboard

A comprehensive Cross Country Performance Management System built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Recharts.

## Features

- **Coach Portal**: Manage team roster, training plans, and athlete performance
- **Athlete Portal**: View training schedules, log workouts, and track progress
- **Reports & Analytics**: Performance insights, race results, and team statistics with interactive charts
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Modern UI Components**: Beautiful components from shadcn/ui
- **Data Visualization**: Interactive charts and graphs using Recharts

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier
- **React Compiler**: Enabled for optimized performance

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd xc-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── globals.css      # Global styles and Tailwind imports
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── coach/           # Coach portal
│   ├── athlete/         # Athlete portal
│   └── reports/         # Reports and analytics
├── components/
│   └── ui/             # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── tabs.tsx
└── lib/
    └── utils.ts        # Utility functions including cn() helper
```

## Routes

- `/` - Dashboard homepage with navigation to all sections
- `/coach` - Coach portal for team management
- `/athlete` - Athlete portal for personal training tracking
- `/reports` - Analytics and reporting dashboard

## Components

### shadcn/ui Components Included

- **Button**: Primary, secondary, outline, ghost, and link variants
- **Card**: Content containers with headers, content, and footers
- **Tabs**: Tabbed navigation for organizing content
- **Table**: Data tables with sorting and styling
- **Badge**: Status indicators and labels
- **Select**: Dropdown selection components

### Charts (Recharts)

- **Line Charts**: Performance trends over time
- **Bar Charts**: Weekly training volume comparisons
- **Pie Charts**: Team composition and distribution

## Customization

### Themes

The application uses CSS custom properties for theming. Colors can be customized in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... other color variables */
}
```

### Adding New Components

To add new shadcn/ui components:

1. Install the required dependencies
2. Copy the component code to `src/components/ui/`
3. Import and use in your pages

## Development

### Code Quality

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Full type safety throughout the application

### Performance

- **React Compiler**: Enabled for automatic optimization
- **Next.js 16**: Latest features and performance improvements
- **Turbopack**: Fast bundling for development

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
