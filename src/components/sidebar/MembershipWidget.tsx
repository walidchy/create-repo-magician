
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, ChevronRight, CalendarClock } from 'lucide-react';
import { getMyMembership } from '@/services/membership';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MembershipWidget = () => {
  const [membershipData, setMembershipData] = useState<{
    current_active_membership: any;
    all_active_memberships: any[];
    has_current_active: boolean;
    expires_in_days: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const data = await getMyMembership();
        setMembershipData(data);
      } catch (error) {
        console.error('Error fetching membership:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembership();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 border-t mt-auto">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gym-primary mr-2" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </div>
    );
  }

  if (!membershipData || !membershipData.has_current_active) {
    return (
      <div className="p-4 border-t mt-auto">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 text-gym-primary mr-2" />
            No Active Membership
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Subscribe to a membership plan to enjoy our premium facilities.
          </p>
          <Link to="/membership" className="mt-2 text-xs text-gym-secondary flex items-center hover:underline">
            View plans
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  const { current_active_membership, expires_in_days } = membershipData;

  return (
    <div className="p-4 border-t mt-auto">
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 text-gym-primary mr-2" />
            Current Membership
          </h3>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>
        
        <p className="mt-1 text-sm font-medium text-gray-800">
          {current_active_membership.membership_plan.name}
        </p>
        
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <CalendarClock className="h-3 w-3 mr-1" />
          <span>
            {expires_in_days > 1 
              ? `Expires in ${Math.floor(expires_in_days)} days` 
              : expires_in_days === 1 
                ? 'Expires tomorrow' 
                : 'Expires today'}
          </span>
        </div>
        
        <Link to="/membership" className="mt-2 text-xs text-gym-secondary flex items-center hover:underline">
          Manage membership
          <ChevronRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default MembershipWidget;
