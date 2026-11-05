import { IsIn } from 'class-validator';
import { CATALOG_DEPARTMENTS, CatalogDepartment } from '../catalog-departments';

export class CatalogDepartmentParamDto {
  @IsIn(CATALOG_DEPARTMENTS)
  department!: CatalogDepartment;
}
