import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[15px] transition duration-200 ease-out active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-inv text-inv-fg hover:opacity-85",
        outline: "border border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
        subtle: "border border-hair bg-alt text-fg hover:border-line",
        ghost: "text-fg hover:bg-fg/5",
        danger: "border border-bad bg-transparent text-bad hover:bg-bad hover:text-white",
        light: "bg-white text-black hover:bg-white/85",
        glass: "border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-10 px-5 text-sm",
        lg: "h-14 px-9 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
