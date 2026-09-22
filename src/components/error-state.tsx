
import { AlertCircleIcon } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
}

export const ErrorState = ({
  title,
  description,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-1 py-4 px-8 items-center justify-center">
      <div className="flex w-full max-w-xs flex-col items-center gap-y-6 glass rounded-3xl p-6">
        <AlertCircleIcon className="mb-4 h-6 w-6 text-rose-500" />

        <h6 className="mb-1 text-md font-large text-foreground">
          {title}
        </h6>

        <p className="text-center text-xs text-muted-foreground">
          {description}
        </p>
        </div>
      </div>
  );
};
