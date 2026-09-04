import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGetScamTrendsQueryKey, useGetScamTrends } from "@workspace/api-client-react";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HistoryItem, ScanResult, ScanType, ScamTrend } from "@/src/types";
import { LOCAL_SCAM_TRENDS, OFFICIAL_SOURCE_LABEL } from "@/src/data/scams";

const HISTORY_KEY = "@scamguard/history";
const TRENDS_KEY = "@scamguard/trends";

interface AppContextValue {
  history: HistoryItem[];
  trends: ScamTrend[];
  trendsUpdatedAt: string | null;
  trendsSource: string;
  isOffline: boolean;
  isUpdatingTrends: boolean;
  addScan: (type: ScanType, result: ScanResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateTrends: () => Promise<boolean>;
  checkConnectivity: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [trends, setTrends] = useState<ScamTrend[]>(LOCAL_SCAM_TRENDS);
  const [trendsUpdatedAt, setTrendsUpdatedAt] = useState<string | null>(null);
  const [trendsSource, setTrendsSource] = useState("Offline database");
  const [isOffline, setIsOffline] = useState(false);
  const [isUpdatingTrends, setIsUpdatingTrends] = useState(false);
  const trendsQuery = useGetScamTrends({ query: { enabled: false, queryKey: getGetScamTrendsQueryKey() } });

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(HISTORY_KEY), AsyncStorage.getItem(TRENDS_KEY)]).then(([storedHistory, storedTrends]) => {
      if (storedHistory) {
        try { setHistory(JSON.parse(storedHistory) as HistoryItem[]); } catch { setHistory([]); }
      }
      if (storedTrends) {
        try {
          const parsed = JSON.parse(storedTrends) as { trends: ScamTrend[]; updatedAt: string; source: string };
          if (parsed.trends?.length) {
            setTrends(parsed.trends);
            setTrendsUpdatedAt(parsed.updatedAt);
            setTrendsSource(parsed.source);
          }
        } catch { setTrends(LOCAL_SCAM_TRENDS); }
      }
    }).catch(() => undefined);
  }, []);

  const checkConnectivity = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api/healthz`, { method: "GET" });
      setIsOffline(!response.ok);
    } catch {
      setIsOffline(true);
    }
  }, []);

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 60000);
    return () => clearInterval(interval);
  }, [checkConnectivity]);

  const addScan = useCallback(async (type: ScanType, result: ScanResult) => {
    const next: HistoryItem[] = [{ ...result, id: makeId(), type, createdAt: new Date().toISOString() }, ...history].slice(0, 50);
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [history]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const updateTrends = useCallback(async () => {
    setIsUpdatingTrends(true);
    try {
      const data = await trendsQuery.refetch();
      if (!data.data?.trends?.length) throw new Error("No data");
      setTrends(data.data.trends);
      setTrendsUpdatedAt(data.data.updatedAt);
      setTrendsSource(data.data.sourceLabel);
      setIsOffline(false);
      await AsyncStorage.setItem(TRENDS_KEY, JSON.stringify({ trends: data.data.trends, updatedAt: data.data.updatedAt, source: data.data.sourceLabel }));
      return true;
    } catch {
      await checkConnectivity();
      return false;
    } finally {
      setIsUpdatingTrends(false);
    }
  }, [checkConnectivity, trendsQuery]);

  const value = useMemo(() => ({ history, trends, trendsUpdatedAt, trendsSource, isOffline, isUpdatingTrends, addScan, clearHistory, updateTrends, checkConnectivity }), [history, trends, trendsUpdatedAt, trendsSource, isOffline, isUpdatingTrends, addScan, clearHistory, updateTrends, checkConnectivity]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}

export { OFFICIAL_SOURCE_LABEL };