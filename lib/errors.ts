export class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'RequestError';
  }
}

// 404
export class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// 403
export class ForbiddenError extends RequestError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

// 401
export class UnauthorizedError extends RequestError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

// 503
export class ServiceUnavailableError extends RequestError {
  constructor(message: string = 'Service unavailable') {
    super(503, message);
    this.name = 'ServiceUnavailableError';
  }
}

// 500
export class InternalServerError extends RequestError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
    this.name = 'InternalServerError';
  }
}
