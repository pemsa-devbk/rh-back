import { ColumnType, Operators } from "../types/search_type";

export const operatorsByType: Record<ColumnType, Operators[]> = {
  text: ["like", "eq", "in"],
  number: ["eq", "gt", "gte", "lt", "lte", "in"],
  boolean: ["eq"],
  enum: ["eq", "in"],
  date: ["eq", "from", "to", "day", "month", "year"],
};