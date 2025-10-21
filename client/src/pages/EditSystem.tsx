import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LAB_NAMES, type System } from "@shared/schema";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { showToast } from "@/lib/toast";
import { apiRequest } from "@/lib/queryClient";

const editSystemFormSchema = z.object({
  labName: z.enum(LAB_NAMES),
  description: z.string().min(1, "Description is required"),
});

type EditSystemForm = z.infer<typeof editSystemFormSchema>;

export default function EditSystem() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: system, isLoading } = useQuery<System>({
    queryKey: ["/api/systems", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/systems/${params.id}`);
      if (!response.ok) throw new Error("System not found");
      return response.json();
    },
  });

  const form = useForm<EditSystemForm>({
    resolver: zodResolver(editSystemFormSchema),
    values: system
      ? {
          labName: system.labName as any,
          description: system.description,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EditSystemForm) => {
      return apiRequest("PUT", `/api/systems/${params.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/systems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/systems", params.id] });
      showToast.success("System updated and QR code regenerated successfully");
      setTimeout(() => setLocation("/view-all"), 1500);
    },
    onError: () => {
      showToast.error("Failed to update system");
    },
  });

  const onSubmit = (data: EditSystemForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading system...</p>
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
            Edit System
          </h1>
          <p className="text-muted-foreground">
            Update system configuration and regenerate QR code if needed
          </p>
        </div>

        <Card className="p-6 md:p-8 border-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <div className="text-sm">
                  <span className="font-medium text-foreground">System ID: </span>
                  <span className="text-muted-foreground" data-testid="text-system-id">
                    {system.idCode}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="labName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Lab Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="h-11 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          data-testid="select-lab-name"
                        >
                          <SelectValue placeholder="Select a lab" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LAB_NAMES.map((lab) => (
                          <SelectItem key={lab} value={lab}>
                            {lab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      System Configuration <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="resize-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Enter system specifications"
                        data-testid="textarea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Link href="/view-all">
                  <Button 
                    type="button" 
                    variant="outline"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </Card>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-medium text-sm mb-2 text-foreground">Note:</h3>
          <p className="text-sm text-muted-foreground">
            Updating the system will regenerate the QR code with the new information.
            The QR code image will be automatically updated in storage.
          </p>
        </div>
      </div>
    </div>
  );
}
