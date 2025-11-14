import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";
import { FeatureGate } from "../../contexts/feature-flags-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import {
  Heart,
  Star,
  Gift,
  Trophy,
  Crown,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Users,
  Euro,
  TrendingUp,
  Award,
  Target,
  BarChart3,
} from "lucide-react";

export function LoyaltyManagementPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [isLoyaltyEnabled, setIsLoyaltyEnabled] = useState(true);
  const [selectedTier, setSelectedTier] = useState("bronze");
  const [isEditingTier, setIsEditingTier] = useState(false);

  // Mock loyalty program data
  const loyaltyProgram = {
    name: "Beauty Rewards",
    description: "Earn points with every visit and unlock exclusive rewards",
    isActive: true,
    pointsPerEuro: 10,
    minimumRedemption: 100,
    expirationMonths: 12,
  };

  const loyaltyTiers = [
    {
      id: "bronze",
      name: "Bronze",
      color: "#CD7F32",
      minPoints: 0,
      benefits: ["Basic rewards", "Birthday discount 10%"],
      multiplier: 1,
      clients: 156,
      icon: Award,
    },
    {
      id: "silver",
      name: "Silver",
      color: "#C0C0C0",
      minPoints: 500,
      benefits: [
        "Priority booking",
        "15% birthday discount",
        "Exclusive offers",
      ],
      multiplier: 1.2,
      clients: 89,
      icon: Star,
    },
    {
      id: "gold",
      name: "Gold",
      color: "#FFD700",
      minPoints: 1500,
      benefits: [
        "Premium perks",
        "20% birthday discount",
        "Free consultations",
      ],
      multiplier: 1.5,
      clients: 34,
      icon: Trophy,
    },
    {
      id: "platinum",
      name: "Platinum",
      color: "#E5E4E2",
      minPoints: 3000,
      benefits: ["VIP treatment", "25% birthday discount", "Concierge service"],
      multiplier: 2,
      clients: 12,
      icon: Crown,
    },
  ];

  const loyaltyRewards = [
    {
      id: 1,
      name: "10€ Service Credit",
      description: "Redeem for any service",
      pointsCost: 200,
      category: "credit",
      isActive: true,
      redemptions: 45,
    },
    {
      id: 2,
      name: "Free Basic Manicure",
      description: "Complimentary basic manicure service",
      pointsCost: 350,
      category: "service",
      isActive: true,
      redemptions: 23,
    },
    {
      id: 3,
      name: "Premium Product Sample Kit",
      description: "Try our premium product line",
      pointsCost: 150,
      category: "product",
      isActive: true,
      redemptions: 67,
    },
    {
      id: 4,
      name: "Exclusive Workshop Access",
      description: "Special beauty workshop invitation",
      pointsCost: 500,
      category: "experience",
      isActive: false,
      redemptions: 8,
    },
  ];

  const loyaltyStats = {
    totalMembers: 291,
    activeMembers: 256,
    averagePoints: 342,
    totalPointsIssued: 89450,
    totalPointsRedeemed: 23600,
    redemptionRate: 26.4,
    programRevenue: 12450,
    customerRetention: 87.3,
  };

  const recentActivity = [
    {
      id: 1,
      customerName: "Ana Silva",
      action: "Earned Points",
      points: 45,
      tier: "Silver",
      date: "2024-01-20",
      details: "Haircut & Styling service",
    },
    {
      id: 2,
      customerName: "João Santos",
      action: "Redeemed Reward",
      points: -200,
      tier: "Gold",
      date: "2024-01-19",
      details: "10€ Service Credit",
    },
    {
      id: 3,
      customerName: "Maria Oliveira",
      action: "Tier Upgrade",
      points: 0,
      tier: "Platinum",
      date: "2024-01-18",
      details: "Reached 3000 points",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "credit":
        return "bg-green-100 text-green-800 border-green-200";
      case "service":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "product":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "experience":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleCreateReward = () => {
    console.log("Create new reward");
  };

  const handleEditTier = (tierId: string) => {
    setSelectedTier(tierId);
    setIsEditingTier(true);
  };

  return (
    <FeatureGate
      feature="loyaltyManagementEnabled"
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-center space-y-4">
            <Heart className="h-20 w-20 text-muted-foreground mx-auto opacity-50" />
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Loyalty Management Coming Soon
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Our comprehensive Loyalty Management system is currently in
                development and will be available for purchase soon. Build
                lasting relationships with your customers!
              </p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Crown className="mr-2 h-4 w-4" />
              Feature Not Available Yet
            </Badge>
          </div>
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
              <CardDescription>
                Loyalty Management will help you retain and reward your best
                customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Trophy className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Tier-Based Programs</p>
                    <p className="text-sm text-muted-foreground">
                      Create multiple loyalty tiers with unique benefits
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Points & Rewards</p>
                    <p className="text-sm text-muted-foreground">
                      Flexible point systems and reward redemption
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Gift className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Custom Rewards</p>
                    <p className="text-sm text-muted-foreground">
                      Design personalized rewards and promotions
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Customer Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Track engagement and retention metrics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Loyalty Management
            </h1>
            <p className="text-muted-foreground">
              Design and manage your customer loyalty program
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Program Settings
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reward
            </Button>
          </div>
        </div>

        {/* Program Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  {loyaltyProgram.name}
                </CardTitle>
                <CardDescription>{loyaltyProgram.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isLoyaltyEnabled}
                  onCheckedChange={setIsLoyaltyEnabled}
                />
                <Badge variant={isLoyaltyEnabled ? "default" : "secondary"}>
                  {isLoyaltyEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {loyaltyProgram.pointsPerEuro}
                </div>
                <div className="text-sm text-muted-foreground">
                  Points per €1
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {loyaltyProgram.minimumRedemption}
                </div>
                <div className="text-sm text-muted-foreground">
                  Min. Redemption
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {loyaltyProgram.expirationMonths}
                </div>
                <div className="text-sm text-muted-foreground">
                  Months to Expire
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {loyaltyStats.totalMembers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Members
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loyaltyStats.activeMembers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Points
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loyaltyStats.averagePoints}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per active member
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Redemption Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loyaltyStats.redemptionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Points redeemed vs issued
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Program Revenue
                  </CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(loyaltyStats.programRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From loyalty members
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest loyalty program interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="p-2 bg-background rounded-full">
                          {activity.action === "Earned Points" && (
                            <Zap className="h-4 w-4 text-green-600" />
                          )}
                          {activity.action === "Redeemed Reward" && (
                            <Gift className="h-4 w-4 text-blue-600" />
                          )}
                          {activity.action === "Tier Upgrade" && (
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {activity.customerName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {activity.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.details}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            {(() => {
                              let colorClass = "text-muted-foreground";
                              if (activity.points > 0)
                                colorClass = "text-green-600";
                              else if (activity.points < 0)
                                colorClass = "text-red-600";

                              return (
                                <span
                                  className={`text-sm font-medium ${colorClass}`}
                                >
                                  {activity.points > 0 && "+"}
                                  {activity.points !== 0 &&
                                    `${activity.points} pts`}
                                </span>
                              );
                            })()}
                            <span className="text-xs text-muted-foreground">
                              {activity.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tier Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Tier Distribution</CardTitle>
                  <CardDescription>
                    Members across loyalty tiers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loyaltyTiers.map((tier) => {
                      const percentage =
                        (tier.clients / loyaltyStats.totalMembers) * 100;
                      const IconComponent = tier.icon;
                      return (
                        <div key={tier.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent
                                className="h-4 w-4"
                                style={{ color: tier.color }}
                              />
                              <span className="font-medium">{tier.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {tier.clients} members
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Tiers</CardTitle>
                <CardDescription>
                  Configure tier requirements and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {loyaltyTiers.map((tier) => {
                    const IconComponent = tier.icon;
                    return (
                      <Card key={tier.id} className="relative">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: tier.color }}
                              />
                              <CardTitle className="text-lg">
                                {tier.name}
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTier(tier.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Requirements</p>
                            <p className="text-sm text-muted-foreground">
                              {tier.minPoints === 0
                                ? "No minimum"
                                : `${tier.minPoints}+ points`}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Point Multiplier
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tier.multiplier}x
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Members</p>
                            <p className="text-sm text-muted-foreground">
                              {tier.clients}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Benefits</p>
                            <div className="space-y-1">
                              {tier.benefits.map((benefit) => (
                                <p
                                  key={benefit}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {benefit}
                                </p>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Loyalty Rewards</CardTitle>
                    <CardDescription>
                      Manage available rewards for point redemption
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Reward</DialogTitle>
                        <DialogDescription>
                          Add a new reward that customers can redeem with points
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>
                            {t("loyalty.rewards.form.name", "Reward Name")}
                          </Label>
                          <Input
                            placeholder={t(
                              "loyalty.rewards.form.namePlaceholder",
                              "e.g., 15€ Service Credit"
                            )}
                          />
                        </div>
                        <div>
                          <Label>
                            {t(
                              "loyalty.rewards.form.description",
                              "Description"
                            )}
                          </Label>
                          <Textarea
                            placeholder={t(
                              "loyalty.rewards.form.descriptionPlaceholder",
                              "Brief description of the reward"
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>
                              {t(
                                "loyalty.rewards.form.pointsCost",
                                "Points Cost"
                              )}
                            </Label>
                            <Input
                              type="number"
                              placeholder={t(
                                "loyalty.rewards.form.pointsPlaceholder",
                                "250"
                              )}
                            />
                          </div>
                          <div>
                            <Label>
                              {t("loyalty.rewards.form.category", "Category")}
                            </Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "loyalty.rewards.form.selectCategory",
                                    "Select category"
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credit">
                                  {t(
                                    "loyalty.rewards.categories.serviceCredit",
                                    "Service Credit"
                                  )}
                                </SelectItem>
                                <SelectItem value="service">
                                  {t(
                                    "loyalty.rewards.categories.freeService",
                                    "Free Service"
                                  )}
                                </SelectItem>
                                <SelectItem value="product">
                                  {t(
                                    "loyalty.rewards.categories.product",
                                    "Product"
                                  )}
                                </SelectItem>
                                <SelectItem value="experience">
                                  {t(
                                    "loyalty.rewards.categories.experience",
                                    "Experience"
                                  )}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">
                            {t("actions.cancel", "Cancel")}
                          </Button>
                          <Button onClick={handleCreateReward}>
                            {t("loyalty.rewards.createReward", "Create Reward")}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reward</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Points Cost</TableHead>
                      <TableHead>Redemptions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loyaltyRewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reward.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {reward.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(reward.category)}
                          >
                            {reward.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {reward.pointsCost} pts
                        </TableCell>
                        <TableCell>{reward.redemptions}</TableCell>
                        <TableCell>
                          <Badge
                            variant={reward.isActive ? "default" : "secondary"}
                          >
                            {reward.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Members</CardTitle>
                <CardDescription>
                  View and manage loyalty program members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Member Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed member management features will be available here
                  </p>
                  <Button variant="outline">View All Members</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Analytics</CardTitle>
                <CardDescription>
                  Program performance and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Advanced Analytics
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed analytics and reporting features will be available
                    here
                  </p>
                  <Button variant="outline">View Analytics Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Tier Dialog */}
        <Dialog open={isEditingTier} onOpenChange={setIsEditingTier}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Loyalty Tier</DialogTitle>
              <DialogDescription>
                Modify tier requirements and benefits
              </DialogDescription>
            </DialogHeader>
            {selectedTier && (
              <div className="space-y-4">
                <div>
                  <Label>Tier Name</Label>
                  <Input
                    defaultValue={
                      loyaltyTiers.find((t) => t.id === selectedTier)?.name
                    }
                  />
                </div>
                <div>
                  <Label>Minimum Points</Label>
                  <Input
                    type="number"
                    defaultValue={
                      loyaltyTiers.find((t) => t.id === selectedTier)?.minPoints
                    }
                  />
                </div>
                <div>
                  <Label>Point Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={
                      loyaltyTiers.find((t) => t.id === selectedTier)
                        ?.multiplier
                    }
                  />
                </div>
                <div>
                  <Label>{t("loyalty.tiers.form.benefits", "Benefits")}</Label>
                  <Textarea
                    placeholder={t(
                      "loyalty.tiers.form.benefitsPlaceholder",
                      "Enter benefits, one per line"
                    )}
                    defaultValue={loyaltyTiers
                      .find((t) => t.id === selectedTier)
                      ?.benefits.join("\n")}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingTier(false)}
                  >
                    {t("actions.cancel", "Cancel")}
                  </Button>
                  <Button onClick={() => setIsEditingTier(false)}>
                    {t("actions.saveChanges", "Save Changes")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FeatureGate>
  );
}
