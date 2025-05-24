import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User } from '@/types';
import { getTrainers, deleteTrainer, updateTrainer } from '@/services/trainer';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { 
  AdminTableContainer, 
  AdminTableHeader, 
  AdminTableRow, 
  StatusBadge, 
  AdminSearchInput,
  ActionButtons,
  Pagination
} from '@/components/admin/AdminTableStyles';

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<User[]>([]);
  const [allTrainers, setAllTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allTrainers, specializationFilter, searchQuery]);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const trainersData = await getTrainers();
      setAllTrainers(trainersData || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      toast.error('Failed to load trainers');
      setAllTrainers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTrainers];

    // Apply specialization filter
    if (specializationFilter && specializationFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.trainer?.specialization === specializationFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(trainer =>
        trainer.name.toLowerCase().includes(searchLower) ||
        trainer.email.toLowerCase().includes(searchLower) ||
        trainer.trainer?.specialization?.toLowerCase().includes(searchLower) ||
        trainer.trainer?.bio?.toLowerCase().includes(searchLower)
      );
    }

    setTrainers(filtered);
    setCurrentPage(1);
  };

  const handleDeleteTrainer = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteTrainer(id);
        setAllTrainers(prev => prev.filter(trainer => trainer.id !== id));
        toast.success('Trainer deleted successfully');
      } catch (error) {
        console.error('Error deleting trainer:', error);
        toast.error('Failed to delete trainer. They may have associated activities.');
      }
    }
  };

  const handleEditClick = (trainer: User) => {
    setEditingId(trainer.id);
    setEditForm({
      name: trainer.name,
      email: trainer.email,
      trainer: {
        specialization: trainer.trainer?.specialization,
        experience_years: trainer.trainer?.experience_years,
        certifications: trainer.trainer?.certifications,
        phone: trainer.trainer?.phone,
        bio: trainer.trainer?.bio,
        user_id: trainer.id
      }
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrainerFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      trainer: {
        ...prev.trainer,
        [name]: name === 'experience_years' ? Number(value) : value
      }
    }));
  };

  const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const certifications = e.target.value.split(',').map(item => item.trim());
    setEditForm(prev => ({
      ...prev,
      trainer: {
        ...prev.trainer,
        certifications
      }
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedTrainer = await updateTrainer(editingId, editForm);
      setAllTrainers(prev => 
        prev.map(trainer => trainer.id === editingId ? updatedTrainer : trainer)
      );
      toast.success('Trainer updated successfully');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating trainer:', error);
      toast.error('Failed to update trainer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const paginatedTrainers = trainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(trainers.length / itemsPerPage);

  const getSpecializations = () => {
    const specializations = new Set(
      allTrainers.map(trainer => trainer.trainer?.specialization).filter(Boolean)
    );
    return Array.from(specializations).sort();
  };

  const parseCertifications = (certifications: string | string[] | undefined): string => {
    if (!certifications) return '-';
    
    if (Array.isArray(certifications)) {
      return certifications.join(', ');
    }
    
    try {
      const parsed = JSON.parse(certifications as string);
      return Array.isArray(parsed) ? parsed.join(', ') : String(certifications);
    } catch {
      return String(certifications);
    }
  };

  const clearAllFilters = () => {
    setSpecializationFilter('all');
    setSearchQuery('');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Trainers Management</h1>
            <p className="text-blue-100 text-lg">Manage all gym trainers and their profiles</p>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">Trainer Records</h2>
                <p className="text-gray-600">Track and manage trainer profiles</p>
              </div>
              
              <Button 
                onClick={() => navigate('/admin/trainers/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Trainer
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trainers..."
                className="flex-1"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {getSpecializations().map(specialization => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(specializationFilter !== 'all' || searchQuery) && (
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
            
            {(specializationFilter !== 'all' || searchQuery) && (
              <div className="text-sm text-slate-600 mt-2">
                Showing {trainers.length} of {allTrainers.length} trainers
                {specializationFilter !== 'all' && ` • Specialization: ${specializationFilter}`}
                {searchQuery && ` • Search: "${searchQuery}"`}
              </div>
            )}
          </div>

          {/* Trainers List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : trainers.length > 0 ? (
              <>
                <AdminTableContainer>
                  <AdminTableHeader className="grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_140px]">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Specialization</div>
                    <div>Experience</div>
                    <div>Certifications</div>
                    <div>Phone</div>
                    <div>Active Clients</div>
                    <div>Actions</div>
                  </AdminTableHeader>
                  
                  {paginatedTrainers.map((trainer) => (
                    <AdminTableRow 
                      key={trainer.id} 
                      className={`grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_140px] ${editingId === trainer.id ? 'bg-accent/50' : ''}`}
                    >
                      <div className="font-medium text-slate-900">{trainer.name}</div>
                      <div className="text-sm text-slate-600 truncate">{trainer.email}</div>
                      <div className="text-sm">{trainer.trainer?.specialization || '-'}</div>
                      <div className="text-sm">{trainer.trainer?.experience_years} years</div>
                      <div className="text-sm truncate max-w-[150px]">
                        {trainer.trainer?.certifications ? parseCertifications(trainer.trainer.certifications) : '-'}
                      </div>
                      <div className="text-sm">{trainer.trainer?.phone || '-'}</div>
                      <div className="text-sm">{trainer.active_members || 0}</div>
                      <ActionButtons 
                        onView={() => navigate(`/admin/trainers/${trainer.id}`)}
                        onEdit={() => handleEditClick(trainer)} 
                        onDelete={() => handleDeleteTrainer(trainer.id)} 
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
                  {allTrainers.length === 0 
                    ? 'No trainers found.' 
                    : 'No trainers match your current filters.'
                  }
                </p>
                {allTrainers.length > 0 && (specializationFilter !== 'all' || searchQuery) ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button variant="outline" onClick={fetchTrainers}>
                    Refresh List
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Trainers;
