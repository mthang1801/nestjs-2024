import { MenuFunction, User } from "@app/common/schemas";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UserProfileEntity extends User{
  @ApiPropertyOptional()
  menu: MenuFunction[]
}
