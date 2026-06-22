import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Building2, 
  ShieldAlert, 
  AlertCircle, 
  Loader2, 
  Database, 
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar
} from 'lucide-react';
import { getSupabaseClient, DEFAULTERS_TABLE } from '@/lib/supabase';

export default function DefaulterSearch() {
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reporting Cycle setup & options
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [availableCycles, setAvailableCycles] = useState<string[]>(['MAR26', 'APR26', 'MAY26']);

  // Pagination & Mode state
  const [mode, setMode] = useState<'search' | 'view_all' | null>(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Constants
  const PAGE_LIMIT = 10;

  // On mount: Try to fetch actual unique reporting cycles from database to update our static checklist
  useEffect(() => {
    const loadCycles = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error: qError } = await supabase
          .from(DEFAULTERS_TABLE)
          .select('Reporting Cycle');
        if (!qError && data) {
          const unique = Array.from(
            new Set(data.map(item => item['Reporting Cycle']).filter(Boolean))
          ) as string[];
          if (unique.length > 0) {
            // Sort cycles to put latest or alphabetically sorted ones nicely
            unique.sort((a, b) => b.localeCompare(a));
            setAvailableCycles(unique);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic reporting cycles, fallback to defaults:', err);
      }
    };
    loadCycles();
  }, []);

  // Execute Supabase direct Server-Side Range Query
  const fetchRecords = async (
    targetPage: number, 
    modeType: 'search' | 'view_all', 
    searchQuery: string,
    cycleFilter: string = selectedCycle
  ) => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      
      // Page 1 = range(0, 999)
      // Page 2 = range(1000, 1999)
      const from = (targetPage - 1) * PAGE_LIMIT;
      const to = targetPage * PAGE_LIMIT - 1;

      let q = supabase
        .from(DEFAULTERS_TABLE)
        .select('*', { count: 'exact' });

      if (modeType === 'search') {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
          throw new Error('Please type a borrower name to search.');
        }
        // Strict requirement: Search column "Borrower Name" using server-side search
        q = q.ilike('Borrower Name', `%${trimmed}%`);
      }

      // Filter by Reporting Cycle if specified
      if (cycleFilter && cycleFilter !== 'all') {
        q = q.eq('Reporting Cycle', cycleFilter);
      }

      // Order by id to ensure stable, consecutive sequential pagination ordering
      q = q.order('id', { ascending: true }).range(from, to);

      const { data, count, error: qError } = await q;

      if (qError) {
        throw qError;
      }

      setRecords(data || []);
      setTotalCount(count !== null ? count : (data?.length || 0));
      setMode(modeType);
      setCurrentPage(targetPage);
    } catch (err: any) {
      console.error('Supabase query error:', err);
      setError(err.message || 'An error occurred while fetching matching credit registers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please type a borrower name to run search.');
      return;
    }
    setShowAllRecords(false); // Reset toggle when search is executed
    fetchRecords(1, 'search', query, selectedCycle);
  };

  const handleToggleViewRecords = () => {
    if (showAllRecords) {
      // Hide the results table & pagination
      setShowAllRecords(false);
      setRecords([]);
      setMode(null);
      setTotalCount(null);
    } else {
      // Load and show records
      setShowAllRecords(true);
      setQuery(''); // clear query when requesting all
      fetchRecords(1, 'view_all', '', selectedCycle);
    }
  };

  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCycle = e.target.value;
    setSelectedCycle(nextCycle);
    
    // Auto-refresh the current search or view-all mode if one is active
    if (mode === 'search') {
      fetchRecords(1, 'search', query, nextCycle);
    } else if (mode === 'view_all' || showAllRecords) {
      setShowAllRecords(true);
      fetchRecords(1, 'view_all', '', nextCycle);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || loading) return;
    fetchRecords(newPage, mode || 'view_all', query, selectedCycle);
  };

  // Safe page stats calculations
  const effectiveCount = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(effectiveCount / PAGE_LIMIT));
  const fromIndex = (currentPage - 1) * PAGE_LIMIT;
  const toIndex = Math.min(currentPage * PAGE_LIMIT, effectiveCount);

  // CSV Report Generator
  const handleExportCSV = () => {
    if (records.length === 0) return;
    
    const headers = [
      "Sr.No.",
      "Reporting Cycle",
      "Bank Name",
      "Bank Branch",
      "State",
      "Borrower Name",
      "Borrower Pan",
      "Outstanding Amount(in Lakhs)",
      "Suit Filed (Y/N)",
      "Borrower Address",
      "Asset Classification",
      "Asset Classification Date",
      "Director/ Promoter Name"
    ];

    const rows = records.map(rec => {
      return headers.map(header => {
        const val = rec[header] !== undefined && rec[header] !== null ? rec[header] : '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Defaulters_Page_${currentPage}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine whether to show the results table section
  const isTableVisible = mode === 'search' || (mode === 'view_all' && showAllRecords);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Professional Title Accent */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive font-medium text-xs border border-destructive/20 select-none">
          <ShieldAlert className="w-3.5 h-3.5" />
          Wilful Defaulters Direct Query Engine
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-heading">
          Credit Registry Verification
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Verify corporate bad-debt portfolios, classified client names, and regulatory suit filers with live, server-side paginated queries to Supabase registers.
        </p>
      </div>

      {/* Main Search Panel & Filter dropdowns */}
      <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text"
                id="defaulter-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Borrower Name (e.g., 'Reliance', 'Sethi')..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>

            {/* Reporting Cycle selector styled like [All Cycles ▼] */}
            <div className="relative min-w-[180px] md:w-48 flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCycle}
                onChange={handleCycleChange}
                className="w-full pl-9 pr-8 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none font-medium cursor-pointer text-foreground"
              >
                <option value="all">All Cycles</option>
                {availableCycles.map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-muted-foreground text-[10px]">▼</div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading && mode === 'search' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
              <button
                type="button"
                onClick={handleToggleViewRecords}
                disabled={loading && mode === 'view_all'}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-muted border hover:bg-muted/80 text-foreground font-medium text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 min-w-[155px]"
              >
                {loading && mode === 'view_all' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{showAllRecords ? '▼ Hide Records' : '▶ View Records'}</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Dynamic Context Header */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs flex gap-2 items-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Database register table - updates in real time on same page with pagination below */}
      {isTableVisible && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground uppercase tracking-wider">
                {mode === 'search' ? `Search Matches for "${query}"` : 'Live Directory'}
                {selectedCycle !== 'all' && ` - Cycle: ${selectedCycle}`}
              </span>
            </div>

            {records.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-medium text-xs rounded-xl transition-all cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Export Page CSV
              </button>
            )}
          </div>

          {/* Table representation */}
          <div className="bg-card border rounded-2xl overflow-hidden shadow-xs relative min-h-[160px]">
            {loading && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center z-10 select-none">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-foreground font-medium animate-pulse">
                  {mode === 'search' ? 'Searching records...' : 'Loading all records...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Querying live credit register database...</p>
              </div>
            )}

            <div className="overflow-x-auto animate-fadeIn">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-[11px] text-muted-foreground uppercase bg-muted/65 border-b select-none font-semibold">
                  <tr>
                    <th className="px-5 py-3">Borrower Entity Name</th>
                    <th className="px-5 py-3">Declaring Institution</th>
                    <th className="px-5 py-3">Outstanding Amount</th>
                    <th className="px-5 py-3">Reporting/Classified Date</th>
                    <th className="px-5 py-3">State</th>
                    <th className="px-5 py-3">Legal Suit / Directorship</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.length > 0 ? (
                    records.map((rec, idx) => {
                      const companyName = rec["Borrower Name"] || rec.company_name || 'N/A';
                      const promoterNames = rec["Director/ Promoter Name"] || rec.promoter_names;
                      const bankName = rec["Bank Name"] || rec.bank_name || 'N/A';
                      const bankBranch = rec["Bank Branch"];
                      
                      let outstandingAmt = '';
                      if (rec["Outstanding Amount(in Lakhs)"] !== undefined && rec["Outstanding Amount(in Lakhs)"] !== null) {
                        outstandingAmt = `₹${rec["Outstanding Amount(in Lakhs)"]} Lakhs`;
                      } else if (rec.outstanding_amount !== undefined && rec.outstanding_amount !== null) {
                        outstandingAmt = typeof rec.outstanding_amount === 'number'
                          ? `₹${rec.outstanding_amount.toLocaleString()}`
                          : String(rec.outstanding_amount);
                      } else {
                        outstandingAmt = 'N/A';
                      }

                      const dateClassified = rec["Asset Classification Date"] || rec.date_of_classification || rec["Reporting Cycle"] || 'N/A';
                      const stateVal = rec["State"] || rec.state || 'N/A';
                      const suitFiled = rec["Suit Filed (Y/N)"];
                      const promoterDin = rec["Director/ Promoter DIN"];
                      const bPan = rec["Borrower Pan"];

                      return (
                        <tr key={rec.id || idx} className="hover:bg-muted/10 transition-colors text-xs">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-foreground flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                              {companyName}
                            </p>
                            {bPan && (
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                Borrower PAN: <span className="font-semibold text-foreground/80">{bPan}</span>
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-foreground/80">{bankName}</p>
                            {bankBranch && (
                              <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{bankBranch}</p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-medium text-destructive">
                            {outstandingAmt}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground font-medium">
                            {dateClassified}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 bg-muted border text-[10px] rounded-md font-medium text-foreground">
                              {stateVal}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground max-w-xs font-mono">
                            <div className="space-y-0.5 text-[10px]">
                              {suitFiled && <p>Suit Filed: <span className="font-semibold text-foreground">{suitFiled}</span></p>}
                              {promoterNames && <p className="truncate" title={promoterNames}>Promoters: <span className="text-foreground">{promoterNames}</span></p>}
                              {promoterDin && <p>DIN: <span className="text-foreground">{promoterDin}</span></p>}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                        <div className="max-w-md mx-auto space-y-2 select-none">
                          <Database className="w-10 h-10 mx-auto opacity-20" />
                          <p className="font-medium text-foreground/80">
                            No matching records found
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground/85">
                            {selectedCycle !== 'all' 
                              ? `No corresponding entries matched in cycle "${selectedCycle}". Try setting the filter to "All Cycles."`
                              : 'Try using shorter search phrases or adjusting your filter keywords.'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination bar below the results table */}
            {records.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-3.5 select-none">
                <div className="text-xs text-muted-foreground font-mono">
                  Showing <span className="font-medium text-foreground">{fromIndex + 1}</span> to{' '}
                  <span className="font-medium text-foreground">{toIndex}</span> of{' '}
                  <span className="font-medium text-foreground">{effectiveCount}</span>{' '}
                  entries
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-background border hover:bg-muted font-medium text-xs rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  
                  <span className="text-xs font-medium font-mono px-3 py-1.5 bg-background border rounded-lg mx-1 text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-background border hover:bg-muted font-medium text-xs rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
