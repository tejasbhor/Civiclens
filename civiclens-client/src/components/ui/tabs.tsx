import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, forwardedRef) => {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const settled = React.useRef(false);

  // Slide one pill under whichever trigger is active (transitions.dev "tabs sliding").
  const place = React.useCallback(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    const active = list?.querySelector<HTMLElement>('[data-state="active"]');
    if (!list || !pill || !active) return;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.height = `${active.offsetHeight}px`;
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    pill.style.opacity = "1";
    if (!settled.current) {
      // First placement must not animate from 0,0.
      pill.style.transition = "none";
      requestAnimationFrame(() => {
        pill.style.transition = "";
        settled.current = true;
      });
    }
  }, []);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    place();
    const mo = new MutationObserver(place);
    mo.observe(list, { attributes: true, attributeFilter: ["data-state"], subtree: true });
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  }, [place]);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        listRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span ref={pillRef} aria-hidden="true" className="t-tab-indicator bg-background shadow-sm opacity-0" />
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex shrink-0 items-center justify-center whitespace-nowrap relative z-10 rounded-control px-3 py-1.5 text-body-sm font-medium [@media(pointer:coarse)]:min-h-10 ring-offset-background transition-colors duration-[150ms] data-[state=active]:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
