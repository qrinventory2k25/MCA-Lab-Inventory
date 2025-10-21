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
import { LAB_NAMES, type System } from "@shared/schema";
import {
  Search,
  Download,
  Trash2,
  Edit,
  FileDown,
  QrCode as QrCodeIcon,
  Loader2,
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
    return systems.filter((system) => {
      const matchesSearch =
        searchTerm === "" ||
        system.idCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        system.labName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLab = labFilter === "all" || system.labName === labFilter;

      return matchesSearch && matchesLab;
    });
  }, [systems, searchTerm, labFilter]);

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
    bulkDeleteMutation.mutate(Array.from(selectedSystems));
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

    const labs = [...new Set(selectedSystemsList.map((s) => s.labName))];
    
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            All Systems
          </h1>
          <p className="text-muted-foreground">
            View, search, and manage all registered computer systems
          </p>
        </div>

        <Card className="p-6 border-2 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by ID or lab name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
                data-testid="input-search"
              />
            </div>

            <Select value={labFilter} onValueChange={setLabFilter}>
              <SelectTrigger className="w-full md:w-48 h-11" data-testid="select-lab-filter">
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
              data-testid="button-export-csv"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
          </div>
        </Card>

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
                  className="border-gradient-indigo text-gradient-indigo hover:bg-gradient-indigo/10"
                  data-testid="button-bulk-download"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Codes
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

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
                <Button
                  className="bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white"
                  data-testid="button-add-first-system"
                >
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
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
                        data-testid="checkbox-select-all"
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
                      data-testid={`row-system-${system.id}`}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedSystems.has(system.id)}
                          onCheckedChange={() => toggleSelection(system.id)}
                          data-testid={`checkbox-system-${system.id}`}
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
                              data-testid={`button-edit-${system.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownloadSingleQR(system)}
                            className="h-9 w-9 text-gradient-blue hover:bg-gradient-blue/10"
                            data-testid={`button-download-${system.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(system.id)}
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-${system.id}`}
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
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this system? This action cannot be
              undone and will also remove the QR code from storage.
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

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedSystems.size} Systems</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSystems.size} systems? This
              action cannot be undone and will also remove all QR codes from storage.
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
