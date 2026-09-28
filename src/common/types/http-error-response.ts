export type HttpErrorResponse = Readonly<{
  statusCode: number;
  code: string;
  message: string;
  details: readonly unknown[];
  path: string;
  timestamp: string;
  requestId: string;
}>;
