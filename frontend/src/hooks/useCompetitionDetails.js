import { useCallback, useEffect, useState } from 'react';
import { fetchCompetition, registerForCompetition, uploadSubmission } from '../api/competitionApi';

/**
 * Owns the full lifecycle of loading a competition + reacting to actions
 * that change server state (register, upload). After any mutating action
 * we simply refetch, because the server is the single source of truth for
 * spots remaining / lifecycle state / participation state - the client
 * never computes or optimistically guesses these values.
 */
export function useCompetitionDetails(idOrSlug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionPending, setActionPending] = useState(false);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCompetition(idOrSlug);
      setData(result);
      if (result?.serverTime) {
        setServerTimeOffsetMs(new Date(result.serverTime).getTime() - Date.now());
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load competition');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    load();
  }, [load]);

  const register = useCallback(
    async (referralCode) => {
      setActionPending(true);
      try {
        const result = await registerForCompetition(idOrSlug, referralCode);
        setData(result);
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err?.response?.data?.message || 'Registration failed' };
      } finally {
        setActionPending(false);
      }
    },
    [idOrSlug]
  );

  const submit = useCallback(
    async (file) => {
      setActionPending(true);
      try {
        const result = await uploadSubmission(idOrSlug, file);
        setData(result);
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err?.response?.data?.message || 'Upload failed' };
      } finally {
        setActionPending(false);
      }
    },
    [idOrSlug]
  );

  return { data, loading, error, actionPending, refetch: load, register, submit };
}
