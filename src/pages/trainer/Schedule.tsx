import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MainLayout from '@/components/layout/MainLayout';
import { getTrainerSchedule, updateTrainerAvailability, updateActivity, deleteActivity } from '@/services/trainer';
import { toast } from 'sonner';
import axios from 'axios';

interface Activity {
  id: number;
  activity_id: number;
  activity_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  participants: number;
  max_participants: number;
}

interface DaySchedule {
  activities: Activity[];
  availability: any[];
}

interface WeeklySchedule {
  [day: string]: DaySchedule;
}

interface ScheduleSummary {
  total_classes: number;
  busiest_day: string;
  busiest_day_count: number;
  total_participants: number;
  total_capacity: number;
}

interface TrainerScheduleResponse {
  schedule: WeeklySchedule;
  summary: ScheduleSummary;
  week_start: string;
  week_end: string;
}

const TrainerSchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    day_of_week: '',
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  const { data: scheduleData, isLoading, refetch } = useQuery<TrainerScheduleResponse>({
    queryKey: ['trainerSchedule', format(startOfCurrentWeek, 'yyyy-MM-dd')],
    queryFn: () => getTrainerSchedule(format(startOfCurrentWeek, 'yyyy-MM-dd')),
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: updateTrainerAvailability,
    onSuccess: () => {
      toast.success('Availability updated successfully');
      refetch();
      setEditingAvailability(false);
    },
    onError: (error) => {
      toast.error('Failed to update availability');
      console.error('Error updating availability:', error);
    }
  });

  const updateActivityMutation = useMutation({
    mutationFn: (params: { id: number, activity: Partial<Activity> }) => 
      updateActivity(params.id, params.activity),
    onSuccess: () => {
      toast.success('Activity updated successfully');
      refetch();
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update activity');
      console.error('Error updating activity:', error);
    }
  });

  const deleteActivityMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      toast.success('Activity deleted successfully');
      refetch();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to delete activity');
      console.error('Error deleting activity:', error);
    }
  });

  const handlePreviousWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfCurrentWeek, i);
    return {
      date: day,
      dayName: format(day, 'EEEE'),
      dayNumber: format(day, 'd'),
      month: format(day, 'MMM'),
      isToday: isSameDay(day, new Date()),
    };
  });

  const getScheduleForDay = (dayName: string) => {
    return scheduleData?.schedule[dayName]?.activities || [];
  };

  const getAvailabilityForDay = (dayName: string) => {
    const availabilities = scheduleData?.schedule[dayName]?.availability || [];
    return availabilities.length > 0 ? availabilities[0] : null;
  };

  const formatTime = (timeString: string) => {
    return timeString.split(':').slice(0, 2).join(':');
  };

  const handleAddAvailability = (dayName: string) => {
    const existingAvailability = getAvailabilityForDay(dayName);
    setNewAvailability({
      day_of_week: dayName,
      start_time: existingAvailability?.start_time ? formatTime(existingAvailability.start_time) : '09:00',
      end_time: existingAvailability?.end_time ? formatTime(existingAvailability.end_time) : '17:00',
      is_available: existingAvailability?.is_available ?? true
    });
    setEditingAvailability(true);
  };

  const handleSaveAvailability = () => {
    updateAvailabilityMutation.mutate(newAvailability);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleSaveActivity = () => {
    if (editingActivity) {
      updateActivityMutation.mutate({ 
        id: editingActivity.id, 
        activity: editingActivity 
      });
    }
  };

  const handleDeleteClick = (activityId: number) => {
    setActivityToDelete(activityId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      deleteActivityMutation.mutate(activityToDelete);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header and week navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Schedule</h1>
            <p className="text-muted-foreground">View and manage your weekly training schedule</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {format(startOfCurrentWeek, 'MMM d')} - {format(addDays(startOfCurrentWeek, 6), 'MMM d, yyyy')}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary"></div>
          </div>
        ) : (
          <>
            {/* Weekly schedule grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const availability = getAvailabilityForDay(day.dayName);
                return (
                  <div key={day.dayName} className="flex flex-col">
                    <div className={`text-center p-2 rounded-t-md ${
                      day.isToday ? 'bg-gym-secondary text-white' : 'bg-gray-100'
                    }`}>
                      <div className="font-medium">{day.dayName}</div>
                      <div className="text-xs">
                        {day.month} {day.dayNumber}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white rounded-b-md border overflow-y-auto max-h-[500px]">
                      {getScheduleForDay(day.dayName).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">No activities scheduled</div>
                      ) : (
                        getScheduleForDay(day.dayName).map((activity) => (
                          <div key={activity.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium truncate">{activity.activity_name}</h4>
                              <div className="flex space-x-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleEditActivity(activity)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteClick(activity.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{formatTime(activity.start_time)} - {formatTime(activity.end_time)}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{activity.participants}/{activity.max_participants} participants</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {activity.location}
                            </div>
                          </div>
                        ))
                      )}
                      {availability && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs">
                          <div className="font-medium">Availability:</div>
                          <div>{formatTime(availability.start_time)} - {formatTime(availability.end_time)}</div>
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 text-sm"
                        onClick={() => handleAddAvailability(day.dayName)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {availability ? 'Edit Availability' : 'Add Availability'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary card */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">This Week</h3>
                    <p className="text-2xl font-bold">{scheduleData?.summary?.total_classes || 0} Classes</p>
                    <p className="text-sm text-gray-500">Total scheduled activities</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Busiest Day</h3>
                    <p className="text-2xl font-bold">{scheduleData?.summary?.busiest_day || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{scheduleData?.summary?.busiest_day_count || 0} classes scheduled</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Participants</h3>
                    <p className="text-2xl font-bold">
                      {scheduleData?.summary?.total_participants || 0} / {scheduleData?.summary?.total_capacity || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total participants / capacity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Availability Edit Dialog */}
      <Dialog open={editingAvailability} onOpenChange={setEditingAvailability}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Availability for {newAvailability.day_of_week}</DialogTitle>
            <DialogDescription>
              Define when you're available to conduct training sessions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input 
                type="time" 
                value={newAvailability.start_time}
                onChange={(e) => setNewAvailability({...newAvailability, start_time: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input 
                type="time" 
                value={newAvailability.end_time}
                onChange={(e) => setNewAvailability({...newAvailability, end_time: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="is_available"
                checked={newAvailability.is_available}
                onChange={(e) => setNewAvailability({...newAvailability, is_available: e.target.checked})}
              />
              <label htmlFor="is_available" className="text-sm font-medium">
                Available during these hours
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingAvailability(false)}
              disabled={updateAvailabilityMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAvailability}
              disabled={updateAvailabilityMutation.isPending}
            >
              {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
            <DialogDescription>
              Modify the activity details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Activity Name</label>
              <Input 
                value={editingActivity?.activity_name || ''}
                onChange={(e) => editingActivity && setEditingActivity({
                  ...editingActivity,
                  activity_name: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <Input 
                  type="time" 
                  value={editingActivity?.start_time ? formatTime(editingActivity.start_time) : ''}
                  onChange={(e) => editingActivity && setEditingActivity({
                    ...editingActivity,
                    start_time: e.target.value + ':00'
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <Input 
                  type="time" 
                  value={editingActivity?.end_time ? formatTime(editingActivity.end_time) : ''}
                  onChange={(e) => editingActivity && setEditingActivity({
                    ...editingActivity,
                    end_time: e.target.value + ':00'
                  })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input 
                value={editingActivity?.location || ''}
                onChange={(e) => editingActivity && setEditingActivity({
                  ...editingActivity,
                  location: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Participants</label>
              <Input 
                type="number"
                value={editingActivity?.max_participants || 0}
                onChange={(e) => editingActivity && setEditingActivity({
                  ...editingActivity,
                  max_participants: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateActivityMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveActivity}
              disabled={updateActivityMutation.isPending}
            >
              {updateActivityMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteActivityMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteActivityMutation.isPending}
            >
              {deleteActivityMutation.isPending ? 'Deleting...' : 'Delete Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TrainerSchedule;
