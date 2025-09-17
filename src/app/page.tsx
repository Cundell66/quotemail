"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { format, addWeeks, subWeeks, startOfToday, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cruiseEmailSchema } from "@/lib/schemas";
import { generateCruiseEmailAction } from "@/lib/actions";
import { CruiseEmailForm } from "@/components/cruise-email-form";
import { EmailPreview } from "@/components/email-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

const defaultFormValues: z.infer<typeof cruiseEmailSchema> = {
  customerName: "John Doe",
  shipName: "MSC Virtuosa",
  cruiseDate: addDays(startOfToday(), 15),
  nights: 7,
  cruiseName: "Northern Europe",
  adults: 2,
  children: 0,
  drinksPackage: true,
  experienceType: "Bella",
  cabinType: "Interior",
  decks: "10-12",
  mscBookPrice: 2500,
  discountPercentage: 10,
  deposit: 200, // This will be recalculated
  dueDate: subWeeks(addDays(startOfToday(), 15), 14),
};

export default function Home() {
  const [emailContent, setEmailContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cruiseEmailSchema>>({
    resolver: zodResolver(cruiseEmailSchema),
    mode: "onChange",
    defaultValues: defaultFormValues,
  });

  const { watch, setValue, reset } = form;
  const cruiseDate = watch("cruiseDate");
  const nights = watch("nights");
  const adults = watch("adults");
  const children = watch("children");

  React.useEffect(() => {
    if (cruiseDate) {
      setValue("dueDate", subWeeks(cruiseDate, 14));
    }
  }, [cruiseDate, setValue]);

  React.useEffect(() => {
    const numNights = Number(nights) || 0;
    const numAdults = Number(adults) || 0;
    const numChildren = Number(children) || 0;
    const totalGuests = numAdults + numChildren;
    
    let newDeposit = 0;
    if (totalGuests > 0) {
      if (numNights < 10) {
        newDeposit = totalGuests * 100;
      } else {
        newDeposit = totalGuests * 200;
      }
    }
    setValue("deposit", newDeposit);

  }, [nights, adults, children, setValue]);

  const onSubmit = async (values: z.infer<typeof cruiseEmailSchema>) => {
    setIsLoading(true);
    try {
      let drinksPackageString = "No drinks package";
      if(values.drinksPackage) {
        if(values.children > 0) {
          drinksPackageString = "Premium Extra & Minors Drinks Included";
        } else {
          drinksPackageString = "Premium Extra Drinks Included";
        }
      }

      const payload = {
        ...values,
        cruiseDate: format(values.cruiseDate, "PPP"),
        dueDate: format(values.dueDate, "PPP"),
        drinksPackage: drinksPackageString,
      };
      const response = await generateCruiseEmailAction(payload);
      if (response.success && response.data) {
        setEmailContent(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: response.error,
        });
        setEmailContent("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Unexpected Error Occurred",
        description: "Please try again later.",
      });
      setEmailContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset(defaultFormValues);
    setEmailContent("");
    toast({
      title: "Form Reset",
      description: "The form has been reset to its default values.",
    });
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          CruiseMailer
        </h1>
      </header>
      <main className="p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cruise Details</CardTitle>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Email
              </Button>
            </CardHeader>
            <CardContent>
              <CruiseEmailForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>
          <EmailPreview emailContent={emailContent} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
