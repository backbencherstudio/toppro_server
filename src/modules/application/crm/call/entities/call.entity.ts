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
  duration: string;
  assignee_id: string;
  description: string;
  result: string;

  constructor(partial: Partial<CallEntity>) {
    Object.assign(this, partial);
  }
}