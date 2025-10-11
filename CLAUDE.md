# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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