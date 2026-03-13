import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useConvexQuery = (action, ...args) => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await action(...args);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          toast.error(err.message || "An error occurred");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [action, JSON.stringify(args)]);

  return {
    data,
    isLoading,
    error,
  };
};

export const useConvexMutation = (action) => {
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      // Handle the case where the argument is an object or standard args
      const response = await action(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err);
      toast.error(err.message || "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, data, isLoading, error };
};
