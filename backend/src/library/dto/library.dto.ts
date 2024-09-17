import {
    IsString,
    IsNumber,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';
import { Status } from '@prisma/client';

export class LibraryDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsEnum(Status)
    status: Status;

    @IsNumber()
    userScore: number;

    @IsNumber()
    volumesProgress: number;

    @IsNumber()
    chaptersProgress: number;

    @IsString()
    notes: string;
}
