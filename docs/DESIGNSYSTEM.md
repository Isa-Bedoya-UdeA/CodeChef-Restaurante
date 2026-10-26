# Antorcha — Design System

## 1. Purpose

This document defines the visual language, reusable interface patterns, layout rules, accessibility expectations, and design-to-code conventions for Antorcha. The system supports a warm restaurant-bar identity while keeping administration clear, compact, and efficient.

## 2. Design Principles

### 2.1 Clarity First

Operational data is easy to scan. Tables identify fields clearly, forms use explicit labels, and actions have specific names. Inventory direction, order status, and errors never rely on color alone.

### 2.2 Visual Hierarchy

Page titles, section headings, primary actions, key metrics, and table content follow a consistent hierarchy. Terracotta and ember-orange accents identify primary actions; neutral surfaces preserve readability.

### 2.3 Progressive Disclosure

Less frequent actions appear in dialogs, menus, or secondary panels. The dashboard prioritizes information needed for the current task and avoids unnecessary decoration.

### 2.4 Additional Principles

- **Warm and appetizing:** terracotta, ember orange, cream, and toasted neutrals reflect grilled food and a restaurant-bar atmosphere.
- **Compact but breathable:** Mira's compact dashboard patterns reduce wasted space without making controls difficult to use.
- **Responsive by default:** desktop tables and sidebars adapt to small screens.
- **Consistent feedback:** pending, success, validation, empty, and error states use predictable patterns.
- **Accessible contrast:** text and controls remain legible on warm surfaces.
- **No green brand palette:** green is not used as a brand or decorative accent. Status meanings also use labels and icons.

## 3. Design System Structure

### 3.1 Platform

- Next.js App Router, React, TypeScript, and Tailwind CSS.
- shadcn/ui configured with **Base UI** and the **Mira preset**.
- Shared tokens in global CSS and Tailwind theme configuration.
- Reusable chart patterns for inventory balance and reports.
- A consistent icon family from the installed shadcn/ui configuration.

### 3.2 Directory Structure

```text
src/
├── app/
│   ├── globals.css
│   └── (dashboard)/
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── layout/              # Sidebar, header, page shell
│   ├── shared/              # Tables, dialogs, feedback
│   └── features/
│       ├── products/
│       ├── categories/
│       ├── ingredients/
│       ├── inventory/
│       ├── transactions/
│       ├── orders/
│       ├── payments/
│       ├── reports/
│       └── users/
├── lib/
│   └── utils.ts
└── styles/                  # Additional styles only when needed
```

### 3.3 Ownership Rules

- `components/ui/` contains generated or adapted shadcn/ui primitives and stays compatible with Base UI/Mira.
- `components/layout/` owns the shell, sidebar, responsive navigation, and page header.
- `components/shared/` owns domain-neutral tables, confirmation dialogs, empty states, and loading states.
- `components/features/` owns domain-specific compositions.
- `globals.css` owns CSS variables and global tokens.
- Tailwind utilities are the default styling mechanism; additional CSS is used only when utilities are insufficient.
- Components use approved tokens instead of duplicating arbitrary values.

## 4. Color System

The default appearance is a light theme. Surfaces are warm and moderately bright, avoiding pure-white glare and very dark backgrounds. Green is not a brand/decorative color.

### 4.1 Light Theme

