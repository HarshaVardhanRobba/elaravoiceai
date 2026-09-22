import { CircleCheckIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/* =========================
   Card Variants
========================= */

const pricingCardVariants = cva(
  "flex h-full flex-col justify-between rounded-[28px] border p-7 transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "glass hover:-translate-y-1 hover:bg-white/10",
        premium:
          "glass shadow-md hover:-translate-y-1 hover:bg-white/10",
        highlighted:
          "border-white/15 bg-gradient-to-br from-[#e8672a] to-[#7a2e10] text-white shadow-xl scale-105",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const pricingTitleVariants = cva(
  "text-lg sm:text-xl font-semibold",
  {
    variants: {
      variant: {
        default: "text-foreground",
        premium: "text-foreground",
        highlighted: "text-white",
      },
    },
  }
);

const pricingDescriptionVariants = cva(
  "mt-1 text-sm sm:text-base",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        premium: "text-muted-foreground",
        highlighted: "text-white/80",
      },
    },
  }
);

const pricingPriceVariants = cva(
  "text-2xl sm:text-3xl font-bold",
  {
    variants: {
      variant: {
        default: "text-foreground",
        premium: "text-foreground",
        highlighted: "text-white",
      },
    },
  }
);

const pricingSuffixVariants = cva(
  "text-sm",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        premium: "text-muted-foreground",
        highlighted: "text-white/70",
      },
    },
  }
);

const pricingFeatureTextVariants = cva(
  "text-sm sm:text-base",
  {
    variants: {
      variant: {
        default: "text-foreground/80",
        premium: "text-foreground/80",
        highlighted: "text-white/80",
      },
    },
  }
);

const pricingIconVariants = cva(
  "h-5 w-5 shrink-0",
  {
    variants: {
      variant: {
        default: "text-brand",
        premium: "text-brand",
        highlighted: "text-white",
      },
    },
  }
);

const pricingBadgeVariants = cva(
  "ml-2 rounded-md px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-muted-foreground",
        premium: "bg-white/10 text-muted-foreground",
        highlighted: "bg-white text-[#7a2e10]",
      },
    },
  }
);

/* =========================
   Props
========================= */

interface Props
  extends VariantProps<typeof pricingCardVariants> {
  title: string;
  description: string | null;
  badge?: string | null;
  features: string[];
  price: number;
  priceSuffix?: string;
  className?: string;
  buttonText: string;
  onClick?: () => void;
}

/* =========================
   Component
========================= */

export const PricingCard = ({
  variant,
  title,
  description,
  badge,
  features,
  price,
  priceSuffix,
  className,
  buttonText,
  onClick,
}: Props) => {
  return (
    <div
      className={cn(
        pricingCardVariants({ variant }),
        className
      )}
    >
      {/* Top Section */}
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={cn(pricingTitleVariants({ variant }))}>
              {title}
            </h3>

            {description && (
              <p
                className={cn(
                  pricingDescriptionVariants({ variant })
                )}
              >
                {description}
              </p>
            )}

            {badge && (
              <Badge
                className={cn(
                  "mt-3",
                  pricingBadgeVariants({ variant })
                )}
              >
                {badge}
              </Badge>
            )}
          </div>

          <div className="text-right whitespace-nowrap">
            <p className={cn(pricingPriceVariants({ variant }))}>
              {Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(price)}
            </p>

            {priceSuffix && (
              <span
                className={cn(
                  pricingSuffixVariants({ variant })
                )}
              >
                {priceSuffix}
              </span>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="mt-6">
          <Button
            className={cn(
              "w-full",
              variant === "highlighted" &&
                "bg-white text-[#16140f] hover:bg-white/90 border-none"
            )}
            size="lg"
            variant={
              variant === "highlighted"
                ? "default"
                : "outline"
            }
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>

        <Separator className="my-6" />
      </div>

      {/* Bottom Section */}
      <div>
        <p
          className={cn(
            "mb-4 text-sm font-semibold tracking-wide",
            variant === "highlighted"
              ? "text-white/70"
              : "text-muted-foreground"
          )}
        >
          FEATURES
        </p>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-3"
            >
              <CircleCheckIcon
                className={cn(
                  pricingIconVariants({ variant })
                )}
              />
              <span
                className={cn(
                  pricingFeatureTextVariants({ variant })
                )}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};