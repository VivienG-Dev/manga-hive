import {
    IsString,
    IsNumber,
    IsEnum,
    IsNotEmpty,
} from 'class-validator';
// import { Status } from '@prisma/client';

// Define the Status enum locally
export enum Status {
    READING = 'READING',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    DROPPED = 'DROPPED',
    PLAN_TO_READ = 'PLAN_TO_READ'
}

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
