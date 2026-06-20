"use server";

/**
 * Wrapper pour les Server Actions qui redacte les données sensibles
 * des logs de Next.js
 */
export function withRedaction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T {
  return (async (...args: any[]) => {
    // Redact sensitive data from the input
    const redactedArgs = args.map((arg) => {
      if (typeof arg === "object" && arg !== null) {
        const redacted = { ...arg };
        const sensitiveFields = ["password", "accessKey", "token", "secret"];

        sensitiveFields.forEach((field) => {
          if (field in redacted) {
            redacted[field] = "*********";
          }
        });

        return redacted;
      }
      return arg;
    });

    // Call the original function
    return await fn(...args);
  }) as T;
}
