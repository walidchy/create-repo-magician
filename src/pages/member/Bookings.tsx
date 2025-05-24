
import React, { useState } from 'react';
import { Search, Calendar, CalendarX } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemberBookings, cancelBooking, getMemberActivities, leaveActivity } from '@/services/members';

const MemberBookings: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'member'],
    queryFn: getMemberBookings
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', 'member'],
    queryFn: getMemberActivities
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'member'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error) => {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  });

  const leaveActivityMutation = useMutation({
    mutationFn: (activityId: number) => leaveActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'member'] });
      toast.success('Left activity successfully');
    },
    onError: (error) => {
      console.error('Error leaving activity:', error);
      toast.error('Failed to leave activity');
    }
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.activity?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      (activeTab === 'upcoming' && booking.status === 'upcoming') ||
      (activeTab === 'past' && booking.status === 'completed') ||
      (activeTab === 'cancelled' && booking.status === 'canceled');

    return matchesSearch && matchesStatus;
  });

  const filteredActivities = activities.filter(activity => 
    activity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = bookingsLoading || activitiesLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Bookings & Activities</h1>
            <p className="text-muted-foreground">Summary of your reserved and joined activities</p>
          </div>
          <Button className="mt-4 md:mt-0" asChild>
            <a href="/activities">Browse Activities</a>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings & Activities</CardTitle>
            <CardDescription>Check your activity details by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full md:w-auto grid-cols-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                    <TabsTrigger value="activities">Joined Activities</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary"></div>
                </div>
              ) : activeTab !== 'activities' ? (
                filteredBookings.length > 0 ? (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-md border bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex flex-col space-y-1">
                          <h4 className="font-semibold text-lg">
                            {booking.activity?.name}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            Category: {booking.activity?.category}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Difficulty: {booking.activity?.difficulty_level}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Duration: {booking.activity?.duration_minutes} minutes
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end space-y-2">
                          <Badge
                            variant={
                              booking.status === 'upcoming'
                                ? 'default'
                                : booking.status === 'completed'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          {booking.status === 'upcoming' && (
                            <Button
                              className="mt-2"
                              variant="destructive"
                              onClick={() => cancelBookingMutation.mutate(booking.id)}
                            >
                              <CalendarX className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">No bookings found.</p>
                    <Button asChild>
                      <a href="/activities">Browse Activities</a>
                    </Button>
                  </div>
                )
              ) : (
                filteredActivities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredActivities.map((activity) => (
                      <Card key={activity.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{activity.name}</CardTitle>
                          <CardDescription>
                            <Badge className="mr-2">{activity.category}</Badge>
                            <Badge variant="outline">{activity.difficulty_level}</Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                            <div className="flex justify-between items-center text-sm pt-2">
                              <div className="flex flex-col">
                                <span>Duration: {activity.duration_minutes} min</span>
                                <span>Location: {activity.location}</span>
                              </div>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => leaveActivityMutation.mutate(activity.id)}
                              >
                                <CalendarX className="h-4 w-4 mr-2" />
                                Leave
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You haven't joined any activities yet.</p>
                    <Button asChild>
                      <a href="/activities">Browse Activities</a>
                    </Button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MemberBookings;
