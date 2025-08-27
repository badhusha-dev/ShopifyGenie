
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
- ✅ **Interactive Documentation**: Live component playground in Swagger UI

---

## 🎨 Color System

### shadcn/ui Color Palette

The design system uses CSS custom properties with automatic dark mode support:

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
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}
```

### Business-Specific Color Extensions

```css
:root {
  /* Success states */
  --success: 142 76% 36%;
  --success-foreground: 355 100% 97%;
  
  /* Warning states */
  --warning: 43 96% 56%;
  --warning-foreground: 25 95% 7%;
  
  /* Info states */
  --info: 199 89% 48%;
  --info-foreground: 210 40% 98%;
  
  /* Accounting-specific colors */
  --debit: 0 84% 60%;
  --credit: 142 76% 36%;
  --overdue: 0 84% 60%;
  --pending: 43 96% 56%;
  --paid: 142 76% 36%;
}
```

### Color Usage Guidelines

- **Primary**: Main brand color, primary CTAs, active navigation
- **Secondary**: Secondary actions, subtle highlights  
- **Accent**: Interactive elements, hover states
- **Destructive**: Error states, deletion confirmations
- **Muted**: Subtle text, secondary information
- **Border**: Dividers, input borders, card outlines
- **Success**: Positive states, completed actions
- **Warning**: Attention needed, pending states
- **Info**: Informational content, tips

---

## 📝 Typography System

### Font Stack

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
               'Helvetica Neue', sans-serif;
}
```

### Typography Scale with shadcn/ui Classes

| Size | shadcn/ui Class | Tailwind Class | Use Case |
|------|----------------|----------------|----------|
| Display | `scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl` | `text-4xl lg:text-5xl font-extrabold` | Hero sections, main titles |
| H1 | `scroll-m-20 text-3xl font-semibold tracking-tight` | `text-3xl font-semibold` | Page headers |
| H2 | `scroll-m-20 text-2xl font-semibold tracking-tight` | `text-2xl font-semibold` | Section titles |
| H3 | `scroll-m-20 text-xl font-semibold tracking-tight` | `text-xl font-semibold` | Subsection headers |
| H4 | `scroll-m-20 text-lg font-semibold tracking-tight` | `text-lg font-semibold` | Card titles |
| Body Large | `text-lg` | `text-lg` | Important body text |
| Body | `leading-7` | `text-base leading-7` | Default body text |
| Body Small | `text-sm text-muted-foreground` | `text-sm` | Secondary information |
| Caption | `text-xs text-muted-foreground` | `text-xs` | Labels, metadata |

### Monospace Typography for Financial Data

```css
.font-mono {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, 
               "Roboto Mono", "Noto Sans Mono", "Ubuntu Mono", monospace;
}
```

---

## 🛠️ Development Workflow in Replit

### Component Development Setup
1. **shadcn/ui Components**: All base components in `client/src/components/ui/`
2. **Custom Components**: Business logic components in `client/src/components/`
3. **Live Preview**: Changes reflect immediately in the webview
4. **Theme Testing**: Toggle dark/light modes via the theme provider
5. **Component Playground**: Test components via Swagger UI at `/api-docs`

### Design Token Management
- **CSS Variables**: Defined in `client/src/index.css` 
- **Tailwind Config**: Extended in `tailwind.config.ts`
- **Component Styling**: Uses `cn()` utility for conditional classes
- **Design Tokens**: Centralized in `client/src/design/tokens.ts`

### Hot Development Features
- **Instant Updates**: File changes trigger immediate browser updates
- **Error Boundaries**: Graceful error handling during development
- **Component Isolation**: Test components independently
- **Responsive Testing**: Real-time breakpoint testing

---

## 🧩 Core Components

### Card Components

#### AnimatedCard
Modern card component with hover animations and gradient options.

```tsx
<AnimatedCard 
  hover={true} 
  gradient="primary"
  className="p-6"
  onClick={() => handleAction()}
>
  <div>
    <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Card Title</h3>
    <p className="text-sm text-muted-foreground">Card content with smooth hover animations</p>
  </div>
</AnimatedCard>
```

