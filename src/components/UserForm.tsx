import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

const formSchema = z.object({
  age: z.coerce.number().min(0, "Age must be a positive number"),
  monthlyBudget: z.coerce.number().min(0, "Monthly budget must be a positive number"),
  investmentGoal: z.enum(["retirement", "house", "education", "other"], {
    required_error: "Please select an investment goal",
  }),
  timeHorizon: z.number().min(1).max(30),
})

export function UserForm() {
  const [timeHorizon, setTimeHorizon] = useState(5)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 0,
      monthlyBudget: 0,
      investmentGoal: undefined,
      timeHorizon: 5,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      const data = await response.json()
      console.log("Strategy received:", data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  min="0"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseInt(value));
                  }}
                />
              </FormControl>
              <FormDescription>
                Your current age
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthlyBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Investment Budget</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? "" : parseInt(value));
                  }}
                />
              </FormControl>
              <FormDescription>
                How much you can invest each month
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="investmentGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your investment goal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="retirement">Retirement</SelectItem>
                  <SelectItem value="house">House Purchase</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                What are you investing for?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeHorizon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investment Time Horizon (Years)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    min={1}
                    max={30}
                    step={1}
                    value={[timeHorizon]}
                    onValueChange={(value) => {
                      setTimeHorizon(value[0])
                      field.onChange(value[0])
                    }}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-500">
                    {timeHorizon} years
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                How long do you plan to invest?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Get Investment Strategy</Button>
      </form>
    </Form>
  )
} 