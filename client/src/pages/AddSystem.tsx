import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LAB_NAMES } from "@shared/schema";
import { Plus, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import { apiRequest } from "@/lib/queryClient";

const addSystemFormSchema = z.object({
  labName: z.enum(LAB_NAMES, { required_error: "Please select a lab" }),
  numberOfSystems: z.coerce.number().min(1, "Must add at least 1 system").max(100, "Maximum 100 systems at once"),
  description: z.string().min(1, "Description is required"),
});

type AddSystemForm = z.infer<typeof addSystemFormSchema>;

export default function AddSystem() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<AddSystemForm>({
    resolver: zodResolver(addSystemFormSchema),
    defaultValues: {
      labName: undefined,
      numberOfSystems: 1,
      description: "INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE",
    },
  });

  const createSystemsMutation = useMutation({
    mutationFn: async (data: AddSystemForm) => {
      const toastId = showToast.loading(
        `Creating ${data.numberOfSystems} system(s)...`
      );
      try {
        const response = await apiRequest<any[]>("POST", "/api/systems", data);
        showToast.dismiss(toastId);
        return response;
      } catch (error) {
        showToast.dismiss(toastId);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/systems"] });
      showToast.success(
        `Successfully created ${data.length} system(s) with QR codes!`
      );
      form.reset();
      setTimeout(() => setLocation("/view-all"), 1500);
    },
    onError: (error: any) => {
      showToast.error(
        error.message || "Failed to create systems. Please try again."
      );
    },
  });

  const onSubmit = (data: AddSystemForm) => {
    createSystemsMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
            Add New System
          </h1>
          <p className="text-muted-foreground">
            Add one or multiple systems to a lab with auto-generated QR codes
          </p>
        </div>

        <Card className="p-6 md:p-8 border-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <SelectItem 
                            key={lab} 
                            value={lab}
                            data-testid={`option-lab-${lab.toLowerCase()}`}
                          >
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
                name="numberOfSystems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Number of Systems <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        className="h-11 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        data-testid="input-number-of-systems"
                        {...field}
                      />
                    </FormControl>
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
                  disabled={createSystemsMutation.isPending}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-gradient-blue via-gradient-indigo to-gradient-purple text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  data-testid="button-submit"
                >
                  {createSystemsMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding Systems...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add System(s)
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <h3 className="font-medium text-sm mb-2 text-foreground">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Select a lab from the dropdown menu</li>
            <li>Enter the number of systems to add (1-100)</li>
            <li>Systems will be assigned sequential IDs (e.g., MCA-001, MCA-002)</li>
            <li>QR codes will be automatically generated and uploaded to storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
