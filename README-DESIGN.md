# ShopifyApp Design System Documentation

*Updated for Replit Environment - January 2025*

A comprehensive, modern design system built with shadcn/ui and Tailwind CSS, featuring modern aesthetics, advanced animations, and enterprise-grade accounting interfaces optimized for the Replit development environment.

## 🎨 Design Philosophy

Our design system combines the accessibility and robustness of shadcn/ui with Tailwind CSS, creating a cohesive, professional experience for e-commerce and accounting applications that works seamlessly in both Replit and production environments.

### Core Principles

- **Accessibility First**: Full compliance with WCAG 2.1 standards via Radix UI primitives
- **Performance Optimized**: Tailwind CSS utility-first approach with minimal bundle size
- **Mobile Responsive**: Mobile-first design with seamless desktop scaling
- **Modern UI/UX**: Contemporary design patterns with smooth animations
- **Component Reusability**: Modular, composable design patterns using shadcn/ui
- **Replit Optimized**: Fast development cycles with hot module replacement

## 🚀 **Replit Environment Features**
- ✅ **Live Development**: Hot module replacement for instant design updates
- ✅ **Component Library**: Complete shadcn/ui integration with Radix UI
- ✅ **Responsive Testing**: Real-time responsive design testing in webview
- ✅ **Theme Support**: Built-in dark/light mode switching
- ✅ **Animation System**: Framer Motion integration for smooth transitions

---

## 🎨 Color Palette

### shadcn/ui + Tailwind CSS Colors

The design system uses a modern color palette built on CSS custom properties with automatic dark mode support:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variants */
}
```

### Color Usage Guidelines

- **Primary**: Main brand color, primary CTAs, active navigation
- **Secondary**: Secondary actions, subtle highlights  
- **Accent**: Interactive elements, hover states
- **Destructive**: Error states, deletion confirmations
- **Muted**: Subtle text, secondary information
- **Border**: Dividers, input borders, card outlines

---

## 📝 Typography System

### Font Stack

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
```

### Typography Scale

Built on Tailwind's type scale with semantic shadcn/ui classes:

| Tailwind Class | shadcn/ui Class | Use Case |
|---------------|----------------|----------|
| `text-4xl` | `scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl` | Page headers |
| `text-3xl` | `scroll-m-20 text-3xl font-semibold tracking-tight` | Section titles |
| `text-2xl` | `scroll-m-20 text-2xl font-semibold tracking-tight` | Subsection headers |
| `text-xl` | `scroll-m-20 text-xl font-semibold tracking-tight` | Card titles |
| `text-lg` | `text-lg font-semibold` | Important text |
| `text-base` | `leading-7` | Default body text |
| `text-sm` | `text-sm text-muted-foreground` | Secondary info |
| `text-xs` | `text-xs text-muted-foreground` | Labels, metadata |

## 🛠️ Development Workflow in Replit

### Hot Development Setup
1. **Component Development**: All shadcn/ui components are in `client/src/components/ui/`
2. **Custom Components**: Business logic components in `client/src/components/`
3. **Live Preview**: Changes reflect immediately in the webview
4. **Theme Testing**: Toggle dark/light modes via the theme provider

### Design Token Management
- **CSS Variables**: Defined in `client/src/index.css` 
- **Tailwind Config**: Extended in `tailwind.config.ts`
- **Component Styling**: Uses cn() utility for conditional classes

---

## 🧩 Core Components

### AnimatedCard

Modern card component with hover animations and gradient options.

```tsx
<AnimatedCard 
  hover={true} 
  gradient="shopify"
  onClick={() => handleAction()}
>
  <div className="p-4">
    <h3>Card Title</h3>
    <p>Card content with smooth hover animations</p>
  </div>
</AnimatedCard>
```

**Features:**
- Hover lift animation (8px translateY)
- Multiple gradient options (shopify, blue, purple, coral)
- Ripple click effects
- Responsive design
- Accessibility-compliant

**Animation Specifications:**
```css
.animated-card {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  transform-origin: center bottom;
}

.animated-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}
```

### DataTable

