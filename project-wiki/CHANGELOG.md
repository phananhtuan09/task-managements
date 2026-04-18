---
id: WIKI-CORE-CHANGELOG
title: Project Wiki Changelog
doc_type: changelog
domain: core
status: proposed
version: 0.1
owner: ai-primary
reviewers:
  - project-maintainer
last_updated: 2026-04-18
source_of_truth: false
canonical: false
related_docs:
  - WIKI-CORE-README
  - WIKI-CORE-INDEX
  - WIKI-CORE-GOVERNANCE
tags:
  - project-wiki
  - changelog
summary: Material change history for the project wiki.
---

# Project Wiki Changelog

Record only material wiki changes here. Minor wording fixes can stay in git history.

## Entries

- 2026-04-18: Added a new proposed canonical feature spec for the real product surface under `03_features/other/feature-taskflow-auth-foundation-mvp.md`, capturing the Week 1 TaskFlow SaaS auth MVP scope, acceptance criteria, explicit uncertainty, and navigation updates in the feature index and root index.
- 2026-04-08: Bootstrapped the project wiki foundation surface, including root navigation, onboarding docs, governance, proposed business rules, and folder entry points for features, flows, and decisions. Workflow commands and skills remain outside `project-wiki/` in their dedicated automation folders.
- 2026-04-08: Expanded the wiki to the full folder model in scope for this slice, added onboarding and requirement support docs, created starter system, operations, and reference surfaces, and added the reusable template library under `99_templates/`.
- 2026-04-08: Added the first canonical content rollout for the wiki system itself, including four feature specs, three flow specs, and three ADRs. These seeded docs remain in proposed status and need human review before any should be treated as confirmed truth.
- 2026-04-09: Added the verification layer under `08_verification/`, plus `scripts/validate-project-wiki.mjs` and `tests/unit/validate-project-wiki.spec.mjs` for minimum checks on frontmatter, IDs, statuses, related-doc references, and internal links. Optional later checks such as stale-review warnings and orphan-doc detection remain out of scope for this milestone.
