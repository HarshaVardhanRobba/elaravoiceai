"use client";

import type { Channel as StreamChannel } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";
import {
  useCreateChatClient,
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";

interface ChatUIProps {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string | undefined;
}

export const ChatUI = ({
  meetingId,
  userId,
  userName,
  userImage,
}: ChatUIProps) => {
  const trpc = useTRPC();

  const { mutateAsync: generateChatToken } = useMutation(
    trpc.meetings.generateChatToken.mutationOptions()
  );

  const [channel, setChannel] = useState<StreamChannel>();
  const [tokenError, setTokenError] = useState(false);

  // useCreateChatClient never reports a failed token, it just stays null
  // forever, so track the failure here to show an error instead of a spinner.
  const tokenProvider = useCallback(async () => {
    try {
      return await generateChatToken();
    } catch (err) {
      console.error("Failed to get chat token", err);
      setTokenError(true);
      throw err;
    }
  }, [generateChatToken]);

  const client = useCreateChatClient({
    apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
    tokenOrProvider: tokenProvider,
    userData: {
      id: userId,
      name: userName,
      image: userImage,
    },
  });

  useEffect(() => {

    if(!client) return;

    const channel = client.channel("messaging", meetingId, {
      members: [userId],
    });
    setChannel(channel);
  }, [client, meetingId, userId]);

  if (tokenError) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ErrorState
          title="Couldn't load the chat"
          description="Your session may have expired. Refresh the page and try again."
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoadingState
          title="Loading Chat"
          description="Please wait while we load your chat."
        />
      </div>
    );
  }

  return (
  <div className="flex h-[calc(100vh-80px)] w-full flex-col overflow-hidden glass rounded-3xl">
    <Chat client={client} theme="str-chat__theme-dark">
      <Channel channel={channel}>
        <div className="flex h-full w-full">

          {/* Main Chat Window */}
          <div className="flex flex-1 flex-col border-r">
            <Window>
              <MessageList />
              <MessageInput />
            </Window>
          </div>

          {/* Thread (hidden on small screens) */}
          <div className="hidden lg:block w-80 border-l">
            <Thread />
          </div>

        </div>
      </Channel>
    </Chat>
  </div>
);
}
