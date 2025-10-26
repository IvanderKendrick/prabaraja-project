// src/hooks/useAccountCOA.ts
import { useEffect, useState } from "react";

export interface AccountCOA {
  id?: string;
  account_code?: string;
  name?: string;
  // any other fields returned by endpoint
  [key: string]: any;
}

const getAuthToken = () => {
  const authDataRaw = localStorage.getItem("sb-xwfkrjtqcqmmpclioakd-auth-token");
  if (!authDataRaw) throw new Error("No access token found in localStorage");
  const authData = JSON.parse(authDataRaw);
  const token = authData.access_token;
  if (!token) throw new Error("Access token missing in parsed auth data");
  return token;
};

export const useAccountCOA = () => {
  const [data, setData] = useState<AccountCOA[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCoa = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        const url = new URL("https://pbw-backend-api.vercel.app/api/dashboard");
        url.searchParams.set("action", "getAccountCOA");
        const res = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // assume result in json.data or json
        const list: AccountCOA[] = json.data ?? json;
        if (mounted) setData(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Failed to fetch COA");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCoa();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};
