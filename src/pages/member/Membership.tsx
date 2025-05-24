
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, Badge as BadgeIcon, Check } from 'lucide-react';
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
import { Membership } from '@/types';
import { getMemberships, subscribeMembership, getMyMembership } from '@/services/membership';
import { getMemberMemberships } from '@/services/members';
import MainLayout from '@/components/layout/MainLayout';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { PaymentForm } from '@/components/member/PaymentForm';

const Memberships: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const itemsPerPage = 6;
  const queryClient = useQueryClient();

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ['memberships', statusFilter],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('is_active', statusFilter);
      return getMemberships(queryParams.toString());
    }
  });

  const { data: myMembershipsData = null, isLoading: myMembershipsLoading } = useQuery({
    queryKey: ['myMemberships'],
    queryFn: async () => {
      try {
        const result = await getMyMembership();
        return result || [];
      } catch (error) {
        const backupResult = await getMemberMemberships();
        return backupResult || [];
      }
    }
  });

  const activeMemberships = useMemo(() => {
    if (!myMembershipsData) return [];
    
    if (typeof myMembershipsData === 'object' && 'all_active_memberships' in myMembershipsData) {
      return myMembershipsData.all_active_memberships;
    }
    
    return myMembershipsData as Membership[];
  }, [myMembershipsData]);

  const subscribeMutation = useMutation({
    mutationFn: (membershipId: number) => subscribeMembership(membershipId),
    onSuccess: () => {
      toast.success('Successfully subscribed to membership!');
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'member'] });
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe to membership');
    }
  });

  const handleSubscribe = (membership: Membership) => {
    setSelectedMembership(membership);
  };

  const filteredMemberships = memberships.filter(membership => {
    const searchLower = searchQuery.toLowerCase();
    return (
      membership.name.toLowerCase().includes(searchLower) ||
      membership.description.toLowerCase().includes(searchLower) ||
      membership.category?.toLowerCase().includes(searchLower)
    );
  });

  const paginatedMemberships = filteredMemberships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  const isSubscribed = (membershipId: number) => {
    return activeMemberships.some(m => {
      if (m.id === membershipId) return true;
      
      if (m.membership_plan && typeof m.membership_plan === 'object') {
        return m.membership_plan.id === membershipId;
      }
      
      return false;
    });
  };

  return (
    <MainLayout>
      <style>
        {`
        .membership-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: box-shadow 0.2s ease;
          position: relative;
        }
        
        .membership-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .membership-card.featured {
          border-color: #6366f1;
          border-width: 2px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }
        
        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-active {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .status-featured {
          background: #ddd6fe;
          color: #6d28d9;
        }
        
        .membership-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        
        .membership-price {
          font-size: 2rem;
          font-weight: 700;
          color: #6366f1;
          margin-bottom: 0.25rem;
        }
        
        .membership-duration {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .membership-description {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .features-list {
          list-style: none;
          margin-bottom: 2rem;
        }
        
        .features-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: #374151;
        }
        
        .check-icon {
          width: 16px;
          height: 16px;
          color: #10b981;
          flex-shrink: 0;
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
        `}
      </style>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="section-title">Membership Plans</h1>
            <p className="text-muted-foreground">Choose a membership that fits your fitness goals</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="dumbbell-logo">
              <div className="dumbbell-bar"></div>
              <div className="dumbbell-weight left"></div>
              <div className="dumbbell-weight right"></div>
            </div>
          </div>
        </div>

        {selectedMembership ? (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedMembership(null)}
              className="mb-4"
            >
              ← Back to Memberships
            </Button>
            <PaymentForm 
              membershipPlanId={selectedMembership.id}
              amount={selectedMembership.price.toString()}
              onSuccess={() => setSelectedMembership(null)}
            />
          </div>
        ) : (
          <div>
            {activeMemberships.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Your Current Memberships</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeMemberships.map((membership) => (
                    <div key={`current-${membership.id}`} className="membership-card featured">
                      <div className="status-badge status-active">Active</div>
                      <h3 className="membership-title">
                        {membership.name || (membership.membership_plan && membership.membership_plan.name) || 'Membership'}
                      </h3>
                      <div className="membership-price">
                        {formatPrice(membership.price || 0)}
                      </div>
                      <div className="membership-duration">
                        Valid until: {new Date(membership.end_date).toLocaleDateString()}
                      </div>
                      <p className="membership-description">
                        {membership.description || (membership.membership_plan && membership.membership_plan.description) || 'Your active membership plan'}
                      </p>
                      
                      <ul className="features-list">
                        {Array.isArray(membership.features) && membership.features.length > 0 ? (
                          membership.features.map((feature, idx) => (
                            <li key={idx}>
                              <Check className="check-icon" size={16} />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : membership.membership_plan && Array.isArray(membership.membership_plan.features) ? (
                          membership.membership_plan.features.map((feature, idx) => (
                            <li key={idx}>
                              <Check className="check-icon" size={16} />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : (
                          <li>
                            <Check className="check-icon" size={16} />
                            <span>Standard membership benefits</span>
                          </li>
                        )}
                      </ul>
                      
                      <Button className="w-full bg-white text-primary hover:bg-gray-50 border border-primary" disabled>
                        Current Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memberships..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={statusFilter === '' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('')}
                  size="sm"
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === 'true' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('true')}
                  size="sm"
                >
                  Active
                </Button>
                <Button 
                  variant={statusFilter === 'false' ? 'default' : 'outline'} 
                  onClick={() => setStatusFilter('false')}
                  size="sm"
                >
                  Inactive
                </Button>
              </div>
            </div>

            {membershipsLoading || myMembershipsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : filteredMemberships.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMemberships.map((membership, index) => (
                    <div 
                      key={membership.id} 
                      className={`membership-card ${index === 1 ? 'featured' : ''}`}
                    >
                      <div className={`status-badge ${membership.is_active ? 'status-active' : 'status-inactive'}`}>
                        {membership.is_active ? 'Active' : 'Inactive'}
                      </div>
                      
                      <h3 className="membership-title">{membership.name}</h3>
                      <div className="membership-price">{formatPrice(membership.price)}</div>
                      <div className="membership-duration">{Math.floor(membership.duration_days / 30)} months</div>
                      
                      <p className="membership-description">{membership.description}</p>
                      
                      <ul className="features-list">
                        {Array.isArray(membership.features) && membership.features.map((feature, idx) => (
                          <li key={idx}>
                            <Check className="check-icon" size={16} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={`w-full ${
                          !membership.is_active ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                          isSubscribed(membership.id) ? 'bg-white text-primary hover:bg-gray-50 border border-primary' : 
                          index === 1 ? 'bg-primary text-white hover:bg-primary/90' : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                        onClick={() => membership.is_active && !isSubscribed(membership.id) && handleSubscribe(membership)}
                        disabled={!membership.is_active || isSubscribed(membership.id)}
                      >
                        {isSubscribed(membership.id) ? 'Current Plan' : 
                          membership.is_active ? 'Subscribe Now' : 'Currently Unavailable'}
                      </Button>
                    </div>
                  ))}
                </div>
                
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
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No memberships found.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['memberships'] })}
                >
                  Refresh List
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Memberships;
