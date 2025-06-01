
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Dumbbell, Plus, Save, X, Edit, Trash2, Eye, RefreshCw, Users, Clock, MapPin, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MainLayout from '@/components/layout/MainLayout';
import { getTrainerActivities, deleteActivity, updateActivity } from '@/services/trainer';
import { Activity as ActivityType } from '@/types';
import { toast } from 'sonner';

const TrainerActivities: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityType | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ActivityType>>({});
  const queryClient = useQueryClient();

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['trainerActivities'],
    queryFn: () => getTrainerActivities(),
  });

  const activities = activitiesData || [];

  const updateActivityMutation = useMutation({
    mutationFn: (data: { id: number; activity: Partial<ActivityType> }) => 
      updateActivity(data.id, data.activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerActivities'] });
      toast.success('Activity updated successfully');
      setEditingId(null);
    },
    onError: (error) => {
      toast.error('Failed to update activity');
      console.error('Error updating activity:', error);
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (id: number) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainerActivities'] });
      toast.success('Activity deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete activity');
      console.error('Error deleting activity:', error);
    }
  });

  const handleDeleteClick = (activity: ActivityType) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete) return;
    deleteActivityMutation.mutate(activityToDelete.id);
  };

  const handleEditClick = (activity: ActivityType) => {
    setEditingId(activity.id);
    setEditForm({
      name: activity.name,
      category: activity.category,
      duration_minutes: activity.duration_minutes,
      location: activity.location,
      max_participants: activity.max_participants,
      description: activity.description
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'max_participants' ? Number(value) : value
    }));
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateActivityMutation.mutate({ id: editingId, activity: editForm });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-teal-100 text-teal-800 border-teal-200',
    ];
    return colors[category.length % colors.length];
  };

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-8">
          {/* Header Section */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold mb-3 text-gray-900">My Activities</h1>
                  <p className="text-gray-600 text-lg mb-4">
                    Manage and organize your fitness classes with ease
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Dumbbell className="h-5 w-5" />
                    <span className="text-sm">{activities.length} Activities</span>
                  </div>
                </div>
                <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
                  <Link to="/trainer/activities/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Create New Activity
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Section */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="relative">
                <Input
                  placeholder="Search activities by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Dumbbell className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your activities...</p>
              </div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center p-8">
                <div className="rounded-full bg-gray-100 p-6 mb-6">
                  <Dumbbell className="h-16 w-16 text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">No activities found</h3>
                <p className="text-gray-600 max-w-md mb-6 text-lg">
                  {activities.length === 0 
                    ? "You haven't created any activities yet. Start by creating your first activity to help members stay fit!"
                    : "No activities match your search criteria. Try adjusting your search terms."
                  }
                </p>
                <Button asChild size="lg" className="bg-gray-900 hover:bg-gray-800">
                  <Link to="/trainer/activities/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Activity
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => (
                <Card key={activity.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
                  {editingId === activity.id ? (
                    <div className="p-6 space-y-4 bg-gray-50">
                      <Input
                        name="name"
                        value={editForm.name || ''}
                        onChange={handleEditFormChange}
                        placeholder="Activity name"
                        className="font-semibold text-lg"
                      />
                      <Input
                        name="category"
                        value={editForm.category || ''}
                        onChange={handleEditFormChange}
                        placeholder="Category"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          name="duration_minutes"
                          type="number"
                          value={editForm.duration_minutes || 0}
                          onChange={handleEditFormChange}
                          placeholder="Duration (min)"
                        />
                        <Input
                          name="max_participants"
                          type="number"
                          value={editForm.max_participants || 0}
                          onChange={handleEditFormChange}
                          placeholder="Max participants"
                        />
                      </div>
                      <Input
                        name="location"
                        value={editForm.location || ''}
                        onChange={handleEditFormChange}
                        placeholder="Location"
                      />
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateActivityMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updateActivityMutation.isPending ? (
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
                          disabled={updateActivityMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-3">
                          <Badge className={getCategoryColor(activity.category)} variant="outline">
                            {activity.category}
                          </Badge>
                          <Badge className={getDifficultyColor(activity.difficulty_level)} variant="outline">
                            {activity.difficulty_level}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {activity.name}
                        </CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {activity.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{activity.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{activity.max_participants} max</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="truncate">{activity.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild className="flex-1">
                            <Link to={`/trainer/activities/${activity.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditClick(activity)}
                            className="hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDeleteClick(activity)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Activity
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete <span className="font-semibold">"{activityToDelete?.name}"</span>? 
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteActivityMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteActivityMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteActivityMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Activity
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TrainerActivities;
