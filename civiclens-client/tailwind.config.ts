import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Schibsted Grotesk Variable"', "Schibsted Grotesk", "Inter", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Outfit", "sans-serif"],
        handwriting: ['"Caveat"', "cursive", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      // Semantic type roles. Use these, not text-[..px]. See DESIGN.md.
      fontSize: {
        display: ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "800" }],
        h1: ["clamp(2rem, 4.2vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["clamp(1.5rem, 2.8vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "700" }],
        h3: ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["0.9375rem", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        label: ["0.8125rem", { lineHeight: "1.25", fontWeight: "600" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
        meta: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: "500" }],
        code: ["0.8125rem", { lineHeight: "1.6" }],
      },
      colors: {
        signal: {
          DEFAULT: "hsl(var(--signal))",
          foreground: "hsl(var(--signal-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          muted: "hsl(var(--surface-muted))",
          inverse: "hsl(var(--surface-inverse))",
          "inverse-foreground": "hsl(var(--surface-inverse-foreground))",
        },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        danger: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
        status: {
          submitted: "hsl(var(--status-submitted))",
          received: "hsl(var(--status-received))",
          review: "hsl(var(--status-review))",
          assigned: "hsl(var(--status-assigned))",
          progress: "hsl(var(--status-progress))",
          completed: "hsl(var(--status-completed))",
          rejected: "hsl(var(--status-rejected))",
          escalated: "hsl(var(--status-escalated))",
          pending: "hsl(var(--status-pending))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // Radius hierarchy: control 8 / card 12 / panel 16 / surface 28. lg/md/sm kept for shadcn primitives.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        control: "0.5rem",
        card: "0.75rem",
        panel: "1rem",
        surface: "1.75rem",
      },
      // Elevation: border-only by default; raised / overlay / floating are the only shadows.
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-lg)",
        raised: "var(--shadow-sm)",
        overlay: "var(--shadow-md)",
        floating: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        marquee: "marquee 35s linear infinite",
        "accordion-down": "accordion-down var(--duration-fast) var(--ease-smooth-out)",
        "accordion-up": "accordion-up var(--duration-quick) var(--ease-smooth-out)",
      },
    },
  },
  future: { hoverOnlyWhenSupported: true },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
