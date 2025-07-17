import Papa from 'papaparse';
import { ImportResult, ImportError, ImportWarning, CSVParserOptions } from './types';
import { ImportedAccount } from '../types';
import { validateImportData } from './validator';
import { mapCSVToAccounts } from './dataMapper';

export class CSVParser {
  async parseFile(file: File, options?: CSVParserOptions): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const defaultOptions: CSVParserOptions = {
        delimiter: ',',
        skipEmptyLines: true,
        header: true,
        transformHeader: (header: string) => header.trim(),
        ...options
      };

      Papa.parse<Record<string, string>>(file, {
        header: defaultOptions.header,
        skipEmptyLines: defaultOptions.skipEmptyLines,
        delimiter: defaultOptions.delimiter,
        transformHeader: defaultOptions.transformHeader,
        complete: (results) => {
          try {
            const importResult = this.processParseResults(results);
            resolve(importResult);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  private processParseResults(results: Papa.ParseResult<Record<string, string>>): ImportResult {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Handle Papa Parse errors
    if (results.errors.length > 0) {
      results.errors.forEach((error, index) => {
        errors.push({
          row: error.row || index + 1,
          column: 'unknown',
          message: error.message,
          severity: 'error'
        });
      });
    }

    // Validate and map data
    const validationErrors = validateImportData(results.data);
    errors.push(...validationErrors.filter((e: ImportError) => e.severity === 'error'));
    warnings.push(...validationErrors.filter((e: ImportError) => e.severity === 'warning').map((e: ImportError) => ({
      row: e.row,
      column: e.column,
      message: e.message,
      severity: 'warning' as const
    })));

    // Map to accounts (only valid rows)
    const accounts = mapCSVToAccounts(results.data, errors);

    return {
      accounts,
      errors,
      warnings
    };
  }

  validateData(data: Record<string, string>[]): ImportError[] {
    return validateImportData(data);
  }

  mapToAccounts(data: Record<string, string>[]): ImportedAccount[] {
    return mapCSVToAccounts(data, []);
  }
}

export const csvParser = new CSVParser();
