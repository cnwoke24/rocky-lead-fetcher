# Reduce Homepage Workflow Video Frame Size on Laptop

## Goal
Make the "ROCKY_WORKFLOW" video frame on the homepage smaller on laptop screens so it doesn't dominate the viewport and pushes the partner logo section too far down.

## Current State
- The frame is in `src/pages/Index.tsx` inside a `max-w-5xl` container with generous padding (`pb-24`) and a large card (`rounded-2xl p-2`).
- On a 13–15" laptop this makes the video the dominant element and leaves little room for the partner marquee below the fold.

## Proposed Changes
1. **Constrain the frame width on large screens.** Change the container from `max-w-5xl` to a smaller max-width (e.g., `max-w-3xl` on `lg`, `max-w-4xl` on `md`, keep full width on mobile).
2. **Reduce vertical spacing.** Drop the bottom padding from `pb-24` to `pb-12 md:pb-16` so the partner section sits higher.
3. **Add a max-height guard.** Cap the video element's height on large screens (e.g., `max-h-[420px] lg:max-h-[360px]`) so wide landscape videos don't stretch vertically.
4. **Preserve mobile/tablet experience.** Keep the frame edge-to-edge and readable on smaller screens; only shrink on `lg` and up.

## Verification
- Open the homepage preview on a laptop viewport.
- Confirm the workflow frame no longer occupies most of the screen.
- Confirm the partner marquee is visible without excessive scrolling.
- Confirm mobile/tablet views remain unchanged.
