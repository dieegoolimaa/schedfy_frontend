import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Settings } from "lucide-react";

export function DevRoleSwitcher() {
  const { user, switchRole } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const roles = [
    { key: "platform_admin", label: "Platform Admin", plan: "Enterprise" },
    { key: "owner", label: "Business Owner", plan: "Business" },
    { key: "professional", label: "Professional", plan: "Individual" },
    { key: "client", label: "Simple User", plan: "Simple" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
        >
          <Settings className="h-4 w-4 mr-2" />
          DEV: {user?.name || "Switch Role"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Development Role Switcher</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.key}
            onClick={() => switchRole(role.key)}
            className={
              user?.role === role.key ||
              (role.key === "client" && user?.plan === "simple")
                ? "bg-blue-50 text-blue-700"
                : ""
            }
          >
            <div className="flex flex-col">
              <span className="font-medium">{role.label}</span>
              <span className="text-xs text-muted-foreground">
                {role.plan} Plan
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Current: {user?.plan} plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
