"use client";

import {
    Call,
    CallingState,
    StreamCall,
    StreamVideo,
    StreamVideoClient
} from "@stream-io/video-react-sdk";

import { useEffect, useState } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { CallUI } from "./call-ui";

interface CallConnectProps {
    meetingId: string
    meetingname: string
    userId: string
    userName: string
    userImage: string
};

export const CallConnect = ({
    meetingId,
    meetingname,
    userId,
    userName,
    userImage }: CallConnectProps) => {

        const trpc = useTRPC();

        const { mutateAsync: generateToken } = useMutation(trpc.meetings.generateToken.mutationOptions(),
    );

    const [Client, setClient] = useState<StreamVideoClient>();
    const [connectError, setConnectError] = useState(false);

    useEffect(() => {
        const _client = new StreamVideoClient({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user: {
                id: userId,
                name: userName,
                image: userImage,
            },
            tokenProvider: async () => {
                // wrap mutateAsync so any args passed by the SDK are ignored
                // and we always call the protected TRPC mutation without input
                try {
                    return await generateToken();
                } catch (err) {
                    // The SDK swallows connect failures, so without this an
                    // expired session would show a lobby that can never join.
                    console.error("Failed to get call token", err);
                    setConnectError(true);
                    throw err;
                }
            },
        });

        setClient(_client);

        return () => {
            _client.disconnectUser();
            setClient(undefined);
        };
    }, [userId, userName, userImage, generateToken]);

    const [call, setCall] = useState<Call>();
    useEffect(() => {
        if (!Client) return;

        const _call = Client.call("default", meetingId);
        _call.camera.disable();
        _call.microphone.disable();
        setCall(_call);

        return () => {
            // Only hang up a call that was actually joined. This must never
            // end the call: endCall() marks it ended for everyone (the AI
            // agent included) and it cannot be re-joined, and this cleanup
            // also runs on React StrictMode's mount/unmount/mount before the
            // user has clicked Join. Ending is done server-side once the last
            // human leaves.
            const callingState = _call.state.callingState;
            if (
                callingState === CallingState.JOINED ||
                callingState === CallingState.JOINING
            ) {
                _call.leave().catch((err) => {
                    console.error("Failed to leave call", err);
                });
            }
            setCall(undefined);
        };
    }, [Client, meetingId]);

    if (connectError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-md">
                    <ErrorState
                        title="Couldn't connect to the call"
                        description="Your session may have expired. Refresh the page or sign in again."
                    />
                </div>
            </div>
        );
    }

    if(!Client || !call) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-linear-to-br from-emerald-900 via-green-900 to-teal-900">
                    <Loader2Icon className="h-6 w-6 animate-spin text-white/80" />
            </div>
        )
    }

    return (
        <StreamVideo client={Client} >
            <StreamCall call={call}>
                <CallUI meetingId={meetingId} meetingName={meetingname}/>
            </StreamCall>
        </StreamVideo>
    );
}
