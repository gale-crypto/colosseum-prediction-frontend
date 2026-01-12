# Colosseum Prediction Market

A prediction market platform built with Vite, TypeScript, and React, featuring a Roman/Greek theme with golden/bronze tones. Part of the Colosseum Project ecosystem.

## Features

- 🎯 **Prediction Markets**: Trade on the outcome of future events
- 🎨 **Colosseum Theme**: Beautiful Roman/Greek inspired design with golden accents
- 📊 **Market Analytics**: View volume, participants, and pricing in real-time
- 🔍 **Search & Filter**: Find markets by category or search query
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
colosseum_prediction/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MarketCard.tsx
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx
│   │   ├── MarketsPage.tsx
│   │   └── MarketDetailPage.tsx
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles and theme
├── public/             # Static assets
└── package.json
```

## Theme

The project uses a custom theme inspired by the Colosseum project:
- **Colors**: Dark backgrounds with golden/bronze accents
- **Fonts**: Alexandria (Google Fonts)
- **Style**: Roman/Greek aesthetic with modern UI patterns

## Development

### Adding New Markets

Currently, markets are defined as mock data in `src/pages/MarketsPage.tsx`. To integrate with a real API:

1. Create a service file in `src/services/`
2. Replace mock data with API calls
3. Add loading and error states

### Customizing the Theme

Edit `src/index.css` to modify:
- Color variables (CSS custom properties)
- Custom utility classes
- Global styles

## License

Part of the Colosseum Project.
