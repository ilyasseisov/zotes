/**
 * Enhanced fetch handler for making API requests in Next.js applications
 * Includes pre-configured abort controller support and retry mechanism
 *
 * @param url The URL to fetch from
 * @param options Optional fetch options
 * @returns Promise with the parsed response data
 */
export async function fetchHandler<T>(
  url: string,
  options?: RequestInit & {
    timeout?: number;
    retry?:
      | {
          attempts?: number;
          delay?: number;
          backoffFactor?: number;
        }
      | boolean;
    useAbortController?: boolean;
  }
): Promise<T> {
  // Deep clone the options to avoid modifying the original
  const fetchOptions = { ...options };

  // Set defaults
  const timeout = fetchOptions.timeout ?? 10000; // Default 10 seconds

  // Handle retry configuration
  let retryConfig: { attempts: number; delay: number; backoffFactor: number };

  if (fetchOptions.retry === undefined) {
    // Default retry behavior - 1 retry with 300ms delay
    retryConfig = { attempts: 1, delay: 300, backoffFactor: 2 };
  } else if (fetchOptions.retry === true) {
    // Enable default retry behavior
    retryConfig = { attempts: 1, delay: 300, backoffFactor: 2 };
  } else if (fetchOptions.retry === false) {
    // Disable retry
    retryConfig = { attempts: 0, delay: 0, backoffFactor: 1 };
  } else {
    // Use provided retry config with defaults for missing values
    retryConfig = {
      attempts: fetchOptions.retry.attempts ?? 1,
      delay: fetchOptions.retry.delay ?? 300,
      backoffFactor: fetchOptions.retry.backoffFactor ?? 2,
    };
  }

  // Clean up internal properties from the fetch options
  delete fetchOptions.timeout;
  delete fetchOptions.retry;
  delete fetchOptions.useAbortController;

  // Setup abort controller (default to true unless explicitly disabled)
  const useAbortController =
    options?.useAbortController !== false && !fetchOptions.signal;
  const controller = useAbortController ? new AbortController() : null;
  const signal = fetchOptions.signal || controller?.signal;

  if (signal) {
    fetchOptions.signal = signal;
  }

  // Set timeout if controller is available
  const timeoutId = controller
    ? setTimeout(() => {
        controller.abort(`Request timed out after ${timeout}ms`);
      }, timeout)
    : null;

  // Retry logic implementation
  const executeWithRetry = async (attempt: number = 0): Promise<T> => {
    try {
      // Default options merged with provided options
      const defaultOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...fetchOptions,
      };

      // Make the API request
      const response = await fetch(url, defaultOptions);

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        // Extract error message if available
        const errorData = await response.json().catch(() => ({}));

        // Create an error with relevant information
        const error = new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      // Parse and return the JSON response
      // For empty responses (like 204 No Content), return empty object
      const data = await response.json().catch(() => ({}));
      return data as T;
    } catch (error) {
      // Clear timeout if exists
      if (timeoutId) clearTimeout(timeoutId);

      // If we have retries left and it's not an abort error, retry
      if (
        attempt < retryConfig.attempts &&
        !(error instanceof DOMException && error.name === 'AbortError')
      ) {
        // Calculate backoff time
        const backoffTime =
          retryConfig.delay * Math.pow(retryConfig.backoffFactor, attempt);

        // Log retry attempt
        console.info(
          `Retrying request to ${url} (${attempt + 1}/${
            retryConfig.attempts
          }) after ${backoffTime}ms`
        );

        // Wait for backoff period
        await new Promise((resolve) => setTimeout(resolve, backoffTime));

        // Retry request
        return executeWithRetry(attempt + 1);
      }

      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`Fetch error: ${error.message}`);
      }

      // For unknown errors
      throw new Error('An unknown error occurred during fetch');
    }
  };

  try {
    // Execute the request with retry logic
    return await executeWithRetry();
  } finally {
    // Clear timeout if it exists
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// Usage examples:
/*
// Basic usage - will use all defaults (timeout: 10s, retry: 1 attempt)
const data = await fetchHandler<UserData>('/api/users/1');

// Disable retry
const data = await fetchHandler<UserData>('/api/users/1', { retry: false });

// Enable retry with default values
const data = await fetchHandler<UserData>('/api/users/1', { retry: true });

// Custom retry configuration
const data = await fetchHandler<UserData>('/api/users/1', { 
  retry: { attempts: 3, delay: 500 } // backoffFactor defaults to 2
});

// Disable abort controller
const data = await fetchHandler<UserData>('/api/users/1', { useAbortController: false });

// Custom abort controller
const controller = new AbortController();
const data = await fetchHandler<UserData>('/api/users/1', { signal: controller.signal });
// Note: When providing a custom signal, the timeout option won't apply

// POST request with default error handling
const response = await fetchHandler<ApiResponse>('/api/resource', {
  method: 'POST',
  body: JSON.stringify({ name: 'New Resource' })
});
*/
