# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read AGENTS.md first

`AGENTS.md` at the repo root is the canonical agent guide. It covers run commands, ports, the provider/council architecture, model-ID prefix routing, streaming/abort logic, cost reporting, settings UI sections, execution modes, and the versioning checklist. Read it before doing any non-trivial work.

The rest of this file is a **Hebrew-edition overlay** — context that AGENTS.md does not cover because this repo is a Hebrew/RTL fork of `jacob-bd/the-ai-counsel`.

## Fork identity

- Upstream: `https://github.com/jacob-bd/the-ai-counsel`
- Fork:     `https://github.com/tzvikahe-ops/the-ai-counsel`
- This branch is the "Hebrew (RTL) Edition". Version line is `0.9.0-he.1` (semver) / `0.9.0+he.1` (PEP 440 in `pyproject.toml`). When bumping, follow AGENTS.md's versioning checklist and keep the `-he.N` / `+he.N` suffix on every surface.
- Two READMEs: `README.md` (English-primary, with a short Hebrew intro at the top and a cross-link to `README.he.md`) and `README.he.md` (full Hebrew translation). Both must stay in sync when content changes.

## Language model: instructions stay English, outputs are translated

The design choice the user committed to:

- **Backend prompts and instructions remain in English.** Do not translate the source prompts in `backend/prompts.py` to Hebrew.
- **Model outputs are switched to Hebrew at runtime** via `apply_response_language()` in `backend/prompts.py`, driven by the `response_language` setting (General settings section).
- **Model IDs, provider names, and code blocks stay LTR/English** even inside Hebrew UI or Hebrew READMEs.
- Title generation and search-query generation always stay English regardless of `response_language`.

## Advisor prompts: pre-translated Hebrew variants

Generic "respond in Hebrew" instructions were not enough — models kept emitting English structural headings (`## Summary`, `## Verdict`, `## Position A`) and transliterations like "רבטל". The fix:

- `backend/advisor_prompts.py` contains paired English + Hebrew prompt constants:
  `ADVISOR_ROUND1_PROMPT` / `_HEBREW`, `ADVISOR_FOLLOWUP_PROMPT` / `_HEBREW`,
  `ADVISOR_CROSS_POLLINATION_PROMPT` / `_HEBREW`, `ADVISOR_VERDICT_PROMPT` / `_HEBREW`,
  `ADVISOR_TIEBREAKER_PROMPT` / `_HEBREW`, `CONSENSUS_TAG_INSTRUCTION` / `_HEBREW`.
- The Hebrew variants pre-translate every structural heading (`## עמדה`, `## הפרכה`, `## אות הסכמה`, `## סיכום`, `## פסיקה`, etc.) and explicitly forbid transliterations like `רבטל`.
- `CONSENSUS_SCORE: N` is intentionally kept in English in the Hebrew variant — the parser depends on it.
- `backend/advisors.py::_pick_advisor_prompt()` selects English vs Hebrew based on `settings.response_language`. **When adding a new advisor prompt, add both variants and route through `_pick_advisor_prompt`** — do not call the English constant directly.

## Persona name localization in transcripts

- `backend/advisors.py` defines `_PERSONA_NAME_HEBREW` and `_PERSONA_ROLE_HEBREW` maps (e.g., `"The Skeptic"` → `"הספקן"`, `"Critical Thinker"` → `"חושב ביקורתי"`).
- `_persona_display_name()` / `_persona_display_role()` and `_format_transcript()` / `_format_debate_arc()` accept a language argument and localize persona labels in Hebrew runs.
- Frontend mirror: `frontend/src/utils/personaHelpers.js` localizes persona labels at display time.
- When adding a new persona, add both maps in `advisors.py` and the helper in `personaHelpers.js`, or Hebrew runs will show English names mid-transcript.

## Frontend i18n + RTL

- i18n stack: `react-i18next` with `localStorage` persistence. Strings live in `frontend/src/i18n/locales/en.json` and `frontend/src/i18n/locales/he.json` — both must be updated together for any new UI string. Never hardcode user-facing copy in components.
- Layout uses CSS logical properties (`inset-inline-start`, `padding-inline-end`, `border-inline-end`, etc.). Do not introduce `left` / `right` / `padding-left` / `margin-right` in new styles — they break in RTL.
- The settings language toggle is the user-facing entry point for switching both UI language and `response_language`.

## Sage light theme

- Active theme is the "Sage" light theme defined in `frontend/src/light-theme.css`: forest green primary (`#15803D`), copper chairman accent (`#9A3412`), cream body (`#F0EEE6`). This overlays the upstream "Council Chamber" dark theme described in AGENTS.md.
- The Sage CSS contains a lot of explicit readability overrides for the chat surface, council grid, stage cards, debate cards, advisor panels, claim cards, ranking heatmap, and round navigator. Before adding a new component, check whether it needs a Sage override — dark-theme defaults often render unreadable on cream.
- The cost pill specifically needs dark text on copper (`#7C2D12` on saturated copper) — do not revert it to the upstream gold-on-dark.

## ASCII hyphens only

A bulk cleanup replaced all em-dashes (`—`) and en-dashes (`–`) with ASCII hyphens (`-`) across ~25 files. Keep it that way in new content (code comments, prompts, READMEs, CHANGELOG entries, JSON copy). Em-dashes also cause subtle BiDi rendering issues in mixed Hebrew/English text on GitHub.

## BiDi rules for the READMEs

`README.md` and `README.he.md` have been heavily tuned for GitHub's BiDi renderer. When editing them:

- Wrap Hebrew sections in `<div dir="rtl"> ... </div>`. Close the div **before** any fenced code block so code stays LTR, then reopen after.
- For tables inside a Hebrew section, use HTML `<table dir="rtl" width="100%">` instead of markdown tables. Do not add `align="right"` — it causes the table to float and adjacent text wraps around it.
- Avoid flag emojis (`🇮🇱`, `🇺🇸`) in headings — GitHub renders them as literal letters ("IL", "us") in some contexts. Use plain text like "Hebrew" / "English" or omit.
- For the cross-link line between the two READMEs, use `·` (middle dot) as a separator, not `|` (pipe) — the pipe disrupts BiDi flow.
- Start each Hebrew paragraph with a Hebrew word, not an English term. A paragraph that begins with "The AI Counsel חושף שרת..." renders with the English chunk pushed to the wrong side; rewrite as "המערכת חושפת שרת..." or quote the English term.

## Adding a new user-facing string (checklist)

1. Add the key + value in **both** `frontend/src/i18n/locales/en.json` and `he.json`.
2. Use `t('key')` in the component — never hardcode.
3. If the string appears in a Sage-styled surface, verify contrast on the cream background.
4. If the string is a persona name, role, or advisor stage heading, see the "pre-translated Hebrew variants" and "persona name localization" sections above — the i18n JSON files are not enough on their own.
