# ShowMySpeed — Dev Notes for Claude

## Critical: Never use AnimatePresence mode="wait"

**Do not use `<AnimatePresence mode="wait">` anywhere in this project.**

`mode="wait"` holds the screen blank for the entire exit-animation duration before mounting the next page. Even with a 0ms exit duration it still leaves a blank frame due to React commit scheduling. This caused a persistent blank-page bug on every page navigation that was extremely difficult to diagnose.

**Always use `mode="sync"`** (or omit the mode prop entirely, which also defaults to sync).

With `mode="sync"` + instant exits (`exit={{ opacity: 0, transition: { duration: 0 } }}`), the old page disappears immediately and the new page fades in — seamless transitions with zero blank gap.

```tsx
// ✅ Correct
<AnimatePresence mode="sync">
  {page === 'test' && <motion.div key="test" exit={{ opacity: 0, transition: { duration: 0 } }} ...>}
  {page === 'compare' && <motion.div key="compare" exit={{ opacity: 0, transition: { duration: 0 } }} ...>}
</AnimatePresence>

// ❌ Never do this — causes blank page on every navigation
<AnimatePresence mode="wait">
```

## Critical: SpeedTips renders inline, not as a separate route

SpeedTips is rendered **inside** the `page === 'test'` block via a `showTips` boolean flag — it is NOT a separate page in the `Page` type. This was done to avoid AnimatePresence transitions for the "Speed Up My Connection" flow.

Do not add a `'tips'` route or navigate to a separate tips page.

```tsx
// ✅ Correct — inline within test page
{phase === 'complete' && showTips && lastResult && (
  <SpeedTips result={lastResult} onCompare={() => handleNavigate('compare')} ... />
)}

// ❌ Wrong — would cause blank page
handleNavigate('tips')
```

## Year

All content, badges, and dates must reference **2026**, not 2025.

## Affiliate links

Use `rel="noopener noreferrer sponsored"` on all affiliate/partner links per FTC guidelines.
