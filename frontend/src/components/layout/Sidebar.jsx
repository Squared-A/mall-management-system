import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, ChevronsLeft, ChevronsRight, Building2, X } from 'lucide-react';
import clsx from 'clsx';
import { NAV_ITEMS } from '../../routes/navConfig';
import { useAuth } from '../../hooks/useAuth';
import { toggleSidebar, closeMobileSidebar } from '../../store/slices/uiSlice';
import { APP_NAME } from '../../constants';

const SidebarLink = ({ item, collapsed }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="mt-1 ml-8 space-y-1 border-l border-gray-100 dark:border-gray-800 pl-3">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end
                className={({ isActive }) =>
                  clsx(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'text-primary-600 font-medium bg-primary-50 dark:bg-primary-500/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
};

const SidebarContent = ({ collapsed, onToggleCollapse, isMobile }) => {
  const { role } = useAuth();
  const dispatch = useDispatch();

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="truncate text-base font-bold text-gray-900 dark:text-gray-50">{APP_NAME}</span>
          )}
        </div>
        {isMobile ? (
          <button
            onClick={() => dispatch(closeMobileSidebar())}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {visibleItems.map((item) => (
          <SidebarLink key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4">
          <div className="rounded-xl bg-primary-50 dark:bg-primary-500/10 p-3 text-xs text-primary-700 dark:text-primary-300">
            <p className="font-semibold">Need help?</p>
            <p className="mt-1 text-primary-600/80 dark:text-primary-300/80">
              Check our documentation or contact support for assistance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector((state) => state.ui);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex lg:flex-col border-r border-gray-100 dark:border-gray-800 bg-sidebar-light dark:bg-sidebar-dark transition-all duration-200 shrink-0',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-64'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} onToggleCollapse={() => dispatch(toggleSidebar())} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => dispatch(closeMobileSidebar())}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar-light dark:bg-sidebar-dark shadow-2xl animate-slideIn">
            <SidebarContent collapsed={false} isMobile />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
