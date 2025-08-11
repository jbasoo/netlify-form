import z from "zod";

const requiredMessage = 'This field is required';

export const SubmissionSchema = z.object({
  email: z.email().min(1, { message: requiredMessage }),
  firstName: z.string().min(1, { message: requiredMessage }),
  lastName: z.string().min(1, { message: requiredMessage }),
  message: z.string().min(1, { message: requiredMessage }),
});