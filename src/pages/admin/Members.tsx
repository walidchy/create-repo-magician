
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMembers, deleteMember, updateMember } from '@/services/members';
import { Member } from '@/types';
import { MemberForm } from '@/components/admin/MemberForm';
import { 
  AdminTableContainer, 
  AdminTableHeader, 
  AdminTableRow, 
  StatusBadge, 
  AdminSearchInput,
  FilterTabs,
  ActionButtons,
  Pagination
} from '@/components/admin/AdminTableStyles';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const navigate = useNavigate();

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

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const data = await getMembers();
      console.log("Admin page fetched members:", data);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && hasActiveMembership(member)) ||
      (statusFilter === 'inactive' && !hasActiveMembership(member));

    return matchesSearch && matchesStatus;
  });

  const indexOfLastMember = currentPage * itemsPerPage;
  const indexOfFirstMember = indexOfLastMember - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Members Management</h1>
            <p className="text-blue-100 text-lg">Manage gym members and their profiles</p>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">Member Records</h2>
                <p className="text-gray-600">Track and manage member profiles</p>
              </div>
              
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="flex-1"
              />
              <FilterTabs 
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          {/* Members List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : currentMembers.length > 0 ? (
              <>
                <AdminTableContainer>
                  <AdminTableHeader className="grid-cols-[2fr_1fr_100px_150px_150px_120px]">
                    <div>Member</div>
                    <div>Membership</div>
                    <div>Status</div>
                    <div>Phone</div>
                    <div>Membership End</div>
                    <div>Actions</div>
                  </AdminTableHeader>
                  
                  {currentMembers.map((member) => {
                    const isActive = hasActiveMembership(member);
                    const membershipEndDate = getMembershipEndDate(member);
                    const membershipName = getMembershipName(member);
                    
                    return (
                      <AdminTableRow 
                        key={member.id} 
                        className="grid-cols-[2fr_1fr_100px_150px_150px_120px]"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg bg-blue-500 text-white">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="rounded-lg">
                              {member.name?.substring(0, 2).toUpperCase() || 'NA'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900">{member.name}</div>
                            <div className="text-xs text-slate-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="inline-flex bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">
                          {membershipName}
                        </div>
                        <div>
                          <StatusBadge status={isActive ? 'active' : 'inactive'} />
                        </div>
                        <div className="text-sm text-slate-600">{member.phone || 'Not provided'}</div>
                        <div className="text-sm text-slate-600">
                          {membershipEndDate !== '-' ? new Date(membershipEndDate).toLocaleDateString() : '-'}
                        </div>
                        <ActionButtons 
                          onView={() => navigate(`/admin/members/${member.id}`)}
                          onEdit={() => handleEditClick(member)} 
                          onDelete={() => handleDeleteMember(member.id)} 
                        />
                      </AdminTableRow>
                    );
                  })}
                </AdminTableContainer>

                <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-500 mb-4">No members found.</p>
                <Button variant="outline" onClick={fetchMembers}>
                  Refresh List
                </Button>
              </div>
            )}
          </div>

          <MemberForm 
            open={isFormOpen} 
            onOpenChange={setIsFormOpen} 
            onSuccess={fetchMembers}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Members;
