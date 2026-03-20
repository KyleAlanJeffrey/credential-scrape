# TODO

## TanStack Devtools toggle button not visible

The devtools panel itself renders and slides in (Ctrl+D works), but the floating toggle button/icon in the bottom-right corner is invisible (width: 0 in the DOM).

### What we know
- The `<TanStackDevtools>` component is in the DOM and the panel works
- The toggle button element exists but has width 0
- The button uses `position: fixed; z-index: 99999`
- The global CSS reset `* { margin: 0; padding: 0 }` may be collapsing the button
- Changing `.page` from `z-index: 1` to `isolation: isolate` did not fix it
- Scoping the reset to `.page *` instead of `*` did not fix it
- Reverting `body::before`/`::after` styles did not fix it
- The issue has existed since the initial React migration — devtools may have never rendered the button in this project

### Still to try
- Inspect the actual devtools button element in browser DevTools to see computed styles
- Check if the `@tanstack/devtools-vite` plugin is stripping the button in dev mode
- Try rendering `<TanStackDevtools>` outside the `<QueryProvider>` wrapper
- Try adding explicit CSS override: `[class*="devtools"] button { width: auto !important; }`
- Check if there's a version mismatch between `@tanstack/react-devtools` and other TanStack packages
- Test with a minimal reproduction (just devtools, no app styles)
