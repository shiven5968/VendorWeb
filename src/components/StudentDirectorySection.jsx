import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, Search, Filter, ChevronLeft, ChevronRight, RefreshCw, 
  GraduationCap, ShieldCheck, Mail, Award, Building2, AlertCircle
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorState, DashboardCard } from './ui';
import { clsx } from 'clsx';

const PAGE_SIZE = 25;

export const StudentDirectorySection = () => {
  const { fetchStaffDirectoryUsers } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [hostelFilter, setHostelFilter] = useState('all');

  // Pagination state (cursor stack for back/forward navigation)
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorStack, setCursorStack] = useState([null]); // stack of cursors: index 0 is null (page 1)
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Debounce search input
  const searchTimeoutRef = useRef(null);

  const loadPage = useCallback(async (pageNumber, cursorToUse, currentSearch, currentRole, currentHostel) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchStaffDirectoryUsers({
        pageSize: PAGE_SIZE,
        cursor: cursorToUse,
        role: currentRole === 'all' ? null : currentRole,
        hostelBlock: currentHostel === 'all' ? null : currentHostel,
        searchQuery: currentSearch
      });

      setUsers(result.users || []);
      setNextCursor(result.nextCursor || null);
      setHasMore(Boolean(result.hasMore));
      setCurrentPage(pageNumber);
    } catch (err) {
      console.error('[StudentDirectorySection] Load error:', err);
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setLoading(false);
    }
  }, [fetchStaffDirectoryUsers]);

  // Initial load or filter/search change
  const executeQuery = useCallback((search, role, hostel) => {
    setCursorStack([null]);
    loadPage(1, null, search, role, hostel);
  }, [loadPage]);

  // Trigger load on filter change
  useEffect(() => {
    executeQuery(searchQuery, roleFilter, hostelFilter);
  }, [roleFilter, hostelFilter]);

  // Search input handler with 400ms debounce
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      executeQuery(val, roleFilter, hostelFilter);
    }, 400);
  };

  const handleNextPage = () => {
    if (!hasMore || !nextCursor || loading) return;
    const nextPage = currentPage + 1;
    setCursorStack(prev => [...prev, nextCursor]);
    loadPage(nextPage, nextCursor, searchQuery, roleFilter, hostelFilter);
  };

  const handlePreviousPage = () => {
    if (currentPage <= 1 || loading) return;
    const prevPage = currentPage - 1;
    const prevCursor = cursorStack[prevPage - 1] || null;
    setCursorStack(prev => prev.slice(0, prevPage));
    loadPage(prevPage, prevCursor, searchQuery, roleFilter, hostelFilter);
  };

  const handleRetry = () => {
    loadPage(currentPage, cursorStack[currentPage - 1] || null, searchQuery, roleFilter, hostelFilter);
  };

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Student & Staff Directory"
        subtitle="Institutional roster oversight with server-side pagination (limit: 25 per page)"
        action={
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">
              Page {currentPage} {users.length > 0 && `(${users.length} records)`}
            </span>
            <button
              onClick={() => executeQuery(searchQuery, roleFilter, hostelFilter)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              title="Refresh Directory"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            </button>
          </div>
        }
      >
        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Name, Admission #, Email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2 sm:col-span-1">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 font-bold"
            >
              <option value="student">Hostel Students</option>
              <option value="mess_committee">Mess Committee</option>
              <option value="all">All Campus Roles</option>
            </select>
          </div>

          {/* Hostel Block Filter */}
          <div className="flex items-center space-x-2 sm:col-span-1">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500 font-bold"
            >
              <option value="all">All Hostel Blocks</option>
              <option value="DNB Block">DNB Block (Boys)</option>
              <option value="VKB Block">VKB Block (Boys)</option>
              <option value="Block A (Girls)">Block A (Girls)</option>
              <option value="Block B (Girls)">Block B (Girls)</option>
              <option value="Block C (Girls)">Block C (Girls)</option>
            </select>
          </div>
        </div>

        {/* Content State Handling */}
        {loading ? (
          <LoadingState type="list" count={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={handleRetry} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description={searchQuery ? `No profiles matched "${searchQuery}". Try another search term or filter.` : 'No registered users match the selected filters.'}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3 px-3">Student / User</th>
                    <th className="pb-3 px-3">Admission #</th>
                    <th className="pb-3 px-3">College Email</th>
                    <th className="pb-3 px-3">Hostel Block</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                            {u.dietPreference && (
                              <span className="text-[10px] text-slate-400 block">{u.dietPreference}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {u.admissionNumber || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {u.email || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                        {u.hostelBlock || 'DNB Block'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={clsx(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                          u.role === 'warden' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                          u.role === 'mess_committee' || u.role === 'committee' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        )}>
                          {u.role === 'mess_committee' ? 'Committee' : u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {u.rewardPoints || 0} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-2.5">
              {users.map(u => (
                <div key={u.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</span>
                    <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">{u.rewardPoints || 0} pts</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">
                      {u.admissionNumber || 'No ID'}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                      {u.hostelBlock || 'DNB Block'}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                      {u.role}
                    </span>
                  </div>
                  {u.email && (
                    <span className="text-[11px] text-slate-400 block truncate">{u.email}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Server-Side Pagination Bar */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Showing up to {PAGE_SIZE} results · Page {currentPage}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || loading}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all',
                    currentPage <= 1 || loading
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
                  )}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={!hasMore || loading}
                  className={clsx(
                    'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all',
                    !hasMore || loading
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-sm cursor-pointer'
                  )}
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </DashboardCard>
    </div>
  );
};
