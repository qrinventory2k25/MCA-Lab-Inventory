import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LAB_NAMES, type System } from "@shared/schema";
import {
  Search,
  Download,
  Trash2,
  Edit,
  FileDown,
  QrCode as QrCodeIcon,
  Loader2,
  BarChart3,
  Grid3X3,
  List,
  Database,
  TrendingUp,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { apiRequest } from "@/lib/queryClient";

export default function ViewAll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [labFilter, setLabFilter] = useState<string>("all");
  const [selectedSystems, setSelectedSystems] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "chart">("list");

  const queryClient = useQueryClient();

  const { data: systems = [], isLoading } = useQuery<System[]>({
    queryKey: ["/api/systems"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/systems/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/systems"] });
      showToast.success("System deleted successfully");
      setDeleteDialogOpen(false);
      setSystemToDelete(null);
    },
    onError: () => {
      showToast.error("Failed to delete system");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest<{ message: string }>("POST", "/api/systems/bulk-delete", { ids });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/systems"] });
      showToast.success(data.message || "Systems deleted successfully");
      setBulkDeleteDialogOpen(false);
      setSelectedSystems(new Set());
    },
    onError: () => {
      showToast.error("Failed to delete systems");
    },
  });

  const filteredSystems = useMemo(() => {
    return systems
      .filter((system) => {
        const matchesSearch =
          searchTerm === "" ||
          system.idCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          system.labName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLab = labFilter === "all" || system.labName === labFilter;

        return matchesSearch && matchesLab;
      })
      .sort((a, b) => a.idCode.localeCompare(b.idCode));
  }, [systems, searchTerm, labFilter]);

  // Statistics calculations
  const stats = useMemo(() => {
    const totalSystems = systems.length;
    const filteredCount = filteredSystems.length;
    
    // Count per department
    const departmentCounts = LAB_NAMES.reduce((acc, lab) => {
      acc[lab] = systems.filter(system => system.labName === lab).length;
      return acc;
    }, {} as Record<string, number>);

    // Group by configuration (description)
    const configGroups = systems.reduce((acc, system) => {
      const config = system.description;
      if (!acc[config]) {
        acc[config] = [];
      }
      acc[config].push(system);
      return acc;
    }, {} as Record<string, System[]>);

    const configStats = Object.entries(configGroups).map(([config, systems]) => ({
      configuration: config,
      count: systems.length,
      systems: systems,
      departments: [...new Set(systems.map(s => s.labName))],
    })).sort((a, b) => b.count - a.count);

    return {
      totalSystems,
      filteredCount,
      departmentCounts,
      configStats,
    };
  }, [systems, filteredSystems]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedSystems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSystems(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedSystems.size === filteredSystems.length) {
      setSelectedSystems(new Set());
    } else {
      setSelectedSystems(new Set(filteredSystems.map((s) => s.id)));
    }
  };

  const handleDelete = (id: string) => {
    setSystemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (systemToDelete) {
      deleteMutation.mutate(systemToDelete);
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedSystems)); // ✅ FIX: convert Set to Array
  };

  const handleExportCSV = () => {
    window.open("/api/systems/export/csv", "_blank");
    showToast.success("CSV export started");
  };

  const handleBulkDownloadQR = () => {
    const selectedSystemsList = systems.filter((s) =>
      selectedSystems.has(s.id)
    );

    if (selectedSystemsList.length === 0) {
      showToast.error("No systems selected");
      return;
    }

    const labs = Array.from(new Set(selectedSystemsList.map((s) => s.labName)));

    if (labs.length > 1) {
      showToast.error("Please select systems from a single lab");
      return;
    }

    window.open(`/api/systems/export/qr/${labs[0]}`, "_blank");
    showToast.success("QR codes download started");
  };

  const handleDownloadSingleQR = (system: System) => {
    if (system.qrImageUrl) {
      window.open(system.qrImageUrl, "_blank");
      showToast.success("QR code opened");
    } else {
      showToast.error("QR code not available");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading systems...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* --- Header --- */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                All Systems
              </h1>
              <p className="text-muted-foreground">
                View, search, and manage all registered computer systems
              </p>
            </div>
            
            {/* View Mode Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "chart" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("chart")}
                className="h-9"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Chart
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gradient-blue to-gradient-indigo flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Systems</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSystems}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gradient-indigo to-gradient-purple flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold text-foreground">{stats.filteredCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gradient-purple to-gradient-blue flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold text-foreground">{LAB_NAMES.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gradient-blue via-gradient-indigo to-gradient-purple flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Configurations</p>
                  <p className="text-2xl font-bold text-foreground">{stats.configStats.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* --- Filters --- */}
        <Card className="p-6 border-2 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID or lab name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Select value={labFilter} onValueChange={setLabFilter}>
              <SelectTrigger className="w-full md:w-48 h-11">
                <SelectValue placeholder="Filter by lab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labs</SelectItem>
                {LAB_NAMES.map((lab) => (
                  <SelectItem key={lab} value={lab}>
                    {lab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleExportCSV}
              className="bg-gradient-to-r from-gradient-blue to-gradient-indigo text-white"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

        {/* --- Bulk Actions --- */}
        {selectedSystems.size > 0 && (
          <Card className="p-4 mb-6 border-2 bg-muted/30 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm font-medium text-foreground">
                {selectedSystems.size} system(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownloadQR}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Codes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* --- Department Counts --- */}
        <Card className="p-6 border-2 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Systems by Department</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {LAB_NAMES.map((lab) => (
              <div key={lab} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gradient-blue/20 to-gradient-indigo/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-gradient-indigo">{stats.departmentCounts[lab]}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{lab}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.departmentCounts[lab] === 1 ? 'system' : 'systems'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* --- Main Content Area --- */}
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grid" | "chart")}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Chart View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {/* List View Content */}
            {filteredSystems.length === 0 ? (
          <Card className="p-12 text-center border-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gradient-blue/20 to-gradient-purple/20 flex items-center justify-center">
                <QrCodeIcon className="w-10 h-10 text-gradient-indigo" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {systems.length === 0 ? "No Systems Found" : "No matching systems"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {systems.length === 0
                ? "Get started by adding your first system to the inventory"
                : "Try adjusting your search or filter criteria"}
            </p>
            {systems.length === 0 && (
              <Link href="/add-system">
                <Button className="bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white">
                  <QrCodeIcon className="w-5 h-5 mr-2" />
                  Add Your First System
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <Card className="border-2 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white">
                    <th className="px-4 py-4 text-left">
                      <Checkbox
                        checked={
                          selectedSystems.size === filteredSystems.length &&
                          filteredSystems.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-4 text-left font-semibold">System ID</th>
                    <th className="px-4 py-4 text-left font-semibold">Lab Name</th>
                    <th className="px-4 py-4 text-left font-semibold">Configuration</th>
                    <th className="px-4 py-4 text-left font-semibold">QR Code</th>
                    <th className="px-4 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSystems.map((system, index) => (
                    <tr
                      key={system.id}
                      className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-muted/10"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedSystems.has(system.id)}
                          onCheckedChange={() => toggleSelection(system.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/system/${system.id}`}>
                          <span className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                            {system.idCode}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gradient-blue/10 to-gradient-indigo/10 text-gradient-indigo border border-gradient-indigo/20">
                          {system.labName}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {system.description}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-12 h-12 rounded-lg border-2 border-gradient-indigo/30 bg-white p-1">
                          {system.qrImageUrl ? (
                            <img
                              src={system.qrImageUrl}
                              alt={`QR code for ${system.idCode}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/edit-system/${system.id}`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 text-gradient-indigo hover:bg-gradient-indigo/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownloadSingleQR(system)}
                            className="h-9 w-9 text-gradient-blue hover:bg-gradient-blue/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(system.id)}
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="grid">
            {/* Grid View Content */}
            {filteredSystems.length === 0 ? (
              <Card className="p-12 text-center border-2">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gradient-blue/20 to-gradient-purple/20 flex items-center justify-center">
                    <QrCodeIcon className="w-10 h-10 text-gradient-indigo" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {systems.length === 0 ? "No Systems Found" : "No matching systems"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {systems.length === 0
                    ? "Get started by adding your first system to the inventory"
                    : "Try adjusting your search or filter criteria"}
                </p>
                {systems.length === 0 && (
                  <Link href="/add-system">
                    <Button className="bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white">
                      <QrCodeIcon className="w-5 h-5 mr-2" />
                      Add Your First System
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSystems.map((system) => (
                  <Card key={system.id} className="p-6 border-2 hover-elevate transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{system.idCode}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {system.labName}
                        </Badge>
                      </div>
                      <Checkbox
                        checked={selectedSystems.has(system.id)}
                        onCheckedChange={() => toggleSelection(system.id)}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <div className="w-24 h-24 mx-auto rounded-lg border-2 border-gradient-indigo/30 bg-white p-2">
                        {system.qrImageUrl ? (
                          <img
                            src={system.qrImageUrl}
                            alt={`QR code for ${system.idCode}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {system.description}
                    </p>

                    <div className="flex gap-2">
                      <Link href={`/system/${system.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link href={`/edit-system/${system.id}`}>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadSingleQR(system)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(system.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart">
            {/* Chart View Content - Configuration Groups */}
            <div className="space-y-6">
              <Card className="p-6 border-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">Systems by Configuration</h3>
                <div className="space-y-4">
                  {stats.configStats.map((config, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gradient-blue to-gradient-indigo flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{config.count}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Configuration {index + 1}</p>
                            <div className="flex gap-2 mt-1">
                              {config.departments.map((dept) => (
                                <Badge key={dept} variant="outline" className="text-xs">
                                  {dept}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {config.count} {config.count === 1 ? 'system' : 'systems'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {config.configuration}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Department Distribution Chart */}
              <Card className="p-6 border-2">
                <h3 className="text-lg font-semibold text-foreground mb-4">Department Distribution</h3>
                <div className="space-y-3">
                  {LAB_NAMES.map((lab) => {
                    const count = stats.departmentCounts[lab];
                    const percentage = stats.totalSystems > 0 ? (count / stats.totalSystems) * 100 : 0;
                    return (
                      <div key={lab} className="flex items-center gap-3">
                        <div className="w-20 text-sm font-medium text-foreground">{lab}</div>
                        <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-gradient-blue to-gradient-indigo rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* --- Delete Dialog --- */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this system? This action cannot be undone and will also remove the QR code from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Bulk Delete Dialog --- */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSystems.size} Systems</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSystems.size} systems? This action cannot be undone and will also remove all QR codes from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
