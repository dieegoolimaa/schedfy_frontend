import { useTranslation } from "react-i18next";
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
  startDate: Date;
  endDate: Date;
  reason: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
}

const DAYS_OF_WEEK = [
  { key: "monday" },
  { key: "tuesday" },
  { key: "wednesday" },
  { key: "thursday" },
  { key: "friday" },
  { key: "saturday" },
  { key: "sunday" },
];

const DEFAULT_TIME_SLOTS: TimeSlot[] = [{ start: "09:00", end: "17:00" }];

const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  enabled: false,
  slots: [...DEFAULT_TIME_SLOTS],
};

export default function ProfessionalSchedulePage() {
  const { t } = useTranslation(["professional", "common"]);
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

  // Permission check
  const canEdit = useState(() => {
    if (!user) return false;
    // Owner and Admin always have access
    if (user.role === 'owner' || user.role === 'admin') return true;

    // Simple plan professionals cannot edit their schedule
    if (user.plan === 'simple') return false;

    return true;
  })[0];

  // Block date dialog state
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
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

      // Convert workingHours from backend format to weeklySchedule
      if (data.workingHours && Array.isArray(data.workingHours)) {
        const newSchedule: WeeklySchedule = {
          sunday: { ...DEFAULT_DAY_SCHEDULE },
          monday: { ...DEFAULT_DAY_SCHEDULE },
          tuesday: { ...DEFAULT_DAY_SCHEDULE },
          wednesday: { ...DEFAULT_DAY_SCHEDULE },
          thursday: { ...DEFAULT_DAY_SCHEDULE },
          friday: { ...DEFAULT_DAY_SCHEDULE },
          saturday: { ...DEFAULT_DAY_SCHEDULE },
        };

        data.workingHours.forEach((wh: any) => {
          const dayKey = DAYS_OF_WEEK[wh.day]?.key;
          if (dayKey) {
            const slots: TimeSlot[] = [
              { start: wh.startTime || "09:00", end: wh.endTime || "17:00" },
            ];

            // Add breaks as additional slots
            if (wh.breaks && Array.isArray(wh.breaks)) {
              wh.breaks.forEach((breakSlot: any) => {
                slots.push({
                  start: breakSlot.startTime,
                  end: breakSlot.endTime,
                });
              });
            }

            newSchedule[dayKey as keyof WeeklySchedule] = {
              enabled: wh.isAvailable !== false,
              slots,
            };
          }
        });

        setWeeklySchedule(newSchedule);
      }

      if (data.blockedDates) {
        setBlockedDates(
          data.blockedDates.map((d: any) => ({
            ...d,
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate),
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

      // Convert weeklySchedule to workingHours format expected by backend
      const workingHours = Object.entries(weeklySchedule).map(
        ([dayKey, schedule]) => {
          const dayIndex = DAYS_OF_WEEK.findIndex((d) => d.key === dayKey);
          return {
            day: dayIndex,
            isAvailable: schedule.enabled,
            startTime: schedule.slots[0]?.start || "09:00",
            endTime: schedule.slots[0]?.end || "17:00",
            breaks: schedule.slots.slice(1).map((slot: TimeSlot) => ({
              startTime: slot.start,
              endTime: slot.end,
            })),
          };
        }
      );

      await apiClient.patch(`/api/users/${professionalId}/schedule`, {
        workingHours,
        blockedDates: blockedDates.map((d) => ({
          ...d,
          startDate: d.startDate.toISOString(),
          endDate: d.endDate.toISOString(),
        })),
        bufferTime,
        breakTime,
      });
      toast.success(t("schedule.messages.saveSuccess"));
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(t("schedule.messages.saveError"));
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
    if (!dateRange.from) {
      toast.error(t("schedule.messages.selectDate"));
      return;
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;

    const newBlock: BlockedDate = {
      startDate,
      endDate,
      reason: blockReason || "Unavailable",
      allDay: blockAllDay,
      ...(!blockAllDay && { startTime: blockStartTime, endTime: blockEndTime }),
    };

    setBlockedDates((prev) => [...prev, newBlock]);
    setBlockDialogOpen(false);
    setDateRange({ from: undefined, to: undefined });
    setBlockReason("");
    setBlockAllDay(true);
    setBlockReason("");
    setBlockAllDay(true);
    toast.success(t("schedule.messages.blockedSuccess"));
  };

  const removeBlockedDate = (index: number) => {
    setBlockedDates((prev) => prev.filter((_, i) => i !== index));
    toast.success(t("schedule.messages.unblockedSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("schedule.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("schedule.description")}
          </p>
        </div>
        <Button onClick={handleSaveSchedule} disabled={loading || !canEdit} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {t("schedule.save")}
        </Button>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your schedule is managed by the account owner. You cannot make changes directly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("schedule.bufferTime")}</CardTitle>
            <CardDescription>
              {t("schedule.bufferDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={bufferTime.toString()}
              onValueChange={(v) => setBufferTime(Number(v))}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("schedule.noBuffer")}</SelectItem>
                <SelectItem value="5">5 {t("schedule.minutes")}</SelectItem>
                <SelectItem value="10">10 {t("schedule.minutes")}</SelectItem>
                <SelectItem value="15">15 {t("schedule.minutes")}</SelectItem>
                <SelectItem value="30">30 {t("schedule.minutes")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("schedule.breakTime")}</CardTitle>
            <CardDescription>
              {t("schedule.breakDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={breakTime.toString()}
              onValueChange={(v) => setBreakTime(Number(v))}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("schedule.noBreak")}</SelectItem>
                <SelectItem value="30">30 {t("schedule.minutes")}</SelectItem>
                <SelectItem value="60">1 {t("schedule.hour")}</SelectItem>
                <SelectItem value="90">1.5 {t("schedule.hours")}</SelectItem>
                <SelectItem value="120">2 {t("schedule.hours")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">{t("schedule.weekly")}</TabsTrigger>
          <TabsTrigger value="blocked">{t("schedule.blocked")}</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4">
            {DAYS_OF_WEEK.map(({ key }) => {
              const dayKey = key as keyof WeeklySchedule;
              const daySchedule = weeklySchedule[dayKey];
              const label = t(`common:days.${key}`);

              return (
                <Card
                  key={key}
                  className={!daySchedule.enabled ? "opacity-60" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <Switch
                          checked={daySchedule.enabled}
                          onCheckedChange={() => toggleDay(dayKey)}
                          disabled={!canEdit}
                        />
                        <div>
                          <h3 className="font-semibold">{label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {daySchedule.enabled
                              ? `${daySchedule.slots.length} ${t("schedule.slots")}`
                              : t("schedule.unavailable")}
                          </p>
                        </div>
                      </div>

                      {daySchedule.enabled && (
                        <div className="flex-1 space-y-3">
                          {daySchedule.slots.map((slot, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
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
                                  className="px-3 py-1.5 border rounded-md text-sm"
                                  disabled={!canEdit}
                                />
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
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
                                  className="px-3 py-1.5 border rounded-md text-sm"
                                  disabled={!canEdit}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                {daySchedule.slots.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeTimeSlot(dayKey, index)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {index === daySchedule.slots.length - 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addTimeSlot(dayKey)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Blocked Dates */}
        <TabsContent value="blocked" className="space-y-4">
          {" "}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("schedule.blocked")}</CardTitle>
                  <CardDescription>
                    {t("schedule.blockDescription")}
                  </CardDescription>
                </div>
                <Dialog
                  open={blockDialogOpen}
                  onOpenChange={setBlockDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("schedule.blockDate")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t("schedule.blockDialogTitle")}</DialogTitle>
                      <DialogDescription>
                        {t("schedule.blockDialogDescription")}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div>
                        <Label className="block mb-2">
                          {!dateRange.from
                            ? t("schedule.selectDateLabel")
                            : dateRange.to
                              ? `${format(
                                dateRange.from,
                                "MMM d, yyyy"
                              )} - ${format(dateRange.to, "MMM d, yyyy")}`
                              : `${format(
                                dateRange.from,
                                "MMM d, yyyy"
                              )} ${t("schedule.clickToRange")}`}
                        </Label>
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            if (
                              range &&
                              typeof range === "object" &&
                              "from" in range
                            ) {
                              setDateRange(range);
                            }
                          }}
                          className="rounded-md border mx-auto"
                        />
                        {(dateRange.from || dateRange.to) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDateRange({ from: undefined, to: undefined })
                            }
                            className="mt-2 w-full"
                          >
                            {t("schedule.clearSelection")}
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label>{t("schedule.reason")}</Label>
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder={t("schedule.reasonPlaceholder")}
                          className="w-full px-3 py-2 border rounded-md mt-1"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={blockAllDay}
                          onCheckedChange={setBlockAllDay}
                        />
                        <Label>{t("schedule.allDay")}</Label>
                      </div>

                      {!blockAllDay && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label>{t("schedule.startTime")}</Label>
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
                            <Label>{t("schedule.endTime")}</Label>
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
                        {t("schedule.cancel")}
                      </Button>
                      <Button onClick={handleBlockDate}>{t("schedule.blockDate")}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              {blockedDates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>{t("schedule.noBlockedDates")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedDates
                    .sort(
                      (a, b) => a.startDate.getTime() - b.startDate.getTime()
                    )
                    .map((block, index) => {
                      const isSingleDay =
                        format(block.startDate, "yyyy-MM-dd") ===
                        format(block.endDate, "yyyy-MM-dd");

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {isSingleDay
                                  ? format(block.startDate, "MMMM dd, yyyy")
                                  : `${format(
                                    block.startDate,
                                    "MMM dd"
                                  )} - ${format(
                                    block.endDate,
                                    "MMM dd, yyyy"
                                  )}`}
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
                      );
                    })}
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
