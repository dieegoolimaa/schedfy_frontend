import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, transformBackendUser } from "../../contexts/auth-context";
import { useBookings } from "../../hooks/useBookings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import {
  User,
  MapPin,
  Briefcase,
  Star,
  Clock,
  Save,
  Camera,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../lib/api-client";

export default function ProfessionalProfilePage() {
  const { t } = useTranslation("professional");
  const { user, updateUser } = useAuth();
  const { userId } = useParams(); // Get user ID from URL if available

  // Determine if we are viewing another user or ourselves
  const targetId = userId || user?.id;
  const isSelf = !userId || userId === user?.id;

  const entityId = user?.entityId || "";

  const { bookings } = useBookings({
    entityId,
    autoFetch: true,
  });

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [jobFunction, setJobFunction] = useState("");
  const [experience, setExperience] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");

  // Working Hours State
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [entityWorkingHours, setEntityWorkingHours] = useState<any>(null);
  const [entityPlan, setEntityPlan] = useState<string>("");
  const [entityOwnerId, setEntityOwnerId] = useState<string>("");

  // Calculate stats from bookings
  const myBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      const profId =
        typeof b.professional === "string"
          ? b.professional
          : (b.professional as any)?._id || (b.professional as any)?.id;
      return profId === targetId || b.professionalId === targetId;
    });
  }, [bookings, targetId]);

  const stats = useMemo(() => {
    const total = myBookings.length;
    const completed = myBookings.filter(
      (b: any) => b.status === "completed"
    ).length;
    const cancelled = myBookings.filter(
      (b: any) => b.status === "cancelled"
    ).length;
    const completionRate =
      total > 0 ? Math.round(((total - cancelled) / total) * 100) : 0;

    return {
      totalBookings: total,
      completedBookings: completed,
      cancelledBookings: cancelled,
      completionRate,
    };
  }, [myBookings]);

  // Calculate if the user can edit the profile
  const canEdit = useMemo(() => {
    if (!user || !entityOwnerId) return true; // Default to true while loading or if data missing

    const isOwner = user.id === entityOwnerId;
    const isAdmin = user.role === 'admin';
    const isSimplePlan = entityPlan === 'simple';

    // Owner can always edit anyone
    if (isOwner) return true;

    // Admin can edit anyone (including themselves)
    if (isAdmin) return true;

    // If viewing another user and not owner/admin (covered above), assume no edit
    if (!isSelf) return false;

    // --- Logic for SELF editing below ---

    // Simple plan professional cannot edit themselves
    if (isSimplePlan && !isOwner && !isAdmin) return false;

    // Default (e.g. Business plan professional) can edit themselves
    return true;
  }, [user, entityOwnerId, entityPlan, isSelf]);

  useEffect(() => {
    if (targetId) {
      fetchProfileData();
    }
  }, [targetId]);

  const DAYS = [
    t("days.sunday", "Sunday"),
    t("days.monday", "Monday"),
    t("days.tuesday", "Tuesday"),
    t("days.wednesday", "Wednesday"),
    t("days.thursday", "Thursday"),
    t("days.friday", "Friday"),
    t("days.saturday", "Saturday"),
  ];

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const response = await apiClient.get(`/api/users/${targetId}`);
      const data = (response.data as any).data || response.data;
      setProfileData(data);

      // Fetch entity details for working hours validation and plan check
      if (entityId) {
        try {
          const entityResponse = await apiClient.get(`/api/entities/${entityId}`);
          const entityData = (entityResponse.data as any).data || entityResponse.data;
          setEntityWorkingHours(entityData.workingHours);
          setEntityPlan(entityData.plan);
          setEntityOwnerId(entityData.ownerId);
        } catch (err) {
          console.error("Failed to fetch entity details:", err);
        }
      }

      // Populate form
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");

      // Professional Info
      setBio(data.professionalInfo?.bio || "");
      setJobFunction(data.professionalInfo?.jobFunction || "");
      setExperience(data.professionalInfo?.experience?.toString() || "");
      setSpecialties(data.professionalInfo?.specialties || []);
      setCertifications(data.professionalInfo?.certifications || []);
      setInstagram(data.professionalInfo?.socialMedia?.instagram || "");
      setLinkedin(data.professionalInfo?.socialMedia?.linkedin || "");
      setWebsite(data.professionalInfo?.socialMedia?.website || "");

      // Initialize working hours if not present
      if (data.workingHours && data.workingHours.length > 0) {
        setWorkingHours(data.workingHours);
      } else {
        // Default to Mon-Fri 9-5
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
          day: i,
          isAvailable: i >= 1 && i <= 5,
          startTime: "09:00",
          endTime: "17:00",
          breaks: [],
        }));
        setWorkingHours(defaultHours);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Validate working hours against entity hours when entity data loads
  useEffect(() => {
    if (entityWorkingHours && workingHours.length > 0) {
      const validatedHours = workingHours.map((daySchedule) => {
        const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const entitySchedule = entityWorkingHours[daysMap[daySchedule.day]];

        // Force isAvailable=false if entity is closed that day
        if (!entitySchedule || !entitySchedule.enabled) {
          return {
            ...daySchedule,
            isAvailable: false, // Force toggle off when company closed
          };
        }

        return daySchedule;
      });

      // Only update if there are actual changes
      const hasChanges = validatedHours.some((validated, index) =>
        validated.isAvailable !== workingHours[index].isAvailable
      );

      if (hasChanges) {
        setWorkingHours(validatedHours);
      }
    }
  }, [entityWorkingHours, workingHours]); // Run when entity working hours load or professional working hours change

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Sanitize working hours to remove _id and other backend-only fields
      const sanitizedWorkingHours = workingHours.map(({ day, startTime, endTime, isAvailable, breaks }) => ({
        day,
        startTime,
        endTime,
        isAvailable,
        breaks: breaks ? breaks.map((b: any) => ({
          startTime: b.startTime,
          endTime: b.endTime
        })) : []
      }));

      const updatePayload: any = {
        firstName,
        lastName,
        phone,
        professionalInfo: {
          bio,
          jobFunction,
          experience: experience ? parseInt(experience) : undefined,
          specialties,
          certifications,
          socialMedia: {
            instagram: instagram || undefined,
            linkedin: linkedin || undefined,
            website: website || undefined,
          },
        },
        workingHours: sanitizedWorkingHours,
      };

      const response = await apiClient.patch(`/api/users/${targetId}`, updatePayload);
      const updatedData = (response as any).data?.data || (response as any).data;

      // Update local user context ONLY if we are editing ourselves
      if (isSelf) {
        await updateUser(transformBackendUser(updatedData));
      }

      // Refresh profile data to ensure UI is in sync
      await fetchProfileData();

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("[Profile] Error updating profile:", error);
      console.error("[Profile] Error response:", error.response?.data);

      const errorMessage = error.response?.data?.message
        || error.message
        || "Failed to update profile";

      toast.error(`Update failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getEntityDaySchedule = (dayIndex: number) => {
    if (!entityWorkingHours) return null;
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = daysMap[dayIndex];
    return entityWorkingHours[dayName];
  };

  const handleWorkingHourChange = (
    index: number,
    field: string,
    value: any
  ) => {
    if (!canEdit) return; // Prevent changes if not allowed

    const newHours = [...workingHours];
    const currentDay = newHours[index];
    const entitySchedule = getEntityDaySchedule(currentDay.day);

    // Validation logic
    if (entitySchedule) {
      // Check if trying to enable a day when entity is closed
      if (field === "isAvailable" && value === true) {
        if (!entitySchedule.enabled) {
          return; // Prevent change
        }
      }

      // Check time limits
      if (field === "startTime" || field === "endTime") {
        const startTime = field === "startTime" ? value : currentDay.startTime;
        const endTime = field === "endTime" ? value : currentDay.endTime;

        if (startTime && entitySchedule.start && startTime < entitySchedule.start) {
          return;
        }

        if (endTime && entitySchedule.end && endTime > entitySchedule.end) {
          return;
        }
      }
    }

    newHours[index] = { ...newHours[index], [field]: value };
    newHours[index] = { ...newHours[index], [field]: value };
    setWorkingHours(newHours);
  };

  const handleAddBreak = (dayIndex: number) => {
    if (!canEdit) return;
    const newHours = [...workingHours];
    const currentBreaks = newHours[dayIndex].breaks || [];
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      breaks: [...currentBreaks, { startTime: "12:00", endTime: "13:00" }]
    };
    setWorkingHours(newHours);
  };

  const handleRemoveBreak = (dayIndex: number, breakIndex: number) => {
    if (!canEdit) return;
    const newHours = [...workingHours];
    if (newHours[dayIndex].breaks) {
      newHours[dayIndex].breaks = newHours[dayIndex].breaks.filter((_, i) => i !== breakIndex);
      setWorkingHours(newHours);
    }
  };

  const handleBreakChange = (dayIndex: number, breakIndex: number, field: 'startTime' | 'endTime', value: string) => {
    if (!canEdit) return;
    const newHours = [...workingHours];
    if (newHours[dayIndex].breaks) {
      const newBreaks = [...newHours[dayIndex].breaks];
      newBreaks[breakIndex] = { ...newBreaks[breakIndex], [field]: value };
      newHours[dayIndex].breaks = newBreaks;
      setWorkingHours(newHours);
    }
  };

  const handleAddSpecialty = () => {
    if (!canEdit) return;
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    if (!canEdit) return;
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const handleAddCertification = () => {
    if (!canEdit) return;
    if (
      newCertification.trim() &&
      !certifications.includes(newCertification.trim())
    ) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (certification: string) => {
    if (!canEdit) return;
    setCertifications(certifications.filter((c) => c !== certification));
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your professional profile and settings
        </p>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Warning Icon */}
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your profile is managed by the account owner. You cannot make changes directly.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          {(profileData?.isProfessional || (canEdit && entityPlan === 'simple')) && (
            <>
              <TabsTrigger value="professional">Professional Details</TabsTrigger>
              <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
            </>
          )}
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile photo</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData?.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {firstName?.[0]}
                  {lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" disabled={!canEdit}>
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t("profile.firstName", "First Name")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("profile.firstNamePlaceholder", "John")}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("profile.lastName", "Last Name")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("profile.lastNamePlaceholder", "Doe")}
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Contact admin for assistance.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Details Tab */}
        {(profileData?.isProfessional || (canEdit && entityPlan === 'simple')) && (
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>
                  Your professional role and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobFunction">Job Function</Label>
                    <Input
                      id="jobFunction"
                      value={jobFunction}
                      onChange={(e) => setJobFunction(e.target.value)}
                      placeholder="e.g., Hair Stylist, Massage Therapist"
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-muted-foreground">
                      Set by your employer:{" "}
                      {profileData?.professionalInfo?.jobFunction || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., 5"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
                <CardDescription>
                  Tell clients about your experience and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t(
                    "profile.bioPlaceholder",
                    "I am a professional with expertise in..."
                  )}
                  rows={6}
                  className="resize-none"
                  disabled={!canEdit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>Add your areas of expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="e.g., Haircut, Massage, Consulting"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddSpecialty()
                    }
                    disabled={!canEdit}
                  />
                  <Button onClick={handleAddSpecialty} variant="outline" disabled={!canEdit}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className={`cursor-pointer ${canEdit ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}`}
                      onClick={() => handleRemoveSpecialty(specialty)}
                    >
                      {specialty} {canEdit && '×'}
                    </Badge>
                  ))}
                  {specialties.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No specialties added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Add your professional certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., Licensed Cosmetologist, Certified Massage Therapist"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddCertification()
                    }
                    disabled={!canEdit}
                  />
                  <Button onClick={handleAddCertification} variant="outline" disabled={!canEdit}>
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert) => (
                    <Badge
                      key={cert}
                      variant="secondary"
                      className={`cursor-pointer ${canEdit ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}`}
                      onClick={() => handleRemoveCertification(cert)}
                    >
                      {cert} {canEdit && '×'}
                    </Badge>
                  ))}
                  {certifications.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No certifications added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Connect your professional profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@yourhandle"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/yourprofile"
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.yourwebsite.com"
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Schedule & Availability Tab */}
        {
          (profileData?.isProfessional || (canEdit && entityPlan === 'simple')) && (
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Working Hours</CardTitle>
                  <CardDescription>
                    Set your availability schedule. Note: You can only set hours within the company's operating hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workingHours.map((daySchedule, index) => {
                    const entitySchedule = getEntityDaySchedule(daySchedule.day);
                    // Treat as closed if no schedule found or explicitly disabled
                    const isEntityClosed = !entitySchedule || !entitySchedule.enabled;
                    const companyHoursText = entitySchedule && entitySchedule.enabled
                      ? `${entitySchedule.start} - ${entitySchedule.end}`
                      : "Closed";

                    return (
                      <div
                        key={daySchedule.day}
                        className={`flex flex-col gap-2 p-4 border rounded-lg ${isEntityClosed ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 w-32">
                              <Switch
                                id={`day-${index}`}
                                checked={daySchedule.isAvailable}
                                onCheckedChange={(checked: boolean) =>
                                  handleWorkingHourChange(index, "isAvailable", checked)
                                }
                                disabled={isEntityClosed || !canEdit}
                              />
                              <Label htmlFor={`day-${index}`} className="capitalize">
                                {DAYS[daySchedule.day]}
                              </Label>
                            </div>

                            {/* Company Hours Badge */}
                            <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
                              Company: {companyHoursText}
                            </Badge>
                          </div>
                        </div>

                        {daySchedule.isAvailable && (
                          <div className="flex gap-2 items-center mt-2 pl-32">
                            <div className="relative w-32">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <Input
                                type="time"
                                value={daySchedule.startTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className="pl-10"
                                disabled={!canEdit}
                              />
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="relative w-32">
                              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              <Input
                                type="time"
                                value={daySchedule.endTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className="pl-10"
                                disabled={!canEdit}
                              />
                            </div>
                          </div>
                        )}

                        {/* Breaks Section */}
                        {daySchedule.isAvailable && (daySchedule.breaks?.length > 0 || canEdit) && (
                          <div className="pl-32 mt-2 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Breaks</div>
                            {daySchedule.breaks?.map((breakItem: any, breakIndex: number) => (
                              <div key={breakIndex} className="flex gap-2 items-center">
                                <div className="relative w-32">
                                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                                  <Input
                                    type="time"
                                    value={breakItem.startTime}
                                    onChange={(e) =>
                                      handleBreakChange(index, breakIndex, "startTime", e.target.value)
                                    }
                                    className="pl-8 h-8 text-xs"
                                    disabled={!canEdit}
                                  />
                                </div>
                                <span className="text-muted-foreground text-xs">-</span>
                                <div className="relative w-32">
                                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                                  <Input
                                    type="time"
                                    value={breakItem.endTime}
                                    onChange={(e) =>
                                      handleBreakChange(index, breakIndex, "endTime", e.target.value)
                                    }
                                    className="pl-8 h-8 text-xs"
                                    disabled={!canEdit}
                                  />
                                </div>
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveBreak(index, breakIndex)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {canEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddBreak(index)}
                                className="h-7 text-xs flex items-center gap-1 mt-1"
                              >
                                <Plus className="h-3 w-3" /> Add Break
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          )
        }

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedBookings} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.cancelledBookings} cancelled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    myBookings.filter((b) => {
                      const bookingDate = new Date(b.startTime || "");
                      const now = new Date();
                      return (
                        bookingDate.getMonth() === now.getMonth() &&
                        bookingDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Appointments this month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.createdAt
                      ? new Date(profileData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {profileData?.location || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs >

      {/* Save Button */}
      <div className="flex justify-end" >
        <Button onClick={handleSaveProfile} disabled={loading || !canEdit} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div >
    </div >
  );
}
