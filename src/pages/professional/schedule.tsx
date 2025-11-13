import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar } from "../../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Clock,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  AlertCircle,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { apiClient } from "../../lib/api-client";

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface BlockedDate {
  _id?: string;
  date: Date;
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const DEFAULT_TIME_SLOTS: TimeSlot[] = [{ start: "09:00", end: "17:00" }];

const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  enabled: false,
  slots: [...DEFAULT_TIME_SLOTS],
};

export default function ProfessionalSchedulePage() {
  const { user } = useAuth();
  const professionalId = user?.id || "";

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { ...DEFAULT_DAY_SCHEDULE, enabled: true },
    tuesday: { ...DEFAULT_DAY_SCHEDULE, enabled: true },
    wednesday: { ...DEFAULT_DAY_SCHEDULE, enabled: true },
    thursday: { ...DEFAULT_DAY_SCHEDULE, enabled: true },
    friday: { ...DEFAULT_DAY_SCHEDULE, enabled: true },
    saturday: DEFAULT_DAY_SCHEDULE,
    sunday: DEFAULT_DAY_SCHEDULE,
  });

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bufferTime, setBufferTime] = useState(15);
  const [breakTime, setBreakTime] = useState(60);
  const [loading, setLoading] = useState(false);

  // Block date dialog state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [blockReason, setBlockReason] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStartTime, setBlockStartTime] = useState("09:00");
  const [blockEndTime, setBlockEndTime] = useState("17:00");

  useEffect(() => {
    fetchSchedule();
  }, [professionalId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/api/users/${professionalId}/schedule`
      );
      const data = response.data as any;

      if (data.weeklySchedule) {
        setWeeklySchedule(data.weeklySchedule);
      }
      if (data.blockedDates) {
        setBlockedDates(
          data.blockedDates.map((d: any) => ({
            ...d,
            date: new Date(d.date),
          }))
        );
      }
      if (data.bufferTime !== undefined) {
        setBufferTime(data.bufferTime);
      }
      if (data.breakTime !== undefined) {
        setBreakTime(data.breakTime);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/users/${professionalId}/schedule`, {
        weeklySchedule,
        blockedDates: blockedDates.map((d) => ({
          ...d,
          date: d.date.toISOString(),
        })),
        bufferTime,
        breakTime,
      });
      toast.success("Schedule saved successfully");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (
    day: keyof WeeklySchedule,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleBlockDate = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const newBlock: BlockedDate = {
      date: selectedDate,
      reason: blockReason || "Unavailable",
      allDay: blockAllDay,
      ...(!blockAllDay && { startTime: blockStartTime, endTime: blockEndTime }),
    };

    setBlockedDates((prev) => [...prev, newBlock]);
    setBlockDialogOpen(false);
    setSelectedDate(undefined);
    setBlockReason("");
    setBlockAllDay(true);
    toast.success("Date blocked successfully");
  };

  const removeBlockedDate = (index: number) => {
    setBlockedDates((prev) => prev.filter((_, i) => i !== index));
    toast.success("Blocked date removed");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Manage your availability and working hours
          </p>
        </div>
        <Button onClick={handleSaveSchedule} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Dates</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule */}
        <TabsContent value="weekly" className="space-y-4">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const dayKey = key as keyof WeeklySchedule;
            const daySchedule = weeklySchedule[dayKey];

            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={daySchedule.enabled}
                        onCheckedChange={() => toggleDay(dayKey)}
                      />
                      <div>
                        <CardTitle className="text-lg">{label}</CardTitle>
                        <CardDescription>
                          {daySchedule.enabled
                            ? `${daySchedule.slots.length} time slot(s)`
                            : "Day off"}
                        </CardDescription>
                      </div>
                    </div>
                    {daySchedule.enabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(dayKey)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {daySchedule.enabled && (
                  <CardContent className="space-y-3">
                    {daySchedule.slots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateTimeSlot(
                                dayKey,
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border rounded-md"
                          />
                          <span className="text-muted-foreground">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateTimeSlot(
                                dayKey,
                                index,
                                "end",
                                e.target.value
                              )
                            }
                            className="px-3 py-2 border rounded-md"
                          />
                        </div>
                        {daySchedule.slots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(dayKey, index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        {/* Blocked Dates */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Blocked Dates</CardTitle>
                  <CardDescription>
                    Block specific dates when you're not available
                  </CardDescription>
                </div>
                <Dialog
                  open={blockDialogOpen}
                  onOpenChange={setBlockDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Block Date
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Block a Date</DialogTitle>
                      <DialogDescription>
                        Select a date and provide a reason
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Select Date</Label>
                        <Calendar
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </div>

                      <div>
                        <Label>Reason</Label>
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="e.g., Vacation, Personal"
                          className="w-full px-3 py-2 border rounded-md mt-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={blockAllDay}
                          onCheckedChange={setBlockAllDay}
                        />
                        <Label>All day</Label>
                      </div>

                      {!blockAllDay && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label>Start Time</Label>
                            <input
                              type="time"
                              value={blockStartTime}
                              onChange={(e) =>
                                setBlockStartTime(e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-md mt-1"
                            />
                          </div>
                          <div className="flex-1">
                            <Label>End Time</Label>
                            <input
                              type="time"
                              value={blockEndTime}
                              onChange={(e) => setBlockEndTime(e.target.value)}
                              className="w-full px-3 py-2 border rounded-md mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBlockDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleBlockDate}>Block Date</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {blockedDates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>No blocked dates yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedDates
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((block, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {format(block.date, "MMMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {block.reason}
                              {!block.allDay &&
                                ` • ${block.startTime} - ${block.endTime}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlockedDate(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduling Preferences</CardTitle>
              <CardDescription>
                Configure buffer times and breaks between appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Buffer Time Between Appointments</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Time added before and after each appointment
                </p>
                <Select
                  value={bufferTime.toString()}
                  onValueChange={(v) => setBufferTime(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lunch Break Duration</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Automatic break time during the day
                </p>
                <Select
                  value={breakTime.toString()}
                  onValueChange={(v) => setBreakTime(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No break</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
