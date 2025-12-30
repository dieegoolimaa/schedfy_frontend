import { useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Camera,
  Upload,
  Link2,
  QrCode,
  Share2,
  Copy,
  Check,
  Eye,
  Save,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import QRCodeLib from "qrcode";
import { entitiesService } from "../services/entities.service";

interface BusinessProfileData {
  businessName: string;
  username: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  banner?: string;
  publicPageEnabled: boolean;
}

interface BusinessProfileManagerProps {
  entityType: "simple" | "simple_unlimited" | "individual" | "business";
  entityId: string;
  initialData?: Partial<BusinessProfileData>;
  onSave?: (data: BusinessProfileData) => void;
}

export function BusinessProfileManager({
  entityType,
  entityId,
  initialData,
  onSave,
}: BusinessProfileManagerProps) {
  const { t } = useTranslation("settings");
  const [profileData, setProfileData] = useState<BusinessProfileData>({
    businessName: initialData?.businessName || "",
    username: initialData?.username || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    logo: initialData?.logo,
    banner: initialData?.banner,
    publicPageEnabled: initialData?.publicPageEnabled ?? true,
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Generate public URL - only show if username is set
  const publicUrl = profileData.username
    ? `${window.location.origin}/book/${profileData.username}`
    : "";

  // Generate QR Code
  const generateQRCode = async () => {
    try {
      const qr = await QRCodeLib.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qr);
      setIsQrDialogOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error(t("success.checkUsernameFailed", "Failed to generate QR code")); // Reusing failure msg or add new one
    }
  };

  // Copy public URL
  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const result = await entitiesService.checkUsername(username);
      setUsernameAvailable(result.data?.available ?? null);
    } catch (error) {
      console.error("Error checking username:", error);
      toast.error("Failed to check username availability");
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      // Upload image (currently returns base64, will be replaced with actual upload)
      const imageUrl = await entitiesService.uploadImage(file, type);
      setProfileData((prev) => ({
        ...prev,
        [type]: imageUrl,
      }));
      toast.success(`${type === "logo" ? "Logo" : "Banner"} uploaded!`);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload ${type}`);
    }
  };

  // Handle username change
  const handleUsernameChange = (value: string) => {
    // Only allow alphanumeric, dots, and underscores
    const sanitized = value.toLowerCase().replace(/[^a-z0-9._]/g, "");
    setProfileData((prev) => ({ ...prev, username: sanitized }));

    // Check availability after typing stops
    if (sanitized.length >= 3) {
      checkUsernameAvailability(sanitized);
    } else {
      setUsernameAvailable(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!profileData.businessName) {
      toast.error("Business name is required");
      return;
    }

    if (!profileData.username || profileData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Username is not available");
      return;
    }

    try {
      // Don't send logo/banner in the profile update to avoid payload size issues
      // These should be uploaded separately via uploadImage
      await entitiesService.updateProfile({
        name: profileData.businessName,
        username: profileData.username,
        description: profileData.description,
        address: profileData.address,
        phone: profileData.phone,
        website: profileData.website,
        // logo and banner are handled separately
      });
      onSave?.(profileData);
      toast.success("Profile saved successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save profile";
      toast.error(errorMessage);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `${profileData.username || entityId}-qrcode.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with Preview & Share */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("business.title")}</h2>
          <p className="text-muted-foreground">
            {t("business.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(publicUrl, "_blank")}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("business.publicPage.preview")}
          </Button>
          <Button variant="outline" onClick={generateQRCode}>
            <QrCode className="h-4 w-4 mr-2" />
            {t("business.publicPage.qrCode")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("business.logo.title")}</CardTitle>
              <CardDescription>
                {t("business.logo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={profileData.logo} />
                  <AvatarFallback className="text-2xl">
                    {profileData.businessName
                      ? profileData.businessName[0].toUpperCase()
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t("business.logo.upload")}
                  </Button>
                  {profileData.logo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setProfileData((prev) => ({ ...prev, logo: undefined }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "logo")}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("business.logo.format")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("business.banner.title")}</CardTitle>
              <CardDescription>
                {t("business.banner.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                {profileData.banner ? (
                  <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden mb-4">
                    <img
                      src={profileData.banner}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        setProfileData((prev) => ({
                          ...prev,
                          banner: undefined,
                        }))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/1] rounded-lg border-2 border-dashed flex items-center justify-center mb-4">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {t("business.banner.noBanner")}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {profileData.banner ? t("business.banner.change") : t("business.banner.upload")}
                </Button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "banner")}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t("business.logo.format")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("business.basicInfo.title")}</CardTitle>
              <CardDescription>
                {t("business.basicInfo.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {t("business.basicInfo.businessName")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    value={profileData.businessName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    placeholder={t("business.basicInfo.businessNamePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">
                    {t("business.basicInfo.username")} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder={t("business.basicInfo.usernamePlaceholder")}
                      className="pl-8"
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </div>
                  {usernameAvailable === true && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      {t("business.basicInfo.usernameAvailable")}
                    </p>
                  )}
                  {usernameAvailable === false && (
                    <p className="text-xs text-red-600">
                      {t("business.basicInfo.usernameTaken")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("business.basicInfo.usernameHint")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("business.basicInfo.businessDescription")}</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={t("business.basicInfo.descriptionPlaceholder")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{t("business.basicInfo.address")}</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    placeholder={t("business.basicInfo.addressPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("business.basicInfo.phone")}</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder={t("business.basicInfo.phonePlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("business.basicInfo.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder={t("business.basicInfo.emailPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t("business.basicInfo.website")}</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder={t("business.basicInfo.websitePlaceholder")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Public Page URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                {t("business.publicPage.title")}
              </CardTitle>
              <CardDescription>
                {t("business.publicPage.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {publicUrl ? (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="font-mono text-sm bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyPublicUrl}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Link2 className="h-3 w-3 mr-1" />
                      Direct Link
                    </Badge>
                    <Badge variant="outline">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Code Compatible
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {entityType} Plan
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    Configure a username first
                  </p>
                  <p className="text-xs mt-1">
                    Your public booking URL will appear here once you set a
                    username
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("business.publicPage.qrDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("business.publicPage.qrDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64 border rounded-lg"
              />
            )}
            <p className="text-sm text-center text-muted-foreground">
              {publicUrl}
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyPublicUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button className="flex-1" onClick={downloadQRCode}>
                <Upload className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
