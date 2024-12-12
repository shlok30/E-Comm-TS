import { ZodError } from "zod";

export function getValidationError(error : ZodError): string{
    const firstIssue = error.errors[0];
    const field = firstIssue.path[0]; // Path to the field (if applicable)
    const message = firstIssue.message; // Validation message
    return `${field} ${message}`;
}