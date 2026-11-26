# Library schema and provenance · library-v1

40 activities cover language, fine motor, gross motor, cognitive, and social/emotional categories. Every entry includes unique ID, applicable month range, prerequisites, difficulty 1–3, duration, materials, format, original description/steps, adult supervision, safety exclusions, organization/URL/access date, unreviewed status, basis, and version. Type contract: `Activity` in `src/lib/schema.ts`.

Four activity ideas were verified on November 25, 2026:

- `language-01` and `language-02`: responsive sounds and picture naming concepts in [UNICEF's learning activities](https://www.unicef.org/parenting/child-care/21-learning-activities-babies-and-toddlers), sections “Chit chat” and “Story time”.
- `social-33` and `social-35`: responsive smiling and waving concepts in [UNICEF's first-two-years tips](https://www.unicef.org/parenting/child-development/baby-tips), newborn/1–6-month and 9–12-month sections.

These are original, limited adaptations of ideas. The exact steps, durations, broader age bands, prerequisites, safety exclusions, and difficulty classifications are **NextStep assumptions**, not UNICEF-validated rules. No UNICEF endorsement or professional review is claimed. The remaining 36 scenarios are explicitly synthetic NextStep fixtures with null source URLs and access dates. Even source-supported entries remain unreviewed and restricted to fictional use. External pages are references only and are never fetched at recommendation time.

Before real-world deployment: qualified early-childhood professionals must review every instruction, age range, prerequisite, material, exclusion and progression relationship; identify contraindications and accessibility needs; document reviewer identity, date, evidence, approvals and version; remove unapproved content; perform privacy/security review and a consented field trial; establish correction/withdrawal ownership. Automated validation cannot replace this process.

Evaluation fixtures live in `evals/`; they are not library content. Browser-local interaction events are a third, distinct dataset and must never be represented as a field study.
