/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState, useCallback } from 'react';

/*
 * The useRequest hook accepts a request function and returns an object with
 * five values:
 *   request: a function to call to invoke the request
 *   result: the value returned from the request function (once invoked)
 *   isLoading: boolean state indicating whether the request is in active/in flight
 *   error: any caught error resulting from the request
 *   setValue: setter to explicitly set the result value
 *
 * The hook also accepts an optional second parameter which is a default
 * value to set as result before the first time the request is made.
 */
export default function useRequest(makeRequest, initialValue) {
  const [result, setResult] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(initialValue?.isLoading || false);
  // const isMounted = useIsMounted();

  return {
    result,
    error,
    isLoading,
    request: useCallback(
      async (...args) => {
        setIsLoading(true);
        try {
          const response = await makeRequest(...args);
          // if (isMounted.current) {
          setResult(response);
          //   setError(null);
          // }
        } catch (err) {
          // if (isMounted.current) {
          setError(err);
          setResult(initialValue);
          // }
        } finally {
          // if (isMounted.current) {
          setIsLoading(false);
          // }
        }
      },
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
      [makeRequest]
    ),
    setValue: setResult,
  };
}

/*
 * Provides controls for "dismissing" an error message
 *
 * Params: an error object
 * Returns: { error, dismissError }
 *   The returned error object is the same object passed in via the paremeter,
 *   until the dismissError function is called, at which point the returned
 *   error will be set to null on the subsequent render.
 */
export function useDismissableError(error) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  return {
    error: showError ? error : null,
    dismissError: () => {
      setShowError(false);
    },
  };
}

/*
 * Hook to assist with deletion of items from a paginated item list. The page
 * url will be navigated back one page on a paginated list if needed to prevent
 * the UI from re-loading an empty set and displaying a "No items found"
 * message.
 *
 * Params: a callback function that will be invoked in order to delete items,
 *   and an object with structure { qsConfig, allItemsSelected, fetchItems }
 * Returns: { isLoading, deleteItems, deletionError, clearDeletionError }
 */
export function useDeleteItems(makeRequest, { qsConfig = null, fetchItems = null } = {}) {
  const { error: requestError, isLoading, request } = useRequest(makeRequest, null);
  const { error, dismissError } = useDismissableError(requestError);

  const deleteItems = async () => {
    await request();
    if (!qsConfig) {
      return;
    }

    fetchItems();
  };

  return {
    isLoading,
    deleteItems,
    deletionError: error,
    clearDeletionError: dismissError,
  };
}
