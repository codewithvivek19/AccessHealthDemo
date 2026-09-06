# Acsess Health — Phase 1: Public website + customer account

The specification describes a full platform with five separate experiences. This first build delivers the two you selected: the new public website, and a secure customer account area behind a login. The operator portal, developer portal, employee support desk and admin console are designed for later phases but not built now.

## Brand and look

Taken from the current acsess.com.au site rather than invented:

- Acsess blue `#0170B9` as the primary colour, deeper navy for dark sections, red reserved for alerts only
- Rubik as the typeface, matching the current site
- Acsess logo and favicon reused from the existing site
- Design discipline from the reference in the document: large editorial headlines, generous spacing, thin dividers, image-led storytelling, restrained motion, and selected dark cinematic sections — layered around the Acsess blue identity, not replacing it
- Older-user accessibility built in from the start: minimum 17px body text, high contrast, large touch targets, visible focus rings, full keyboard navigation, and reduced-motion support

## Public website

Each of these is its own page with its own title and social preview text:

- **Home** — clear 10-second explanation of the company, retirement living front and centre, service overview, SwitchStar feature, proof points, news, partner logos
- **Services** — Internet and village networks, Foxtel and MATV, telephone, DAS and mobile coverage, thermal imaging and safety, facial recognition, plus a detail page per service
- **Retirement living** — the anchor audience page: residents, operators, and developers each get their own journey and calls to action
- **SwitchStar** — product page carrying the real specifications (Australian-designed double GPO, automatic 8-hour cut-off, 10A × 2, white and black, materials and standards) held as structured data rather than retyped prose
- **About** — 20+ years, the team, the story
- **Resources** — guides, datasheets, FAQs, news articles
- **Support** — plain-language "I need help" selector, guided troubleshooting, and a contact/ticket form
- **Contact** — enquiry form plus the 1300 736 785 number

Wording is pulled from the existing Acsess site where it exists. Anything I have to write from scratch (statistics, testimonials, opening hours) I will flag to you rather than pass off as real.

## Customer account

- Sign up, sign in, password reset, sign out
- `/account` dashboard: services at this address, current status, anything needing attention
- My services — what's active, plan details
- Support — raise a request, track status, see the conversation history
- Documents — invoices, guides and anything shared with the account
- Profile and notification preferences
- Everything is protected so a signed-in person only ever sees their own account

Signing in keeps you on the Acsess site — no jump to a separate portal.

## Not in this phase

Employee support workspace, operator portal, developer/project portal, admin console, online purchasing, billing/payments, and the "Ask Acsess" AI assistant. The data structure is set up so these can be added later without a rebuild.

## Technical notes

- TanStack Start, React 19, Tailwind v4; brand tokens defined once in `src/styles.css` as semantic values and used everywhere
- Lovable Cloud enabled for accounts, database and file storage
- Tables: profiles, organisations, sites, services, support tickets, ticket messages, documents, resources/articles, products — with row-level security scoping every read and write to the signed-in user's account, and a separate roles table so later phases can add staff and operator roles without a schema rewrite
- Public pages render server-side for search engines; the account area is gated behind an authenticated route
- Content-managed items (services, resources, news, product specs) live in the database so text changes don't need code changes

## Build order

1. Design tokens, layout shell, navigation and footer
2. Home, Services, Retirement living, SwitchStar
3. About, Resources, Support, Contact
4. Cloud setup: schema, security rules, seed content
5. Sign up / sign in / reset
6. Account dashboard, services, support tickets, documents, profile
7. Accessibility and mobile pass across everything
