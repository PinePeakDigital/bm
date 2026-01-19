# bm

A modern web dashboard for tracking and managing your [Beeminder](https://www.beeminder.com) goals. This application provides a clean, organized interface to view your goals, track progress, and manage datapoints.

## Features

- **Goal Organization**: Goals are automatically grouped into:
  - **Pinned**: Goals you've marked as important
  - **Today**: Goals with deadlines today
  - **Next**: Upcoming goals
  - **Later**: Future goals
- **Smart Filtering**: Search goals by slug/name
- **Detail View**: Click any goal to see detailed information in a modal
- **Keyboard Navigation**: 
  - `a` - Navigate to previous goal
  - `d` - Navigate to next goal
  - `Escape` - Close modal
- **Real-time Updates**: Automatically refreshes when goals are queued (every 3 seconds) or periodically (every 60 seconds)
- **Datapoint Management**: Create and delete datapoints directly from the interface

## Tech Stack

- **Framework**: [Preact](https://preactjs.com/) - Fast, lightweight React alternative
- **Language**: TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query) for server state
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Testing**: [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Run the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:5174`

### Building

Build for production:
```bash
pnpm build
```

Preview the production build:
```bash
pnpm preview
```

### Testing

Run tests:
```bash
pnpm test
```

### Linting

Check for linting errors:
```bash
pnpm lint
```

Fix linting errors automatically:
```bash
pnpm lint:fix
```

### Type Checking

Check TypeScript types:
```bash
pnpm checkTs
```

## Authentication

The app uses Beeminder API authentication. You'll need:
- Your Beeminder username
- Your Beeminder API token (available in your [Beeminder settings](https://www.beeminder.com/api))

These are stored in browser localStorage for convenience.

## Deployment

This application is deployed via [Render.com](https://render.com) as a static site at:

**<https://bm.taskratchet.com>**

The deployment configuration is defined in `render.yaml`.

## Project Structure

```
src/
├── components/        # React/Preact components
├── services/          # API service layer (Beeminder integration)
├── lib/              # Utility functions
├── auth.ts           # Authentication logic
├── useGoals.ts       # Custom hook for fetching goals
├── queryClient.ts    # TanStack Query configuration
└── main.tsx          # Application entry point
```

## License

See [LICENSE](LICENSE) file for details.