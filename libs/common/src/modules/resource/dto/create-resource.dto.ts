import { AbstractCreateDto } from "@app/shared/abstract/dto/abstract-create.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateResourceDto extends AbstractCreateDto {
  @IsNotEmpty()
  @IsString()
  name : string 

  permissions: string[];
}