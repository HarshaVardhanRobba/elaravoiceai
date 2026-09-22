"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaGithub,  FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { WaveRibbon } from "@/components/wave-ribbon";

const formSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);

    authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/meetings",
    },
    {
      onSuccess: () => {
        router.refresh();
      },
      onError: (err) => {
        setError(err.error.message);
      }
  });
  };

  return (
    <div className="app-glow relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <WaveRibbon className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full opacity-70" />

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Elara logo" width={28} height={28} priority />
            <span className="font-display text-xl font-semibold tracking-tight">Elara</span>
          </Link>
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-5xl">
            Welcome back
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Log in to pick up where your agents left off.
          </p>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* OAuth buttons */}
              <Button
                type="button"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/meetings"
                  })
                }}
                variant="outline"
                size="lg"
                className="h-11 w-full"
              >
                <FaGoogle />
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={() => {
                  authClient.signIn.social({
                    provider: "github"
                  })
                }}
                variant="outline"
                size="lg"
                className="h-11 w-full"
              >
                <FaGithub />
                Continue with GitHub
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  <OctagonAlertIcon className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="h-11 w-full">
                Sign in
              </Button>
            </form>
          </Form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
