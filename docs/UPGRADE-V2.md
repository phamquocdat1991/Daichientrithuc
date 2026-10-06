# Đại Chiến Tri Thức PRO 2.0

## Implemented
- Preserved existing browser data key and all 15 original PNG characters.
- Migrated static hosting to Vinext/Cloudflare Worker with authenticated D1 metadata and R2 snapshots.
- Optimistic concurrency: stale clients receive HTTP 409. Reads/writes use authenticated user ID. Replaced snapshots are removed after successful compare-and-swap.
- Manual cloud push/pull, optional autosync and local recovery copy.
- Bank search, subject/grade/topic metadata, favorites and duplication.
- Excel import validation and export; Word document export; print-to-PDF.
- Word/PDF/TXT text extraction, source-aware prompt generation, JSON preview and approval. No AI API credentials configured.
- KaTeX formulas with trust disabled.
- Fair/fun rules, teacher pause, extra time, skip, HP adjustments, answer undo, action log.
- Report overview, question error rates, per-match reports, timed responses and replay of wrong questions.
- Class team randomization and no-repeat student draw.
- Local MediaPipe hand detection with mirrored left/right zones, 400ms hold, simultaneous-hand rejection and manual controls fallback.

## Verification
- Original gameplay regression tests.
- jsdom workflow tests for banks, fair match rules, undo, time, skip, tie, reports, student draw, JSON approval.
- API unit tests for authentication, user isolation, stale revision rejection and R2 cleanup.
- TypeScript check and production build.
- Not visually verified in a real browser: managed preview browser capability unavailable.
- Camera has not been tested with real hardware. Cross-device sync requires user-authenticated device verification.

## Remaining
- Automatic AI generation: requires configured AI provider and credentials through secure integration.
- Student QR rooms: not implemented; current private audience preserved.
- OCR for scanned PDFs; native Word math objects; source app combat animation fidelity.