Enterprise-grade data table with sorting, filtering, and expansion capabilities.

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'amount', label: 'Amount', render: (value) => formatCurrency(value) }
  ]}
  data={accountingData}
  expandable={true}
  renderExpandedRow={(row) => <DetailView data={row} />}
/>
```

**Features:**
- Column sorting with visual indicators
- Row expansion with slide animations
- Responsive column hiding
- Loading states with skeleton UI
- Custom cell renderers
- Bootstrap 5.3 integration

### Form Components

Modern form system with validation and accessibility.

```tsx
<Form onSubmit={handleSubmit(onSubmit)}>
  <FormField
    label="Account Name"
    error={errors.accountName}
    required
  >
    <input
      {...register('accountName')}
      className="form-control"
      data-testid="input-account-name"
    />
  </FormField>
  
  <Button 
    type="submit" 
    variant="primary"
    loading={isSubmitting}
    data-testid="button-submit"
  >
    Save Account
  </Button>
</Form>
```

---

## 🎭 Animation Specifications

### Transition Timing

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
}
```

### Animation Patterns

1. **Fade In**: Opacity 0 → 1 over 250ms
2. **Slide Up**: TranslateY(20px) → 0 over 300ms
3. **Ripple Effect**: Scale and opacity animation for button interactions
4. **Card Hover**: Lift and shadow enhancement
5. **Modal Entrance**: Scale(0.95) + fade in combination

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📱 Responsive Design

### Breakpoint System

| Breakpoint | Min Width | Max Width | Use Case |
|------------|-----------|-----------|----------|
| xs | 0px | 575px | Mobile phones |
| sm | 576px | 767px | Large phones, small tablets |
| md | 768px | 991px | Tablets |
| lg | 992px | 1199px | Small desktops |
| xl | 1200px | 1399px | Large desktops |
| xxl | 1400px+ | - | Extra large screens |

### Mobile-First Approach

```css
/* Mobile-first base styles */
.accounting-card {
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .accounting-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 992px) {
  .accounting-card {
    padding: 2rem;
    margin-bottom: 2rem;
  }
}
```

---

## 🌙 Dark Mode Support

### Implementation

Dark mode is implemented using CSS custom properties and data attributes:

```css
/* Light mode (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --border-color: #dee2e6;
}

/* Dark mode */
[data-bs-theme="dark"] {
  --bg-primary: #212529;
  --text-primary: #ffffff;
  --border-color: #495057;
}
```

### Dark Mode Components

All components automatically adapt to dark mode:

- **Cards**: Background and border color adjustments
- **Tables**: Header and row background modifications
- **Forms**: Input field and validation styling
- **Buttons**: Contrast and hover state optimization

---

## 📊 Accounting-Specific Components

### Financial Data Display

```tsx
// Currency formatting with proper alignment
<td className="text-end font-monospace">
  {formatCurrency(amount)}
</td>

// Status indicators with consistent styling
<span className={`badge bg-${getStatusColor(status)}`}>
  {status.toUpperCase()}
</span>

// Aging buckets with visual hierarchy
<div className="aging-bucket">
  <div className="aging-header">Current (0-30 days)</div>
  <div className="aging-amount">{formatCurrency(currentAmount)}</div>
  <div className="aging-count">{currentCount} items</div>
</div>
```

### Journal Entry Interface

- **Double-entry validation**: Real-time debit/credit balance checking
- **Account selection**: Searchable dropdown with code and name
- **Line item management**: Add/remove with smooth animations
- **Reference tracking**: Consistent reference number formatting

### Bank Reconciliation

- **Statement upload**: Drag-and-drop file interface
- **Matching algorithm**: Visual similarity scoring
- **Reconciliation status**: Clear visual indicators
- **Difference highlighting**: Color-coded variances

---

## 🏗️ Layout Patterns

### Page Structure

