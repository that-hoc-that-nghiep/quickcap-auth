import { StatusCodes } from "http-status-codes";
import { z } from "zod";
export class ServiceResponse<T = null> {
  readonly status: number;
  readonly message: string;
  readonly data: T;

  private constructor(message: string, data: T, status: number) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data: T, status: number = StatusCodes.OK) {
    return new ServiceResponse(message, data, status);
  }

  static failure<T>(
    message: string,
    data: T,
    statusCode: number = StatusCodes.BAD_REQUEST
  ) {
    return new ServiceResponse(message, data, statusCode);
  }
}
export const ServiceResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.number(),
    message: z.string(),
    data: dataSchema.optional(),
  });
