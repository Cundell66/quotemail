"use client";

import * as React from "react";
import { Check, Copy, Bot, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "./ui/textarea";

type EmailPreviewProps = {
  emailBody: string;
  emailSignature: string;
  isLoading: boolean;
  isSending: boolean;
  onSend: (editedBody: string) => void;
};

export function EmailPreview({ emailBody, emailSignature, isLoading, isSending, onSend }: EmailPreviewProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [editedBody, setEditedBody] = React.useState(emailBody);
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedBody(emailBody);
  }, [emailBody]);

  const handleCopy = async () => {
    if (!editedBody) return;
    try {
      const plainTextSignature = emailSignature ? emailSignature.replace(/<[^>]*>?/gm, '') : '';
      const textToCopy = `${editedBody}\n\n${plainTextSignature}`;

      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "You can now paste the email content.",
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
      });
    }
  };

  const hasContent = emailBody || editedBody;

  return (
    <Card className="lg:sticky lg:top-8 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Live Email Preview
          </CardTitle>
          <CardDescription>
            The generated email will appear below. You can edit it before sending.
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={isLoading || !hasContent}
                aria-label="Copy email content"
              >
                {isCopied ? (
                  <Check className="h-5 w-5 transition-transform duration-300 ease-in-out scale-110" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy to Clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="prose prose-sm dark:prose-invert flex-grow w-full rounded-md border bg-muted/20 p-4 transition-all">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : hasContent ? (
            <>
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full h-full min-h-[250px] bg-transparent border-0 focus-visible:ring-0 resize-none font-sans text-sm text-foreground"
                placeholder="Email content will appear here..."
              />
            </>
          ) : (
            <div className="whitespace-pre-wrap font-sans text-sm text-foreground">
              Fill out the form to see the generated email...
            </div>
          )}
        </div>
        {emailSignature && (
            <div className="prose prose-sm dark:prose-invert w-full rounded-md border bg-muted/20 p-4 font-sans text-sm text-foreground">
                <div dangerouslySetInnerHTML={{ __html: emailSignature.replace(/\n/g, '<br />') }} />
            </div>
        )}
      </CardContent>
       <CardFooter>
        <Button 
          onClick={() => onSend(editedBody)} 
          disabled={!hasContent || isSending || isLoading} 
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
