import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import Home from "@/pages/Home";
import AddSystem from "@/pages/AddSystem";
import ViewAll from "@/pages/ViewAll";
import EditSystem from "@/pages/EditSystem";
import SystemDetails from "@/pages/SystemDetails";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/add-system" component={AddSystem} />
      <Route path="/view-all" component={ViewAll} />
      <Route path="/edit-system/:id" component={EditSystem} />
      <Route path="/system/:id" component={SystemDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Navigation />
        <HotToaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
