export type ColumnType = "text" | "number" | "date" | "boolean";

export interface ColumnConfig {
  type: ColumnType;
  alias: string; 
}

export type ColumnTypeMap<T extends object> = Partial<Record<keyof T | string, ColumnConfig>>;