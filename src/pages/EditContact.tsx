import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useContacts, useUpdateContact } from "@/hooks/useContacts";
import { toast } from "sonner";

// Schema for edit form - only editable fields
const editContactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

type EditContactFormValues = z.infer<typeof editContactSchema>;

const EditContact = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const { data: contacts = [] } = useContacts();
  const updateContactMutation = useUpdateContact();

  const contact = contacts.find((c) => c.id === id);

  const form = useForm<EditContactFormValues>({
    resolver: zodResolver(editContactSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
    },
  });

  // Pre-populate form when contact data is available
  useEffect(() => {
    if (contact) {
      form.reset({
        email: contact.email,
        phone: contact.phone,
        address: contact.address,
      });
      setIsLoading(false);
    }
  }, [contact, form]);

  // If contact not found and contacts are loaded
  useEffect(() => {
    if (contacts.length > 0 && !contact && id) {
      toast.error("Contact not found");
      navigate("/contacts");
    }
  }, [contacts, contact, id, navigate]);

  const onSubmit = async (data: EditContactFormValues) => {
    if (!contact) return;

    try {
      await updateContactMutation.mutateAsync({
        id: contact.id,
        updates: data,
      });

      toast.success("Contact updated successfully!");
      navigate("/contacts");
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6 flex items-center gap-4">
            <button
              onClick={() => navigate("/contacts")}
              className="text-white hover:bg-white/10 rounded-full p-2 mr-4"
              aria-label="Back to Contacts"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Edit Contact
              </h2>
              <p className="text-white/80">Update contact information.</p>
            </div>
          </div>
          <div className="flex flex-col items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contact...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return null; // Will redirect via useEffect
  }

  const isFormComplete = form.formState.isValid;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="px-8 pt-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/contacts")}
            className="bg-white hover:bg-white/90 rounded-md p-2 mr-4"
            aria-label="Back to Contacts"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold ">Edit Contact</h2>
            <p className="">Update contact information for {contact.name}</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-10">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Read-only fields */}
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Contact Number
                    </label>
                    <Input
                      value={contact.number.toString()}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Category
                    </label>
                    <Input
                      value={contact.category}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Name
                    </label>
                    <Input
                      value={contact.name}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Editable fields */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate("/contacts")}
                      disabled={updateContactMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        !isFormComplete || updateContactMutation.isPending
                      }
                    >
                      {updateContactMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Contact"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditContact;
