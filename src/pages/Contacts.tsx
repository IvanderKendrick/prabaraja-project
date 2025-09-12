import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  User,
  UserPlus,
  Users,
  Building2,
  Trash2,
  Edit,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useContacts, useDeleteContact } from "@/hooks/useContacts";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Employee":
      return "#0EA5E9";
    case "Customer":
      return "#8B5CF6";
    case "Vendor":
      return "#F97316";
    default:
      return "#64748B";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Employee":
      return <User size={16} color={getCategoryColor("Employee")} />;
    case "Customer":
      return <Users size={16} color={getCategoryColor("Customer")} />;
    case "Vendor":
      return <Building2 size={16} color={getCategoryColor("Vendor")} />;
    default:
      return <User size={16} color={getCategoryColor("default")} />;
  }
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15];

const Contacts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[1]);

  const { data: contacts = [], isLoading, error } = useContacts();
  const deleteContactMutation = useDeleteContact();

  const handleContactClick = (contactId: string) => {
    navigate(`/contact-details/${contactId}`);
  };

  const handleDeleteContact = async (
    contactId: string,
    contactName: string
  ) => {
    try {
      await deleteContactMutation.mutateAsync(contactId);
      toast.success(`Contact "${contactName}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.toString().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = filteredContacts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header title="Contacts" description="View your company Contacts" />
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contacts...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header title="Contacts" description="View your company Contacts" />
          <div className="p-6 flex items-center justify-center">
            <div className="text-center text-red-600">
              <p>Error loading contacts: {error.message}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Contacts" description="View your company Contacts" />

        <div className="p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative w-full max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      All Categories
                    </span>
                  </SelectItem>
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

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Rows per page" />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="bg-sidebar-active"
                onClick={() => navigate("/create-contact")}
              >
                <UserPlus className="ml-2" />
                Create Contact
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContacts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      {contacts.length === 0
                        ? "No contacts found. Create your first contact!"
                        : "No contacts match your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(contact.category)}
                          {contact.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => handleContactClick(contact.id)}
                        >
                          {contact.name}
                        </Button>
                      </TableCell>
                      <TableCell>{contact.number}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {contact.address}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/contact-details/${contact.id}/edit`)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Edit size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Contact
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {contact.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteContact(
                                      contact.id,
                                      contact.name
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Contacts;
