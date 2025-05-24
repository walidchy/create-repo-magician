import React, { useState, useEffect } from 'react';
import { Filter, Search, CalendarPlus, Clock, MapPin, Dumbbell, UserCheck, UserCircle2, Bookmark, Gauge, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Activity } from '@/types';
import { getActivities, joinActivity } from '@/services/activities';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useQueryClient } from '@tanstack/react-query';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const itemsPerPage = viewMode === 'grid' ? 6 : 5;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchActivities();
  }, [categoryFilter, difficultyFilter]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (difficultyFilter && difficultyFilter !== 'all') queryParams.append('difficulty_level', difficultyFilter);

      const data = await getActivities(queryParams.toString());
      setActivities(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinActivity = async (id: number) => {
    try {
      await joinActivity(id);
      toast.success(`Successfully joined activity!`);
      queryClient.invalidateQueries({ queryKey: ['bookings', 'member'] });
      queryClient.invalidateQueries({ queryKey: ['activities', 'member'] });
    } catch (error) {
      console.error('Error joining activity:', error);
      toast.error('Failed to join activity');
    }
  };

  const filteredActivities = activities.filter(activity => {
    const searchLower = searchQuery.toLowerCase();
    return (
      activity.name.toLowerCase().includes(searchLower) ||
      activity.description?.toLowerCase().includes(searchLower) ||
      activity.location.toLowerCase().includes(searchLower) ||
      (activity.trainer?.name || '').toLowerCase().includes(searchLower)
    );
  });

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const getCategories = () => {
    const categories = new Set(activities.map(activity => activity.category));
    return Array.from(categories);
  };

  const getDifficultyLevels = () => {
    const levels = new Set(activities.map(activity => activity.difficulty_level));
    return Array.from(levels);
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

  return (
    <MainLayout>
      <style>{`
        /* Activity Cards */
        .activity-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
            transition: box-shadow 0.2s ease;
        }

        .activity-card:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .activity-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .activity-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }

        .activity-description {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }

        .difficulty-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            margin-bottom: 1rem;
        }

        .difficulty-beginner {
            background: #dcfce7;
            color: #166534;
        }

        .difficulty-intermediate {
            background: #fef3c7;
            color: #92400e;
        }

        .difficulty-advanced {
            background: #fee2e2;
            color: #991b1b;
        }

        .activity-info {
            margin-bottom: 1.5rem;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: #64748b;
            font-size: 0.9rem;
        }

        .info-icon {
            width: 16px;
            height: 16px;
            color: #6366f1;
        }

        .join-btn {
            width: 100%;
            background: #6366f1;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .join-btn:hover {
            background: #5855eb;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 1.5rem;
        }
        
        .dumbbell-logo {
          position: relative;
          width: 110px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
        }
        
        .dumbbell-bar {
          width: 60px;
          height: 10px;
          background-color: #0e3b5f;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .dumbbell-weight {
          width: 20px;
          height: 50px;
          background-color: #0e3b5f;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .dumbbell-weight.left {
          left: 10px;
        }
        
        .dumbbell-weight.right {
          right: 10px;
        }
      `}</style>
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="section-title">Activities</h1>
            <p className="text-muted-foreground">Find and join activities that match your interests and fitness goals</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="dumbbell-logo">
              <div className="dumbbell-bar"></div>
              <div className="dumbbell-weight left"></div>
              <div className="dumbbell-weight right"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCategoryFilter('all')}>All Categories</DropdownMenuItem>
                {getCategories().map(category => (
                  <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Difficulty
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setDifficultyFilter('all')}>All Levels</DropdownMenuItem>
                {getDifficultyLevels().map(level => (
                  <DropdownMenuItem key={level} onClick={() => setDifficultyFilter(level)}>
                    {level}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 1.5H6.5V6.5H1.5V1.5ZM8.5 1.5H13.5V6.5H8.5V1.5ZM1.5 8.5H6.5V13.5H1.5V8.5ZM8.5 8.5H13.5V13.5H8.5V8.5Z" fill="currentColor" />
              </svg>
              Grid
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3.5H13.5M1.5 7.5H13.5M1.5 11.5H13.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              List
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-primary"></div>
          </div>
        ) : filteredActivities.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedActivities.map((activity) => (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-header">
                      <div>
                        <h3 className="activity-title">{activity.name}</h3>
                        <span className={`difficulty-badge difficulty-${activity.difficulty_level.toLowerCase()}`}>
                          {activity.difficulty_level}
                        </span>
                      </div>
                    </div>
                    
                    <p className="activity-description">{activity.description}</p>
                    
                    <div className="activity-info">
                      <div className="info-item">
                        <Clock className="h-4 w-4 info-icon" />
                        <span>{activity.duration_minutes} minutes</span>
                      </div>
                      <div className="info-item">
                        <MapPin className="h-4 w-4 info-icon" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="info-item">
                        <UserCheck className="h-4 w-4 info-icon" />
                        <span>Max {activity.max_participants} people</span>
                      </div>
                      {activity.trainer?.name && (
                        <div className="info-item">
                          <UserCircle2 className="h-4 w-4 info-icon" />
                          <span>{activity.trainer.name}</span>
                        </div>
                      )}
                      {activity.equipment_needed && (
                        <div className="info-item">
                          <Dumbbell className="h-4 w-4 info-icon" />
                          <span>{parseEquipment(activity.equipment_needed)}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="join-btn"
                      onClick={() => handleJoinActivity(activity.id)}
                    >
                      Join Activity
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedActivities.map((activity) => (
                  <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{activity.name}</h3>
                            <span className={`difficulty-badge difficulty-${activity.difficulty_level.toLowerCase()}`}>
                              {activity.difficulty_level}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mt-3">{activity.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="space-y-2">
                            <div className="info-item">
                              <Clock className="h-4 w-4 info-icon" />
                              <span>{activity.duration_minutes} minutes</span>
                            </div>
                            <div className="info-item">
                              <MapPin className="h-4 w-4 info-icon" />
                              <span>{activity.location}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {activity.equipment_needed && (
                              <div className="info-item">
                                <Dumbbell className="h-4 w-4 info-icon" />
                                <span>{parseEquipment(activity.equipment_needed)}</span>
                              </div>
                            )}
                            <div className="info-item">
                              <UserCheck className="h-4 w-4 info-icon" />
                              <span>Max {activity.max_participants} people</span>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-end md:justify-end">
                            <Button
                              onClick={() => handleJoinActivity(activity.id)}
                              className="join-btn"
                            >
                              Join Activity
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No activities found.</p>
            <Button variant="outline" className="mt-4" onClick={fetchActivities}>
              Refresh List
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Activities;
