"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  age: z.coerce.number().min(0, "Age must be a positive number"),
  budget: z.coerce.number().min(0, "Monthly budget must be a positive number"),
  goal: z.string().min(1, "Please enter or select an investment goal"),
  timeHorizon: z.number().min(1, "Time horizon must be at least 1 year").max(50, "Maximum time horizon is 50 years"),
});

type FormValues = z.infer<typeof formSchema>;

const investmentGoals = [
  { value: "retirement", label: "Retirement Planning" },
  { value: "house", label: "Buying a House" },
  { value: "education", label: "Education Fund" },
  { value: "wealth", label: "Wealth Building" },
  { value: "other", label: "Other" },
] as const;

export function UserForm() {
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      budget: 1000,
      goal: "",
      timeHorizon: 10,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      // Handle successful submission
      console.log("Form submitted successfully:", values);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 border border-gray-200 dark:border-gray-700">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseInt(value));
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Your current age
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="space-y-3 mt-8">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">Monthly Investment Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : parseInt(value));
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  How much you can invest each month
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goal"
            render={({ field }) => (
              <FormItem className="space-y-3 mt-8">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">Investment Goal</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCustomGoal(!isCustomGoal);
                      form.setValue("goal", "");
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {isCustomGoal ? "Use Preset Goals" : "Enter Custom Goal"}
                  </Button>
                </div>
                <FormControl>
                  {isCustomGoal ? (
                    <Input
                      {...field}
                      placeholder="Enter your investment goal"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11"
                    />
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11">
                        <SelectValue placeholder="Select your investment goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                        {investmentGoals.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value} className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer">
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  {isCustomGoal ? "Describe your specific investment goal" : "What are you investing for?"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeHorizon"
            render={({ field }) => (
              <FormItem className="space-y-3 mt-8">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">Time Horizon</FormLabel>
                <FormControl>
                  <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full mt-2"
                  />
                </FormControl>
                <div 
                  className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-2"
                  suppressHydrationWarning
                >
                  <span>1 year</span>
                  <span>{field.value} years</span>
                  <span>30 years</span>
                </div>
                <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  How long you plan to invest
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 h-11 mt-10"
          >
            Get Investment Strategy
          </Button>
        </div>
      </form>
    </Form>
  );
}