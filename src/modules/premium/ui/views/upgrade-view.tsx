"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { PricingCard } from "../components/pricing-card";

export const UpgradeView = () => {
  const trpc = useTRPC();

  const { data: products } = useSuspenseQuery(
    trpc.premium.getProducts.queryOptions()
  );

  const { data: currentSubscription } = useSuspenseQuery(
    trpc.premium.getCurrentSubscription.queryOptions()
  );

  // ✅ Explicit order control
  const orderedProducts = [...products].sort((a, b) => {
    const order = ["monthly", "yearly", "enterprise"];

    const aType =
      (a.metadata.type as string)?.toLowerCase() ||
      a.name.toLowerCase();

    const bType =
      (b.metadata.type as string)?.toLowerCase() ||
      b.name.toLowerCase();

    return order.indexOf(aType) - order.indexOf(bType);
  });

  return (
  <div className="min-h-screen">
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

      {/* Heading */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          You are on the{" "}
          
            {currentSubscription?.name ?? "Free"}
          {" "}
          plan
        </h1>

        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Choose a plan that fits your needs.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {orderedProducts.map((product) => {
          const isCurrentPlan =
            product.id === currentSubscription?.id;

          const isPremium = !!currentSubscription;

          let buttonText = "Upgrade";
          let onClick = () =>
            authClient.checkout({
              products: [product.id],
            });

          if (isCurrentPlan) {
            buttonText = "Manage";
            onClick = () => authClient.customer.portal();
          } else if (isPremium) {
            buttonText = "Change plan";
            onClick = () => authClient.customer.portal();
          }

          return (
            <PricingCard
              key={product.id}
              buttonText={buttonText}
              onClick={onClick}
              variant={
                product.metadata.variant === "highlighted"
                  ? "highlighted"
                  : "default"
              }
              title={product.name}
              price={
                product.prices[0].amountType === "fixed"
                  ? product.prices[0].priceAmount / 100
                  : 0
              }
              description={product.description}
              priceSuffix={`/ ${product.prices[0].recurringInterval}`}
              features={product.benefits.map(
                (benefit) => benefit.description
              )}
              badge={product.metadata.badge as string | null}
            />
          );
        })}
      </div>
    </div>
  </div>
);
};

export const UpgradeViewLoading = () => {
  return (
    <LoadingState
      title="Loading upgrade"
      description="Please wait while we load your upgrade."
    />
  );
};

export const UpgradeViewError = () => {
  return (
    <ErrorState
      title="Something went wrong"
      description="Please try again later."
    />
  );
};