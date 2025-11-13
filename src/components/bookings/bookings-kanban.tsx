import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Repeat,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface BookingCard {
  _id: string;
  clientId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  serviceId?: {
    _id: string;
    name: string;
  };
  professionalId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  time: string;
  status: BookingStatus;
  totalPrice: number;
  isRecurring?: boolean;
  recurrenceParentId?: string;
}

interface BookingsKanbanProps {
  bookings: BookingCard[];
  onBookingUpdate?: (bookingId: string, newStatus: BookingStatus) => void;
  onRefresh?: () => void;
}

const statusColumns: {
  id: BookingStatus;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  {
    id: "pending",
    label: "Pending",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  {
    id: "completed",
    label: "Completed",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
  },
  {
    id: "cancelled",
    label: "Cancelled / No-Show",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
  },
];

export function BookingsKanban({
  bookings,
  onBookingUpdate,
  onRefresh,
}: BookingsKanbanProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Group bookings by status
  const groupedBookings = statusColumns.reduce((acc, column) => {
    acc[column.id] = bookings.filter((booking) => {
      if (column.id === "cancelled") {
        return booking.status === "cancelled" || booking.status === "no_show";
      }
      return booking.status === column.id;
    });
    return acc;
  }, {} as Record<BookingStatus, BookingCard[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // No movement
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as BookingStatus;
    const bookingId = draggableId;

    // Prevent moving to "no_show" - only to "cancelled"
    if (newStatus === "no_show") {
      toast.error("Cannot move to No-Show. Please use Cancel instead.");
      return;
    }

    // Optimistic update
    if (onBookingUpdate) {
      onBookingUpdate(bookingId, newStatus);
    }

    setIsUpdating(true);

    try {
      await apiClient.patch(`/api/bookings/${bookingId}`, {
        status: newStatus,
      });

      toast.success("Booking status updated successfully");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update booking");
      // Revert optimistic update
      if (onRefresh) {
        onRefresh();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className={`p-3 rounded-t-lg border ${column.bgColor}`}>
              <h3 className={`font-semibold ${column.color} text-center`}>
                {column.label}
              </h3>
              <p className="text-xs text-center text-muted-foreground mt-1">
                {groupedBookings[column.id]?.length || 0} bookings
              </p>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-2 space-y-2 min-h-[400px] border-x border-b rounded-b-lg transition-colors ${
                    snapshot.isDraggingOver ? "bg-muted/50" : "bg-background"
                  } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {groupedBookings[column.id]?.map((booking, index) => (
                    <Draggable
                      key={booking._id}
                      draggableId={booking._id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`cursor-move hover:shadow-md transition-shadow ${
                            snapshot.isDragging ? "shadow-lg rotate-2" : ""
                          }`}
                        >
                          <CardContent className="p-2 space-y-1">
                            {/* Client Info with Status */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={booking.clientId.avatar}
                                    alt={`${booking.clientId.firstName} ${booking.clientId.lastName}`}
                                  />
                                  <AvatarFallback className="text-[10px]">
                                    {booking.clientId.firstName[0]}
                                    {booking.clientId.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-xs font-semibold truncate">
                                  {booking.clientId.firstName}{" "}
                                  {booking.clientId.lastName}
                                </p>
                              </div>
                              {booking.isRecurring && (
                                <Repeat className="h-3 w-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>

                            {/* Service */}
                            {booking.serviceId && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Briefcase className="h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate font-medium">
                                  {booking.serviceId.name}
                                </span>
                              </div>
                            )}

                            {/* Date, Time & Price in one line */}
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <Calendar className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">
                                  {booking.date &&
                                  !isNaN(new Date(booking.date).getTime())
                                    ? format(new Date(booking.date), "MMM dd")
                                    : "No date"}
                                </span>
                                <Clock className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0 ml-1" />
                                <span>{booking.time || "No time"}</span>
                              </div>
                              <div className="flex items-center gap-0.5 font-semibold text-green-600 flex-shrink-0">
                                <DollarSign className="h-2.5 w-2.5" />
                                <span>{booking.totalPrice.toFixed(0)}</span>
                              </div>
                            </div>

                            {/* Professional */}
                            {booking.professionalId && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <User className="h-2.5 w-2.5 flex-shrink-0" />
                                <span className="truncate">
                                  {booking.professionalId.firstName}{" "}
                                  {booking.professionalId.lastName}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
