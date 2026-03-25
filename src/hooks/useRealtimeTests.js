"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * useRealtimeTests — accepts optional pre-fetched initial data from server,
 * falls back to client fetch, and subscribes to Supabase Realtime for live updates.
 *
 * @param {string} type - "reading" | "listening" | "writing"
 * @param {Array} initialData - Pre-fetched tests from server component (optional)
 * @returns {{ tests: Array, loading: boolean, error: string|null }}
 */
export function useRealtimeTests(type, initialData = null) {
  const [tests, setTests] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  // Fetch (or re-fetch) the full test list via the API route
  const fetchTests = useCallback(async () => {
    try {
      const res = await fetch(`/api/tests?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setTests(data);
        setError(null);
      } else {
        setError("Failed to fetch tests");
      }
    } catch (err) {
      console.error(`[useRealtimeTests] Error fetching ${type} tests:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    // 1. Only fetch if no initial data was provided
    if (!initialData) {
      fetchTests();
    }

    // 2. Subscribe to Supabase Realtime on the "Tests" table
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-tests-${type}`)
      .on(
        "postgres_changes",
        {
          event: "*",            // INSERT, UPDATE, DELETE
          schema: "public",
          table: "Tests",
          filter: `type=eq.${type}`,
        },
        (payload) => {
          console.log(`[Realtime] ${type} tests changed:`, payload.eventType);
          // Re-fetch the full list to get fresh data
          fetchTests();
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, fetchTests, initialData]);

  return { tests, loading, error };
}

export default useRealtimeTests;
