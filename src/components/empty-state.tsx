

import Image from "next/image";

interface EmptyStateProps {
  title: string;
  description: string;
  image?: string;
}

export const EmptyState = ({
  title,
  description,
  image = "/empty.svg",
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
        <Image src={image} width={280} height={280} alt="error" />
        <div className="flex flex-col gap-y-6 max-w-md mx-auto text-center">
          <h6 className="mb-1 font-display text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h6>
          <p className="text-center text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
  );
};