| Category             | Token                    | Hex       | Usage                                   |
|----------------------|--------------------------|-----------|-----------------------------------------|
| Background           | `--background`           | `#FFF8F0` | Main warm-cream background              |
| Surface              | `--card`                 | `#FFFFFF` | Cards and dialogs                       |
| Surface muted        | `--muted`                | `#F4E8DA` | Secondary panels                        |
| Surface raised       | `--popover`              | `#FFFCF8` | Popovers and menus                      |
| Border               | `--border`               | `#E6D5C3` | Dividers and outlines                   |
| Text primary         | `--foreground`           | `#34251F` | Main text and headings                  |
| Text secondary       | `--muted-foreground`     | `#79685D` | Helper and secondary text               |
| Primary              | `--primary`              | `#C64F2C` | Primary actions and brand accents       |
| Primary foreground   | `--primary-foreground`   | `#FFFFFF` | Text on primary controls                |
| Secondary            | `--secondary`            | `#F2D2B8` | Secondary actions and surfaces          |
| Secondary foreground | `--secondary-foreground` | `#4A2D20` | Text on secondary surfaces              |
| Accent               | `--accent`               | `#F9DFC8` | Hover/selected backgrounds              |
| Accent foreground    | `--accent-foreground`    | `#4A2D20` | Text on accent surfaces                 |
| Destructive          | `--destructive`          | `#B4232D` | Destructive actions and critical errors |
| Success              | `--success`              | `#8A5B2B` | Semantic success state, warm brown      |
| Warning              | `--warning`              | `#A85D08` | Warnings and low-stock notices          |
| Info                 | `--info`                 | `#356C9A` | Informational state                     |
| Chart 1              | `--chart-1`              | `#C64F2C` | Primary series                          |
| Chart 2              | `--chart-2`              | `#D98B32` | Secondary series                        |
| Chart 3              | `--chart-3`              | `#7D5A50` | Third series                            |
| Chart 4              | `--chart-4`              | `#8A6DAD` | Fourth series                           |
| Chart 5              | `--chart-5`              | `#3F7F9A` | Fifth series                            |

Success uses a warm brown semantic color, not green. Status is also communicated through a label or icon.

### 4.2 Dark Theme

Antorcha's primary design target is light. Where a dark appearance is enabled, it uses softened charcoal and warm brown rather than pure black.

| Category           | Token                  | Hex       | Usage                           |
|--------------------|------------------------|-----------|---------------------------------|
| Background         | `--background`         | `#302722` | Warm charcoal background        |
| Surface            | `--card`               | `#3D312B` | Cards and dialogs               |
| Surface muted      | `--muted`              | `#4A3A32` | Secondary panels                |
| Border             | `--border`             | `#685347` | Dividers and outlines           |
| Text primary       | `--foreground`         | `#FFF4E8` | Main text                       |
| Text secondary     | `--muted-foreground`   | `#D0BBAA` | Secondary text                  |
| Primary            | `--primary`            | `#F07A4D` | Primary action and brand accent |
| Primary foreground | `--primary-foreground` | `#2B1B15` | Text on primary controls        |
| Secondary          | `--secondary`          | `#5A4034` | Secondary controls              |
| Accent             | `--accent`             | `#624333` | Hover/selected states           |
| Destructive        | `--destructive`        | `#FF7777` | Destructive actions             |

### 4.3 Color Rules

- Light theme is the primary design target.
- Primary actions use `--primary`; destructive actions use `--destructive`.
- Surface colors distinguish page, card, and dialog layers.
- Text contrast is checked for normal and small text.
- Status uses a label/icon as well as color.
- Green is not used anywhere in the Antorcha color palette, including semantic status colors and chart series.
- Charts use a limited consistent palette and visible labels/legends.
- Feature components use semantic tokens instead of arbitrary hex values where possible.

## 5. Typography

| Font                 | Use                                                        |  Weight |     Size |
|----------------------|------------------------------------------------------------|--------:|---------:|
| **Barlow Condensed** | Brand wordmark, page titles, prominent section headings    | 600–700 | 24–36 px |
| **Inter**            | Body text, forms, tables, buttons, navigation, helper text | 400–600 | 12–16 px |
| **IBM Plex Mono**    | IDs, timestamps, quantities, technical metadata            | 400–500 | 11–13 px |

Barlow Condensed gives the brand a bold, signage-inspired restaurant identity. Inter keeps dense dashboard information readable. IBM Plex Mono is reserved for identifiers and aligned numeric/technical details.

### Typography Rules