**Features:**
- Hover lift animation (8px translateY)
- Multiple gradient options (primary, secondary, success, warning, info)
- Ripple click effects
- Responsive design
- Accessibility-compliant focus states

#### KPI Card
Specialized card for displaying key performance indicators.

```tsx
<KPICard
  title="Total Revenue"
  value="$45,230"
  change={12.5}
  trend="up"
  icon={<DollarSign className="h-4 w-4" />}
  className="col-span-1"
/>
```

### Data Display Components

#### DataTable
Enterprise-grade data table with sorting, filtering, and expansion capabilities.

```tsx
<DataTable
  columns={[
    { 
      accessorKey: 'name', 
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      )
    },
    { 
      accessorKey: 'amount', 
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {formatCurrency(row.getValue('amount'))}
        </div>
      )
    }
  ]}
  data={accountingData}
  searchKey="name"
  searchPlaceholder="Search accounts..."
/>
```

**Features:**
- Column sorting with visual indicators
- Global search functionality
- Row selection with checkboxes
- Pagination controls
- Loading states with skeleton UI
- Responsive column hiding
- Custom cell renderers

### Form Components

#### Form with Validation
Modern form system with React Hook Form and Zod validation.

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="accountName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Account Name</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter account name"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            This will be displayed in the chart of accounts.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    
    <Button 
      type="submit" 
      disabled={form.formState.isSubmitting}
      className="w-full"
    >
      {form.formState.isSubmitting && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      Save Account
    </Button>
  </form>
</Form>
```

#### Select Component
Enhanced select with search and multi-select capabilities.

```tsx
<Select onValueChange={handleChange} defaultValue="1001">
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select an account" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Assets</SelectLabel>
      <SelectItem value="1001">1001 - Cash</SelectItem>
      <SelectItem value="1200">1200 - Accounts Receivable</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Liabilities</SelectLabel>
      <SelectItem value="2001">2001 - Accounts Payable</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### Navigation Components

#### Sidebar with Collapsible Sections
Responsive sidebar navigation with role-based access control.

```tsx
<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Package2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ShopifyApp</span>
            <span className="truncate text-xs">Business Suite</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
  
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Accounting</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/accounting/chart-of-accounts">
                <BookOpen className="h-4 w-4" />
                <span>Chart of Accounts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

---

## 🎭 Animation System

### Transition Specifications

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  --easing-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
  --easing-sharp: cubic-bezier(0.4, 0.0, 0.6, 1);
}
```

### Animation Patterns with Framer Motion

#### Page Transitions
```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

<motion.div
  initial="initial"
  animate="in"
  exit="out"
  variants={pageVariants}
  transition={pageTransition}
>
  {/* Page content */}
</motion.div>
```

#### Card Hover Effects
```tsx
const cardVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

<motion.div
  variants={cardVariants}
  initial="rest"
  whileHover="hover"
  className="cursor-pointer"
>
  {/* Card content */}
</motion.div>
```

#### Loading Animations
```tsx
const spinTransition = {
  loop: Infinity,
  duration: 1,
  ease: "linear"
};

<motion.div
  animate={{ rotate: 360 }}
  transition={spinTransition}
  className="h-4 w-4"
>
  <Loader2 className="h-4 w-4" />
</motion.div>
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 📱 Responsive Design System

### Breakpoint System

| Breakpoint | Min Width | Tailwind | Use Case |
|------------|-----------|----------|----------|
| sm | 640px | `sm:` | Mobile landscape, small tablets |
| md | 768px | `md:` | Tablets |
| lg | 1024px | `lg:` | Small desktops, large tablets |
| xl | 1280px | `xl:` | Large desktops |
| 2xl | 1536px | `2xl:` | Extra large screens |

### Container System

```css
.container {
  @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
}

.container-sm {
  @apply mx-auto max-w-3xl px-4 sm:px-6;
}

.container-fluid {
  @apply mx-auto max-w-none px-4 sm:px-6 lg:px-8;
}
```

### Responsive Component Patterns

#### Dashboard Grid
```tsx
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* KPI Cards */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <KPICard title="Revenue" value="$45,230" />
    <KPICard title="Orders" value="1,234" />
    <KPICard title="Customers" value="5,678" />
    <KPICard title="Conversion" value="3.2%" />
  </div>
  
  {/* Charts */}
  <div className="grid gap-4 lg:grid-cols-2">
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Sales Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
</div>
```

#### Responsive Table
```tsx
<div className="w-full overflow-auto">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-[100px]">Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="hidden md:table-cell">Method</TableHead>
        <TableHead className="hidden lg:table-cell">Date</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {invoices.map((invoice) => (
        <TableRow key={invoice.id}>
          <TableCell className="font-medium">{invoice.invoice}</TableCell>
          <TableCell>
            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
              {invoice.status}
            </Badge>
          </TableCell>
          <TableCell className="hidden md:table-cell">{invoice.paymentMethod}</TableCell>
          <TableCell className="hidden lg:table-cell">{invoice.date}</TableCell>
          <TableCell className="text-right font-mono">{invoice.amount}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## 🌙 Dark Mode Implementation

### Theme Provider Setup

```tsx
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background font-sans antialiased">
        {/* App content */}
      </div>
    </ThemeProvider>
  )
}
```

### Theme Toggle Component

```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Dark Mode Utilities

```tsx
import { cn } from "@/lib/utils"

// Dark mode conditional classes
<div className={cn(
  "bg-white dark:bg-gray-950",
  "text-gray-900 dark:text-gray-50",
  "border-gray-200 dark:border-gray-800"
)}>
  Content that adapts to theme
</div>

// Using CSS variables for consistent theming
<div className="bg-background text-foreground border-border">
  Automatically themed content
</div>
```

---

## 📊 Accounting-Specific Components

### Financial Data Display

#### Currency Formatting
```tsx
const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Usage in components
<TableCell className="text-right font-mono tabular-nums">
  {formatCurrency(invoice.amount)}
</TableCell>
```

#### Status Indicators
```tsx
const getStatusBadge = (status: string) => {
  const variants = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive',
    partial: 'outline'
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
```

#### Aging Buckets
```tsx
<Card>
  <CardHeader>
    <CardTitle>Accounts Receivable Aging</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid gap-4 md:grid-cols-4">
      {agingBuckets.map((bucket) => (
        <div key={bucket.range} className="text-center">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(bucket.amount)}
          </div>
          <div className="text-sm text-muted-foreground">
            {bucket.range}
          </div>
          <div className="text-xs text-muted-foreground">
            {bucket.count} invoices
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### Journal Entry Interface

#### Double-Entry Validation
```tsx
const JournalEntryForm = () => {
  const [lines, setLines] = useState([]);
  
  const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebits === totalCredits;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Journal entry lines */}
          <div className="grid gap-4">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium">
              <div className="col-span-4">Account</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2 text-right">Debit</div>
              <div className="col-span-2 text-right">Credit</div>
              <div className="col-span-1"></div>
            </div>
            
            {lines.map((line, index) => (
              <JournalEntryLine
                key={index}
                line={line}
                onChange={(updatedLine) => updateLine(index, updatedLine)}
                onRemove={() => removeLine(index)}
              />
            ))}
          </div>
          
          {/* Balance verification */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-sm text-muted-foreground">Total Debits</div>
                <div className="font-mono text-lg">{formatCurrency(totalDebits)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
                <div className="font-mono text-lg">{formatCurrency(totalCredits)}</div>
              </div>
            </div>
            
            <Badge variant={isBalanced ? 'default' : 'destructive'}>
              {isBalanced ? 'Balanced' : 'Out of Balance'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🔧 Technical Implementation

### CSS Architecture

```
client/src/
├── index.css              # Global styles, CSS variables
├── components/
│   └── ui/                # shadcn/ui components
├── design/
│   ├── tokens.ts          # Design tokens
│   └── tokens.scss        # SCSS design tokens
└── lib/
    └── utils.ts           # Utility functions (cn, etc.)
```

### Utility Functions

#### Class Name Utility
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  anotherCondition ? "true-classes" : "false-classes"
)}>
```

#### Format Utilities
```typescript
export const formatters = {
  currency: (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  },
  
  number: (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  },
  
  date: (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  },
  
  percentage: (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }
};
```

### Component Guidelines

1. **Use semantic HTML elements** with proper ARIA attributes
2. **Include data-testid attributes** for testing
3. **Follow shadcn/ui patterns** for consistency
4. **Implement proper keyboard navigation**
5. **Support screen readers** with descriptive labels
6. **Handle loading and error states** gracefully

### Performance Optimizations

- **Tree shaking**: Only import used components
- **Code splitting**: Lazy load route components
- **Efficient animations**: Use transform and opacity
- **Optimized images**: WebP format with fallbacks
- **Minimal re-renders**: Optimize React component updates

---

## ✅ Accessibility Standards

### WCAG 2.1 Compliance

#### Color Contrast
- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **Non-text elements**: 3:1 minimum contrast ratio

#### Keyboard Navigation
```tsx
// Proper focus management
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  Accessible Button
</Button>
```

#### Screen Reader Support
```tsx
// Proper ARIA labels and descriptions
<div role="region" aria-labelledby="summary-title">
  <h2 id="summary-title">Financial Summary</h2>
  <div aria-live="polite" aria-atomic="true">
    {/* Dynamic content updates */}
  </div>
</div>
```

#### Form Accessibility
```tsx
<FormField
  control={form.control}
  name="amount"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Amount</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="0.00"
          aria-describedby="amount-description amount-error"
          {...field}
        />
      </FormControl>
      <FormDescription id="amount-description">
        Enter the transaction amount in USD
      </FormDescription>
      <FormMessage id="amount-error" />
    </FormItem>
  )}
/>
```

### Testing Accessibility

```typescript
// Example accessibility test
describe('Component Accessibility', () => {
  test('should have proper ARIA attributes', () => {
    render(<AccountingCard />);
    
    const card = screen.getByRole('region');
    expect(card).toHaveAttribute('aria-labelledby');
    expect(card).toBeVisible();
  });

  test('should support keyboard navigation', () => {
    render(<DataTable />);
    
    const firstCell = screen.getAllByRole('cell')[0];
    firstCell.focus();
    
    fireEvent.keyDown(firstCell, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getAllByRole('cell')[1]);
  });
});
```

---

## 🚀 Performance Metrics

### Target Performance Goals

- **First Contentful Paint**: < 1.2s
- **Largest Contentful Paint**: < 2.0s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.0s

### Optimization Strategies

#### Bundle Optimization
```typescript
// Dynamic imports for route components
const AccountsReceivable = lazy(() => import('./pages/AccountsReceivable'));
const ChartOfAccounts = lazy(() => import('./pages/ChartOfAccounts'));

// Code splitting with error boundaries
<Suspense fallback={<PageSkeleton />}>
  <ErrorBoundary>
    <AccountsReceivable />
  </ErrorBoundary>
</Suspense>
```

#### Image Optimization
```tsx
// Responsive images with modern formats
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.avif" type="image/avif" />
  <img 
    src="image.jpg" 
    alt="Descriptive text"
    loading="lazy"
    className="h-auto w-full object-cover"
  />
</picture>
```

#### CSS Optimization
```css
/* Use contain for isolated components */
.card-container {
  contain: layout style paint;
}

/* Optimize animations for performance */
.animate-in {
  animation: fadeIn 0.3s ease-out;
  transform: translateZ(0); /* Force hardware acceleration */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px) translateZ(0); }
  to { opacity: 1; transform: translateY(0) translateZ(0); }
}
```

---

## 📦 Component Library Documentation

### Available Components

#### Layout Components
- **Sidebar**: Collapsible navigation with role-based menu items
- **TopNav**: Header navigation with user menu and notifications
- **Container**: Responsive container with max-width constraints
- **Grid**: CSS Grid utility components

#### Data Display
- **DataTable**: Full-featured data table with sorting, filtering, pagination
- **KPICard**: Key performance indicator display cards
- **Chart**: Recharts integration for data visualization
- **Badge**: Status and category indicators
- **Progress**: Progress bars and loading indicators

#### Form Controls
- **Input**: Enhanced input fields with validation
- **Select**: Searchable select with grouping
- **Checkbox**: Styled checkbox controls
- **RadioGroup**: Radio button groups
- **Switch**: Toggle switches
- **Textarea**: Multi-line text input

#### Navigation
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Breadcrumb**: Navigation breadcrumbs
- **Tabs**: Tabbed navigation interface
- **Pagination**: Data pagination controls

#### Feedback
- **Alert**: Alert messages and notifications
- **Toast**: Temporary notification system
- **Dialog**: Modal dialogs and confirmations
- **Popover**: Contextual popup content
- **Tooltip**: Hover information displays

#### Overlay
- **Sheet**: Side panel overlays
- **Modal**: Full modal dialogs
- **Dropdown**: Dropdown menus and actions

### Usage Examples and API Documentation

Each component includes comprehensive documentation with:
- **Props interface**: TypeScript definitions
- **Usage examples**: Code snippets with common use cases
- **Accessibility notes**: WCAG compliance information
- **Styling guide**: Customization options
- **Testing examples**: Unit test patterns

---

## 🔄 Version History

### v3.0.0 - January 2025
- Complete migration to shadcn/ui component library
- Tailwind CSS integration for utility-first styling
- Dark mode support with CSS custom properties
- Enhanced accessibility compliance (WCAG 2.1)
- Framer Motion animation system
- Responsive design improvements
- Performance optimizations

### v2.0.0 - Previous Version
- Bootstrap 5.3 integration
- Basic component library
- Responsive design foundations
- Core accounting features

### v1.0.0 - Initial Release
- Basic UI components
- Limited styling system
- Proof of concept implementation

---

## 🤝 Contributing

### Design System Contributions

1. **Follow established patterns**: Use existing design tokens and components
2. **Maintain accessibility**: Ensure WCAG 2.1 compliance
3. **Test responsiveness**: Verify behavior across breakpoints
4. **Document changes**: Update component documentation
5. **Consider performance**: Optimize for loading and runtime performance

### Code Style Guidelines

- **Use TypeScript**: Strict type checking for all components
- **Follow shadcn/ui patterns**: Consistent with established conventions
- **Implement proper error handling**: Graceful error states
- **Write comprehensive tests**: Unit and integration test coverage
- **Document component APIs**: Clear prop interfaces and examples

---

## 📞 Support and Resources

### Design System Resources
- **shadcn/ui Documentation**: [ui.shadcn.com](https://ui.shadcn.com)
- **Tailwind CSS Guide**: [tailwindcss.com](https://tailwindcss.com)
- **Radix UI Primitives**: [radix-ui.com](https://radix-ui.com)
- **Framer Motion**: [framer.com/motion](https://framer.com/motion)

### Accessibility Resources
- **WCAG 2.1 Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21)
- **Accessibility Testing**: [axe-core](https://github.com/dequelabs/axe-core)
- **Screen Reader Testing**: [NVDA](https://www.nvaccess.org)

### Development Tools
- **Replit Environment**: Optimized for live development
- **Hot Module Replacement**: Instant design updates
- **Component Playground**: Interactive component testing
- **Responsive Design Testing**: Real-time breakpoint verification

---

*This design system documentation provides comprehensive guidelines for building accessible, performant, and beautiful user interfaces in the ShopifyApp ecosystem. The system is optimized for the Replit development environment while maintaining production-ready standards.*
