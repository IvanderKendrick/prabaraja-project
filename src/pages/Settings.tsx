
import { useState, useEffect } from "react";
import { FileQuestion, Save, User, Users, Upload, Image } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useProfiles, useUpdateUserRole, useUpdateProfileName } from "@/hooks/useProfiles";
import { useUpdateProfileLogo } from "@/hooks/useUpdateProfileLogo";
import { getRoleDisplayName, AVAILABLE_ROLES, validateRoleChange } from "@/utils/roleUtils";
import { ConfirmRoleChangeDialog } from "@/components/ConfirmRoleChangeDialog";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [roleSelects, setRoleSelects] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userEmail: string;
    currentRole: string;
    newRole: string;
  }>({
    isOpen: false,
    userId: '',
    userEmail: '',
    currentRole: '',
    newRole: ''
  });

  const { user } = useAuth();
  const { isAdmin, profile, isLoading: roleLoading } = useRoleAccess();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const updateUserRole = useUpdateUserRole();
  const updateProfileName = useUpdateProfileName();
  const updateProfileLogo = useUpdateProfileLogo();
  
  // Initialize role selects when profiles load
  useEffect(() => {
    if (profiles) {
      const initialRoles: Record<string, string> = {};
      profiles.forEach(profile => {
        initialRoles[profile.id] = profile.role || 'member';
      });
      setRoleSelects(initialRoles);
    }
  }, [profiles]);
  
  // Load username and logo from profile on component mount
  useEffect(() => {
    if (profile?.name) {
      setUsername(profile.name);
    }
    if (profile?.company_logo) {
      setLogoPreview(profile.company_logo);
    }
  }, [profile]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      try {
        await updateProfileLogo.mutateAsync({ logoFile: file });
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }
  };

  const handleSaveUsername = async () => {
    if (username.trim()) {
      try {
        await updateProfileName.mutateAsync({ name: username.trim() });
        // Also keep localStorage for backward compatibility
        localStorage.setItem("username", username.trim());
      } catch (error) {
        console.error('Error updating username:', error);
      }
    } else {
      toast.error("Username cannot be empty");
    }
  };

  const handleRoleChangeRequest = (userId: string, newRole: string) => {
    const targetUser = profiles?.find(p => p.id === userId);
    if (!targetUser) return;

    // Validate the role change
    const validation = validateRoleChange(
      profile?.role || 'member',
      user?.id || '',
      userId,
      newRole
    );

    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid role change');
      // Reset the select to the original value
      setRoleSelects(prev => ({
        ...prev,
        [userId]: targetUser.role || 'member'
      }));
      return;
    }

    // Show confirmation dialog
    setConfirmDialog({
      isOpen: true,
      userId,
      userEmail: targetUser.email || 'Unknown',
      currentRole: targetUser.role || 'member',
      newRole
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!confirmDialog.userId || !confirmDialog.newRole) return;

    try {
      await updateUserRole.mutateAsync({ 
        userId: confirmDialog.userId, 
        newRole: confirmDialog.newRole 
      });
      
      // Close dialog on success
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      // Error is already handled in the mutation
      console.error('Role change failed:', error);
      
      // Reset the select to the original value on error
      const targetUser = profiles?.find(p => p.id === confirmDialog.userId);
      if (targetUser) {
        setRoleSelects(prev => ({
          ...prev,
          [confirmDialog.userId]: targetUser.role || 'member'
        }));
      }
    }
  };

  const handleResetPassword = (email: string) => {
    // In a real app, this would trigger a password reset flow
    toast.success(`Password reset link sent to ${email}`);
  };

  const closeConfirmDialog = () => {
    // Reset the select to the original value when cancelling
    const targetUser = profiles?.find(p => p.id === confirmDialog.userId);
    if (targetUser) {
      setRoleSelects(prev => ({
        ...prev,
        [confirmDialog.userId]: targetUser.role || 'member'
      }));
    }
    
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  if (roleLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="bg-gradient-to-b from-[#818CF8] to-[#C084FC] p-6">
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="text-white/80">Modify your workdesk</p>
        </div>
        
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                  <Input 
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-muted-foreground">Your email address cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role"
                    type="text"
                    value={getRoleDisplayName(profile?.role || 'member')}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-muted-foreground">Your role is managed by administrators</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex flex-col gap-4">
                    {logoPreview && (
                      <div className="w-32 h-32 border border-border rounded-lg overflow-hidden">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload your company logo (max 5MB)</p>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveUsername}
                  className="flex items-center gap-2"
                  disabled={updateProfileName.isPending}
                >
                  <Save className="h-4 w-4" /> 
                  {updateProfileName.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {isAdmin && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> User Management (Admin Only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : !profiles || profiles.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No users found in the system
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((userProfile) => {
                        const isCurrentUser = userProfile.id === user?.id;
                        const currentRole = userProfile.role || 'member';
                        
                        return (
                          <TableRow key={userProfile.id}>
                            <TableCell className="font-medium">
                              {userProfile.email || "—"}
                              {isCurrentUser && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  You
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{userProfile.name || "—"}</TableCell>
                            <TableCell>
                              <Select
                                value={roleSelects[userProfile.id] || currentRole}
                                onValueChange={(value) => {
                                  setRoleSelects(prev => ({
                                    ...prev,
                                    [userProfile.id]: value
                                  }));
                                  handleRoleChangeRequest(userProfile.id, value);
                                }}
                                disabled={isCurrentUser || updateUserRole.isPending}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AVAILABLE_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                      <Badge 
                                        variant="outline" 
                                        className={`${
                                          role === 'admin' ? 'bg-blue-50 text-blue-600 hover:bg-blue-50' :
                                          role === 'team_lead' ? 'bg-green-50 text-green-600 hover:bg-green-50' :
                                          role === 'division_member' ? 'bg-purple-50 text-purple-600 hover:bg-purple-50' :
                                          'bg-gray-50 text-gray-600 hover:bg-gray-50'
                                        }`}
                                      >
                                        {getRoleDisplayName(role)}
                                      </Badge>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {isCurrentUser && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Cannot change own role
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleResetPassword(userProfile.email || '')}
                                disabled={!userProfile.email}
                              >
                                Reset Password
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
          
          {!isAdmin && (
            <div className="text-center text-gray-500 mt-8">
              <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">More Settings Coming Soon</h2>
              <p className="text-muted-foreground">
                Additional settings options are currently under development. Check back later for updates!
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmRoleChangeDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmRoleChange}
        userEmail={confirmDialog.userEmail}
        currentRole={confirmDialog.currentRole}
        newRole={confirmDialog.newRole}
        isLoading={updateUserRole.isPending}
      />
    </div>
  );
}
