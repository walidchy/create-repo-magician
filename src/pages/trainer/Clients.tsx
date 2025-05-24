
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Search, Save, X, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import ClientCard from '@/components/trainer/ClientCard';

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <ClientCard
                    key={member.id}
                    member={member}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteMember}
                  />
                ))}
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

        {/* Edit Dialog */}
        {editingId && (
          <Dialog open={true} onOpenChange={() => setEditingId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
                <DialogDescription>
                  Update member information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <Input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={editForm.email || ''}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Input
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar URL</label>
                  <Input
                    name="avatar"
                    value={editForm.avatar || ''}
                    onChange={handleEditFormChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Member Dialog */}
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
