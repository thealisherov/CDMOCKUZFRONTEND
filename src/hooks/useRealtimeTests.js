"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * useRealtimeTests — fetches test list from /api/tests and subscribes
 * to Supabase Realtime so the list updates automatically whenever a
 * row is inserted, updated, or deleted in the "Tests" table.
 *
 * @param {string} type - "reading" | "listening" | "writing"
 * @returns {{ tests: Array, loading: boolean, error: string|null }}
 */
export function useRealtimeTests(type) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    // 1. Initial fetch
    fetchTests();

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
          // Only listen for changes matching our type
          filter: `type=eq.${type}`,
        },
        (payload) => {
          console.log(`[Realtime] ${type} tests changed:`, payload.eventType);
          // Re-fetch the full list so we get correct position-based IDs,
          // user attempts info, and proper metadata extraction
          fetchTests();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to ${type} test changes`);
        }
      });

    // 3. Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, fetchTests]);

  return { tests, loading, error };
}

export default useRealtimeTests;
