export type ColumnType = "text" | "number" | "date" | "boolean" | "enum";
export type Operators = "" | "like" | "eq" | "gt" | "gte" | "lt" | "lte" | "from" | "to" | "day" | "month" | "year" | "in";

export interface ColumnConfig{
  type: ColumnType;
  column: string;
  default: Operators;
}

export interface ColumnConfig2 {
  type: ColumnType;
  alias: string; 
}

export type ColumnTypeMap<T extends object> = Partial<Record<keyof T | string, ColumnConfig>>;