import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Users, Building2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
} from "@/hooks/useContacts";

const contactSchema = z.object({
  category: z.enum(["Customer", "Vendor", "Employee"], {
    required_error: "Please select a category",
  }),
  name: z.string().min(1, "Name is required"),
  number: z.number().min(1, "Number is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const CreateContact = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: contacts = [] } = useContacts();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: undefined,
      name: "",
      number: 0,
      email: "",
      phone: "",
      address: "",
    },
    mode: "onChange",
  });

  // Find the contact to edit if we're in edit mode
  const contactToEdit = isEditing ? contacts.find((c) => c.id === id) : null;

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && contactToEdit) {
      form.reset({
        category: contactToEdit.category,
        name: contactToEdit.name,
        number: contactToEdit.number,
        email: contactToEdit.email,
        phone: contactToEdit.phone,
        address: contactToEdit.address,
      });
    }
  }, [contactToEdit, isEditing, form]);

  // Function to generate the next contact number based on category
  const generateNextNumber = (category: string) => {
    if (!category) return 1;

    // Find the highest number for the selected category
    const categoryContacts = contacts.filter((c) => c.category === category);

    if (categoryContacts.length === 0) {
      return 1; // First contact of this category
    }

    // Find the highest number
    const highestNumber = Math.max(
      ...categoryContacts.map((contact) => contact.number)
    );
    return highestNumber + 1;
  };

  // Update number when category changes (only for new contacts)
  useEffect(() => {
    if (!isEditing) {
      const category = form.watch("category");
      if (category) {
        const nextNumber = generateNextNumber(category);
        form.setValue("number", nextNumber);
      }
    }
  }, [form.watch("category"), contacts, isEditing]);

  // Check if all fields are filled
  const isFormComplete = form.formState.isValid;

  const onSubmit = async (data: ContactFormValues) => {
    try {
      if (isEditing && contactToEdit) {
        // Update existing contact
        await updateContactMutation.mutateAsync({
          id: contactToEdit.id,
          updates: {
            category: data.category,
            name: data.name,
            number: data.number,
            email: data.email,
            phone: data.phone,
            address: data.address,
          },
        });
        toast.success("Contact updated successfully");
      } else {
        // Create new contact
        const contactData = {
          category: data.category,
          name: data.name,
          number: data.number,
          email: data.email,
          phone: data.phone,
          address: data.address,
        };

        await createContactMutation.mutateAsync(contactData);
        toast.success("Contact created successfully");
      }

      navigate("/contacts");
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} contact:`,
        error
      );
      toast.error(`Failed to ${isEditing ? "update" : "create"} contact`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Employee":
        return <User size={16} />;
      case "Customer":
        return <Users size={16} />;
      case "Vendor":
        return <Building2 size={16} />;
      default:
        return <User size={16} />;
    }
  };

  // Show loading state when editing and contact data hasn't loaded yet
  if (isEditing && !contactToEdit && contacts.length > 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Header title="Edit Contact" description="Contact not found" />
          <div className="p-6">
            <Button variant="outline" onClick={() => navigate("/contacts")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contacts
            </Button>
            <div className="mt-8 text-center">
              <p className="text-red-600">
                Contact not found or you don't have permission to edit it.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Header
          title={isEditing ? "Edit Contact" : "Create New Contact"}
          description={
            isEditing ? "Update contact information" : "Add a new contact to your network"
          }
        />

        <div className="p-6">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => navigate("/contacts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Customer">
                            <span className="flex items-center gap-2">
                              {getCategoryIcon("Customer")}
                              Customer
                            </span>
                          </SelectItem>
                          <SelectItem value="Vendor">
                            <span className="flex items-center gap-2">
                              {getCategoryIcon("Vendor")}
                              Vendor
                            </span>
                          </SelectItem>
                          <SelectItem value="Employee">
                            <span className="flex items-center gap-2">
                              {getCategoryIcon("Employee")}
                              Employee
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Contact number"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          readOnly={isEditing}
                          className={
                            isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={
                    !isFormComplete ||
                    createContactMutation.isPending ||
                    updateContactMutation.isPending
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing
                    ? updateContactMutation.isPending
                      ? "Updating..."
                      : "Update Contact"
                    : createContactMutation.isPending
                    ? "Creating..."
                    : "Create Contact"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateContact;
