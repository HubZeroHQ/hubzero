# Engineering Profiles

Engineering Profiles are Studio content records that document how an engineer thinks: their principles, decisions, evidence, current exploration, and technical interests. They are not resumes, employee biographies, or portfolio pages.

## Why they are separate from Team

`Team` answers who belongs to HubZero and supplies roster identity. `EngineeringProfile` is optional and earned. Keeping the collections separate prevents ordinary team membership from implying a public body of engineering evidence, and lets each record evolve under the correct workflow and permissions.

The relationship is one-to-zero-or-one from Team to Engineering Profile. Every Engineering Profile must reference exactly one Team Member. A unique MongoDB index on `teamMemberId`, backed by an application-level guard, prevents a Team Member from owning more than one profile.

## Content model

Structured metadata carries list/search/filter concerns: overview, engineering philosophy, current exploration, expertise, interests, engineering identity, technologies, featured Work/Builds/Blueprints/Labs/Notes, portrait, optional hero media, and an optional gallery.

Long-form introduction, interview, timeline, quotes, and achievements are independent polymorphic Documents owned by `EngineeringProfile`. They use the existing Document Engine block schema and editor. Visibility belongs to the profile owner record and follows the shared Draft → In Review → Approved → Published → Archived workflow.

## Reference IDs

Profiles receive permanent `EP-001` identifiers from the existing atomic counter infrastructure. Assignment happens exactly once at creation. IDs are never edited, reused, or renumbered; deletion does not decrement the counter.

## Future Markdown migration

Existing Markdown profiles remain canonical source material until migration. The Studio model intentionally keeps narrative sections in Documents whose ordered block arrays can receive parsed Markdown without changing profile metadata. Section names map directly to document roles, while YAML/frontmatter-style metadata maps to structured fields and relationship lookups. No importer is included in Phase 11A.
