"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import LogoutButton from "./logout-button";
import { useCurrentUser } from "../hooks/use-current-user";

const UserButton = () => {
  const user = useCurrentUser();

  // If user is not logged in, show the Sign In button
  if (!user) {
    return (
      <Button size="sm" variant="default" asChild>
        <Link href="/auth/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className={cn("relative rounded-full cursor-pointer")}>
          <Avatar>
            <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
            <AvatarFallback className="bg-red-500">
              <User className="text-white" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-4 min-w-[160px]">
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          {user.name && <span className="font-semibold text-sm">{user.name}</span>}
          {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutButton>
          <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
            <LogOut className="h-4 w-4 mr-2" />
            LogOut
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
