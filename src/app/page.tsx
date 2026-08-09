"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addDays, startOfToday, subWeeks } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cruiseEmailSchema } from "@/lib/schemas";
import { generateEmailAction, sendEmailAction } from "@/lib/actions";
import { CruiseEmailForm } from "@/components/cruise-email-form";
import { EmailPreview } from "@/components/email-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

type CruiseFormData = z.infer<typeof cruiseEmailSchema>;

const getDefaultFormValues = (): CruiseFormData => ({
  customerName: "",
  customerEmail: "",
  fromAccount: "get-that-cruise",
  adults: 2,
  children: 0,
  drinksPackage: false,
  voyagerMember: false,
  discountPercentage: 8.5,
  deposit: 0,
  dueDate: null, // Initially null
  sailings: [{
    shipName: "",
    cruiseDate: null, // Initially null
    nights: 0,
    cruiseName: "",
    options: [{ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 }],
  }],
  hideMscPrice: false,
});


export default function Home() {
  const [emailBody, setEmailBody] = React.useState("");
  const [emailSubject, setEmailSubject] = React.useState("");
  const [emailSignature, setEmailSignature] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [lastGeneratedData, setLastGeneratedData] = React.useState<CruiseFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<CruiseFormData>({
    resolver: zodResolver(cruiseEmailSchema),
    mode: "onChange",
    defaultValues: getDefaultFormValues(),
  });

  const { watch, setValue, reset } = form;
  const adults = watch("adults");
  const children = watch("children");
  const sailings = watch("sailings");

  React.useEffect(() => {
    setIsClient(true);
    const defaultSailingValue = {
      shipName: "",
      cruiseDate: addDays(startOfToday(), 568),
      nights: 0,
      cruiseName: "",
      options: [{ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 }],
    };
    setValue('sailings', [defaultSailingValue]);
    setValue('dueDate', subWeeks(addDays(startOfToday(), 15), 14));
  }, [setValue]);


  React.useEffect(() => {
    if (sailings && sailings.length > 0) {
       const validSailings = sailings.filter(s => s.cruiseDate);
      if (validSailings.length > 0) {
        const latestDate = validSailings.reduce((max, s) => s.cruiseDate! > max! ? s.cruiseDate : max, validSailings[0].cruiseDate);
        if (latestDate) {
          setValue("dueDate", subWeeks(latestDate, 14));
        }
      }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children, setValue, JSON.stringify(sailings)]);

  const handleGenerate = async (values: CruiseFormData) => {
    setIsGenerating(true);
    setEmailBody("");
    setEmailSubject("");
    setEmailSignature("");
    setLastGeneratedData(null);
    try {
      const response = await generateEmailAction(values);

      if (response.success && response.data) {
        const [body, signature] = response.data.body.split('\n\n---SIGNATURE_SEPARATOR---\n\n');
        setEmailBody(body);
        setEmailSubject(response.data.subject || "");
        setEmailSignature(signature || "");
        setLastGeneratedData(values);
        toast({
          title: "Preview Generated",
          description: "The email preview has been updated.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Generation Failed",
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
      setIsGenerating(false);
    }
  };

  const handleSend = async (editedSubject: string, editedBody: string) => {
    if (!editedBody || !lastGeneratedData) {
      toast({
        variant: "destructive",
        title: "Cannot Send",
        description: "Please generate an email preview first.",
      });
      return;
    }
    
    setIsSending(true);
    try {
      const response = await sendEmailAction({
        customerEmail: lastGeneratedData.customerEmail,
        fromAccount: lastGeneratedData.fromAccount,
        emailBody: editedBody,
        signature: emailSignature,
        subject: editedSubject,
      });

      if (response.success) {
        toast({
          title: "Email Sent Successfully!",
          description: `Quote sent to ${lastGeneratedData.customerEmail}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Send Failed",
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Unexpected Error Occurred",
        description: "Could not send the email. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };


  const handleReset = () => {
    const defaultValues = getDefaultFormValues();
    const defaultSailingValue = {
      shipName: "",
      cruiseDate: addDays(startOfToday(), 568),
      nights: 0,
      cruiseName: "",
      options: [{ experienceType: "", cabinType: "", decks: "", mscBookPrice: 0 }],
    };
    reset({
      ...defaultValues,
      sailings: [defaultSailingValue],
      dueDate: subWeeks(addDays(startOfToday(), 15), 14)
    });
    setEmailBody("");
    setEmailSubject("");
    setEmailSignature("");
    setLastGeneratedData(null);
    toast({
      title: "Form Reset",
      description: "The form has been reset to its default values.",
    });
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

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
              <CruiseEmailForm form={form} onSubmit={handleGenerate} isLoading={isGenerating} />
            </CardContent>
          </Card>
          <EmailPreview 
            emailBody={emailBody} 
            emailSubject={emailSubject}
            emailSignature={emailSignature}
            isLoading={isGenerating}
            isSending={isSending}
            onSend={handleSend}
          />
        </div>
      </main>
    </div>
  );
}
