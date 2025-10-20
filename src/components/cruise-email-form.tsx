"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import type { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { cruiseEmailSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { addDays, startOfToday } from 'date-fns';

type CruiseEmailFormProps = {
  form: UseFormReturn<z.infer<typeof cruiseEmailSchema>>;
  onSubmit: (values: z.infer<typeof cruiseEmailSchema>) => void;
  isLoading: boolean;
};

const shipNames = ["MSC Virtuosa", "MSC Poesia", "MSC Preziosa", "MSC Meraviglia"];
const experienceTypes = ["Bella", "Fantastica", "Aurea", "Yacht Club"];
const cabinTypes = ["Interior", "Ocean View", "Balcony", "Suite"];

const defaultSailingValue = {
  shipName: "",
  cruiseDate: addDays(startOfToday(), 30),
  nights: 7,
  cruiseName: "",
  options: [{ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 }],
};

export function CruiseEmailForm({ form, onSubmit, isLoading }: CruiseEmailFormProps) {
  const { fields: sailingFields, append: appendSailing, remove: removeSailing } = useFieldArray({
    control: form.control,
    name: "sailings",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
              control={form.control}
              name="fromAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account to send from" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="get-that-cruise">Get That Cruise</SelectItem>
                      <SelectItem value="cruise-aboard">Cruise Aboard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          <Separator/>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
             <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="drinksPackage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Drinks Package</FormLabel>
                    <FormDescription>
                      Premium Extra for adults, and a minor's package if children
                      are present.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="voyagerMember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Voyager Member</FormLabel>
                     <FormDescription>
                      Note in email that the Voyager Club discount has been included.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-lg font-semibold">Sailings</FormLabel>
               <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSailing(defaultSailingValue)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Sailing
              </Button>
            </div>
            <FormDescription>
              Add one or more sailings to this quote.
            </FormDescription>
            {sailingFields.map((sailing, sailingIndex) => (
               <div key={sailing.id} className="relative space-y-4 rounded-md border p-4">
                {sailingIndex > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => removeSailing(sailingIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                 <h3 className="font-semibold text-md">Sailing #{sailingIndex + 1}</h3>
                 <CruiseSailingForm form={form} sailingIndex={sailingIndex} />
               </div>
            ))}
          </div>
          
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>My Price Discount (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 8.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Deposit (£)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 200" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
              control={form.control}
              name="hideMscPrice"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Hide MSC Price</FormLabel>
                     <FormDescription>
                      If checked, the MSC book price will not be shown in the email.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating & Sending...
            </>
          ) : (
            "Generate & Send Email"
          )}
        </Button>
      </form>
    </Form>
  );
}


function CruiseSailingForm({ form, sailingIndex }: { form: UseFormReturn<z.infer<typeof cruiseEmailSchema>>, sailingIndex: number }) {
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `sailings.${sailingIndex}.options`,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        <FormField
            control={form.control}
            name={`sailings.${sailingIndex}.shipName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ship Name</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a ship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shipNames.map((ship) => (
                      <SelectItem key={ship} value={ship}>
                        {ship}
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
            name={`sailings.${sailingIndex}.cruiseDate`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Cruise Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < addDays(startOfToday(), 13) 
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`sailings.${sailingIndex}.nights`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nights</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name={`sailings.${sailingIndex}.cruiseName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cruise Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Western Mediterranean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
    </div>
    <Separator/>
      <div className="space-y-4">
          <div className="flex justify-between items-center">
                <FormLabel>Pricing Options</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendOption({ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 })}
                  >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
              </Button>
          </div>
          {optionFields.map((option, optionIndex) => (
            <div key={option.id} className="relative space-y-4 rounded-md border p-4">
                {optionIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => removeOption(optionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <FormField
                  control={form.control}
                  name={`sailings.${sailingIndex}.options.${optionIndex}.experienceType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                  control={form.control}
                  name={`sailings.${sailingIndex}.options.${optionIndex}.cabinType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cabin Type</FormLabel>                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a cabin type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cabinTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sailings.${sailingIndex}.options.${optionIndex}.decks`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decks</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`sailings.${sailingIndex}.options.${optionIndex}.mscBookPrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MSC Book Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
  </div>
  );
}
