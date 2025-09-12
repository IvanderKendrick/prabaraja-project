import React from "react";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCurrentUserProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();

  return (
    <div className="flex items-center justify-between p-8 pb-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 hover:shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute p-0 -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-white text-xs font-medium border-2 border-white dark:border-zinc-900"
          >
          </Badge>
        </Button>
        
        {/* User Profile Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white/20 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
            <AvatarImage src={profile?.company_logo || "/avatars/user.jpg"} alt="User" />
            <AvatarFallback>
              {profileLoading ? (
                <User className="h-5 w-5" />
              ) : (
                profile?.name?.charAt(0)?.toUpperCase() || 
                user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 
                user?.email?.charAt(0)?.toUpperCase() || 
                "U"
              )}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium">
              {profileLoading ? "Loading..." : 
               profile?.name || 
               user?.user_metadata?.name || 
               user?.email || 
               "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.role || "Administrator"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
