"use client";

import { useState } from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NoteSchema } from "@/lib/validations";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// 🔧 Props type
interface NoteFormProps {
  id?: string;
  title?: string;
  content?: string;
  btnTitle?: string;
  onSubmit: (values: z.infer<typeof NoteSchema>) => void;
}

const NoteForm = ({
  id,
  title,
  content,
  btnTitle,
  onSubmit,
}: NoteFormProps) => {
  // hooks
  // --- State for loading indicator ---
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof NoteSchema>>({
    resolver: zodResolver(NoteSchema),
    defaultValues: {
      id: id ?? "",
      title: title ?? "",
      content: content ?? "",
    },
    // Add mode: 'onChange' or 'onBlur' to trigger validation as the user types/interacts
    // 'onChange' is generally more responsive for showing/hiding based on validity
    mode: "onChange",
  });
  // --- Use useFormState to get form state properties ---
  const { isValid, isDirty } = useFormState({
    control: form.control, // Pass the form's control object
  });
  // --- Determine if the footer/button should be visible ---
  // In create mode (no id), show if the form is valid.
  // In update mode (has id), show if the form is valid AND has been changed (isDirty).
  const shouldShowFooter = id ? isValid && isDirty : isValid;
  // local variables
  // functions

  // --- Override the default onSubmit handler to manage loading state ---
  const handleFormSubmit = async (values: z.infer<typeof NoteSchema>) => {
    setIsLoading(true); // Start loading
    try {
      await onSubmit(values); // Call the onSubmit prop provided by the parent
    } catch (error) {
      // Error handling is done in the parent component's onSubmit handler,
      // but we catch here to ensure loading state is turned off even on error.
      console.error("NoteForm caught error during submission:", error);
      // The parent's toast will handle user feedback for the error.
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // return
  return (
    <>
      <Card className="mb-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            {/* hidden id */}
            {id && ( // Only render hidden input if an ID exists (for editing)
              <input type="hidden" {...form.register("id")} />
            )}

            {/* title */}
            <CardHeader className="pb-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        className="border-none px-0 text-2xl font-medium focus-visible:ring-0 md:text-2xl"
                        placeholder="Note title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardHeader>
            {/* content */}
            <CardContent className="pb-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Note content..."
                        className="min-h-[300px] resize-none border-none px-0 text-lg focus-visible:ring-0 md:text-lg"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            {shouldShowFooter && (
              <CardFooter className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading}>
                  {/* Disable button when loading */}
                  {/* Conditionally render content based on loading state */}
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      {/* Spinner icon */}
                      In progress...
                    </>
                  ) : (
                    (btnTitle ?? "Save") // Show normal text when not loading
                  )}
                </Button>
              </CardFooter>
            )}
          </form>
        </Form>
      </Card>
    </>
  );
};
export default NoteForm;
