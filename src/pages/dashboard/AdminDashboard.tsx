import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Dumbbell, CreditCard, Wrench, TrendingUp, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard: React.FC = () => {
  // This would normally fetch data from your API
  // For demo purposes, we'll use static data
  
  // Revenue data
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 5000 },
    { name: 'Mar', revenue: 3800 },
    { name: 'Apr', revenue: 7000 },
    { name: 'May', revenue: 6500 },
    { name: 'Jun', revenue: 8000 },
  ];
  
  // Member activity data
  const activityData = [
    { name: 'Mon', visits: 40 },
    { name: 'Tue', visits: 35 },
    { name: 'Wed', visits: 50 },
    { name: 'Thu', visits: 45 },
    { name: 'Fri', visits: 60 },
    { name: 'Sat', visits: 75 },
    { name: 'Sun', visits: 55 },
  ];
  
  // Membership distribution data
  const membershipData = [
    { name: 'Basic', value: 35 },
    { name: 'Standard', value: 45 },
    { name: 'Premium', value: 20 },
  ];
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];
  
  // Recent activities
  const recentActivities = [
    { id: 1, type: 'membership', description: 'New Premium membership purchased', time: '2 hours ago' },
    { id: 2, type: 'booking', description: 'HIIT Class fully booked', time: '3 hours ago' },
    { id: 3, type: 'equipment', description: 'Treadmill #3 reported as broken', time: '5 hours ago' },
    { id: 4, type: 'member', description: 'New member registration', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your gym operations.</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+4.3% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+2 new this month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,980</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <div className="flex items-center pt-1 text-xs text-amber-500">
              <span>3 items need maintenance</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#457B9D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Member Activity</CardTitle>
            <CardDescription>Daily gym visits for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Visits']} />
                  <Line type="monotone" dataKey="visits" stroke="#E63946" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
            <CardDescription>Current active membership types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Members']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-8 mt-4">
              {membershipData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className={`
                      p-2 rounded-full mr-3
                      ${activity.type === 'membership' && 'bg-blue-100 text-blue-600'}
                      ${activity.type === 'booking' && 'bg-green-100 text-green-600'}
                      ${activity.type === 'equipment' && 'bg-amber-100 text-amber-600'}
                      ${activity.type === 'member' && 'bg-purple-100 text-purple-600'}
                    `}>
                      {activity.type === 'membership' && <CreditCard className="h-4 w-4" />}
                      {activity.type === 'booking' && <Calendar className="h-4 w-4" />}
                      {activity.type === 'equipment' && <Wrench className="h-4 w-4" />}
                      {activity.type === 'member' && <Users className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link to="/admin/activities">View All Activities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Activities</CardTitle>
            <CardDescription>Classes with highest attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">HIIT Training</p>
                  <p className="text-sm text-gray-500">95% attendance</p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gym-primary h-2.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Spinning</p>
                  <p className="text-sm text-gray-500">88% attendance</p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gym-primary h-2.5 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Yoga</p>
                  <p className="text-sm text-gray-500">82% attendance</p>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gym-primary h-2.5 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Equipment Maintenance</CardTitle>
            <CardDescription>Items that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-md">
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <p className="font-medium">Treadmill #3</p>
                    <p className="text-xs text-gray-500">Reported: 5 hours ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-md">
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <p className="font-medium">Rowing Machine #2</p>
                    <p className="text-xs text-gray-500">Reported: 1 day ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-md">
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-amber-500 mr-2" />
                  <div>
                    <p className="font-medium">Weight Rack #5</p>
                    <p className="text-xs text-gray-500">Reported: 2 days ago</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
