
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Check, User, Clock, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkInUser } from '@/services/attendance';
import { toast } from 'sonner';

const CheckInForm = () => {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const checkInMutation = useMutation({
    mutationFn: () => checkInUser({
      user_id: parseInt(userId),
      verification_method: 'manual',
    }),
    onSuccess: () => {
      toast.success('User checked in successfully');
      navigate('/admin/attendances');
    },
    onError: (error) => {
      toast.error('Failed to check in user');
      console.error('Check-in error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkInMutation.mutate();
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-medium text-gray-700">User ID *</Label>
            <Input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Verification Method</Label>
            <div className="p-3 border border-gray-200 rounded-md flex items-center gap-2 bg-gray-50">
              <Hand className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700">Manual</span>
            </div>
            <p className="text-xs text-gray-500">Manual verification is the only method available.</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/attendances')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={checkInMutation.isPending}
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 gap-2"
            >
              {checkInMutation.isPending ? 'Processing...' : (
                <>
                  <Check className="h-4 w-4" />
                  Check In
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInForm;
