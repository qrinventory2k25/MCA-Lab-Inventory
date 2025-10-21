import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Database, Download, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gradient-blue via-gradient-indigo to-gradient-purple" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl animate-in fade-in zoom-in duration-500">
              <QrCode className="w-12 h-12" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            College QR Inventory System
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Streamline your computer lab management with QR code-based tracking across all departments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Link href="/add-system">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                data-testid="button-add-system"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Add New System
              </Button>
            </Link>
            <Link href="/view-all">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm shadow-lg font-semibold"
                data-testid="button-view-all"
              >
                <Database className="w-5 h-5 mr-2" />
                View All Systems
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-foreground">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover-elevate active-elevate-2 transition-all duration-200 border-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gradient-blue to-gradient-indigo flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-card-foreground">Auto QR Generation</h3>
              <p className="text-muted-foreground">
                Automatically generate unique QR codes for each system with sequential IDs per lab
              </p>
            </Card>

            <Card className="p-6 hover-elevate active-elevate-2 transition-all duration-200 border-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gradient-indigo to-gradient-purple flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-card-foreground">Multi-Lab Support</h3>
              <p className="text-muted-foreground">
                Manage systems across MCA, BCA, UIT, PIT, UCS, PCS, and PDS labs
              </p>
            </Card>

            <Card className="p-6 hover-elevate active-elevate-2 transition-all duration-200 border-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gradient-purple to-gradient-blue flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-card-foreground">Bulk Export</h3>
              <p className="text-muted-foreground">
                Download QR codes as ZIP files and export data to CSV format
              </p>
            </Card>

            <Card className="p-6 hover-elevate active-elevate-2 transition-all duration-200 border-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gradient-blue via-gradient-indigo to-gradient-purple flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-card-foreground">Cloud Storage</h3>
              <p className="text-muted-foreground">
                Secure QR code storage with Supabase for reliable access anytime
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Begin managing your college computer lab inventory with our modern QR-based system
          </p>
          <Link href="/add-system">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
              data-testid="button-get-started"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
