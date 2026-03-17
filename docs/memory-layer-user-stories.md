# Memory Layer User Stories

## Product Direction

Memory Atlas should evolve from a branded landing page into a respectful place-memory platform: a memory layer for Earth where families, institutions, and historians can attach verified human memories to locations.

## North Star

Users can open a map, toggle memory layers, and understand how a person, family, or institution is connected to real places over time.

## Phase 1: Memory Record Foundation

### Epic 1: Define memory records beyond burial

User stories:
- As a family archivist, I want to create a memory record for a burial, birthplace, home, school, or historical moment so that one person’s life can be preserved in one system.
- As a contributor, I want each memory to include location, dates, people, description, media, and source notes so that records are useful and trustworthy.
- As an admin, I want memory types and metadata to be validated consistently so that the platform stays structured as it grows.

Implementation notes:
- Extend the current `memories` model into a layer-aware record model.
- Normalize `metadata` shape by memory type.
- Add source attribution, visibility, and moderation status fields.

### Epic 2: Add authenticated memory creation

User stories:
- As a signed-in user, I want to add a place memory from the app so that I can start building my family atlas.
- As a user, I want to attach a person to a memory so that places are connected to real people.
- As a user, I want draft and published states so that I can review records before sharing them.

Implementation notes:
- Build create/edit flows after auth.
- Add server-side validation at the boundary.
- Add tests for create, edit, and invalid submission flows.

## Phase 2: Map Layers And Discovery

### Epic 3: Layer-aware map experience

User stories:
- As a visitor, I want to toggle burial, home, education, and historical layers so that I can focus on one type of memory at a time.
- As a user, I want colored markers and legends per layer so that the map is understandable at a glance.
- As a user, I want a detail panel when I click a marker so that I can read the full memory without losing map context.

Implementation notes:
- Replace or complement the current globe hero with a data-driven map view.
- Add filters, marker clustering, and empty states.
- Add tests for layer toggles and memory selection.

### Epic 4: Search and browse

User stories:
- As a family member, I want to search by person, place, cemetery, school, or city so that I can find relevant records quickly.
- As a researcher, I want to filter by date range and memory type so that I can explore historical patterns.
- As a user, I want place pages so that each location can act as a memory hub.

Implementation notes:
- Add indexed search fields.
- Build canonical place pages.
- Use lean read models for map and search performance.

## Phase 3: Family Timeline And Journey

### Epic 5: Person timeline

User stories:
- As a family member, I want to see a person’s memories ordered through time so that I can understand their life story.
- As a user, I want to view that same timeline on a map so that migration and movement become visible.
- As a contributor, I want to connect parents, children, and spouses so that timelines fit inside a family graph.

Implementation notes:
- Expand the `people` and `relationships` models.
- Build timeline UI and a map route view for major life events.
- Add tests for ordering, filtering, and relationship display.

### Epic 6: Family atlas

User stories:
- As a family admin, I want a shared family space so that multiple relatives can contribute memories together.
- As a family member, I want to browse homes, schools, and burials across generations so that I can understand our family footprint.
- As a user, I want private family memories and public historical memories so that sensitive records stay controlled.

Implementation notes:
- Add family/workspace membership.
- Add role-based access controls.
- Add sharing settings per memory.

## Phase 4: Trust, Respect, And Institutions

### Epic 7: Respectful governance

User stories:
- As a platform admin, I want reporting and moderation workflows so that disrespectful content can be removed quickly.
- As a community leader, I want memorial records to avoid entertainment patterns or worship-like interactions so that the platform remains respectful.
- As a user, I want to know whether a record is family-submitted, institution-verified, or historically sourced so that I can trust what I see.

Implementation notes:
- Add moderation queues and audit logs.
- Add trust badges and source labels.
- Write content rules for sensitive memory types.

### Epic 8: Institutional tools

User stories:
- As a cemetery operator, I want to import burial records in bulk so that our archive can come online quickly.
- As a university archivist, I want to maintain alumni memory pages tied to campus buildings so that institutional history remains accessible.
- As a museum or city partner, I want curated place-memory collections so that local history can be explored on a map.

Implementation notes:
- Add CSV import/export.
- Add institution workspaces and review permissions.
- Add partner dashboards and basic analytics.

## MVP Scope Recommendation

Build this first:
- Authenticated memory CRUD for `BURIAL`, `HOME`, `EDUCATION`, and `HISTORY`
- Layer toggle UI
- Map markers and detail panel
- Person profile with chronological memory list
- Draft/publish workflow

Do not build yet:
- Complex monetization
- AI-generated biographies
- Open public contributions without moderation
- Multi-tenant institution dashboards beyond basic imports

## Acceptance Criteria For MVP

- A signed-in user can create a memory with a valid location and memory type.
- Memories can be filtered by layer on a map view.
- A person page shows linked memories in chronological order.
- Records include source notes and visibility settings.
- Sensitive memory types support moderation and respectful display rules.
