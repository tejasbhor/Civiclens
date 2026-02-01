# CivicLens Admin Dashboard - UI Standards Quick Reference

## 🎨 Design Tokens

### Colors
```typescript
// Primary (Blue)
primary-50  to primary-900  // #EBF5FF to #0C4A6E
// Use primary-600 for main actions

// Status Colors
status-received    // Blue    - #6366F1
status-classified  // Purple  - #8B5CF6
status-assigned    // Blue    - #3B82F6
status-progress    // Amber   - #F59E0B
status-resolved    // Green   - #10B981
status-rejected    // Red     - #EF4444

// Severity Colors
critical  // Red    - #DC2626
high      // Orange - #F97316
medium    // Yellow - #EAB308
low       // Gray   - #6B7280
```

### Spacing
```css
/* Base: 4px */
p-4  /* 16px - Standard padding */
p-6  /* 24px - Card padding */
gap-3 /* 12px - Standard gap between elements */
gap-4 /* 16px - Standard gap between cards */
space-y-6 /* 24px - Vertical section spacing */
```

### Typography
```css
/* Headers */
text-3xl font-bold text-gray-900  /* Main page title */
text-2xl font-bold text-gray-900  /* Section title */
text-lg font-semibold text-gray-900  /* Card title */

/* Body */
text-sm text-gray-500  /* Subtitle/description */
text-base text-gray-700  /* Regular text */
text-xs font-medium uppercase tracking-wide  /* Labels */
```

### Borders & Shadows
```css
rounded-lg  /* 12px - Default border radius */
shadow-sm   /* Subtle shadow for cards */
hover:shadow-md  /* Shadow on hover */
border border-gray-200  /* Card borders */
```

---

## 📐 Standard Patterns

### 1. Page Container
```tsx
<div className="p-6 space-y-6 bg-gray-50 min-h-screen">
  {/* Page content */}
</div>
```

### 2. Page Header
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Page Title</h1>
    <p className="text-sm text-gray-500 mt-1">Page description</p>
  </div>
  <div className="flex items-center gap-3">
    {/* Action buttons */}
  </div>
</div>
```

### 3. Primary Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
  <Icon className="w-4 h-4" />
  <span className="text-sm font-medium">Button Text</span>
</button>
```

### 4. Secondary/Outline Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
  <Icon className="w-4 h-4" />
  <span className="text-sm font-medium">Button Text</span>
</button>
```

### 5. Stat Card (KPI)
```tsx
<div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Label
      </div>
      <div className="text-2xl font-bold text-blue-600 mt-2">
        {value}
      </div>
    </div>
    <div className="p-3 bg-blue-100 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
  </div>
</div>
```

### 6. Content Card
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-primary-100 rounded-lg">
      <Icon className="w-5 h-5 text-primary-600" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">Section Title</h2>
  </div>
  {/* Card content */}
</div>
```

### 7. Filter/Search Bar
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Search input */}
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    {/* Filters */}
    <div className="flex gap-3">
      {/* Filter dropdowns */}
    </div>
  </div>
</div>
```

### 8. Badge
```tsx
{/* Status Badge */}
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
  Status
</span>

{/* Severity Badge */}
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
  Critical
</span>
```

### 9. Loading State
```tsx
<div className="flex items-center justify-center py-12">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
    <p className="text-gray-600">Loading...</p>
  </div>
</div>
```

### 10. Error State
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
    <div className="flex-1">
      <h4 className="text-sm font-medium text-red-800">Error Title</h4>
      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
    </div>
  </div>
</div>
```

### 11. Empty State
```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
  <Icon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
  <p className="text-gray-600 mb-4">Description of empty state</p>
  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
    Create New
  </button>
</div>
```

---

## 🎯 Common Layouts

### Grid Layouts
```tsx
{/* 2 columns on large screens */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

{/* 3 columns on extra-large screens */}
<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>

{/* 4 equal columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>

{/* 2/3 - 1/3 split */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

---

## 🔧 Utility Classes

### Flexbox Helpers
```css
flex items-center gap-2       /* Horizontal flex with center alignment */
flex items-center justify-between  /* Space between items */
flex-1                        /* Flex grow to fill space */
flex-shrink-0                 /* Prevent shrinking */
```

### Responsive Utilities
```css
hidden lg:block              /* Hide on mobile, show on large screens */
flex-col lg:flex-row         /* Stack on mobile, row on large screens */
text-sm lg:text-base         /* Smaller text on mobile */
```

### Hover & Transition
```css
hover:bg-gray-50 transition-colors    /* Background color transition */
hover:shadow-md transition-all        /* All properties transition */
```

### Text Truncation
```css
truncate                     /* Single line with ellipsis */
line-clamp-2                 /* Two lines max with ellipsis */
```

---

## 📏 Measurement Guide

### Padding & Margins
- **p-4** (16px): Standard button/input padding
- **p-6** (24px): Standard card padding
- **p-12** (48px): Empty state padding

### Gaps
- **gap-2** (8px): Icon and text
- **gap-3** (12px): Filter elements
- **gap-4** (16px): Card grid
- **gap-6** (24px): Section spacing

### Icon Sizes
- **w-4 h-4** (16px): Button icons
- **w-5 h-5** (20px): Card header icons
- **w-6 h-6** (24px): Stat card icons
- **w-12 h-12** (48px): Loading spinner
- **w-16 h-16** (64px): Empty state icons

---

## ✅ Checklist for New Pages

- [ ] Uses `p-6 space-y-6 bg-gray-50 min-h-screen` container
- [ ] Header follows standard pattern (title + actions)
- [ ] Stat cards (if any) use consistent styling
- [ ] Filter bar (if any) uses consistent styling
- [ ] Content cards use white background with shadow-sm
- [ ] All buttons have icons and proper hover states
- [ ] Loading state uses centered spinner
- [ ] Error states use red card with icon
- [ ] Empty states are properly styled
- [ ] Proper responsive breakpoints (lg:, md:, sm:)
- [ ] All interactive elements have transitions
- [ ] Proper TypeScript types for all props
- [ ] Accessibility: ARIA labels, keyboard navigation

---

## 🚫 Common Mistakes to Avoid

1. ❌ Don't use inline styles - use Tailwind classes
2. ❌ Don't create one-off card styles - use standard pattern
3. ❌ Don't mix p-4 and p-6 for cards - be consistent
4. ❌ Don't use arbitrary colors - use defined color palette
5. ❌ Don't forget hover states on interactive elements
6. ❌ Don't skip loading states
7. ❌ Don't use plain div for buttons - use semantic HTML
8. ❌ Don't forget transitions - always add `transition-*`
9. ❌ Don't use hard-coded colors - use theme colors
10. ❌ Don't skip responsive breakpoints

---

## 📚 Resources

- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons
- **Next.js Docs**: https://nextjs.org/docs
- **Reference Pages**:
  - `src/app/dashboard/page.tsx` - Main dashboard
  - `src/app/dashboard/reports/page.tsx` - Reports page
- **Design System**: `src/styles/design-system.css`
- **Tailwind Config**: `tailwind.config.ts`

---

## 💡 Tips

1. **Copy from reference pages** - Don't reinvent the wheel
2. **Use VS Code snippets** - Create snippets for common patterns
3. **Preview in browser** - Always check responsive design
4. **Use React DevTools** - Debug component hierarchy
5. **Check Lighthouse** - Monitor performance scores
6. **Test accessibility** - Use keyboard navigation
7. **Check dark mode** - Ensure colors work in both modes
8. **Validate HTML** - Use semantic HTML whenever possible

---

**Last Updated**: 2026-02-02  
**Maintainer**: Development Team
