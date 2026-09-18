# Login and Admin CMS Enhancement

## Goal
Polish the existing dark sign-in page and make the admin area faster and safer for day-to-day publishing, while keeping the public website unchanged.

## Login page
- Keep the current dark Content Studio visual direction.
- Improve spacing, hierarchy, field labels, focus states, error feedback, and mobile layout.
- Add show/hide password, clearer loading feedback, and a discreet link back to the website.
- Keep the existing secure session flow and current credentials behavior unchanged.

## Workflow essentials
- Add preview links for content that has a public destination.
- Add duplicate actions for generic content and PM Talks, creating a new draft with a unique slug.
- Add unsaved-change protection to editing forms before navigation or closing the tab.
- Make Save draft and Publish actions explicit and show clear success/error feedback.

## Dashboard insights
- Improve the overview cards with total, published, and draft counts.
- Add a publishing-status summary and recent activity feed.
- Keep quick-create shortcuts and make recent items directly editable.
- Surface items needing SEO work without changing public metadata behavior.

## Bulk management
- Add row selection to reusable admin tables.
- Add bulk Publish, Move to draft, and Delete actions for PM Talks and generic content.
- Keep confirmation for destructive bulk actions and refresh the table after completion.

## Editorial tools
- Add scheduled publishing fields and a scheduled status presentation using the existing publish-date model.
- Add lightweight revision snapshots for content and videos, with a revision list and restore action.
- Record duplicate, bulk, schedule, and restore actions in the existing activity log.

## Technical details
- Extend the SQLite migrations additively; retain the repository/service abstraction for future database replacement.
- Add server-validated operations for duplication, bulk changes, revisions, and restoration.
- Reuse the existing shadcn components and admin-only Tailwind stylesheet.
- Do not alter public components, animations, typography, navigation, or styling.
- Verify sign-in, dashboard, content lists, bulk actions, edit protection, and mobile admin layouts with browser checks and TypeScript validation.
