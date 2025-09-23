// src/bank-account/dto/update-bank-account.dto.ts
export class UpdateBankAccountDto {
  bank_type?: string;
  holder_name?: string;
  bank_name?: string;
  account_number?: string;
  opening_balance?: number;
  contact_number?: string;
  bank_branch?: string;
  swift?: string;
  bank_address?: string;
  status?: string;
  user_id?: string;
  workspace_id?: string;
  owner_id?: string;
}
