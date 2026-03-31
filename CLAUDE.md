# ShowMySpeed — Dev Notes for Claude

## Critical: Do NOT use AnimatePresence for top-level page transitions

**Do not wrap the page router in `<AnimatePresence>`.**

Even `mode="sync"` causes a large gap above content: during the transition both the exiting and entering pages are in the DOM simultaneously. In a flex column, the entering page renders _below_ the exiting page's full height. Combined with `scrollTo(0,0)`, this makes the gap immediately visible.

**Use plain conditional rendering.** Each page's `motion.div` uses `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` for a fade-in. Since only one page is in the DOM at a time, there is zero layout gap.

```tsx
// ✅ Correct — no AnimatePresence, plain conditional render
<div className="w-full flex flex-col items-center">
  {page === 'test' && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      ...
    </motion.div>
  )}
  {page === 'compare' && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      ...
    </motion.div>
  )}
</div>

// ❌ Never do this — causes gap above content and/or blank pages
<AnimatePresence mode="wait">  // blank page
<AnimatePresence mode="sync">  // layout gap (exiting page takes up space while in DOM)
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
