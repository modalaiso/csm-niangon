export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const originalWrite = process.stdout.write;
    const originalErrorWrite = process.stderr.write;

    // List of sensitive fields to redact
    const redactOutput = (text: string): string => {
      let redacted = text;
      
      // Redact password patterns
      redacted = redacted.replace(/"password":"([^"]*)"/g, '"password":"*********"');
      redacted = redacted.replace(/password":"([^"]*)"/g, 'password":"*********"');
      redacted = redacted.replace(/password=([^\s,}]*)/g, 'password=*********');
      
      // Redact accessKey patterns
      redacted = redacted.replace(/"accessKey":"([^"]*)"/g, '"accessKey":"*********"');
      redacted = redacted.replace(/accessKey":"([^"]*)"/g, 'accessKey":"*********"');
      
      // Redact token patterns
      redacted = redacted.replace(/"token":"([^"]*)"/g, '"token":"*********"');
      
      return redacted;
    };

    process.stdout.write = function (chunk: any, ...args: any[]) {
      const text = typeof chunk === 'string' ? chunk : chunk?.toString() || '';
      const redacted = redactOutput(text);
      return originalWrite.call(process.stdout, redacted, ...args);
    } as any;

    process.stderr.write = function (chunk: any, ...args: any[]) {
      const text = typeof chunk === 'string' ? chunk : chunk?.toString() || '';
      const redacted = redactOutput(text);
      return originalErrorWrite.call(process.stderr, redacted, ...args);
    } as any;
  }
}
