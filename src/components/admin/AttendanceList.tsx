
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Check, X, Clock, Calendar, Search, Filter, User, ChevronLeft, 
  ChevronRight, QrCode, Smartphone, Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAttendances, checkOutUser } from '@/services/attendance';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const AttendanceList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendances', { statusFilter, searchQuery, currentPage }],
    queryFn: () => getAttendances({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery,
      page: currentPage
    }),
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutUser,
    onSuccess: () => {
      refetch();
    },
  });

  const getStatusBadge = (attendance: any) => {
    if (attendance.check_out_time) {
      return <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Checked Out</span>;
    }
    
    switch (attendance.status) {
      case 'late':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Late</span>;
      case 'excused':
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Excused</span>;
      default:
        return <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Present</span>;
    }
  };

  const getVerificationBadge = (method: string | null) => {
    const getIcon = () => {
      switch (method) {
        case 'qr_code':
          return '📱';
        case 'nfc':
          return '🏷️';
        case 'manual':
          return '🔐';
        default:
          return '❓';
      }
    };

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
        {getIcon()} {method || 'Unknown'}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-blue-600 mb-1">Attendance Records</h2>
          <p className="text-gray-600">Track and manage user attendance</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-72"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => navigate('/admin/attendances/check-in')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Manual Check-In
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data?.data?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <User className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No attendance records found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              {searchQuery ? 'No matches for your search' : 'No attendance records available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-blue-600 text-white">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-500 hover:bg-blue-700">
                  <TableHead className="font-medium text-white">User</TableHead>
                  <TableHead className="font-medium text-white">Status</TableHead>
                  <TableHead className="font-medium text-white">Check-In</TableHead>
                  <TableHead className="font-medium text-white">Check-Out</TableHead>
                  <TableHead className="font-medium text-white">Method</TableHead>
                  <TableHead className="font-medium text-white">Location</TableHead>
                  <TableHead className="font-medium text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <Table>
            <TableBody>
              {data?.data?.map((attendance) => (
                <TableRow key={attendance.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium text-blue-600">{attendance.user.name}</div>
                      <div className="text-sm text-gray-500">{attendance.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(attendance)}
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-700">
                      {formatDateTime(attendance.check_in_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {attendance.check_out_time ? (
                      <div className="text-gray-700">
                        {formatDateTime(attendance.check_out_time)}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getVerificationBadge(attendance.verification_method)}
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-700">
                      {attendance.location || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!attendance.check_out_time && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => checkOutMutation.mutate(attendance.id)}
                          disabled={checkOutMutation.isPending}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {data?.last_page || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === data?.last_page} 
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
