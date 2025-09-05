import { IsNotEmpty, IsString } from "class-validator";

export class CreateDiscussionDto {
    @IsString()
    @IsNotEmpty()
    lead_id: string;

    @IsNotEmpty()
    @IsString()
    content: string;

}