import { EmptyState } from "@/components/empty-state";

export const PendingState = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12 px-4 sm:px-6 lg:px-8">
            <EmptyState
                image="/processing.svg"
                title="Processing your meeting"
                description="Your meeting has ended. The summary, transcript and recording are being generated, and this page will update automatically."
            />
        </div>
    );
};
