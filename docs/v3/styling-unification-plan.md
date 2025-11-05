# Talent Matcher Styling Unification Plan

## Style Analysis

**Home Page (home.jpg):**
- Clean white cards with subtle borders
- Minimal shadows (light gray/none)
- Consistent spacing and padding
- Professional color scheme (blues, grays, whites)
- Clean typography with clear hierarchy
- Simple hover states

**Workflows Detail Page (workflows_[id].jpg):**
- Well-structured information cards with light borders
- Consistent use of icons and badges
- Clean spacing and layout
- Professional gradient accents
- Clear visual hierarchy

**Pages Needing Updates:**

1. **Candidates Page (candidates.jpg):** Currently has inconsistent styling, needs cleaner cards and better spacing
2. **Candidate Detail Page (candidate_[id].jpg):** Has some visual inconsistencies in card styling and layout
3. **Jobs Page (jobs.jpg):** Needs more consistent card styling and spacing
4. **Jobs Detail Page (jobs_[id].jpg):** Could benefit from cleaner card layouts
5. **Settings Page (settings.jpg):** Already has good styling, minor refinements needed

## Styling Plan

### 1. **Base Card Component Updates** (`components/ui/card.tsx`)
- Standardize card borders to use `border-border` instead of `border-0`
- Remove excessive shadows (`shadow-lg`) and use subtle borders
- Ensure consistent padding and spacing
- Add hover states that are subtle and professional

### 2. **Page-Specific Updates**

**Candidates Page (`app/candidates/page.tsx`)**:
- Update search filter cards to match clean styling
- Standardize candidate listing cards with consistent borders
- Remove any exaggerated styling effects
- Ensure consistent badge and button styling

**Candidate Detail (`app/candidates/[id]/page.tsx`)**:
- Update application cards to have consistent borders and spacing
- Standardize alternative matches section styling
- Ensure all cards follow the same visual pattern

**Jobs Page (`app/jobs/page.tsx`)**:
- Update job listing cards for consistent styling
- Standardize filter controls and search interface
- Ensure consistent typography and spacing

**Jobs Detail (`app/jobs/[id]/page.tsx`)**:
- Update job detail information cards
- Standardize candidate listing section
- Ensure consistent styling with other pages

**Settings Page (`app/settings/settings-client.tsx`)**:
- Minor refinements to maintain consistency
- Ensure company cards follow standard styling

### 3. **Consistent Design System Elements**

**Color Palette:**
- Primary: Blues (current)
- Background: Clean whites and light grays
- Borders: Subtle gray (`border-border`)
- Text: Consistent hierarchy

**Spacing:**
- Cards: `p-6` for standard cards
- Sections: `space-y-6` between sections
- Grid layouts: Consistent gap spacing

**Typography:**
- Headers: Consistent sizing and weight
- Body text: Consistent line height and color
- Badges: Standard sizing and colors

**Interactive Elements:**
- Buttons: Consistent variants and sizing
- Links: Consistent hover states
- Cards: Subtle hover effects if any

### 4. **Component-Level Updates**

**Search and Filter Components:**
- Standardize search input styling
- Consistent dropdown/select styling
- Clean button styling for actions

**Information Cards:**
- Consistent header styling
- Standardized icon usage and sizing
- Clean content layout with proper spacing

**Status Badges and Indicators:**
- Consistent color coding
- Standard sizing and positioning
- Clear visual hierarchy

### 5. **Implementation Priority**

1. **High Priority:** Base card component updates (affects all pages)
2. **High Priority:** Candidates page (currently most inconsistent)
3. **Medium Priority:** Jobs pages (minor inconsistencies)
4. **Low Priority:** Settings page (already good, minor tweaks)

This plan will create a cohesive, professional design system that matches the clean styling demonstrated in the home page and workflows detail page, while maintaining the functionality and user experience of the current application.