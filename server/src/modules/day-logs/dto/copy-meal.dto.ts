import {
  IsArray,
  IsDateString,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class CopyMealDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsDateString({}, { each: true })
  targetDates: string[];
}
