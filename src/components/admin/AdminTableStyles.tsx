
import React from 'react';
import { cn } from '@/lib/utils';

export const AdminTableContainer = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const AdminTableHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn("bg-slate-50 p-4 border-b border-slate-200 grid font-medium text-xs uppercase text-slate-500 tracking-wider", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const AdminTableRow = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn("p-4 border-b border-slate-100 grid items-center transition-colors hover:bg-slate-50", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const StatusBadge = ({ 
  status, 
  className 
}: { 
  status: 'active' | 'inactive' | 'maintenance' | 'featured' | 'beginner' | 'intermediate' | 'advanced' | 'available' | 'in_use' | 'retired'
  className?: string 
}) => {
  const variants = {
    active: "bg-green-100 text-green-800",
    available: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    maintenance: "bg-orange-100 text-orange-800",
    featured: "bg-purple-100 text-purple-800",
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-amber-100 text-amber-800",
    advanced: "bg-red-100 text-red-800",
    in_use: "bg-blue-100 text-blue-800",
    retired: "bg-red-100 text-red-800",
  };

  const labels = {
    active: "Active",
    available: "Available",
    inactive: "Inactive",
    maintenance: "Maintenance",
    featured: "Featured",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    in_use: "In Use",
    retired: "Retired",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
      variants[status],
      className
    )}>
      {labels[status]}
    </span>
  );
};

export const ActionButton = ({
  variant = 'view',
  onClick,
  className,
  ...props
}: {
  variant: 'view' | 'edit' | 'delete'
  onClick?: () => void
  className?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>) => {
  const variants = {
    view: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    edit: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    delete: "bg-red-100 text-red-700 hover:bg-red-200",
  };

  return (
    <button
      className={cn(
        "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
        variants[variant],
        className
      )}
      onClick={onClick}
      {...props}
    />
  );
};

export const AdminPageHeader = ({
  title,
  description,
  actionButton,
}: {
  title: string
  description: string
  actionButton?: React.ReactNode
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500">{description}</p>
      </div>
      {actionButton}
    </div>
  );
};

export const AdminSearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}) => {
  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      <input
        type="search"
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
      />
    </div>
  );
};

export const FilterTabs = ({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap",
            value === option.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export const ActionButtons = ({
  onView,
  onEdit,
  onDelete
}: {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      {onView && (
        <ActionButton variant="view" onClick={onView} title="View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </ActionButton>
      )}
      {onEdit && (
        <ActionButton variant="edit" onClick={onEdit} title="Edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          </svg>
        </ActionButton>
      )}
      {onDelete && (
        <ActionButton variant="delete" onClick={onDelete} title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"></path>
          </svg>
        </ActionButton>
      )}
    </div>
  );
};

export const PageControls = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6 justify-between items-start lg:items-center">
      {children}
    </div>
  );
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        className={cn(
          "px-3 py-2 text-sm border border-slate-200 rounded-md transition-colors",
          currentPage === 1
            ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
            : "bg-white text-slate-600 hover:bg-slate-50"
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      <span className="px-3 py-2 text-sm text-slate-500">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={cn(
          "px-3 py-2 text-sm border border-slate-200 rounded-md transition-colors",
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400"
            : "bg-white text-slate-600 hover:bg-slate-50"
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};
