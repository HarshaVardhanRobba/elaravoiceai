"use client";

import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsGetOne } from "../../types";
import { BookOpenTextIcon, ClockFadingIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import Markdown from "react-markdown"
import Link from "next/link";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Transcript } from "./transcript";
import { ChatProvider } from "./chat-provider";

interface CompletedStateProps {
    data: MeetingsGetOne;
}

export const CompletedState = ({ data }: CompletedStateProps) => {
    // The chat opens a Stream connection, so only mount it once the user
    // opens the tab, then keep it mounted (forceMount) so switching tabs does
    // not tear the connection down and rebuild it every time.
    const [chatOpened, setChatOpened] = useState(false);

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-6">
            <Tabs
                defaultValue="summary"
                className="w-full"
                onValueChange={(value) => {
                    if (value === "chat") setChatOpened(true);
                }}
            >
                {/* Tabs header */}
                <ScrollArea>
                    <TabsList className="mb-6 h-auto gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="summary"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-muted"
                        >
                            <BookOpenTextIcon className="h-4 w-4" />
                            Summary
                        </TabsTrigger>

                        <TabsTrigger
                            value="transcript"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-muted"
                        >
                            <FileTextIcon className="h-4 w-4" />
                            Transcript
                        </TabsTrigger>

                        <TabsTrigger
                            value="recording"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-muted"
                        >
                            <FileTextIcon className="h-4 w-4" />
                            Recording
                        </TabsTrigger>

                        <TabsTrigger
                            value="chat"
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium data-[state=active]:bg-muted"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            Ask AI
                        </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent
                    value="chat"
                    forceMount
                    className="data-[state=inactive]:hidden"
                >
                    {chatOpened && (
                        <ChatProvider meetingName={data.name} meetingId={data.id} />
                    )}
                </TabsContent>
                <TabsContent value="transcript">
                    <Transcript meetingId={data.id} />
                </TabsContent>

                {/* Recording */}
                <TabsContent value="recording">
                    <div className="rounded-lg border bg-background p-4">
                        <video
                            src={data.recordingUrl!}
                            controls
                            className="w-full rounded-md bg-black"
                        />
                    </div>
                </TabsContent>

                {/* Summary */}
                <TabsContent value="summary">
                    <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-1">
                            <h2 className="text-2xl font-semibold">
                                {data.name}
                            </h2>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <Link
                                    href={`/agents/${data.agent.id}`}
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    <GeneratedAvatar
                                        seed={data.agent.name}
                                        variant="botttsNeutral"
                                        className="h-6 w-6"
                                    />
                                    {data.agent.name}
                                </Link>

                                <span>•</span>

                                <span>
                                    {data.startedAt
                                        ? format(data.startedAt, "PPP")
                                        : ""}
                                </span>

                                <Badge variant="outline" className="gap-1">
                                    <ClockFadingIcon className="h-3 w-3" />
                                    {data.duration
                                        ? formatDuration(data.duration)
                                        : "No Duration"}
                                </Badge>
                            </div>
                        </div>

                        {/* Section header */}
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                            <span>General summary</span>
                        </div>

                        {/* Summary content */}
                        <div className="rounded-lg border bg-muted/30 p-5">
                            <Markdown
                                components={{
                                    h1: (props) => (
                                        <h1 className="mb-3 text-lg font-semibold" {...props} />
                                    ),
                                    h2: (props) => (
                                        <h2 className="mb-3 text-base font-semibold" {...props} />
                                    ),
                                    h3: (props) => (
                                        <h3 className="mb-2 text-sm font-semibold" {...props} />
                                    ),
                                    p: (props) => (
                                        <p className="mb-3 text-sm leading-relaxed text-muted-foreground" {...props} />
                                    ),
                                    ul: (props) => (
                                        <ul className="mb-3 list-disc pl-5 text-sm text-muted-foreground" {...props} />
                                    ),
                                    ol: (props) => (
                                        <ol className="mb-3 list-decimal pl-5 text-sm text-muted-foreground" {...props} />
                                    ),
                                    li: (props) => (
                                        <li className="mb-1" {...props} />
                                    ),
                                    strong: (props) => (
                                        <strong className="text-foreground" {...props} />
                                    ),
                                    code: (props) => (
                                        <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props} />
                                    ),
                                    blockquote: (props) => (
                                        <blockquote className="border-l-2 pl-4 italic text-muted-foreground" {...props} />
                                    ),
                                }}
                            >
                                {data.summary}
                            </Markdown>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

