# Hover Card — replica report
Built per REPLICATE_SPEC.md v4 from demo-original.js data/behaviour (clean-room). One self-contained index.html, light+dark with toggle, /*noflash*/ guard, in-place updates only.
Verification: worker died on a rejected /tmp cleanup after building; the in-dir harness was re-run by the aggregator: `node harness_verify.js` → PASS: all harness checks (light+dark, loop, identity, zero innerHTML). node --check clean per harness.
