"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { format, subWeeks, startOfToday, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cruiseEmailSchema } from "@/lib/schemas";
import { generateAndSendEmailAction } from "@/lib/actions";
import { CruiseEmailForm } from "@/components/cruise-email-form";
import { EmailPreview } from "@/components/email-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

const defaultSailingValue = {
  shipName: "",
  cruiseDate: addDays(startOfToday(), 568),
  nights: 0,
  cruiseName: "",
  options: [{ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 }],
};

const defaultFormValues: z.infer<typeof cruiseEmailSchema> = {
  customerName: "",
  customerEmail: "",
  fromAccount: "get-that-cruise",
  adults: 2,
  children: 0,
  drinksPackage: false,
  discountPercentage: 8.5,
  deposit: 0,
  dueDate: subWeeks(addDays(startOfToday(), 15), 14),
  voyagerMember: false,
  sailings: [defaultSailingValue],
  hideMscPrice: false,
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
  const adults = watch("adults");
  const children = watch("children");
  const sailings = watch("sailings");


  React.useEffect(() => {
    // This effect handles setting the due date for each sailing.
    // It seems the original logic only set one due date.
    // Let's assume for now the LATEST cruise date determines the single due date for the whole quote.
    if (sailings && sailings.length > 0) {
      const latestDate = sailings.reduce((max, s) => s.cruiseDate > max ? s.cruiseDate : max, sailings[0].cruiseDate);
      setValue("dueDate", subWeeks(latestDate, 14));
    }
  }, [sailings, setValue]);

  React.useEffect(() => {
    const numAdults = Number(adults) || 0;
    const numChildren = Number(children) || 0;
    const totalGuests = numAdults + numChildren;
    
    const maxNights = sailings?.reduce((max, s) => Math.max(max, s.nights), 0) || 0;

    let newDeposit = 0;
    if (totalGuests > 0) {
      if (maxNights > 9) {
        newDeposit = totalGuests * 200;
      } else {
        newDeposit = totalGuests * 100;
      }
    }
    setValue("deposit", newDeposit);

  }, [adults, children, sailings, setValue]);

  const onSubmit = async (values: z.infer<typeof cruiseEmailSchema>) => {
    setIsLoading(true);
    setEmailContent("");
    try {
      const response = await generateAndSendEmailAction(values);

      if (response.success && response.data) {
        setEmailContent(response.data);
        toast({
          title: "Email Sent Successfully!",
          description: `Quote sent to ${values.customerEmail}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Action Failed",
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Unexpected Error Occurred",
        description: "Please check the console for details and try again.",
      });
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
              <CardTitle>Quote Details</CardTitle>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Quote
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
