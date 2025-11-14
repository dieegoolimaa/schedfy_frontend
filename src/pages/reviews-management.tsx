import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  MoreVertical,
  Reply,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  reviewsService,
  Review,
  ReviewStats,
} from "@/services/reviews.service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReviewsManagement() {
  const { entity } = useAuth();
  const entityId = entity?.id;
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "responded"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");

  // Respond Dialog
  const [respondDialog, setRespondDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (entityId) {
      fetchReviews();
      fetchStats();
    }
  }, [entityId, selectedTab, ratingFilter, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const filters: any = {
        entityId: entityId!,
        sortBy,
      };

      if (ratingFilter !== "all") {
        filters.rating = parseInt(ratingFilter);
      }

      if (selectedTab === "pending") {
        filters.hasResponse = false;
      } else if (selectedTab === "responded") {
        filters.hasResponse = true;
      }

      const data = await reviewsService.getAll(filters);
      setReviews(Array.isArray(data) ? data : (data as any).reviews || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      if (!entityId) return;
      const statsData = await reviewsService.getEntityStats(entityId);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setResponseText("");
    setRespondDialog(true);
  };

  const submitResponse = async () => {
    if (!selectedReview || !responseText.trim()) return;

    try {
      setSubmitting(true);
      await reviewsService.respond(selectedReview._id, {
        response: responseText,
      });

      toast({
        title: "Success",
        description: "Response submitted successfully",
      });

      setRespondDialog(false);
      setSelectedReview(null);
      setResponseText("");
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeature = async (
    reviewId: string,
    currentStatus: boolean
  ) => {
    try {
      await reviewsService.toggleFeature(reviewId);
      toast({
        title: "Success",
        description: currentStatus ? "Review unfeatured" : "Review featured",
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerified = async (
    reviewId: string,
    currentStatus: boolean
  ) => {
    try {
      await reviewsService.toggleVerified(reviewId);
      toast({
        title: "Success",
        description: currentStatus ? "Review unverified" : "Review verified",
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublic = async (
    reviewId: string,
    currentStatus: boolean
  ) => {
    try {
      await reviewsService.update(reviewId, { isPublic: !currentStatus });
      toast({
        title: "Success",
        description: currentStatus ? "Review hidden" : "Review published",
      });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsService.delete(reviewId);
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, size = "sm") => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              size === "sm" ? "h-4 w-4" : "h-5 w-5",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (review: Review) => {
    if (!review.isPublic) {
      return (
        <Badge variant="outline" className="gap-1">
          <EyeOff className="h-3 w-3" />
          Hidden
        </Badge>
      );
    }
    if (review.response) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          Responded
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const pendingCount = reviews.filter((r) => !r.response).length;
  const respondedCount = reviews.filter((r) => r.response).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reviews & Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage customer reviews and respond to feedback
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Response Rate
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {respondedCount} of {stats.total} responded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Reviews
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting your response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                5-Star Reviews
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.distribution["5"] || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0
                  ? Math.round(
                      ((stats.distribution["5"] || 0) / stats.total) * 100
                    )
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of reviews by star rating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  stats.distribution[
                    rating as keyof typeof stats.distribution
                  ] || 0;
                const percentage =
                  stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-2 block">Filter by Rating</Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-2 block">Sort By</Label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Most Recent</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <Tabs
            value={selectedTab}
            onValueChange={(v: any) => setSelectedTab(v)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="responded">
                Responded ({respondedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Reviews from your clients will appear here
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar>
                            <AvatarImage
                              src={(review.clientId as any)?.profilePicture}
                            />
                            <AvatarFallback>
                              {(review.clientId as any)?.firstName?.[0] || "C"}
                              {(review.clientId as any)?.lastName?.[0] || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                {(review.clientId as any)?.firstName}{" "}
                                {(review.clientId as any)?.lastName}
                              </span>
                              {renderStars(review.rating)}
                              {review.isVerified && (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                              {review.isFeatured && (
                                <Badge
                                  variant="outline"
                                  className="gap-1 border-yellow-400"
                                >
                                  <Sparkles className="h-3 w-3 text-yellow-400" />
                                  Featured
                                </Badge>
                              )}
                              {getStatusBadge(review)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(review.createdAt), {
                                addSuffix: true,
                              })}
                              {review.professionalId && (
                                <>
                                  {" · "}
                                  for{" "}
                                  {(review.professionalId as any)?.firstName ||
                                    "Professional"}
                                </>
                              )}
                              {review.serviceId && (
                                <>
                                  {" · "}
                                  {(review.serviceId as any)?.name || "Service"}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!review.response && (
                              <DropdownMenuItem
                                onClick={() => handleRespond(review)}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Respond
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                handleTogglePublic(review._id, review.isPublic)
                              }
                            >
                              {review.isPublic ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleFeature(
                                  review._id,
                                  review.isFeatured
                                )
                              }
                            >
                              <Sparkles className="h-4 w-4 mr-2" />
                              {review.isFeatured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleVerified(
                                  review._id,
                                  review.isVerified
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {review.isVerified ? "Unverify" : "Verify"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(review._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Review Comment */}
                      {review.comment && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {review.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Response */}
                      {review.response && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-900">
                              Your Response
                            </span>
                            {review.respondedAt && (
                              <span className="text-xs text-blue-600">
                                {formatDistanceToNow(
                                  new Date(review.respondedAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-900 leading-relaxed">
                            {review.response}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Respond Dialog */}
      <Dialog open={respondDialog} onOpenChange={setRespondDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a thoughtful response to this customer review
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Review Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>
                      {(selectedReview.clientId as any)?.firstName?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {(selectedReview.clientId as any)?.firstName}{" "}
                      {(selectedReview.clientId as any)?.lastName}
                    </div>
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                {selectedReview.comment && (
                  <p className="text-sm text-gray-700">
                    {selectedReview.comment}
                  </p>
                )}
              </div>

              {/* Response Input */}
              <div className="space-y-2">
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  placeholder="Thank you for your feedback..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be professional and address the customer's concerns
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRespondDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitResponse}
              disabled={!responseText.trim() || submitting}
            >
              {submitting ? "Submitting..." : "Submit Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
