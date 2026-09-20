"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaGithub,  FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { OctagonAlertIcon } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
  <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
    <Card className="w-full max-w-5xl overflow-hidden rounded-xl">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-8 md:p-10"
          >
            {/* LEFT PANEL */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Login to your account
                </p>
              </div>

              {/* Error */}
              <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                <OctagonAlertIcon className="h-4 w-4" />
                {error ? <span>{error}</span> : <span> &nbsp; </span>}
              </div>

              <div className="space-y-4">
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
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-black/90"
                >
                  Sign in
                </Button>
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                Or continue with
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* OAuth buttons */}
              <div className="flex gap-3 flex-row">
                <Button 
                  onClick={() => {
                      authClient.signIn.social({
                          provider: "google",
                          callbackURL: "/meetings"
                      })
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  <FaGoogle />
                </Button>
              </div>

              <div className="flex gap-3 flex-col mt-3">
                <Button 
                  onClick={() => {
                      authClient.signIn.social({
                          provider: "github"
                      })
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  <FaGithub />
                </Button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className=" font-bold text-black">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </Form>

          {/* RIGHT PANEL */}
          <div className="relative hidden md:flex items-center justify-center bg-linear-to-br from-green-700 to-green-900">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white/10 flex items-center justify-center">
                {/* Replace with SVG logo */}
                <Image
                  src="/logo.svg"
                  alt="Elara logo"
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <p className="text-xl font-semibold">Elara</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="absolute bottom-4 text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <span className="underline">Terms of Service</span> and{" "}
        <span className="underline">Privacy Policy</span>
      </p>
    </div>
  );
};
