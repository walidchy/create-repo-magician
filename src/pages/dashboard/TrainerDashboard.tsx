
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrainerDashboard: React.FC = () => {
  // This would normally fetch data from your API
  // For demo purposes, we'll use static data
  const upcomingClasses = [
    { id: 1, name: 'HIIT Training', time: '10:00 AM', date: 'Mon, Apr 7', attendees: 12, location: 'Studio A' },
    { id: 2, name: 'Yoga Basics', time: '2:30 PM', date: 'Mon, Apr 7', attendees: 8, location: 'Studio B' },
    { id: 3, name: 'Strength Training', time: '5:00 PM', date: 'Tue, Apr 8', attendees: 15, location: 'Main Floor' },
  ];
  
  const clients = [
    { id: 1, name: 'Jane Cooper', progress: 80, lastSession: '2 days ago', nextSession: 'Tomorrow, 10:00 AM' },
    { id: 2, name: 'Wade Warren', progress: 65, lastSession: '1 week ago', nextSession: 'Wed, Apr 9, 3:30 PM' },
    { id: 3, name: 'Esther Howard', progress: 90, lastSession: 'Yesterday', nextSession: 'Fri, Apr 11, 2:00 PM' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trainer Dashboard</h1>
          <p className="text-muted-foreground">Manage your sessions and clients from here.</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button asChild variant="outline">
            <Link to="/trainer/schedule">View Schedule</Link>
          </Button>
          <Button asChild>
            <Link to="/trainer/activities/new">Create Activity</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Classes scheduled for today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5</div>
            <p className="text-xs text-muted-foreground">
              Hours of scheduled training
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Clients currently training with you
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Session attendance rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((activity) => (
                <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <h4 className="font-medium">{activity.name}</h4>
                    <p className="text-sm text-gray-500">{activity.date} at {activity.time}</p>
                    <p className="text-sm text-gray-500">{activity.location}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center">
                    <div className="flex items-center mr-4">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm">{activity.attendees}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/trainer/activities/${activity.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/trainer/schedule">View Full Schedule</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Client Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="p-4 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{client.name}</h4>
                    <span className="text-sm bg-green-100 text-green-800 py-0.5 px-2 rounded-full">
                      {client.progress}% progress
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gym-secondary h-2.5 rounded-full" 
                      style={{ width: `${client.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Last: {client.lastSession}</span>
                    <span>Next: {client.nextSession}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/trainer/clients">Manage All Clients</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="text-center">
                <div className="font-medium mb-2">{day}</div>
                <div className={`py-1 px-2 rounded-full text-xs font-semibold ${index < 5 ? 'bg-gym-secondary/15 text-gym-secondary' : 'bg-gray-100 text-gray-500'}`}>
                  {index < 5 ? `${index + 2} classes` : 'Off'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Most Popular Class</h3>
              <p className="text-lg font-bold">High-Intensity Interval Training</p>
              <p className="text-sm text-gray-500">Average 15 attendees per session</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Class Feedback</h3>
              <p className="text-lg font-bold">4.8 / 5</p>
              <p className="text-sm text-gray-500">Average rating from 24 sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainerDashboard;
