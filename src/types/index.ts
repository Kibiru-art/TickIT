// src/types/index.ts

// Problem categories
export type ProblemCategory = 
  | 'Network Issue'
  | 'Computer Support'
  | 'Database Issue'
  | 'General Repair'
  | 'Systems Issue'
  | 'Other';

// Priority levels
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

// Ticket status
export type TicketStatus = 'Reported' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';

// Media attachment type
export type Attachment = {
  id: string;
  uri: string;
  type: 'image' | 'file' | 'screenshot';
  name: string;
  size?: number;
  uploadedAt: Date;
};

// Technician type
export type Technician = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: ProblemCategory[];
  available: boolean;
};

// Main Ticket type
export type Ticket = {
  id: string | number;               // Accept both string and number for flexibility
  ticketNumber: string;             // Auto-generated (e.g., TICK-2024-001)
  title: string;
  description: string;
  category: ProblemCategory;
  priority: Priority;
  status: TicketStatus;
  
  // Client information
  clientName: string;               // Display name (derived from client object)
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  client?: any;                     // Full client object from API (optional)
  
  // Technical details
  deviceType?: string;              // e.g., "Dell XPS 15", "Custom PC", "Server"
  operatingSystem?: string;         // e.g., "Windows 11", "macOS", "Linux"
  errorMessage?: string;
  
  // Attachments (photos of the problem)
  attachments: Attachment[];
  
  // Assignment
  assignedTo?: Technician;
  assignedAt?: Date;
  
  // Timestamps
  createdAt: string | Date;         // Main creation timestamp (alias for created_at)
  created_at?: string;              // Original field from API (optional)
  updatedAt: Date;
  resolvedAt?: Date;
  
  // Notes
  technicianNotes?: string[];
  internalNotes?: string[];
};

// Filter options
export type FilterOptions = {
  status?: TicketStatus[];
  category?: ProblemCategory[];
  priority?: Priority[];
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
};