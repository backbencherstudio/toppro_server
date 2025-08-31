// src/calls/entities/call.entity.ts
import { Call } from '@prisma/client';

export class CallEntity implements Call {
  id: string;
  created_at: Date;
  updated_at: Date;
  workspace_id: string;
  owner_id: string;
  lead_id: string;
  subject: string;
  call_type: 'INBOUND' | 'OUTBOUND';
  duration: string | null;
  assignee_id: string | null;
  description: string | null;
  result: string | null;

  constructor(partial: Partial<CallEntity>) {
    // Initialize all required fields with default values
    this.id = partial.id || '';
    this.created_at = partial.created_at || new Date();
    this.updated_at = partial.updated_at || new Date();
    this.workspace_id = partial.workspace_id || '';
    this.owner_id = partial.owner_id || '';
    this.lead_id = partial.lead_id || '';
    this.subject = partial.subject || '';
    this.call_type = partial.call_type || 'OUTBOUND';
    
    // Initialize optional fields with null if not provided
    this.duration = partial.duration ?? null;
    this.assignee_id = partial.assignee_id ?? null;
    this.description = partial.description ?? null;
    this.result = partial.result ?? null;
  }
}