- Use `next/font/google` with CSS variables such as `--font-heading`, `--font-body`, and `--font-mono`.
- Body copy defaults to 14–16 px on desktop and remains legible on mobile.
- Table content may use 13–14 px for compactness, but essential information does not fall below 12 px.
- Use tabular numerals for prices, quantities, and aligned numeric columns.
- Headings use sentence case unless the brand wordmark is styled separately.
- Avoid long blocks of all-caps text.
- Font weight and size establish hierarchy; color alone does not.

## 6. Spacing

| Token | Value | Typical Usage                   |
|-------|------:|---------------------------------|
| `xxs` |  2 px | Tight icon/label alignment      |
| `xs`  |  4 px | Small inline gaps               |
| `sm`  |  8 px | Compact controls and lists      |
| `md`  | 12 px | Default compact spacing         |
| `lg`  | 16 px | Card content and form groups    |
| `xl`  | 24 px | Section spacing                 |
| `xxl` | 32 px | Major page sections             |
| `3xl` | 48 px | Landing-page section separation |

### Layout Tokens

- Dashboard content uses a 24 px desktop gutter and 16 px mobile gutter.
- Cards use 16–20 px padding, adapting to compact Mira patterns.
- Form fields use consistent vertical spacing and aligned labels.
- Related controls are grouped; unrelated sections receive larger separation.
- Avoid unnecessary nested cards and excessive whitespace in data-heavy pages.

### Touch Targets

- Interactive controls aim for a minimum 40 × 40 px target.
- Icon-only controls have accessible names and sufficiently large hit areas.
- Mobile navigation and dialog actions remain comfortable for touch.

## 7. Shapes

| Token  |   Value | Usage                             |
|--------|--------:|-----------------------------------|
| `none` |    0 px | Flat table rows where appropriate |
| `sm`   |    4 px | Compact badges                    |
| `md`   |    6 px | Inputs and standard buttons       |
| `lg`   |    8 px | Cards and popovers                |
| `xl`   |   12 px | Large panels and dialogs          |
| `full` | 9999 px | Pills and avatars                 |

### Component Shape Rules

- Use restrained rounding rather than pill-shaped controls everywhere.
- Buttons and inputs use consistent radii.
- Cards and dialogs use approved surface and border tokens.
- Badges use compact shapes and readable text.
- Avoid decorative shadows that reduce dashboard clarity.

## 8. Icons

### Icon Family

Use the icon set supported by the installed shadcn/ui configuration. Important actions retain text labels; icons supplement rather than replace meaning.

### Icon Sizes

| Token     |  Size | Usage                                      |
|-----------|------:|--------------------------------------------|
| `icon-xs` | 12 px | Dense metadata                             |
| `icon-sm` | 16 px | Inline labels and compact controls         |
| `icon-md` | 20 px | Standard buttons and navigation            |
| `icon-lg` | 24 px | Empty states and prominent feature actions |

### Icon Rules

- Use one icon family consistently.
- Do not mix emoji with interface icons.
- Icon-only controls require accessible labels or tooltips.
- Prefer explicit text when an icon's meaning may be ambiguous.

## 9. Component Catalog

### Structure

```text
components/
├── ui/                 # shadcn/ui primitives (Base UI, Mira)
├── layout/             # Sidebar, mobile navigation, header, page shell
├── shared/             # Data table, form field, confirm dialog, empty state
└── features/
    ├── dashboard/
    ├── products/
    ├── categories/
    ├── ingredients/
    ├── inventory/
    ├── transactions/
    ├── orders/
    ├── payments/
    ├── reports/
    └── users/
```

### Naming

- React components use PascalCase, e.g. `InventoryMovementDialog`.
- Hooks begin with `use`, e.g. `useInventoryMovements`.
- Validation schemas have descriptive names ending in `Schema`.
- Shared components remain domain-neutral; feature components own domain-specific behavior.

### Catalog

