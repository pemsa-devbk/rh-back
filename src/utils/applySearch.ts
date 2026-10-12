import { SelectQueryBuilder } from "typeorm";
import { ColumnConfig, Operators } from '../types/search_type';
import { operatorsByType } from "./operatorsByType";
import dayjs from '../utils/dayjs'

type QueryParams = Record<string, string | string[] | undefined>;

export const applyQueryFilters = <T>(queryBuilder: SelectQueryBuilder<T>, query: QueryParams, columns: Record<string, ColumnConfig>) => {
  let parameterIndex = 0;

  const getParameterName = (key: string) => {
    return `filter_${key}_${parameterIndex++}`;
  };

  const getValueParam = (value: QueryParams[string]): string | undefined => {
    if (typeof value === "string") {
      console.log(value);
      // if(value === "NULL")
      return value;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
    return undefined;
  };

  const addWhere = (condition: string, parameters: Record<string, unknown> = {}) => {
    queryBuilder.andWhere(condition, parameters);
  };

  const getFilter = (key: string, config: ColumnConfig): Array<[string, Operators]> => {
    const operators = operatorsByType[config.type];
    const filters: Array<[string, Operators]> = [];
    for (const operator of operators) {
      const queryKey = `${key}${operator.charAt(0).toUpperCase()}${operator.slice(1)}`;
      const value = getValueParam(query[queryKey]);
      if (value === undefined || value === "") {
        continue;
      }
      filters.push([value, operator]);
    }
    const defaultValue = getValueParam(query[key]);

    if (defaultValue !== undefined && defaultValue !== "") filters.push([defaultValue, config.default]);

    return filters;
  }


  for (const [key, config] of Object.entries(columns)) {

    // * Obtener las coincidencias 
    const filters = getFilter(key, config);

    for (const [value, operator] of filters) {
      if (value === undefined || value === "") continue;
      const parameter = getParameterName(`${key}_${operator}`);

      switch (config.type) {
        case 'text':
          applyTextFilter(addWhere, config, operator, value, parameter)
          break;
        case 'number':
          applyNumberFilter(addWhere, config, operator, value, parameter);
          break;
        case 'boolean':
          if (value !== "true" && value !== "false") return;
          const boolValue = value === "true";
          addWhere(`${config.column} = :${parameter}`, { [parameter]: boolValue })
          break;
        case 'enum':// TODO Implementar (se puede ocupar text y number)
          applyEnumFilter(addWhere, config, operator, value, parameter);
          break;
        case 'date':
          applyDateFilter(addWhere, config, operator, value, parameter);
          break;
      }
    }

  }
  return queryBuilder;
}



const applyTextFilter = (
  addWhere: (condition: string, parameters?: Record<string, unknown>) => void,
  config: ColumnConfig,
  operator: Operators,
  value: string,
  parameter: string
) => {
  switch (operator) {
    case 'in':
      const values = value.split(',').map(value => value.trim()).filter(Boolean);
      if (values.length === 0) break;
      addWhere(`${config.column} IN (:...${parameter})`, { [parameter]: values })
      break;
    case 'like':
      addWhere(`${config.column} LIKE :${parameter}`, { [parameter]: `%${value}%` })
      break;
    case 'eq':
      addWhere(`${config.column} = :${parameter}`, { [parameter]: value })
      break;
  }
}

const applyNumberFilter = (
  addWhere: (condition: string, parameters?: Record<string, unknown>) => void,
  config: ColumnConfig,
  operator: Operators,
  value: string,
  parameter: string
) => {
  if (operator === "in") {
    const values = value.split(',').map(v => Number(v));
    if (values.some(Number.isNaN)) return; // * Hay valores no númericos
    if (values.length === 0) return; // * Sin valores
    addWhere(`${config.column} IN (:...${parameter})`, { [parameter]: values })
    return;
  }

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return; // No es numero

  const operators: Partial<Record<Operators, string>> = {
    eq: "=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
  };

  const sqlOperator = operators[operator];

  if (!sqlOperator) return;


  addWhere(`${config.column} ${sqlOperator} :${parameter}`, { [parameter]: numberValue, });
};

const applyEnumFilter = (
  addWhere: (condition: string, parameters?: Record<string, unknown>) => void,
  config: ColumnConfig,
  operator: Operators,
  value: string,
  parameter: string
) => {

}

const applyDateFilter = (
  addWhere: (condition: string, parameters?: Record<string, unknown>) => void,
  config: ColumnConfig,
  operator: Operators,
  value: string,
  parameter: string
) => {
  if (['eq', 'from', 'to'].includes(operator)) { // * fechas completas 
    if (!dayjs(value, 'YYYY-MM-DD', true).isValid()) return; // Formato no correcta o fecha incorrecta
    const operators: Partial<Record<Operators, string>> = {
      eq: "=",
      from: ">=",
      to: "<="
    };
    const sqlOperator = operators[operator];
    if (!sqlOperator) return;
    addWhere(`CAST(${config.column} AS DATE) ${sqlOperator} :${parameter}`, { [parameter]: value });
  } else { 
    switch (operator) {
      case 'day':
        const day = Number(value);
        if (!Number.isInteger(day) || day < 1 || day > 31) return;
        addWhere(`DAY(${config.column}) = :${parameter}`, { [parameter]: day });
        break;
      case 'month':
        const month = Number(value);
        if (!Number.isInteger(month) || month < 1 || month > 12) return;
        addWhere(`MONTH(${config.column}) = :${parameter}`, { [parameter]: month });
        break;
      case 'year':
        const year = Number(value);
        if (!Number.isInteger(year) || year < 1 ) return;
        addWhere(`YEAR(${config.column}) = :${parameter}`, { [parameter]: year });
        break;
    }
  }

}