import React, { useEffect, useState } from 'react';
import { Calendar, Activity, CreditCard, Clock, Dumbbell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Booking } from '@/types';
import { getMemberBookings } from '@/services/members';
import { Link } from 'react-router-dom';

const MemberDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const bookingsData = await getMemberBookings();
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Member Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your fitness journey.</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button asChild variant="outline">
            <Link to="/activities">Browse Classes</Link>
          </Button>
          <Button asChild>
            <Link to="/bookings/new">Book Activity</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                bookings.filter(b => b.status === 'upcoming').length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Classes you've scheduled
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Stats</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                bookings.filter(b => b.status === 'completed').length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Completed activities this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div> : 
                'No active plan'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              No active membership
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : 
                0
              }
            </div>
            <Progress value={0} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              0% of membership remaining
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your next scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center p-3 h-16 rounded-md bg-gray-100 animate-pulse">
                    <div className="w-full">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bookings.filter(b => b.status === 'upcoming').length > 0 ? (
              <div className="space-y-4">
                {bookings
                  .filter(b => b.status === 'upcoming')
                  .slice(0, 5)
                  .map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-gym-secondary text-white p-2 rounded mr-3">
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{booking.activity?.name}</h4>
                          <p className="text-sm text-gray-500">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/bookings/${booking.id}`}>
                          <span className="sr-only">View booking</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No upcoming bookings.</p>
                <Button asChild className="mt-4">
                  <Link to="/activities">Browse Activities</Link>
                </Button>
              </div>
            )}
            
            {bookings.filter(b => b.status === 'upcoming').length > 5 && (
              <div className="mt-4 text-center">
                <Button variant="link" asChild>
                  <Link to="/bookings">View all bookings</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recommended For You</CardTitle>
            <CardDescription>Activities you might enjoy</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center p-3 h-16 rounded-md bg-gray-100 animate-pulse">
                    <div className="w-full">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
