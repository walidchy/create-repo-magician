import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search, Save, X, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMembers, deleteMember, updateMember, createMember } from '@/services/members';
import { Member, Membership, MemberFormData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newMember, setNewMember] = useState<Partial<MemberFormData>>({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    avatar: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const data = await getMembers();
        console.log("Fetched members:", data);
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  const handleDeleteMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(memberId);
        setMembers(prev => prev.filter(member => member.id !== memberId));
        toast.success('Member deleted successfully');
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Failed to delete member. They may have existing bookings or payments.');
      }
    }
  };

  const handleEditClick = (member: Member) => {
    setEditingId(member.id);
    setEditForm({
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (value: string) => {
    setNewMember(prev => ({
      ...prev,
      gender: value as 'male' | 'female'
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedMember = await updateMember(editingId, editForm);
      setMembers(prev => 
        prev.map(member => member.id === editingId ? updatedMember : member)
      );
      toast.success('Member updated successfully');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async () => {
    setIsSaving(true);
    try {
      const createdMember = await createMember(newMember);
      setMembers(prev => [createdMember, ...prev]);
      toast.success('Member added successfully');
      setIsAddDialogOpen(false);
      setNewMember({
        name: '',
        email: '',
        phone: '',
        gender: 'male',
        avatar: ''
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const hasActiveMembership = member.membership?.is_active || member.memberships?.some(m => m.is_active);
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && hasActiveMembership) ||
      (statusFilter === 'inactive' && !hasActiveMembership);
    
    return matchesSearch && matchesStatus;
  });

  const hasActiveMembership = (member: Member): boolean => {
    if (member.membership?.is_active) {
      return true;
    }
    return member.memberships?.some(m => m.is_active) || false;
  };

  const getMembershipEndDate = (member: Member): string => {
    if (member.membership?.end_date) {
      return member.membership.end_date;
    }
    
    if (member.memberships && member.memberships.length > 0) {
      const sortedMemberships = [...member.memberships].sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      );
      return sortedMemberships[0].end_date;
    }
    
    return '-';
  };

  const getMembershipName = (member: Member): string => {
    if (member.membership) {
      return `Plan #${member.membership.membership_plan_id}`;
    }
    
    if (member.memberships && member.memberships.length > 0) {
      const latestMembership = [...member.memberships].sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0];
      return latestMembership.membership_plan?.name || `Plan #${latestMembership.id}`;
    }
    
    return 'No membership';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Members Management</h1>
            <p className="text-muted-foreground">Manage gym members and their profiles</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Members</CardTitle>
            <CardDescription>A list of all gym members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={statusFilter === '' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('')}
                  size="sm"
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === 'active' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Active
                </Button>
                <Button 
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('inactive')}
                  size="sm"
                >
                  Inactive
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary"></div>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Membership End</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => {
                      const isActive = hasActiveMembership(member);
                      const membershipEndDate = getMembershipEndDate(member);
                      const membershipName = getMembershipName(member);
                      
                      return (
                        <React.Fragment key={member.id}>
                          {editingId === member.id ? (
                            <TableRow className="bg-accent/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={editForm.avatar} alt={editForm.name} />
                                    <AvatarFallback>
                                      {(editForm.name || '').substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="space-y-2">
                                    <Input
                                      name="name"
                                      value={editForm.name || ''}
                                      onChange={handleEditFormChange}
                                      className="w-full"
                                    />
                                    <Input
                                      name="email"
                                      value={editForm.email || ''}
                                      onChange={handleEditFormChange}
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{membershipName}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={isActive ? 'default' : 'secondary'}
                                  className={isActive ? 
                                    'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Input
                                  name="phone"
                                  value={editForm.phone || ''}
                                  onChange={handleEditFormChange}
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                {membershipEndDate !== '-' ? 
                                  new Date(membershipEndDate).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4 mr-1" />
                                  )}
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name?.substring(0, 2).toUpperCase() || 'NA'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{membershipName}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={isActive ? 'default' : 'secondary'}
                                  className={isActive ? 
                                    'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{member.phone || 'Not provided'}</TableCell>
                              <TableCell>
                                {membershipEndDate !== '-' ? 
                                  new Date(membershipEndDate).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditClick(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteMember(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No members found.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Refresh List
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new member to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  name="name"
                  value={newMember.name || ''}
                  onChange={handleNewMemberChange}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={newMember.email || ''}
                  onChange={handleNewMemberChange}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  name="phone"
                  value={newMember.phone || ''}
                  onChange={handleNewMemberChange}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <Select 
                  value={newMember.gender || 'male'} 
                  onValueChange={handleGenderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar URL (Optional)</label>
                <Input
                  name="avatar"
                  value={newMember.avatar || ''}
                  onChange={handleNewMemberChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMember}
                disabled={isSaving || !newMember.name || !newMember.email}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-2" />
                )}
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Members;
