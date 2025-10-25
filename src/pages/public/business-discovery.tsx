import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Filter,
  Calendar,
  Heart,
  Share2,
  Navigation,
} from "lucide-react";

export function BusinessDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [serviceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Mock businesses data for public discovery
  const businesses = [
    {
      id: 1,
      name: "Bella Vista Salon",
      description:
        "Premium hair salon specializing in modern cuts and coloring",
      address: "Rua das Flores, 123, Lisboa",
      city: "Lisboa",
      rating: 4.9,
      reviewCount: 127,
      priceRange: "€€€",
      distance: 0.8,
      image: "/api/placeholder/400/200",
      services: ["Hair Coloring", "Haircut & Styling", "Hair Treatment"],
      specialties: ["Balayage", "Keratin Treatment", "Wedding Styling"],
      openHours: "09:00 - 19:00",
      phone: "+351 123 456 789",
      website: "www.bellavistasalon.pt",
      featured: true,
      availableToday: true,
      nextAvailable: "14:30",
    },
    {
      id: 2,
      name: "Modern Cuts",
      description: "Contemporary barbershop with traditional techniques",
      address: "Av. da República, 456, Porto",
      city: "Porto",
      rating: 4.7,
      reviewCount: 89,
      priceRange: "€€",
      distance: 1.2,
      image: "/api/placeholder/400/200",
      services: ["Haircut", "Beard Trim", "Hot Towel Shave"],
      specialties: ["Classic Cuts", "Beard Styling", "Straight Razor"],
      openHours: "10:00 - 20:00",
      phone: "+351 987 654 321",
      website: "www.moderncuts.pt",
      featured: false,
      availableToday: true,
      nextAvailable: "16:00",
    },
    {
      id: 3,
      name: "Elite Beauty Studio",
      description: "Full-service beauty salon for all your needs",
      address: "Rua Augusta, 789, Lisboa",
      city: "Lisboa",
      rating: 4.8,
      reviewCount: 156,
      priceRange: "€€€€",
      distance: 2.1,
      image: "/api/placeholder/400/200",
      services: ["Hair Services", "Nail Care", "Skincare", "Makeup"],
      specialties: ["Bridal Package", "Luxury Treatments", "Color Correction"],
      openHours: "08:00 - 21:00",
      phone: "+351 555 789 123",
      website: "www.elitebeauty.pt",
      featured: true,
      availableToday: false,
      nextAvailable: "Tomorrow 09:00",
    },
    {
      id: 4,
      name: "Urban Barbershop",
      description: "Hip barbershop in the heart of the city",
      address: "Cais do Sodré, 321, Lisboa",
      city: "Lisboa",
      rating: 4.6,
      reviewCount: 94,
      priceRange: "€€",
      distance: 0.5,
      image: "/api/placeholder/400/200",
      services: ["Haircut", "Beard Care", "Hair Styling"],
      specialties: ["Fade Cuts", "Pompadour", "Undercuts"],
      openHours: "11:00 - 19:00",
      phone: "+351 444 555 666",
      website: "www.urbanbarbershop.pt",
      featured: false,
      availableToday: true,
      nextAvailable: "15:45",
    },
  ];

  const categories = [
    { id: "all", name: "All Services", count: 245 },
    { id: "hair", name: "Hair Services", count: 156 },
    { id: "nails", name: "Nail Care", count: 89 },
    { id: "beauty", name: "Beauty & Makeup", count: 67 },
    { id: "spa", name: "Spa & Wellness", count: 34 },
    { id: "barbershop", name: "Barbershop", count: 78 },
  ];

  const popularServices = [
    "Haircut & Styling",
    "Hair Coloring",
    "Manicure & Pedicure",
    "Beard Trim",
    "Hair Treatment",
    "Eyebrow Shaping",
    "Facial",
    "Massage",
  ];

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.services.some((service) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesLocation =
      locationFilter === "all" || business.city === locationFilter;
    const matchesService =
      serviceFilter === "all" ||
      business.services.some((service) =>
        service.toLowerCase().includes(serviceFilter.toLowerCase())
      );

    return matchesSearch && matchesLocation && matchesService;
  });

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-500 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case "€":
        return "text-green-600";
      case "€€":
        return "text-blue-600";
      case "€€€":
        return "text-orange-600";
      case "€€€€":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Beauty & Wellness Experience
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover and book appointments with top-rated salons and beauty
              professionals near you
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search for services, salons, or treatments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-gray-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-[150px] text-gray-900">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Lisboa">Lisboa</SelectItem>
                      <SelectItem value="Porto">Porto</SelectItem>
                      <SelectItem value="Coimbra">Coimbra</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-semibold">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.count} businesses
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Services</h2>
          <div className="flex flex-wrap gap-2">
            {popularServices.map((service) => (
              <Badge
                key={service}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 hover:text-blue-800"
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {filteredBusinesses.length} businesses found
            </h2>
            <Badge variant="outline">Near you</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="distance">Nearest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="availability">Available Now</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Business Listings */}
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex">
                <div className="w-1/3 relative">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                  {business.featured && (
                    <Badge className="absolute top-2 left-2 bg-orange-500">
                      Featured
                    </Badge>
                  )}
                  {business.availableToday && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      Available Today
                    </Badge>
                  )}
                </div>
                <div className="w-2/3 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{business.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {getRatingStars(business.rating)}
                    </div>
                    <span className="font-medium">{business.rating}</span>
                    <span className="text-muted-foreground">
                      ({business.reviewCount} reviews)
                    </span>
                    <span
                      className={`font-medium ${getPriceRangeColor(business.priceRange)}`}
                    >
                      {business.priceRange}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-3">
                    {business.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {business.address} • {business.distance}km away
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {business.openHours} • Next available:{" "}
                      {business.nextAvailable}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {business.phone}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {business.services.slice(0, 3).map((service) => (
                      <Badge
                        key={service}
                        variant="outline"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                    {business.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{business.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                    <Button variant="outline">
                      <Globe className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      </div>
    </div>
  );
}
