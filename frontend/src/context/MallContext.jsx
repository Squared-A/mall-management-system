import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { mallApi } from "../api/mallApi";
import { useAuth } from "./AuthContext";
import { storage } from "../utils/storage";
import { ROLES } from "../constants/roles";

const ACTIVE_MALL_KEY = "mms_active_mall_id";

const MallContext = createContext(null);

export const MallProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [malls, setMalls] = useState([]);
  const [activeMallId, setActiveMallIdState] = useState(() =>
    storage.get(ACTIVE_MALL_KEY),
  );
  const [loading, setLoading] = useState(false);

  const isMultiMallRole = user?.role === ROLES.MALL_OWNER;
  const isAdmin = user?.role === ROLES.SUPER_ADMIN;
  const ownerHasOnlyPendingMalls =
    isMultiMallRole &&
    user?.hasApprovedMall === false &&
    ((user?.mallIds?.length || 0) > 0 || (user?.malls?.length || 0) > 0);

  const setActiveMallId = useCallback((id) => {
    setActiveMallIdState(id);
    if (id) storage.set(ACTIVE_MALL_KEY, id);
    else storage.remove(ACTIVE_MALL_KEY);
  }, []);

  const refreshMalls = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!isMultiMallRole && !isAdmin) return;

    if (ownerHasOnlyPendingMalls) {
      setMalls([]);
      setActiveMallId(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await mallApi.getAll();
      const list = data?.data || [];
      const visibleMalls = isMultiMallRole
        ? list.filter((mall) => mall.status === "APPROVED")
        : list;
      setMalls(visibleMalls);

      setActiveMallIdState((prev) => {
        const stillValid = prev && visibleMalls.some((m) => m._id === prev);
        if (stillValid) return prev;
        const fallback = visibleMalls[0]?._id || null;
        if (fallback) storage.set(ACTIVE_MALL_KEY, fallback);
        return fallback;
      });
    } catch (err) {
      console.error("Failed to load malls:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isMultiMallRole, isAdmin, ownerHasOnlyPendingMalls, setActiveMallId]);

  useEffect(() => {
    refreshMalls();
    // Clear mall state on logout
    if (!isAuthenticated) {
      setMalls([]);
      setActiveMallId(null);
    }
  }, [isAuthenticated, user?.id, refreshMalls, setActiveMallId]);

  const activeMall = useMemo(
    () => malls.find((m) => m._id === activeMallId) || null,
    [malls, activeMallId],
  );

  const effectiveMallId =
    isMultiMallRole || isAdmin ? activeMallId : user?.mallId;

  const value = {
    malls,
    activeMall,
    activeMallId: effectiveMallId,
    setActiveMallId,
    refreshMalls,
    loading,
    needsMallSelection: isMultiMallRole && malls.length > 0 && !activeMallId,
    hasNoMalls: isMultiMallRole && !loading && malls.length === 0,
    hasPendingApproval: ownerHasOnlyPendingMalls,
  };

  return <MallContext.Provider value={value}>{children}</MallContext.Provider>;
};

export const useMall = () => {
  const ctx = useContext(MallContext);
  if (!ctx) throw new Error("useMall must be used within a MallProvider");
  return ctx;
};

