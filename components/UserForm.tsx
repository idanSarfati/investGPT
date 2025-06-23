"use client";

import { useState, useEffect } from "react";
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
  startingSavings: z.coerce.number().min(0, "Starting savings must be a positive number").optional(),
  budget: z.coerce.number().min(0, "Monthly budget must be a positive number"),
  goal: z.string().min(1, "Please enter or select an investment goal"),
  riskLevel: z.enum(["low", "medium", "high"], { required_error: "Please select a risk level" }),
  timeHorizon: z.number().min(1, "Time horizon must be at least 1 year").max(50, "Maximum time horizon is 50 years"),
});

type FormValues = z.infer<typeof formSchema>;

const investmentGoals = [
  { value: "retirement", label: "Retirement Planning" },
  { value: "house", label: "Buying a House" },
  { value: "education", label: "Education Fund" },
  { value: "wealth", label: "Wealth Building" },
] as const;

const getRecommendedRiskLevel = (timeHorizon: number) => {
  if (timeHorizon <= 3) return "low";
  if (timeHorizon <= 7) return "medium";
  return "high";
};

// Helper to build the prompt string from form values
function buildPrompt({ age, budget, riskLevel, goal, timeHorizon }: FormValues): string {
  return `Create a ${riskLevel}-risk investment strategy for a ${age}-year-old investing ₪${budget} monthly for ${timeHorizon} years. The goal is ${goal.toLowerCase()}.`;
}

export function UserForm() {
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [userSetRisk, setUserSetRisk] = useState(false);
  // State for AI recommendation, loading, and error
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 25,
      startingSavings: undefined,
      budget: 1000,
      goal: "",
      riskLevel: undefined,
      timeHorizon: 10,
    },
  });

  // Watch timeHorizon and riskLevel
  const timeHorizon = form.watch("timeHorizon");
  const riskLevel = form.watch("riskLevel");

  useEffect(() => {
    if (!userSetRisk) {
      const recommended = getRecommendedRiskLevel(timeHorizon);
      form.setValue("riskLevel", recommended);
    }
  }, [timeHorizon, userSetRisk]);

  // Handler for the Generate button
  async function handleGenerate() {
    setLoading(true);
    setError('');
    setRecommendation('');
    try {
      const values = form.getValues();
      const prompt = buildPrompt(values);
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecommendation(data.result);
      } else {
        setError(data.error || 'Failed to generate recommendation.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendation.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-10 border border-gray-200 dark:border-gray-700">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">🧑 Age</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value === undefined ? '' : field.value}
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
            name="startingSavings"
            render={({ field }) => (
              <FormItem className="space-y-3 mt-8">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">Do you already have savings to invest?</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="e.g. 5000"
                    value={field.value === undefined ? '' : field.value}
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? '' : parseInt(value));
                    }}
                  />
                </FormControl>
                <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                  Optional: Add your current savings to improve accuracy
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
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">💰 Monthly Investment Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value === undefined ? '' : field.value}
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
                  <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">🎯 Investment Goal</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
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

          {/* Risk Level Dropdown */}
          <FormField
            control={form.control}
            name="riskLevel"
            render={({ field }) => {
              const recommended = getRecommendedRiskLevel(timeHorizon);
              return (
                <FormItem className="space-y-3 mt-8">
                  <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">⚖️ Risk Level</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                      }}
                      value={field.value || ""}
                      defaultValue={field.value || ""}
                    >
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-white h-11">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                        <SelectItem value="low" className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer">Low</SelectItem>
                        <SelectItem value="medium" className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer">Medium</SelectItem>
                        <SelectItem value="high" className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                    Select your preferred risk level for investments
                    <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">(Recommended: {recommended} for {timeHorizon} years)</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="timeHorizon"
            render={({ field }) => (
              <FormItem className="space-y-3 mt-8">
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium text-base">⏳ Time Horizon</FormLabel>
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
        </div>
        {/* Generate and Reset buttons */}
        <div className="flex gap-4 mt-6">
          <Button type="button" onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => { setRecommendation(''); setError(''); form.reset(); }}>
            Reset
          </Button>
        </div>
        {/* Display recommendation or error */}
        {recommendation && (
          <div className="mt-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded shadow">
              <strong>AI Recommendation:</strong>
              <div className="mt-2 whitespace-pre-line">{recommendation}</div>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-600 dark:text-red-400">{error}</div>
        )}
      </form>
    </Form>
  );
}