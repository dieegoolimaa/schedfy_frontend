import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Search,
  Filter,
  Building,
  MapPin,
  Phone,
  Mail,
  Download,
  UserPlus,
  MoreHorizontal,
  Edit,
  Eye,
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  status: "Active" | "Suspended" | "Trial" | "Expired";
  plan: "Simple" | "Individual" | "Business";
  owner: string;
  email: string;
  phone: string;
  location: string;
  employees: number;
  revenue: number;
  createdDate: string;
  lastActivity: string;
}

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Enhanced mock data generation for thousands of companies
  const generateMockCompanies = (): Company[] => {
    const cities = [
      "Lisboa",
      "Porto",
      "Braga",
      "Coimbra",
      "Faro",
      "Aveiro",
      "Viseu",
      "Leiria",
    ];
    const companyTypes = [
      "Beauty Salon",
      "Barbershop",
      "Spa",
      "Wellness Center",
      "Clinic",
      "Studio",
    ];
    const owners = [
      "Maria",
      "João",
      "Ana",
      "Pedro",
      "Carla",
      "Miguel",
      "Sofia",
      "Ricardo",
    ];
    const surnames = [
      "Silva",
      "Santos",
      "Costa",
      "Oliveira",
      "Ferreira",
      "Pereira",
      "Rodrigues",
      "Almeida",
    ];

    return Array.from({ length: 5000 }, (_, i) => {
      const companyType =
        companyTypes[Math.floor(Math.random() * companyTypes.length)];
      const owner = owners[Math.floor(Math.random() * owners.length)];
      const surname = surnames[Math.floor(Math.random() * surnames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const plans = ["Simple", "Individual", "Business"] as const;
      const statuses = ["Active", "Suspended", "Trial", "Expired"] as const;

      return {
        id: i + 1,
        name: `${companyType} ${owner} ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        plan: plans[Math.floor(Math.random() * plans.length)],
        owner: `${owner} ${surname}`,
        email: `${owner.toLowerCase()}${i + 1}@${companyType.replace(" ", "").toLowerCase()}.com`,
        phone: `+351 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`,
        location: `${city}, Portugal`,
        employees: Math.floor(Math.random() * 50) + 1,
        revenue: Math.floor(Math.random() * 5000) + 500,
        createdDate: `2024-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        lastActivity: `2024-${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 2) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      };
    });
  };

  const mockCompanies = generateMockCompanies();

  // Helper functions for styling
  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case "Business":
        return "border-purple-200 text-purple-800 bg-purple-50";
      case "Individual":
        return "border-green-200 text-green-800 bg-green-50";
      default:
        return "border-blue-200 text-blue-800 bg-blue-50";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default" as const;
      case "Trial":
        return "secondary" as const;
      case "Suspended":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || company.status === statusFilter;
    const matchesPlan = planFilter === "all" || company.plan === planFilter;
    const matchesLocation =
      locationFilter === "all" || company.location.includes(locationFilter);
    return matchesSearch && matchesStatus && matchesPlan && matchesLocation;
  });

  // Sort companies
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Company];
    let bValue: any = b[sortBy as keyof Company];

    if (sortBy === "revenue" || sortBy === "employees") {
      aValue = Number(aValue);
      bValue = Number(bValue);
    } else if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = sortedCompanies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage all companies and subscriptions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Companies
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,000</div>
            <p className="text-xs text-muted-foreground">
              {filteredCompanies.length} matching filters
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Advanced Search */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies, owners, emails, phones..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPlanFilter("all");
                  setLocationFilter("all");
                  setSortBy("name");
                  setSortOrder("asc");
                  setCurrentPage(1);
                }}
              >
                Clear All
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Simple">Simple</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Lisboa">Lisboa</SelectItem>
                  <SelectItem value="Porto">Porto</SelectItem>
                  <SelectItem value="Braga">Braga</SelectItem>
                  <SelectItem value="Coimbra">Coimbra</SelectItem>
                  <SelectItem value="Faro">Faro</SelectItem>
                  <SelectItem value="Aveiro">Aveiro</SelectItem>
                  <SelectItem value="Viseu">Viseu</SelectItem>
                  <SelectItem value="Leiria">Leiria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Company Name</SelectItem>
                  <SelectItem value="owner">Owner Name</SelectItem>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="createdDate">Created Date</SelectItem>
                  <SelectItem value="lastActivity">Last Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items per page</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Summary */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span>
                Showing {paginatedCompanies.length} of {sortedCompanies.length}{" "}
                companies
                {sortedCompanies.length !== mockCompanies.length &&
                  ` (filtered from ${mockCompanies.length} total)`}
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Sort: {sortBy} ({sortOrder})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Companies ({sortedCompanies.length})</CardTitle>
              <CardDescription>
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, sortedCompanies.length)} of{" "}
                {sortedCompanies.length} results
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSortBy("name")}
                    >
                      Company
                      {sortBy === "name" && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSortBy("owner")}
                    >
                      Owner
                      {sortBy === "owner" &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSortBy("employees")}
                    >
                      Users
                      {sortBy === "employees" &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSortBy("revenue")}
                    >
                      Revenue
                      {sortBy === "revenue" &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium"
                      onClick={() => setSortBy("lastActivity")}
                    >
                      Last Activity
                      {sortBy === "lastActivity" &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCompanies.length > 0 ? (
                  paginatedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${company.name}`}
                            />
                            <AvatarFallback>
                              {company.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {company.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{company.owner}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {company.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {company.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPlanBadgeStyle(company.plan)}
                        >
                          {company.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(company.status)}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {company.employees}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        €{company.revenue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(company.lastActivity).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Company"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="More Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No companies found matching your filters
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
