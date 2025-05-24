import React, { useState, useEffect } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { getEquipment, deleteEquipment, updateEquipment } from '@/services/equipment';
import { Equipment as EquipmentType } from '@/types';
import { EquipmentForm } from '@/components/admin/EquipmentForm';
import { 
  AdminTableContainer, 
  AdminTableHeader, 
  AdminTableRow, 
  StatusBadge, 
  AdminSearchInput,
  ActionButtons,
  Pagination
} from '@/components/admin/AdminTableStyles';

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [allEquipment, setAllEquipment] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<EquipmentType>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allEquipment, categoryFilter, statusFilter, searchQuery]);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const data = await getEquipment();
      setAllEquipment(data);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Failed to load equipment');
      setAllEquipment([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEquipment];

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description?.toLowerCase().includes(searchLower))
      );
    }

    setEquipment(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteEquipment(id);
        setEquipment(prev => prev.filter(item => item.id !== id));
        toast.success('Equipment deleted successfully');
      } catch (error) {
        toast.error('Failed to delete equipment');
      }
    }
  };

  const handleEditClick = (item: EquipmentType) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      status: item.status,
      maintenance_date: item.maintenance_date,
      description: item.description
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedEquipment = await updateEquipment(editingId, editForm);
      setEquipment(prev => 
        prev.map(item => item.id === editingId ? updatedEquipment : item)
      );
      toast.success('Equipment updated successfully');
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update equipment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const paginatedEquipment = equipment.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(equipment.length / itemsPerPage);

  const getCategories = () => {
    const categories = new Set(allEquipment.map(item => item.category));
    return Array.from(categories).sort();
  };

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const maintenanceNeeded = allEquipment.filter(
    item =>
      item.status === 'maintenance' ||
      (item.maintenance_date && new Date(item.maintenance_date) <= new Date())
  ).length;

  const totalItems = allEquipment.reduce((sum, item) => sum + item.quantity, 0);
  const availableItems = allEquipment
    .filter(item => item.status === 'available')
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Equipment Management</h1>
            <p className="text-blue-100 text-lg">Manage gym equipment inventory</p>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-500 mb-1">Total Items</h3>
                <div className="text-2xl font-bold text-slate-900">{totalItems}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {allEquipment.length} equipment types
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-500 mb-1">Available</h3>
                <div className="text-2xl font-bold text-slate-900">{availableItems}</div>
                <p className="text-xs text-slate-500 mt-1">Ready for use</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-500 mb-1 flex items-center">
                  Maintenance Needed
                  {maintenanceNeeded > 0 && (
                    <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
                  )}
                </h3>
                <div className="text-2xl font-bold text-slate-900">{maintenanceNeeded}</div>
                <p className="text-xs text-slate-500 mt-1">Requiring attention</p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">Equipment Records</h2>
                <p className="text-gray-600">Track and manage equipment inventory</p>
              </div>
              
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="flex-1"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>

                {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="whitespace-nowrap"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            {(categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <div className="text-sm text-slate-600 mt-2">
                Showing {equipment.length} of {allEquipment.length} equipment
                {categoryFilter !== 'all' && ` • Category: ${categoryFilter}`}
                {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                {searchQuery && ` • Search: "${searchQuery}"`}
              </div>
            )}
          </div>

          {/* Equipment List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : equipment.length > 0 ? (
              <>
                <AdminTableContainer>
                  <AdminTableHeader className="grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
                    <div>Name</div>
                    <div>Category</div>
                    <div>Quantity</div>
                    <div>Status</div>
                    <div>Last Maintenance</div>
                    <div>Actions</div>
                  </AdminTableHeader>
                  
                  {paginatedEquipment.map((item) => (
                    <AdminTableRow
                      key={item.id}
                      className="grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]"
                    >
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-600">{item.category}</div>
                      <div className="text-sm text-slate-600">{item.quantity}</div>
                      <div>
                        <StatusBadge status={item.status as any} />
                      </div>
                      <div className="text-sm text-slate-600">
                        {item.maintenance_date
                          ? new Date(item.maintenance_date).toLocaleDateString()
                          : 'N/A'}
                      </div>
                      <ActionButtons
                        onView={() => navigate(`/admin/equipment/${item.id}`)}
                        onEdit={() => handleEditClick(item)}
                        onDelete={() => handleDelete(item.id)}
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
                <p className="text-slate-500 mb-4">
                  {allEquipment.length === 0
                    ? 'No equipment found in system'
                    : 'No equipment matches your current filters.'}
                </p>
                {allEquipment.length > 0 && (categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery) ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={fetchEquipment}>
                      Refresh List
                    </Button>
                    <Button variant="default" onClick={() => setIsFormOpen(true)}>
                      Add Equipment
                    </Button>
                  </div>
                )}
              </div>
            )}

            <EquipmentForm 
              open={isFormOpen} 
              onOpenChange={setIsFormOpen} 
              onSuccess={fetchEquipment}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Equipment;
