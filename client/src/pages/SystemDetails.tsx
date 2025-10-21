import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, QrCode as QrCodeIcon, Loader2 } from "lucide-react";
import { type System } from "@shared/schema";
import { showToast } from "@/lib/toast";

export default function SystemDetails() {
  const params = useParams<{ id: string }>();

  const { data: system, isLoading } = useQuery<System>({
    queryKey: ["/api/systems", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/systems/${params.id}`);
      if (!response.ok) throw new Error("System not found");
      return response.json();
    },
  });

  const handleDownloadQR = () => {
    if (system?.qrImageUrl) {
      window.open(system.qrImageUrl, "_blank");
      showToast.success("QR code opened");
    } else {
      showToast.error("QR code not available");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading system details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <Card className="p-12 text-center border-2">
            <h3 className="text-xl font-semibold text-foreground mb-2">System Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The system you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/view-all">
              <Button>Back to All Systems</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <Link href="/view-all">
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Systems
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            System Details
          </h1>
          <p className="text-muted-foreground">
            View complete information and QR code for this system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 border-2">
            <h2 className="text-xl font-medium mb-6 text-foreground">System Information</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">System ID</span>
                <p className="text-lg font-semibold text-foreground mt-1" data-testid="text-id-code">
                  {system.idCode}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">Lab Name</span>
                <div className="mt-1">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-gradient-blue/10 to-gradient-indigo/10 text-gradient-indigo border border-gradient-indigo/20"
                    data-testid="text-lab-name"
                  >
                    {system.labName}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">Configuration</span>
                <p className="text-base text-foreground mt-1" data-testid="text-description">
                  {system.description}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">System URL</span>
                <p className="text-sm text-foreground mt-1 break-all font-mono bg-muted/30 p-2 rounded" data-testid="text-url">
                  {system.systemUrl || `${window.location.origin}/system/${system.id}`}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <p className="text-base text-foreground mt-1" data-testid="text-created-at">
                  {system.createdAt ? new Date(system.createdAt).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex gap-3">
              <Link href={`/edit-system/${params.id}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full border-gradient-indigo text-gradient-indigo hover:bg-gradient-indigo/10"
                  data-testid="button-edit"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit System
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 border-2">
            <h2 className="text-xl font-medium mb-6 text-foreground">QR Code</h2>
            
            <div className="flex flex-col items-center">
              <div className="w-64 h-64 rounded-xl border-2 border-gradient-indigo/30 bg-white p-4 mb-6 flex items-center justify-center">
                {system.qrImageUrl ? (
                  <img
                    src={system.qrImageUrl}
                    alt={`QR code for ${system.idCode}`}
                    className="w-full h-full object-contain"
                    data-testid="img-qr-code"
                  />
                ) : (
                  <div className="text-center">
                    <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Generating QR code...</p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleDownloadQR}
                disabled={!system.qrImageUrl}
                className="w-full bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                data-testid="button-download-qr"
              >
                <Download className="w-5 h-5 mr-2" />
                Download QR Code
              </Button>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border w-full">
                <h3 className="font-medium text-sm mb-2 text-foreground">QR Code Information</h3>
                <p className="text-xs text-muted-foreground">
                  This QR code contains the system ID, lab name, configuration details, and a direct link to this page.
                  Scan with any QR code reader to view system information.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