| Component    | Category           | Purpose                                 | Variants                                        | States                                   |
|--------------|--------------------|-----------------------------------------|-------------------------------------------------|------------------------------------------|
| Button       | Action             | Main and secondary actions              | Primary, secondary, outline, ghost, destructive | Default, hover, focus, disabled, loading |
| Input        | Form               | Single-line entry                       | Text, email, password, numeric                  | Default, focus, invalid, disabled        |
| Select       | Form               | Choose role/master/category/filter      | Standard, compact                               | Default, open, invalid, disabled         |
| Checkbox     | Form               | Toggle boolean value                    | Standard                                        | Checked, unchecked, disabled             |
| Dialog       | Overlay            | Create/edit workflow                    | Standard                                        | Open, closing, submitting                |
| Alert Dialog | Overlay            | Confirm consequential action            | Confirm/cancel                                  | Open, pending                            |
| Card         | Surface            | Group metrics and content               | Default, compact                                | Default, interactive if needed           |
| Badge        | Status             | Show role/type/state                    | Neutral, success, warning, destructive, info    | Static                                   |
| Table        | Data               | Display records                         | Standard, compact, responsive                   | Loading, populated, empty, error         |
| Sidebar      | Navigation         | Dashboard navigation                    | Expanded/collapsed where supported              | Active/inactive                          |
| Sheet        | Overlay/navigation | Mobile navigation                       | Side panel                                      | Open/closed                              |
| Avatar       | Identity           | User image or initials                  | Image/fallback                                  | Loaded/fallback                          |
| Tooltip      | Help               | Explain icon-only controls              | Standard                                        | Visible/hidden                           |
| Sonner toast | Feedback           | Report operation result                 | Success, error, info, warning                   | Visible/dismissed                        |
| Skeleton     | Loading            | Preserve layout while loading           | Text, row, card                                 | Loading                                  |
| Chart        | Visualization      | Balance and report trends               | Line/area/bar                                   | Loading, populated, empty, error         |
| Form Field   | Form composition   | Label, control, description, validation | Standard, compact                               | Default, invalid, disabled               |

## 10. Component Specifications

### Buttons

| Property | Specification                                    |
|----------|--------------------------------------------------|
| Name     | `Button`                                         |
| Height   | 36–40 px standard; 32–36 px compact              |
| Radius   | 6 px                                             |
| Variants | Primary, secondary, outline, ghost, destructive  |
| States   | Default, hover, focus-visible, disabled, loading |

#### Rules

- Primary buttons represent the main action for the current context.
- Destructive buttons are reserved for high-impact operations.
- Loading buttons prevent duplicate submissions and communicate progress.
- Button labels use clear verbs, such as “Add movement”, “Save changes”, and “Cancel”.
- Dialogs use predictable primary/cancel action order.

### Inputs

- Every input has a visible label.
- Placeholder text supplements rather than replaces the label.
- Invalid fields show a concise adjacent explanation.
- Numeric inputs state their unit where relevant.
- Password inputs use appropriate autocomplete attributes.
- Disabled and read-only states are visually distinct.

### Cards

- Cards group related metrics, filters, or content.
- Titles explain the data group.
- Nested cards are avoided unless hierarchy requires them.
- Dashboard widgets use compact padding; forms use adequate padding.

### Navigation

- Desktop sidebar remains fixed within the authenticated application shell.
- Sidebar shows user identity and role-appropriate links.
- Transactions and Masters appear for both roles; Users appears only for ADMIN.
- Mobile navigation uses a Sheet or equivalent accessible compact pattern.
- Active navigation has a visible style and accessible current-page indication.

### Feedback

- Success feedback confirms completed operations.
- Error feedback explains failure and gives a recovery action where possible.
- Validation messages appear next to the relevant field.
- Loading states prevent duplicate mutation submissions.
- Empty states explain what is absent and offer a next step when allowed.
- Toasts do not replace important field errors or persistent status indicators.

### Other Components

