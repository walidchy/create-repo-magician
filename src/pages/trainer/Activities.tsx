import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Dumbbell, Plus, Save, X, Edit, Trash2, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  // The activities are now directly in the data object, not nested under 'activities'
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

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Activities</h1>
            <p className="text-muted-foreground">
              Manage your fitness activities and classes
            </p>
          </div>
          <Button asChild>
            <Link to="/trainer/activities/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Activity
            </Link>
          </Button>
        </div>

        <div className="flex items-center">
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <Dumbbell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No activities found</h3>
              <p className="text-sm text-gray-500 max-w-md mb-4">
                You haven't created any activities yet or none match your search criteria.
              </p>
              <Button asChild>
                <Link to="/trainer/activities/new">Create Your First Activity</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Max Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      {editingId === activity.id ? (
                        <TableRow className="bg-accent/50">
                          <TableCell>
                            <Input
                              name="name"
                              value={editForm.name || ''}
                              onChange={handleEditFormChange}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              name="category"
                              value={editForm.category || ''}
                              onChange={handleEditFormChange}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              name="duration_minutes"
                              type="number"
                              value={editForm.duration_minutes || 0}
                              onChange={handleEditFormChange}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              name="location"
                              value={editForm.location || ''}
                              onChange={handleEditFormChange}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              name="max_participants"
                              type="number"
                              value={editForm.max_participants || 0}
                              onChange={handleEditFormChange}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={updateActivityMutation.isPending}
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
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell className="font-medium">{activity.name}</TableCell>
                          <TableCell>{activity.category}</TableCell>
                          <TableCell>{activity.duration_minutes} min</TableCell>
                          <TableCell>{activity.location}</TableCell>
                          <TableCell>{activity.max_participants}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/trainer/activities/${activity.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditClick(activity)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(activity)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{activityToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
            >
              {deleteActivityMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TrainerActivities;
