import React from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useMall } from "../../context/MallContext";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants/roles";

// New component: previously there was no UI anywhere for an owner with
// multiple malls to choose which one they're currently managing. Every
// list/dashboard page either silently showed nothing (because no mallId
// was ever sent) or, before the multi-mall backend fix, showed whatever
// single mall happened to be on the user's stale token.
const MallSelector = () => {
  const { user } = useAuth();
  const { malls, activeMall, activeMallId, setActiveMallId, loading } = useMall();

  // Only MALL_OWNER ever needs to choose between multiple malls. Other
  // roles are bound to exactly one mall and don't see this control.
  if (user?.role !== ROLES.MALL_OWNER) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
        <Building2 className="w-4 h-4 animate-pulse" />
        Loading malls...
      </div>
    );
  }

  if (malls.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
        <Building2 className="w-4 h-4" />
        No malls yet
      </div>
    );
  }

  if (malls.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        <Building2 className="w-4 h-4" />
        {malls[0].name}
      </div>
    );
  }

  return (
    <div className="relative">
      <label htmlFor="mall-selector" className="sr-only">
        Select active mall
      </label>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
        <select
          id="mall-selector"
          value={activeMallId || ""}
          onChange={(e) => setActiveMallId(e.target.value)}
          className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer pr-6"
        >
          {malls.map((mall) => (
            <option key={mall._id} value={mall._id}>
              {mall.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 -ml-6 pointer-events-none" />
      </div>
      {activeMall?.status === "PENDING" && (
        <p className="absolute top-full left-0 mt-1 text-xs text-amber-600 whitespace-nowrap">
          Pending platform approval
        </p>
      )}
    </div>
  );
};

export default MallSelector;
