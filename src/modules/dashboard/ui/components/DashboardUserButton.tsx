"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerDescription,
    DrawerFooter
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import {  CreditCardIcon, LogOutIcon } from "lucide-react";
import { user } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useIsMobile } from "@/hooks/use-mobile";

export const DashboardUserButton = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const isMobile = useIsMobile();

  const onLogout = () => {
    authClient.signOut({
        fetchOptions: { 
            onSuccess: () => {
            router.push("/sign-in");
        }
    }
    });
  }

  if (isPending || !data?.user) {
    return null;
  }

  if(isMobile) {
    return (
        <Drawer>
            <DrawerTrigger className="flex items-center gap-2 rounded-2xl border border-white/10 p-2.5 w-full bg-white/5 text-sm text-white hover:bg-white/10 font-medium overflow-hidden">
            {data.user.image ? (
                <Avatar>
                    <AvatarImage src={data.user.image} />
                </Avatar>
            ) : ( <GeneratedAvatar seed={data.user.name ?? data.user.email}
                variant="initials"
                className="size-9 mr-3" />)}
            <span className="max-w-[120px] truncate">
                {data.user.name ?? data.user.email}
            </span>
                </DrawerTrigger>
                <DrawerContent>
            <DrawerHeader>
                <DrawerTitle>{data.user.name}</DrawerTitle>
                <DrawerDescription>{data.user.email}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
                <Button
                variant="outline"
                onClick={() => authClient.customer.portal()}
                >
                <CreditCardIcon className="size-4 mr-2" />
                Billing
                </Button>
                <Button
                variant="destructive"
                onClick={onLogout}
                >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
                </Button>
            </DrawerFooter>
                </DrawerContent>
        </Drawer>
        )
    }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-2xl border border-white/10 p-2.5 w-full bg-white/5 text-sm text-white hover:bg-white/10 font-medium overflow-hidden">
          {data.user.image ? (
            <Avatar>
                <AvatarImage src={data.user.image} />
            </Avatar>
          ) : ( <GeneratedAvatar seed={data.user.name ?? data.user.email}
            variant="initials"
            className="size-9 mr-3" />)}
          <span className="max-w-[120px] truncate">
            {data.user.name ?? data.user.email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-72">
        <DropdownMenuLabel>
            <span className="font-medium truncate ">{data.user.name}</span>
            <span className="text-sm font-normal text-muted-foreground truncate">{data.user.email}</span>
          
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer flex items-center justify-between"
        onClick={() => authClient.customer.portal()}>
            Billing
            <CreditCardIcon className="size-4" />
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardUserButton;