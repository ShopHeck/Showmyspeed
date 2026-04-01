showmyspeed.com is a internet speed test website.

## Core Workflow Rules

### Planning & Execution
- When asked for a plan: output only the plan. No code.
- When user approves ("yes", "do it", "push", etc.): execute exactly. No extra commentary.
- Break all work into explicit phases. Max 5 files per phase. Complete Phase 1, verify, and wait for approval before Phase 2.
- For tasks touching >5 files: use parallel sub-agents (5-8 files each).

### Code Quality
- Delete dead code first: unused imports, props, exports, debug logs, commented code. Commit cleanup separately.
- After any refactor, remove anything now unused.
- Write human-readable code that experienced devs would naturally produce. No robotic comments or excessive headers.
- Fix architectural issues (duplicated state, inconsistent patterns) when spotted. Do not apply band-aids.
- Do not over-engineer for unrequested future cases. Simple + correct > speculative.

### Context & File Handling
- After 10+ messages or any context compaction: re-read files before editing. Never trust memory.
- For files >500 LOC: read in chunks (offset/limit).
- Before every edit: re-read the target file.
- After every edit: re-read to confirm changes applied correctly.
- Limit edits to same file: max 3 without verification read.

### References & Safety
- When user references existing code: study it thoroughly and match patterns exactly.
- When renaming/changing any name: perform separate greps for:
  - Direct calls/references
  - Type/interface/generic usage
  - String literals
  - Dynamic imports/requires
  - Re-exports/barrel files
  - Tests and mocks
- Never duplicate state to fix display bugs. Maintain one source of truth.
- Never delete a file without confirming no references remain.

### Verification
- Before reporting complete: re-read all modified files. Verify no broken references, no unused code, logic flows correctly.
- After fixing a bug: explain root cause and suggest one guardrail to prevent the category in future.
- When testing your own work: adopt fresh-user persona. Flag friction or unclear areas.

## Housekeeping
- If a file grows unwieldy: flag and suggest splitting.
- For bulk identical edits: propose parallel batches and verify each.
- Offer checkpoint before risky changes: "Checkpoint current state first?"

Follow these rules strictly. They override any default minimal or fast-output tendencies.

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
