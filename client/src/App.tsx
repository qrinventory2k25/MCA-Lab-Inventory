import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import SessionTimeout from "@/components/SessionTimeout";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import AddSystem from "@/pages/AddSystem";
import ViewAll from "@/pages/ViewAll";
import EditSystem from "@/pages/EditSystem";
import SystemDetails from "@/pages/SystemDetails";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/add-system">
        <ProtectedRoute>
          <AddSystem />
        </ProtectedRoute>
      </Route>
      <Route path="/view-all">
        <ProtectedRoute>
          <ViewAll />
        </ProtectedRoute>
      </Route>
      <Route path="/edit-system/:id">
        <ProtectedRoute>
          <EditSystem />
        </ProtectedRoute>
      </Route>
      <Route path="/system/:id">
        <ProtectedRoute>
          <SystemDetails />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Navigation />
          <SessionTimeout />
          <HotToaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
