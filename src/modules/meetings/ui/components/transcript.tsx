import { GenerateAvatarUri } from "@/lib/avatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import Highlighter from "react-highlight-words";

interface TranscriptProps {
  meetingId: string;
}

export const Transcript = ({ meetingId }: TranscriptProps) => {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.meetings.getTranscript.queryOptions({ id: meetingId })
  );

  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = (data ?? []).filter((item) =>
    item.text.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        Transcript
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search transcript"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Messages */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-5">
          {filteredData.map((item) => (
            <div
              key={item.start_ts}
              className="flex items-start gap-3"
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    item.user.image ??
                    GenerateAvatarUri({
                      seed: item.user.name,
                      variant: "initials",
                    })
                  }
                  alt="User avatar"
                />
              </Avatar>

              {/* Message content */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {item.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(
                      new Date(0, 0, 0, 0, 0, 0, item.start_ts),
                      "mm:ss"
                    )}
                  </p>
                </div>

                <Highlighter
                  className="text-sm leading-relaxed text-foreground/80"
                  highlightClassName="bg-highlight/30 text-foreground"
                  searchWords={searchQuery ? [searchQuery] : []}
                  autoEscape
                  textToHighlight={item.text}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
