# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT INSTRUCTIONS
- **DO NOT USE SCREENSHOTS** - I cannot read images, use kapture with DOM to get page content
- **DO NOT CREATE UNNECESSARY FILES** - Only create files when absolutely required
- **UPDATE CLAUDE.md FIRST** - Document all changes in this file before implementing
- **FOLLOW EXISTING PATTERNS** - Use existing code style and conventions
- **RUN ON SPECIFIC PORT** - Use `pnpm dev --port 51548` to start server on http://localhost:51548
- **THIS IS SVELTE 5** - This project uses Svelte 5 with runes ($state, $effect, etc.), not Svelte 3/4 stores
- **SERVER MANAGEMENT** - Tail server.log to monitor existing servers. This is Vite with hot reload - keep ONE server running, don't start multiple servers
- **SKIP PNPM TEST** - `pnpm test` is not known to be good tests at the moment avoid it and use playwright mcp instead.

## Project Overview

This is **svelte-infinite**, a Svelte 5 library that provides infinite scroll functionality using IntersectionObserver and Svelte 5 runes for reactive state management.

## Development Commands

### Essential Commands
```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server on custom port
pnpm dev --port [PORT]

# Build the library
pnpm build

# Run tests
pnpm test

# Lint and format code
pnpm lint
pnpm format

# Create distributable package
pnpm package
```

### Testing Commands
```bash
# Run all tests with Vitest
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test src/index.test.ts
```

## Architecture

### Core Components

**InfiniteLoader Component** (`src/lib/InfiniteLoader.svelte`):
- Uses Svelte 5 runes (`$state`, `$effect`) for reactive state management
- Implements IntersectionObserver for scroll detection
- Supports customizable loading states via Svelte 5 snippets
- Handles loop detection to prevent infinite loops
- Props: `load`, `loaded`, `hasMore`, `loaderState`, `root`, `rootMargin`

**LoaderState Class** (`src/lib/loaderState.svelte.ts`):
- Reactive state management using Svelte 5 runes
- Tracks loading state, loaded items count, and error handling
- Provides methods: `start()`, `done()`, `error()`, `reset()`
- Exports as both class and reactive state

### Key Design Patterns

1. **Svelte 5 Runes**: Uses `$state` and `$effect` instead of stores for reactivity
2. **Snippets**: Customizable UI components via Svelte 5 snippet system
3. **IntersectionObserver**: Efficient scroll detection without event listeners
4. **TypeScript**: Full type safety with generic support for data types
5. **Immutability**: State updates follow immutable patterns

### Package Structure

```
src/lib/
├── InfiniteLoader.svelte    # Main component
├── loaderState.svelte.ts    # State management
└── index.ts                 # Public exports
```

### Demo Application

Located in `src/routes/` with:
- Real-world usage example with user cards
- Mock API endpoint for testing (`api/data/+server.ts`)
- Server-side data loading example
- **Meal Planner Calendar**: Interactive calendar with week sections and activity tracking
  - Week-based layout with date ranges
  - Daily activity counters with increment functionality
  - Save functionality for meal planning data
  - Responsive grid layout for meal organization

## Development Guidelines

### Code Standards
- Use TypeScript for all new code
- Follow existing Svelte 5 patterns with runes
- Maintain compatibility with Svelte 5+ only
- Use proper TypeScript generics for type safety

### Testing Requirements
- Write tests in Vitest framework
- Test files should be named `*.test.ts` or `*.spec.ts`
- Focus on testing state management and component behavior
- Use the existing test patterns in `src/index.test.ts`

### Performance Considerations
- IntersectionObserver is used for efficient scroll detection
- Debounced loading to prevent excessive API calls
- Loop detection prevents infinite loops
- Lazy loading of components and data

## Common Development Tasks

### Meal Planner Calendar Features
- **Activity Tracking**: Click "+ Add" buttons to increment daily activity counters
- **Week Organization**: Calendar divided into 7-day week sections with date ranges
- **State Management**: Uses Svelte 5 runes for reactive activity counting
- **Save Functionality**: Persists meal planning data with Save button
- **Responsive Design**: Grid layout adapts to different screen sizes

### Adding New Features to InfiniteLoader
1. Update component props in `InfiniteLoader.svelte`
2. Add corresponding state management in `LoaderState` if needed
3. Update TypeScript types and exports in `index.ts`
4. Add demo usage in `src/routes/+page.svelte`
5. Write tests for new functionality

### Debugging Scroll Issues
1. Check IntersectionObserver configuration (root, rootMargin)
2. Verify `hasMore` and `loaded` props are correctly managed
3. Use browser DevTools to monitor observer callbacks
4. Check for CSS issues affecting scroll container

### Publishing the Library
1. Update version in `package.json`
2. Run `pnpm package` to build distributable
3. Test with `pnpm build` and `pnpm preview`
4. Run full test suite with `pnpm test`
