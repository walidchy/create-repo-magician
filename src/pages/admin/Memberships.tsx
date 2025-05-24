import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Membership } from '@/types';
import { getMemberships, deleteMembership, updateMembership } from '@/services/membership';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { MembershipForm } from '@/components/admin/MembershipForm';
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

const Memberships: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Membership>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberships();
  }, [statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const fetchMemberships = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') queryParams.append('is_active', statusFilter);
      const data = await getMemberships(queryParams.toString());
      setMemberships(data);
    } catch (error) {
      console.error('Error fetching memberships:', error);
      toast.error('Failed to load memberships');
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMembership = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await deleteMembership(id);
        setMemberships(prev => prev.filter(m => m.id !== id));
        toast.success('Membership deleted successfully');
      } catch (error) {
        console.error('Error deleting membership:', error);
        toast.error('Failed to delete membership');
      }
    }
  };

  const handleEditClick = (membership: Membership) => {
    setEditingId(membership.id);
    setEditForm({
      name: membership.name,
      price: membership.price,
      duration_days: membership.duration_days,
      is_active: membership.is_active,
      features: membership.features,
      description: membership.description
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration_days' ? Number(value) : value
    }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const features = e.target.value.split(',').map(f => f.trim());
    setEditForm(prev => ({ ...prev, features }));
  };

  const handleStatusChange = (isActive: boolean) => {
    setEditForm(prev => ({ ...prev, is_active: isActive }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      const updatedMembership = await updateMembership(editingId, editForm);
      setMemberships(prev =>
        prev.map(m => (m.id === editingId ? updatedMembership : m))
      );
      toast.success('Membership updated successfully');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating membership:', error);
      toast.error('Failed to update membership');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredMemberships = memberships.filter(m => {
    const searchLower = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower) ||
      m.category?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);
  const paginatedMemberships = filteredMemberships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Membership Management</h1>
            <p className="text-blue-100 text-lg">Manage all gym memberships</p>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">Membership Records</h2>
                <p className="text-gray-600">Track and manage membership plans</p>
              </div>
              
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Membership
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memberships..."
                className="flex-1"
              />
              <FilterTabs 
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'true' },
                  { label: 'Inactive', value: 'false' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </div>

          {/* Memberships List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : paginatedMemberships.length > 0 ? (
              <>
                <AdminTableContainer>
                  <AdminTableHeader className="grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr]">
                    <div>Name</div>
                    <div>Price</div>
                    <div>Duration</div>
                    <div>Status</div>
                    <div>Features</div>
                    <div>Actions</div>
                  </AdminTableHeader>
                  
                  {paginatedMemberships.map((membership) => (
                    <AdminTableRow 
                      key={membership.id} 
                      className="grid-cols-[2fr_1fr_1fr_1fr_2fr_1fr]"
                    >
                      <div className="font-medium text-slate-900">{membership.name}</div>
                      <div className="text-sm text-slate-600">{formatPrice(membership.price)}</div>
                      <div className="text-sm text-slate-600">
                        {Math.floor(membership.duration_days / 30)} months
                      </div>
                      <div>
                        <StatusBadge status={membership.is_active ? 'active' : 'inactive'} />
                      </div>
                      <div className="text-sm text-slate-600 truncate max-w-[200px]">
                        {Array.isArray(membership.features) ? membership.features.join(', ') : ''}
                      </div>
                      <ActionButtons 
                        onView={() => navigate(`/admin/memberships/${membership.id}`)}
                        onEdit={() => handleEditClick(membership)} 
                        onDelete={() => handleDeleteMembership(membership.id)} 
                      />
                    </AdminTableRow>
                  ))}
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
                <p className="text-slate-500 mb-4">No memberships found.</p>
                <Button variant="outline" onClick={fetchMemberships}>
                  Refresh List
                </Button>
              </div>
            )}

            <MembershipForm 
              open={isFormOpen} 
              onOpenChange={setIsFormOpen} 
              onSuccess={fetchMemberships}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Memberships;
