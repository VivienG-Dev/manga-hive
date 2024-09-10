import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';

export class UserDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  backgroundImageUrl: string;

  @IsBoolean()
  private: boolean;
}