```html
<main className="container-fluid py-4">
  <!-- Page Header -->
  <header className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h1 className="h3 mb-0">Page Title</h1>
      <p className="text-muted mb-0">Page description</p>
    </div>
    <div>
      <button className="btn btn-primary">
        <i className="fas fa-plus me-2"></i>
        Primary Action
      </button>
    </div>
  </header>
  
  <!-- Filters and Search -->
  <section className="mb-4">
    <AnimatedCard>
      <!-- Filter controls -->
    </AnimatedCard>
  </section>
  
  <!-- Main Content -->
  <section>
    <AnimatedCard>
      <DataTable />
    </AnimatedCard>
  </section>
</main>
```

### Grid System Usage

```html
<!-- Dashboard Cards -->
<div className="row g-4">
  <div className="col-12 col-md-6 col-xl-3">
    <AnimatedCard gradient="shopify">
      <!-- Metric card -->
    </AnimatedCard>
  </div>
</div>

<!-- Form Layout -->
<div className="row">
  <div className="col-12 col-lg-8">
    <!-- Main form -->
  </div>
  <div className="col-12 col-lg-4">
    <!-- Sidebar information -->
  </div>
</div>
```

---

## 🔧 Technical Implementation

### CSS Architecture

```
styles/
├── vendors/          # Bootstrap and third-party CSS
├── base/            # Reset, typography, base styles
├── components/      # Component-specific styles
├── pages/          # Page-specific styles
├── utilities/      # Utility classes
└── themes/         # Dark mode and theme variations
```

### Component Guidelines

1. **Use semantic HTML elements**
2. **Include data-testid attributes for testing**
3. **Follow Bootstrap 5.3 class conventions**
4. **Implement proper ARIA labels**
5. **Support keyboard navigation**

### Performance Optimizations

- **CSS-in-JS removed**: Eliminated styled-jsx for better performance
- **Minimal custom CSS**: Leverage Bootstrap utilities
- **Efficient animations**: Use transform and opacity for smooth rendering
- **Lazy loading**: Components load only when needed

---

## ✅ Accessibility Standards

### WCAG 2.1 Compliance

- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Descriptive alt text for images

### Testing Guidelines

```typescript
// Example accessibility test
describe('AnimatedCard Accessibility', () => {
  test('should have proper focus management', () => {
    render(<AnimatedCard onClick={mockFn}>Content</AnimatedCard>);
    const card = screen.getByRole('button');
    
    fireEvent.focus(card);
    expect(card).toHaveFocus();
    expect(card).toBeVisible();
  });
});
```

---

## 🚀 Performance Metrics

### Target Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### Optimization Strategies

1. **Component lazy loading**
2. **Image optimization and lazy loading**
3. **Efficient CSS delivery**
4. **Minimal JavaScript bundle size**
5. **Caching strategies**

---

## 📦 Component Library

### Available Components

- **AnimatedCard**: Interactive card with hover effects
- **DataTable**: Feature-rich data table
- **Button**: Multiple variants with loading states
- **Form**: Complete form system with validation
- **Modal**: Animated modal dialogs
- **Toast**: Non-intrusive notifications
- **Badge**: Status and category indicators
- **Dropdown**: Enhanced select components

### Usage Examples

See individual component documentation in the `/components/ui/` directory for detailed implementation examples and API references.

---

## 🔄 Version History

### v2.0.0 - August 2025
- Complete Bootstrap 5.3 migration
- Enhanced accounting module components
- Dark mode implementation
- Accessibility improvements
- Performance optimizations

### v1.5.0 - Previous Version
- Initial component library
- Basic responsive design
- Core accounting features

---

## 🤝 Contributing

### Design Contributions

1. Follow the established design tokens
2. Maintain accessibility standards
3. Test across all supported browsers
4. Include proper documentation
5. Update this design system documentation

### Code Style

- Use TypeScript for all components
- Follow React best practices
- Include proper PropTypes or TypeScript interfaces
- Write comprehensive tests
- Document component APIs

---

## 📞 Support

For design system questions, component requests, or technical support:

- Review component documentation in `/components/ui/`
- Check existing issues and patterns
- Follow accessibility guidelines
- Test responsive behavior
- Validate dark mode compatibility

---

*This design system powers the ShopifyApp accounting and e-commerce platform, providing a consistent, accessible, and performant user experience across all modules.*