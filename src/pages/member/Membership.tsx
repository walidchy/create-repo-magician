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

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const getMembershipPrice = (membership: any) => {
    // Try multiple ways to get the price
    if (membership.price !== undefined) return membership.price;
    if (membership.membership_plan?.price !== undefined) return membership.membership_plan.price;
    return 0;
  };

  const isSubscribed = (membershipId: number) => {
    return activeMemberships.some(m => {
      if (m.id === membershipId) return true;
      
      if (m.membership_plan && typeof m.membership_plan === 'object') {
        return m.membership_plan.id === membershipId;
      }
      
      return false;
    });
  };

  const getMembershipCategory = (index: number, membership: Membership) => {
    if (membership.category) return membership.category.toUpperCase();
    
    const categories = ['BASIC', 'STANDARD', 'PREMIUM'];
    return categories[index % categories.length];
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'premium':
        return 'bg-red-100 text-red-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const isPopularPlan = (index: number) => index === 1;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Plans</h1>
            <p className="text-gray-600">Choose a membership that fits your fitness goals</p>
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
                    <Card key={`current-${membership.id}`} className="relative border-2 border-blue-500">
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg font-semibold">
                          {membership.name || (membership.membership_plan && membership.membership_plan.name) || 'Membership'}
                        </CardTitle>
                        <div className="text-3xl font-bold text-gray-900">
                          {formatPrice(getMembershipPrice(membership))}
                          <span className="text-base font-normal text-gray-500">/mo</span>
                        </div>
                        <CardDescription>
                          Valid until: {new Date(membership.end_date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">
                          {membership.description || (membership.membership_plan && membership.membership_plan.description) || 'Your active membership plan'}
                        </p>
                        
                        <ul className="space-y-2">
                          {Array.isArray(membership.features) && membership.features.length > 0 ? (
                            membership.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))
                          ) : membership.membership_plan && Array.isArray(membership.membership_plan.features) ? (
                            membership.membership_plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="flex items-center text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              <span>Standard membership benefits</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" variant="outline" disabled>
                          Current Plan
                        </Button>
                      </CardFooter>
                    </Card>
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
                  {paginatedMemberships.map((membership, index) => {
                    const category = getMembershipCategory(index, membership);
                    const isPopular = isPopularPlan(index);
                    
                    return (
                      <Card 
                        key={membership.id} 
                        className={`relative ${isPopular ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'} ${!membership.is_active ? 'opacity-60' : ''}`}
                      >
                        <div className="absolute top-4 right-4">
                          <Badge className={getCategoryColor(category)}>
                            {category}
                          </Badge>
                        </div>
                        
                        {isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                          </div>
                        )}
                        
                        <CardHeader className="text-center pb-2">
                          <CardTitle className="text-lg font-semibold">{membership.name}</CardTitle>
                          <div className="text-3xl font-bold text-gray-900">
                            {formatPrice(membership.price)}
                            <span className="text-base font-normal text-gray-500">/mo</span>
                          </div>
                          <CardDescription>
                            Perfect for {category.toLowerCase()} fitness needs
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-gray-600 mb-4">{membership.description}</p>
                          
                          <ul className="space-y-2">
                            {Array.isArray(membership.features) && membership.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        
                        <CardFooter>
                          <Button
                            className={`w-full ${
                              !membership.is_active ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                              isSubscribed(membership.id) ? 'bg-white text-primary hover:bg-gray-50 border border-primary' : 
                              isPopular ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                            onClick={() => membership.is_active && !isSubscribed(membership.id) && handleSubscribe(membership)}
                            disabled={!membership.is_active || isSubscribed(membership.id)}
                            variant={isSubscribed(membership.id) ? 'outline' : 'default'}
                          >
                            {isSubscribed(membership.id) ? 'Current Plan' : 
                              membership.is_active ? 'Get started →' : 'Currently Unavailable'}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
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
