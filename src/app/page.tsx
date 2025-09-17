"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cruiseEmailSchema } from "@/lib/schemas";
import { generateCruiseEmailAction } from "@/lib/actions";
import { CruiseEmailForm } from "@/components/cruise-email-form";
import { EmailPreview } from "@/components/email-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [emailContent, setEmailContent] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cruiseEmailSchema>>({
    resolver: zodResolver(cruiseEmailSchema),
    mode: "onChange",
    defaultValues: {
      customerName: "John Doe",
      shipName: "Ocean Explorer",
      cruiseDate: new Date(),
      nights: 7,
      cruiseName: "Caribbean Adventure",
      adults: 2,
      children: 0,
      drinksPackage: "Premium",
      experienceType: "All-Inclusive",
      cabinType: "Balcony Suite",
      decks: "10-12",
      mscBookPrice: 2500,
      discountPercentage: 15,
      deposit: 500,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  const onSubmit = async (values: z.infer<typeof cruiseEmailSchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        cruiseDate: format(values.cruiseDate, "PPP"),
        dueDate: format(values.dueDate, "PPP"),
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
            <CardHeader>
              <CardTitle>Cruise Details</CardTitle>
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
