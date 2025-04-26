import { NextResponse } from 'next/server';
import { RequestError } from '../errors';
// import logger from '../logger';

export type ResponseType = 'api' | 'server';

// error msg format
const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === 'api'
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = 'server') => {
  if (error instanceof RequestError) {
    // logger.error(
    //   { err: error },
    //   `${responseType.toUpperCase()} Error: ${error.message}`
    // );
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors
    );
  }

  if (error instanceof Error) {
    // logger.error(error.message);
    return formatResponse(responseType, 500, error.message);
  }

  // logger.error({ err: error }, 'An unexpected error occurred');
  return formatResponse(responseType, 500, 'An unexpected error occurred');
};

export default handleError;

// usage
// const testError = async () => {
//   try {
//     throw new RequestError(400, 'Bad request');
//   } catch (error) {
//     return handleError(error);
//     // return error;
//     // return 'error';
//   }
// };
