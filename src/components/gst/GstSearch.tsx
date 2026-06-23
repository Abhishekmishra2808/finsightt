import React, { useState } from 'react';
import { Search, Building2, MapPin, Calendar, FileText, AlertCircle, CheckCircle2, Loader2, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { apiUrl } from '@/lib/api';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface GstDetails {
  legalName: string;
  tradeName: string;
  status: string;
  taxpayerType: string;
  registrationDate: string;
  cancellationDate?: string;
  address: string;
  stateJurisdiction: string;
  natureOfBusiness: string[];
  goodsAndServices: string[];
  hsnSacCodes: string[];
  promoters: string[];
  filingHistory: {
    returnType: string;
    financialYear: string;
    dateOfFiling: string;
    status: string;
  }[];
}

export default function GstSearch() {
  const [gstin, setGstin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<GstDetails | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gstin || gstin.length !== 15) {
      setError('Please enter a valid 15-character GSTIN');
      return;
    }

    setLoading(true);
    setError(null);
    setDetails(null);

    try {
      const prompt = `Search the web for the Indian GSTIN (Goods and Services Tax Identification Number): ${gstin}. 
      Extract the official public business registration details associated with this GSTIN from sites like Cleartax, GSTZen, MastersIndia, KnowYourGST, or ZaubaCorp.
      Specifically look for:
      1. Basic details (Legal Name, Trade Name, Status, Taxpayer Type, Registration Date, Cancellation Date if applicable, Address, Jurisdiction).
      2. "Nature of Business", "HSN/SAC codes", and the specific "Goods and Services" they deal in.
      3. "Promoters" or "Directors" names.
      4. "Filing History" or "Return Status" (GSTR-1, GSTR-3B, GSTR-9, etc.). Extract the return type, financial year/tax period, date of filing, and status (Filed/Not Filed).
      
      If the GSTIN is invalid or no data can be found, return "Not Found" for the legalName.`;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          legalName: { type: "STRING", description: "Legal name of the business. Set to 'Not Found' if GSTIN is invalid." },
          tradeName: { type: "STRING", description: "Trade name of the business" },
          status: { type: "STRING", description: "Active, Inactive, Cancelled, etc." },
          taxpayerType: { type: "STRING", description: "Regular, Composition, etc." },
          registrationDate: { type: "STRING", description: "Date of registration" },
          cancellationDate: { type: "STRING", description: "Date of cancellation if applicable, else empty" },
          address: { type: "STRING", description: "Principal place of business" },
          stateJurisdiction: { type: "STRING", description: "State jurisdiction" },
          natureOfBusiness: { 
            type: "ARRAY", 
            items: { type: "STRING" },
            description: "Nature of business activities" 
          },
          goodsAndServices: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Specific products, goods, or services the business deals in"
          },
          hsnSacCodes: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "HSN or SAC codes associated with the business"
          },
          promoters: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Names of directors, partners, or promoters"
          },
          filingHistory: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                returnType: { type: "STRING", description: "e.g., GSTR-3B, GSTR-1" },
                financialYear: { type: "STRING", description: "Tax period or Financial Year" },
                dateOfFiling: { type: "STRING", description: "Date when it was filed" },
                status: { type: "STRING", description: "Filed, Pending, etc." }
              },
              required: ["returnType", "financialYear", "dateOfFiling", "status"]
            },
            description: "Recent GST return filing history"
          }
        },
        required: ["legalName", "tradeName", "status", "taxpayerType", "registrationDate", "address", "stateJurisdiction", "natureOfBusiness", "goodsAndServices", "hsnSacCodes", "promoters", "filingHistory"]
      };

      const proxyRes = await fetch(apiUrl('/api/analyze-gst'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, responseSchema })
      });

      if (!proxyRes.ok) {
        throw new Error(`Failed to fetch GST details: ${proxyRes.statusText}`);
      }

      const data = await proxyRes.json();
      
      if (!data.legalName || data.legalName.toLowerCase().includes('not found') || data.legalName === 'N/A') {
        throw new Error('GSTIN not found or invalid. Please check the number and try again.');
      }

      setDetails({
        legalName: data.legalName || 'N/A',
        tradeName: data.tradeName || 'N/A',
        status: data.status || 'N/A',
        taxpayerType: data.taxpayerType || 'N/A',
        registrationDate: data.registrationDate || 'N/A',
        cancellationDate: data.cancellationDate || '',
        address: data.address || 'N/A',
        stateJurisdiction: data.stateJurisdiction || 'N/A',
        natureOfBusiness: Array.isArray(data.natureOfBusiness) ? data.natureOfBusiness : [],
        goodsAndServices: Array.isArray(data.goodsAndServices) ? data.goodsAndServices : [],
        hsnSacCodes: Array.isArray(data.hsnSacCodes) ? data.hsnSacCodes : [],
        promoters: Array.isArray(data.promoters) ? data.promoters : [],
        filingHistory: Array.isArray(data.filingHistory) ? data.filingHistory : []
      });

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-medium font-heading">GST Number Search</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Verify any business instantly. Enter a 15-character Goods and Services Tax Identification Number (GSTIN) to fetch official registration details.
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="Enter 15-digit GSTIN (e.g., 22AAAAA0000A1Z5)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all uppercase"
              maxLength={15}
            />
          </div>
          <button
            type="submit"
            disabled={loading || gstin.length !== 15}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search GSTIN'}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </div>

      {details && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative`}
        >
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
            {/* Main Info */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-medium">{details.legalName}</h3>
                <p className="text-muted-foreground">{details.tradeName !== 'N/A' ? details.tradeName : 'No Trade Name'}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                details.status.toLowerCase() === 'active' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {details.status.toLowerCase() === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {details.status}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Taxpayer Type</p>
                  <p className="text-sm text-muted-foreground">{details.taxpayerType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date of Registration</p>
                  <p className="text-sm text-muted-foreground">{details.registrationDate}</p>
                  {details.cancellationDate && details.cancellationDate !== 'N/A' && details.cancellationDate !== '' && (
                    <p className="text-sm text-red-500 mt-1">Cancelled on: {details.cancellationDate}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Principal Place of Business</p>
                  <p className="text-sm text-muted-foreground">{details.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Business Details
            </h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">State Jurisdiction</p>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">{details.stateJurisdiction}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Nature of Business Activities</p>
                <div className="flex flex-wrap gap-2">
                  {details.natureOfBusiness.length > 0 ? (
                    details.natureOfBusiness.map((activity, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-lg font-medium">
                        {activity}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Promoters / Directors</p>
                <div className="flex flex-wrap gap-2">
                  {details.promoters && details.promoters.length > 0 ? (
                    details.promoters.map((promoter, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-muted text-foreground text-xs rounded-lg font-medium border">
                        {promoter}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Goods & Services Info */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6 md:col-span-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Products & Services (HSN/SAC)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Goods and Services</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                  {details.goodsAndServices.length > 0 ? (
                    details.goodsAndServices.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))
                  ) : (
                    <li>Not specified</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">HSN / SAC Codes</p>
                <div className="flex flex-wrap gap-2">
                  {details.hsnSacCodes.length > 0 ? (
                    details.hsnSacCodes.map((code, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-lg font-medium border">
                        {code}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filing History */}
          {details.filingHistory && details.filingHistory.length > 0 && (
            <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6 md:col-span-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Return Filing History
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Return Type</th>
                      <th className="px-6 py-3">Tax Period / FY</th>
                      <th className="px-6 py-3">Date of Filing</th>
                      <th className="px-6 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.filingHistory.map((history, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium">{history.returnType}</td>
                        <td className="px-6 py-4 text-muted-foreground">{history.financialYear}</td>
                        <td className="px-6 py-4 text-muted-foreground">{history.dateOfFiling}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            history.status.toLowerCase().includes('filed') && !history.status.toLowerCase().includes('not')
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {history.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
