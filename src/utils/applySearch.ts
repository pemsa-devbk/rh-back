import { SelectQueryBuilder } from "typeorm";
import { SearchDTO } from "../Dto/pagination.dto";
import { ColumnConfig, ColumnTypeMap, Operators } from '../types/search_type';
import { operatorsByType } from "./operatorsByType";
import dayjs from '../utils/dayjs'

export const applySearch = <T extends object>(
  query: SelectQueryBuilder<T>,
  search: SearchDTO,
  columnTypes: ColumnTypeMap<T>
): SelectQueryBuilder<T> => {
  const { search: searchValue, searchKey, dateFrom, dateTo } = search;

  if (!searchKey) return query;

  const columnConfig: ColumnConfig | undefined =
    columnTypes[searchKey as keyof T];

  // Si la columna no está registrada en el mapa, la ignoramos
  if (!columnConfig) return query;

  const { type, alias } = columnConfig;
  const field = `${alias}.${searchKey}`; // alias viene del mapa, no del parámetro

  switch (type) {
    case "text": {
      if (!searchValue) break;

      query.andWhere(`${field} LIKE :search`, {
        search: `%${searchValue}%`,
      });
      break;
    }

    case "number": {
      if (!searchValue) break;

      const parsed = Number(searchValue);

      if (isNaN(parsed)) {
        throw new Error(`El valor "${searchValue}" no es un número válido`);
      }

      query.andWhere(`${field} = :search`, { search: parsed });
      break;
    }

    case "date": {
      if (dateFrom && dateTo) {
        query.andWhere(`CAST(${field} AS DATE) BETWEEN :dateFrom AND :dateTo`, {
          dateFrom,
          dateTo,
        });
        break;
      }

      if (dateFrom) {
        query.andWhere(`CAST(${field} AS DATE) >= :dateFrom`, { dateFrom });
        break;
      }

      if (dateTo) {
        query.andWhere(`CAST(${field} AS DATE) <= :dateTo`, { dateTo });
        break;
      }

      break;
    }

    case "boolean": {
      if (!searchValue) break;

      const validValues = ["true", "false", "1", "0"];

      if (!validValues.includes(searchValue.toLowerCase())) {
        throw new Error(`El valor "${searchValue}" no es un booleano válido`);
      }

      const parsed = searchValue === "true" || searchValue === "1";

      query.andWhere(`${field} = :search`, { search: parsed });
      break;
    }
  }

  return query;
};

type QueryParams = Record<string, string | string[] | undefined>;

export const applyQueryFilters2 = <T>(queryBuilder: SelectQueryBuilder<T>, query: QueryParams, columns: Record<string, ColumnConfig>) => {
  let parameterIndex = 0;

  const getParameterName = (key: string) => {
    return `filter_${key}_${parameterIndex++}`;
  };

  const getValueParam = (value: QueryParams[string]): string | undefined => {
    if (typeof value === "string") {
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





export function applyQueryFilters<T>(queryBuilder: SelectQueryBuilder<T>, query: QueryParams, columns: Record<string, ColumnConfig>): SelectQueryBuilder<T> {
  let parameterIndex = 0;

  const getParameterName = (key: string) => {
    return `filter_${key}_${parameterIndex++}`;
  };

  const getValue = (value: QueryParams[string]): string | undefined => {
    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }

    return undefined;
  };

  const parseNumber = (value: string, key: string): number => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      throw new Error(`El parámetro "${key}" debe ser numérico.`);
    }

    return number;
  };

  const parseBoolean = (value: string, key: string): boolean => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    throw new Error(`El parámetro "${key}" debe ser true o false.`);
  };

  const addWhere = (
    condition: string,
    parameters: Record<string, unknown> = {}
  ) => {
    queryBuilder.andWhere(condition, parameters);
  };

  for (const [key, config] of Object.entries(columns)) {
    const value = getValue(query[key]);

    if (value === undefined || value === "") {
      continue;
    }

    switch (config.type) {
      case "text": {
        if (!config.operators.includes("like")) {
          continue;
        }

        const parameter = getParameterName(key);

        addWhere(
          `${config.column} LIKE :${parameter}`,
          {
            [parameter]: `%${value}%`,
          }
        );

        break;
      }

      case "number": {
        if (config.operators.includes("eq")) {
          const parameter = getParameterName(key);

          addWhere(
            `${config.column} = :${parameter}`,
            {
              [parameter]: parseNumber(value, key),
            }
          );
        }

        break;
      }

      case "boolean": {
        if (!config.operators.includes("eq")) {
          continue;
        }

        const parameter = getParameterName(key);

        addWhere(
          `${config.column} = :${parameter}`,
          {
            [parameter]: parseBoolean(value, key),
          }
        );

        break;
      }

      case "enum": {
        if (config.operators.includes("eq")) {
          const parameter = getParameterName(key);

          addWhere(
            `${config.column} = :${parameter}`,
            {
              [parameter]: value,
            }
          );
        }

        break;
      }

      case "date": {
        applyDateFilter(
          queryBuilder,
          query,
          key,
          config,
          getValue,
          getParameterName
        );

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
  } else { // * prueba de mes
    if (!dayjs(value, 'MM', true).isValid()) return; // Formato no correcta o fecha incorrecta
    addWhere(`MONTH(${config.column}) = :${parameter}`, { [parameter]: +value });
  }

}