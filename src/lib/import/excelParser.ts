import * as ExcelJS from 'exceljs';
import { ImportResult, ImportError, ImportWarning } from './types';
import { validateImportData } from './validator';
import { mapCSVToAccounts } from './dataMapper';

export class ExcelParser {
  async parseFile(file: File): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    
    try {
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      
      // Get the first worksheet
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file');
      }

      // Convert worksheet to CSV-like data format
      const data = this.convertWorksheetToData(worksheet);
      
      // Process the data similar to CSV
      return this.processData(data);
    } catch (error) {
      throw new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertWorksheetToData(worksheet: ExcelJS.Worksheet): Record<string, string>[] {
    const data: Record<string, string>[] = [];
    const headers: string[] = [];
    
    // Get headers from the first row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.text?.trim() || `Column${colNumber}`;
    });

    // Process data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      const rowData: Record<string, string> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          // Convert cell value to string
          let value = '';
          if (cell.value !== null && cell.value !== undefined) {
            if (cell.value instanceof Date) {
              value = cell.value.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            } else if (typeof cell.value === 'object' && 'text' in cell.value) {
              value = cell.value.text;
            } else {
              value = cell.value.toString();
            }
          }
          rowData[header] = value.trim();
        }
      });
      
      // Only add row if it has some data
      if (Object.values(rowData).some(value => value !== '')) {
        data.push(rowData);
      }
    });

    return data;
  }

  private processData(data: Record<string, string>[]): ImportResult {
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];

    // Validate and map data
    const validationErrors = validateImportData(data);
    errors.push(...validationErrors.filter((e: ImportError) => e.severity === 'error'));
    warnings.push(...validationErrors.filter((e: ImportError) => e.severity === 'warning').map((e: ImportError) => ({
      row: e.row,
      column: e.column,
      message: e.message,
      severity: 'warning' as const
    })));

    // Map to accounts (only valid rows)
    const accounts = mapCSVToAccounts(data, errors);

    return {
      accounts,
      errors,
      warnings
    };
  }
}

export const excelParser = new ExcelParser();