- **Tables:** column labels, loading/empty/error states, responsive overflow or compact mobile layout.
- **Dialogs:** accessible title/description, focus handling, keyboard dismissal where appropriate.
- **Charts:** labels, legends, readable axes, non-color-only cues, and empty states.
- **Status badges:** text plus color.
- **Confirmations:** explicit confirmation for destructive actions affecting history or access.

## 11. Responsive Layout

| Breakpoint / Size Class | Range             | Behavior                                                                   |
|-------------------------|-------------------|----------------------------------------------------------------------------|
| Small mobile            | 320–479 px        | Single column, compact header, mobile navigation, contained table overflow |
| Large mobile            | 480–767 px        | Single-column sections and stacked forms                                   |
| Tablet                  | 768–1023 px       | Two-column layouts where useful, compact navigation                        |
| Desktop                 | 1024–1279 px      | Persistent sidebar and main content                                        |
| Large desktop           | 1280 px and above | Sidebar and wider dashboard grid with bounded content width                |

### Layout Rules

- Design mobile-first with Tailwind responsive utilities.
- No core action depends on hover alone.
- Tables scroll within their container or use a mobile-appropriate alternative.
- Forms use one column on narrow screens and multiple columns only when useful.
- Dialogs fit the viewport and allow internal scrolling.
- Charts resize with their container and preserve readable labels.
- Test at 360 px, 768 px, 1024 px, and 1440 px widths.

## 12. Accessibility

- Use semantic HTML for landmarks, headings, tables, forms, and buttons.
- Every form control has a programmatic label.
- Interactive elements are keyboard accessible with visible focus.
- Dialogs manage focus and have accessible names/descriptions.
- Text and controls meet WCAG AA contrast targets where applicable.
- Status and chart information are not conveyed by color alone.
- Images have meaningful alt text or empty alt when decorative.
- Motion is restrained and respects reduced-motion preferences.
- Validation and asynchronous feedback are exposed to assistive technology.
- Touch targets remain usable on mobile.

## 13. Component Naming Convention

- Primitive components use shadcn/ui's established names.
- Shared application components use descriptive PascalCase names such as `PageHeader`, `DataTable`, `EmptyState`, and `ConfirmActionDialog`.
- Feature components include their domain, such as `MasterFormDialog`, `InventoryMovementTable`, `DailyBalanceChart`, and `UserRoleDialog`.
- Tokens use semantic CSS variable names.
- Avoid ambiguous names such as `Box1` or `NewCard`.

## 14. Design-to-Code Rules

- Use approved color, typography, spacing, and radius tokens.
- Tailwind utilities are the primary styling approach.
- Use shadcn/ui with Base UI and Mira rather than adding a competing component system.
- Keep business logic out of presentational primitives.
- Keep feature data transformations near the feature or server service, not generic UI primitives.
- Reuse shared loading, empty, error, table, and dialog patterns.
- Avoid arbitrary colors when semantic tokens exist.
- Check responsive behavior and keyboard access for each component.

## 15. Component Definition of Done

- [x] Purpose and ownership are clear.
- [x] Existing tokens/components are considered.
- [x] Approved tokens are used.
- [x] Variants and states are defined.
- [x] Responsive behavior is defined.
- [x] Accessibility requirements are documented.
- [x] Naming follows conventions.
- [x] Tests or visual verification cover relevant behavior.
- [x] Documentation reflects the shared pattern.

## 16. Design System Scope

### In Scope

- Landing page and authenticated dashboard shell.
- Tables, forms, dialogs, buttons, badges, feedback, and charts.
- Responsive layout and accessibility patterns.
- Warm palette and typography.
- shadcn/ui Base UI components using Mira.

### Out of Scope

- Brand identity for unrelated businesses.
- Native mobile UI systems.
- Marketing assets unrelated to the web app.
- Complex animation systems that do not improve usability.

### Future

The token structure supports additional dashboard modules without requiring a new visual language. New patterns follow the same semantic tokens, accessibility rules, and component ownership conventions.

## 17. References

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Base UI](https://base-ui.com/)
- [Next.js Fonts](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)
- [Material Design](https://m3.material.io/)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
