import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Briefcase,
  Search,
  Clock,
  DollarSign,
} from "lucide-react";
import { searchService, SearchResult } from "@/services/search.service";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchService.search(query, 5);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((callback: () => void) => {
    setOpen(false);
    setQuery("");
    setResults(null);
    callback();
  }, []);

  const getBookingStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return variants[status] || "bg-gray-100 text-gray-800";
  };

  const totalResults = results
    ? results.clients.length + results.services.length + results.bookings.length
    : 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search clients, services, bookings..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="h-6 w-6 mx-auto mb-2 animate-pulse" />
            Searching...
          </div>
        ) : query.length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p>Type at least 2 characters to search</p>
            <p className="text-xs mt-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>{" "}
              to open
            </p>
          </div>
        ) : totalResults === 0 ? (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        ) : (
          <>
            {/* Clients */}
            {results && results.clients.length > 0 && (
              <>
                <CommandGroup heading="Clients">
                  {results.clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={`client-${client.id}`}
                      onSelect={() =>
                        handleSelect(() =>
                          navigate(`/entity/client-profile?id=${client.id}`)
                        )
                      }
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {client.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {client.email}
                            {client.phone && ` • ${client.phone}`}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Services */}
            {results && results.services.length > 0 && (
              <>
                <CommandGroup heading="Services">
                  {results.services.map((service) => (
                    <CommandItem
                      key={service.id}
                      value={`service-${service.id}`}
                      onSelect={() =>
                        handleSelect(() => navigate("/entity/services"))
                      }
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {service.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {service.price}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.duration}min
                            </span>
                            {service.category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4"
                              >
                                {service.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Bookings */}
            {results && results.bookings.length > 0 && (
              <CommandGroup heading="Bookings">
                {results.bookings.map((booking) => (
                  <CommandItem
                    key={booking.id}
                    value={`booking-${booking.id}`}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(`/entity/bookings?id=${booking.id}`)
                      )
                    }
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {booking.client?.name || "Unknown"}
                          </span>
                          <Badge
                            className={cn(
                              "text-[10px] h-4",
                              getBookingStatusBadge(booking.status)
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.service?.name || "No service"} •{" "}
                          {format(new Date(booking.date), "MMM dd, yyyy")} at{" "}
                          {booking.startTime}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
