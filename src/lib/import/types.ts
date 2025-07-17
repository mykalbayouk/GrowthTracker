import { ImportedAccount } from '../types';

export interface ImportResult {
  accounts: ImportedAccount[];
  errors: ImportError[];
  warnings: ImportWarning[];
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ImportWarning {
  row: number;
  column: string;
  message: string;
  severity: 'warning';
}

export interface CSVTemplate {
  name: string;
  columns: ColumnMapping[];
  sampleData: Record<string, string>[];
}

export interface ColumnMapping {
  csvColumn: string;
  accountField: keyof ImportedAccount;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'enum';
  enumValues?: string[];
}

export interface CSVParserOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  header?: boolean;
  transformHeader?: (header: string) => string;
}

export interface ImportStats {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
}
