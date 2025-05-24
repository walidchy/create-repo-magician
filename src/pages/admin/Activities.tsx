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
import { Activity } from '@/types';
import { getActivities, deleteActivity, updateActivity } from '@/services/activities';
import { getTrainers } from '@/services/trainer';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { ActivityForm } from '@/components/admin/ActivityForm';
import { 
  AdminTableContainer, 
  AdminTableHeader, 
  AdminTableRow, 
  StatusBadge, 
  AdminPageHeader, 
  AdminSearchInput,
  ActionButtons,
  Pagination
} from '@/components/admin/AdminTableStyles';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [trainers, setTrainers] = useState<{id: number, name: string}[]>([]);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
    fetchTrainers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allActivities, categoryFilter, difficultyFilter, searchQuery]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const data = await getActivities();
      setAllActivities(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      setAllActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allActivities];

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(activity => activity.category === categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty_level === difficultyFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        activity.location.toLowerCase().includes(searchLower) ||
        (activity.trainer?.name || '').toLowerCase().includes(searchLower)
      );
    }

    setActivities(filtered);
    setCurrentPage(1);
  };

  const fetchTrainers = async () => {
    try {
      const trainersData = await getTrainers();
      setTrainers(trainersData.map(trainer => ({
        id: trainer.id,
        name: trainer.name
      })));
    } catch (error) {
      console.error("Error fetching trainers:", error);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivity(id);
        setAllActivities(prev => prev.filter(activity => activity.id !== id));
        toast.success('Activity deleted successfully');
      } catch (error) {
        console.error('Error deleting activity:', error);
        toast.error('Failed to delete activity. It may have existing bookings.');
      }
    }
  };

  const handleEditClick = (activity: Activity) => {
    setEditingId(activity.id);
    setEditForm({
      name: activity.name,
      category: activity.category,
      difficulty_level: activity.difficulty_level,
      duration_minutes: activity.duration_minutes,
      location: activity.location,
      equipment_needed: activity.equipment_needed,
      trainer_id: activity.trainer && 'id' in activity.trainer ? activity.trainer.id as number : undefined,
      description: activity.description
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'trainer_id' ? Number(value) : value
    }));
  };

  const handleEquipmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const equipment = e.target.value.split(',').map(item => item.trim());
    setEditForm(prev => ({
      ...prev,
      equipment_needed: equipment
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    setIsSaving(true);
    try {
      const updatedActivity = await updateActivity(editingId, editForm);
      setAllActivities(prev => 
        prev.map(activity => activity.id === editingId ? updatedActivity : activity)
      );
      toast.success('Activity updated successfully');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Failed to update activity');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(activities.length / itemsPerPage);

  const getCategories = () => {
    const categories = new Set(allActivities.map(activity => activity.category));
    return Array.from(categories).sort();
  };

  const getDifficultyLevels = () => {
    const levels = new Set(allActivities.map(activity => activity.difficulty_level));
    return Array.from(levels).sort();
  };

  const parseEquipment = (equipment: string | string[] | undefined): string => {
    if (!equipment) return '';
    if (Array.isArray(equipment)) {
      return equipment.join(', ');
    }
    try {
      const parsed = JSON.parse(equipment);
      return Array.isArray(parsed) ? parsed.join(', ') : equipment.toString();
    } catch {
      return equipment.toString();
    }
  };

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setDifficultyFilter('all');
    setSearchQuery('');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Activities Management</h1>
            <p className="text-blue-100 text-lg">Manage all gym activities and classes</p>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 mb-1">Activity Records</h2>
                <p className="text-gray-600">Track and manage gym activities</p>
              </div>
              
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Activity
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search activities..."
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

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {getDifficultyLevels().map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(categoryFilter !== 'all' || difficultyFilter !== 'all' || searchQuery) && (
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
            
            {(categoryFilter !== 'all' || difficultyFilter !== 'all' || searchQuery) && (
              <div className="text-sm text-slate-600 mt-2">
                Showing {activities.length} of {allActivities.length} activities
                {categoryFilter !== 'all' && ` • Category: ${categoryFilter}`}
                {difficultyFilter !== 'all' && ` • Difficulty: ${difficultyFilter}`}
                {searchQuery && ` • Search: "${searchQuery}"`}
              </div>
            )}
          </div>

          {/* Activities List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length > 0 ? (
              <>
                <AdminTableContainer>
                  <AdminTableHeader className="grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr]">
                    <div>Name</div>
                    <div>Category</div>
                    <div>Difficulty</div>
                    <div>Duration</div>
                    <div>Location</div>
                    <div>Equipment</div>
                    <div>Trainer</div>
                    <div>Actions</div>
                  </AdminTableHeader>
                  
                  {paginatedActivities.map((activity) => (
                    <AdminTableRow
                      key={activity.id}
                      className="grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_1fr_1fr]"
                    >
                      <div className="font-medium text-slate-900">{activity.name}</div>
                      <div className="text-sm text-slate-600">{activity.category}</div>
                      <div>
                        <StatusBadge 
                          status={activity.difficulty_level.toLowerCase() as any} 
                        />
                      </div>
                      <div className="text-sm text-slate-600">{activity.duration_minutes} min</div>
                      <div className="text-sm text-slate-600">{activity.location}</div>
                      <div className="text-sm text-slate-600 truncate max-w-[150px]">
                        {parseEquipment(activity.equipment_needed)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {activity.trainer?.name || 'No trainer'}
                      </div>
                      <ActionButtons
                        onView={() => navigate(`/admin/activities/${activity.id}`)}
                        onEdit={() => handleEditClick(activity)}
                        onDelete={() => handleDeleteActivity(activity.id)}
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
                  {allActivities.length === 0 
                    ? 'No activities found.' 
                    : 'No activities match your current filters.'
                  }
                </p>
                {allActivities.length > 0 && (categoryFilter !== 'all' || difficultyFilter !== 'all' || searchQuery) ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button variant="outline" onClick={fetchActivities}>
                    Refresh List
                  </Button>
                )}
              </div>
            )}
          </div>

          <ActivityForm 
            open={isFormOpen} 
            onOpenChange={setIsFormOpen} 
            trainers={trainers}
            onSuccess={fetchActivities}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Activities;
