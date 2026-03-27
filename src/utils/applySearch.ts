import { SelectQueryBuilder } from "typeorm";
import { SearchDTO } from "../Dto/pagination.dto";
import { ColumnConfig, ColumnTypeMap } from "../types/search_type";

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