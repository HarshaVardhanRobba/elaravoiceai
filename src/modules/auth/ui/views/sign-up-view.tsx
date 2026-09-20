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
import { Card, CardContent } from "@/components/ui/card";
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

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
    confirmpassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmpassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setError(null);

    authClient.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        callbackURL: "/meetings",
      },
      {
        onSuccess: () => {
          router.refresh();
          router.push("/sign-in");
        },
        onError: (err) => {
          setError(err.error.message);
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-5xl overflow-hidden rounded-xl">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
          {/* LEFT PANEL */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-8 md:p-10"
            >
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold">Create an account</h1>
                  <p className="text-sm text-muted-foreground">
                    Sign up to get started
                  </p>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                    <OctagonAlertIcon className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmpassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-black text-white hover:bg-black/90"
                  >
                    Sign up
                  </Button>
                </div>

                <div className="my-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  Or continue with
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="flex gap-3 flex-row">
                <Button 
                  onClick={() => {
                        authClient.signIn.social({
                            provider: "google"
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
                  Already have an account?{" "}
                  <Link href="/sign-in" className=" font-bold text-black">
                  Sign in
                </Link>
                </p>
              </div>
            </form>
          </Form>

          {/* RIGHT PANEL */}
          <div className="hidden md:flex items-center justify-center bg-linear-to-br from-green-700 to-green-900">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
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
    </div>
  );
};
