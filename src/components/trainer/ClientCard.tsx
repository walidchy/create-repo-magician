
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Member } from '@/types';

interface ClientCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (memberId: number) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ member, onEdit, onDelete }) => {
  const hasActiveMembership = (member: Member): boolean => {
    if (member.membership?.is_active) {
      return true;
    }
    return member.memberships?.some(m => m.is_active) || false;
  };

  const getMembershipEndDate = (member: Member): string => {
    if (member.membership?.end_date) {
      return member.membership.end_date;
    }
    
    if (member.memberships && member.memberships.length > 0) {
      const sortedMemberships = [...member.memberships].sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      );
      return sortedMemberships[0].end_date;
    }
    
    return '-';
  };

  const getMembershipName = (member: Member): string => {
    if (member.membership) {
      return `Plan #${member.membership.membership_plan_id}`;
    }
    
    if (member.memberships && member.memberships.length > 0) {
      const latestMembership = [...member.memberships].sort((a, b) => 
        new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      )[0];
      return latestMembership.membership_plan?.name || `Plan #${latestMembership.id}`;
    }
    
    return 'No membership';
  };

  const isActive = hasActiveMembership(member);
  const membershipEndDate = getMembershipEndDate(member);
  const membershipName = getMembershipName(member);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <Badge 
          variant={isActive ? 'default' : 'secondary'}
          className={`text-xs font-medium px-2 py-1 ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Badge>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(member)}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(member.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Avatar and Basic Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="h-12 w-12 mb-3 bg-blue-100">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="text-blue-600 font-semibold">
            {member.name?.substring(0, 2).toUpperCase() || 'NA'}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
        <p className="text-sm text-gray-500">{member.email}</p>
      </div>

      {/* Membership Info */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="text-center">
          <p className="text-sm font-medium text-blue-800">{membershipName}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">PHONE</span>
          <span className="text-gray-900">{member.phone || 'Not provided'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">MEMBER SINCE</span>
          <span className="text-gray-900">
            {membershipEndDate !== '-' ? 
              new Date(membershipEndDate).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
