import React, { useState, useEffect } from 'react';
import { Upload, FileImage, FileText, FileSpreadsheet, Loader2, AlertCircle, TrendingUp, DollarSign, Activity, PieChart, CheckCircle, AlertTriangle, XCircle, Info, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const getRatioHealth = (name: string, value: number) => {
  switch(name) {
    case 'Current Ratio':
      return {
        status: value >= 1.5 ? 'good' : value >= 1.0 ? 'warning' : 'bad',
        interpretation: 'Measures ability to pay short-term obligations. >1.5 is generally healthy, <1.0 indicates potential liquidity issues.'
      };
    case 'Debt-Equity Ratio':
      return {
        status: value <= 1.0 ? 'good' : value <= 2.0 ? 'warning' : 'bad',
        interpretation: 'Proportion of debt and equity used to finance assets. Lower means less financial risk. >2.0 is highly leveraged.'
      };
    case 'Net Profit Ratio':
      return {
        status: value >= 10 ? 'good' : value >= 5 ? 'warning' : 'bad',
        interpretation: 'Percentage of revenue left after all expenses. Higher indicates better overall profitability and cost control.'
      };
    case 'Operating Profit Ratio':
      return {
        status: value >= 15 ? 'good' : value >= 10 ? 'warning' : 'bad',
        interpretation: 'Percentage of revenue left after operating expenses. Shows core business efficiency before tax and interest.'
      };
    case 'DSCR':
      return {
        status: value >= 1.25 ? 'good' : value >= 1.0 ? 'warning' : 'bad',
        interpretation: 'Debt Service Coverage Ratio. >1.25 means comfortable ability to pay debt obligations. <1.0 means insufficient cash flow for debt.'
      };
    case 'Inventory Turnover':
      return {
        status: value >= 5 ? 'good' : value >= 3 ? 'warning' : 'bad',
        interpretation: 'How many times inventory is sold and replaced. Higher means efficient inventory management and strong sales.'
      };
    case 'Debtors Turnover':
      return {
        status: value >= 6 ? 'good' : value >= 4 ? 'warning' : 'bad',
        interpretation: 'How quickly cash is collected from debtors. Higher means faster collection and better cash flow.'
      };
    case 'TOL / TNW Ratio':
      return {
        status: value <= 2 ? 'good' : value <= 3 ? 'warning' : 'bad',
        interpretation: 'Total Outside Liabilities to Tangible Net Worth. Lower indicates better long-term solvency and creditor protection.'
      };
    case 'NWC / TCA %':
      return {
        status: value >= 20 ? 'good' : value >= 0 ? 'warning' : 'bad',
        interpretation: 'Net Working Capital to Total Current Assets. Shows what portion of current assets is financed by long-term stable sources.'
      };
    default:
      return { status: 'neutral', interpretation: '' };
  }
};

interface RawLineItem {
  name: string;
  value: number;
}

interface ExtractedData {
  year: string;
  rawLineItems: RawLineItem[];
  capital: number;
  longTermDebt: number;
  shortTermDebt: number;
  currentLiabilities: number;
  fixedAssets: number;
  investments: number;
  otherNonCurrentAssets: number;
  totalCurrentAssets: number;
  netProfit: number;
  revenue: number;
  ebit: number;
  pbt: number;
  interest: number;
  depreciation: number;
  amortization: number;
  principalRepayment: number;
  cogs: number;
  inventory: number;
  debtors: number;
  otherOutsideLiabilities: number;
  intangibleAssets: number;
}

interface AnalysisResult extends ExtractedData {
  longTermSources: number;
  longTermUses: number;
  netWorkingCapital: number;
  nwcToTcaPercentage: number;
  currentRatio: number;
  debtEquityRatio: number;
  netProfitRatio: number;
  operatingProfitRatio: number;
  dscr: number;
  inventoryTurnover: number;
  debtorsTurnover: number;
  tolToTnwRatio: number;
  ebitda: number;
}

interface OutputData {
  extractedData: ExtractedData[];
  projections: string;
}

interface ProcessedOutput {
  analysis: AnalysisResult[];
  projections: string;
}


export default function Analyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProcessedOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saveAnalysis = async () => {
      // Feature temporary disabled since auth was removed
      // You can restore backend saving logic here later if needed
    };
    saveAnalysis();
  }, [result, hasSaved]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/jpeg;base64, part
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeImages = async () => {
    if (files.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const parts = await Promise.all(
        files.map(async (file) => {
          if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            let csvText = `File: ${file.name}\n`;
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              csvText += `\n--- Sheet: ${sheetName} ---\n`;
              csvText += XLSX.utils.sheet_to_csv(sheet);
            });
            return { text: csvText };
          } else {
            return {
              inlineData: {
                data: await fileToBase64(file),
                mimeType: file.type,
              },
            };
          }
        })
      );

      const prompt = `
        You are an expert financial analyst. I have provided images, PDF documents, or Excel/CSV data of balance sheets and/or P&L statements.
        Your task is to extract the financial data accurately.
        
        For each year found in the documents, provide:
        1. A list of all raw line items and their exact numerical values as they appear in the document.
        2. Map these raw items to the following standard categories (use the exact numerical values). If a value is missing, assume it is 0:
           - Capital (Shareholder's Equity, Partner's Capital, Net Worth)
           - Long Term Debt
           - Short Term Debt
           - Current Liabilities (Total current liabilities)
           - Fixed Assets
           - Investments
           - Other Non-Current Assets
           - Total Current Assets
           - Net Profit (Net Income)
           - Revenue (Sales, Turnover)
           - EBIT (Earnings Before Interest and Taxes)
           - PBT (Profit Before Tax)
           - Interest (Finance Cost)
           - Depreciation
           - Amortization
           - Principal Repayment (if available, else 0)
           - COGS (Cost of Goods Sold)
           - Inventory (Stock)
           - Debtors (Accounts Receivable, Trade Receivables)
           - Other Outside Liabilities (Non-current liabilities other than long term debt)
           - Intangible Assets

        If a specific category is missing, assume it is 0.
        
        CRITICAL INSTRUCTION FOR PROJECTIONS:
        If data for multiple years is provided (e.g., 2023 and 2024), you MUST calculate a projected set of line items for the next year (e.g., 2025) using linear trend extrapolation. 
        Add this projected year as an additional object in the \`extractedData\` array, with the \`year\` field labeled as '[Next Year] (Projected)'. 
        If only one year of data is provided, do NOT add a projected year to the array.

        Also, provide a brief text projection for the next year based on the historical trends in the \`projections\` field.
      `;

      const responseSchema = {
        type: "OBJECT",
        properties: {
          extractedData: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                year: { type: "STRING" },
                rawLineItems: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      value: { type: "NUMBER" }
                    },
                    required: ["name", "value"]
                  }
                },
                capital: { type: "NUMBER" },
                longTermDebt: { type: "NUMBER" },
                shortTermDebt: { type: "NUMBER" },
                currentLiabilities: { type: "NUMBER" },
                fixedAssets: { type: "NUMBER" },
                investments: { type: "NUMBER" },
                otherNonCurrentAssets: { type: "NUMBER" },
                totalCurrentAssets: { type: "NUMBER" },
                netProfit: { type: "NUMBER" },
                revenue: { type: "NUMBER" },
                ebit: { type: "NUMBER" },
                pbt: { type: "NUMBER" },
                interest: { type: "NUMBER" },
                depreciation: { type: "NUMBER" },
                amortization: { type: "NUMBER" },
                principalRepayment: { type: "NUMBER" },
                cogs: { type: "NUMBER" },
                inventory: { type: "NUMBER" },
                debtors: { type: "NUMBER" },
                otherOutsideLiabilities: { type: "NUMBER" },
                intangibleAssets: { type: "NUMBER" }
              },
              required: [
                "year", "rawLineItems", "capital", "longTermDebt", "shortTermDebt", "currentLiabilities",
                "fixedAssets", "investments", "otherNonCurrentAssets", "totalCurrentAssets",
                "netProfit", "revenue", "ebit", "pbt", "interest", "depreciation", "amortization",
                "principalRepayment", "cogs", "inventory", "debtors", "otherOutsideLiabilities", "intangibleAssets"
              ]
            }
          },
          projections: {
            type: "STRING",
            description: "A brief projection for the next year based on the trends."
          }
        },
        required: ["extractedData", "projections"]
      };

      const proxyRes = await fetch('/api/analyze-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts, prompt, responseSchema })
      });

      if (!proxyRes.ok) {
        const errorBody = await proxyRes.json().catch(() => ({}));
        throw new Error(errorBody.error || `Server returned ${proxyRes.status}`);
      }

      const parsedData = await proxyRes.json() as OutputData;
        // Sort by year ascending
        parsedData.extractedData.sort((a, b) => a.year.localeCompare(b.year));
        
        // Calculate derived fields precisely in code to avoid AI math errors
        const processedAnalysis: AnalysisResult[] = parsedData.extractedData.map(data => {
          const longTermSources = data.capital + data.longTermDebt;
          const longTermUses = data.fixedAssets + data.investments + data.otherNonCurrentAssets;
          const netWorkingCapital = longTermSources - longTermUses;
          const nwcToTcaPercentage = data.totalCurrentAssets !== 0 
            ? (netWorkingCapital / data.totalCurrentAssets) * 100 
            : 0;

          const totalDebt = data.longTermDebt + data.shortTermDebt;
          const currentRatio = data.currentLiabilities !== 0 ? data.totalCurrentAssets / data.currentLiabilities : 0;
          const debtEquityRatio = data.capital !== 0 ? totalDebt / data.capital : 0;
          const netProfitRatio = data.revenue !== 0 ? (data.netProfit / data.revenue) * 100 : 0;
          const operatingProfitRatio = data.revenue !== 0 ? (data.ebit / data.revenue) * 100 : 0;
          
          const dscrNumerator = data.pbt + data.interest + data.depreciation;
          const dscrDenominator = data.interest + data.principalRepayment;
          const dscr = dscrDenominator !== 0 ? dscrNumerator / dscrDenominator : 0;

          const inventoryTurnover = data.inventory !== 0 ? data.cogs / data.inventory : 0;
          const debtorsTurnover = data.debtors !== 0 ? data.revenue / data.debtors : 0;

          const totalOutsideLiabilities = totalDebt + data.currentLiabilities + data.otherOutsideLiabilities;
          const tangibleNetWorth = data.capital - data.intangibleAssets;
          const tolToTnwRatio = tangibleNetWorth !== 0 ? totalOutsideLiabilities / tangibleNetWorth : 0;

          const ebitda = data.pbt + data.interest + data.depreciation + data.amortization;

          return {
            ...data,
            longTermSources,
            longTermUses,
            netWorkingCapital,
            nwcToTcaPercentage,
            currentRatio,
            debtEquityRatio,
            netProfitRatio,
            operatingProfitRatio,
            dscr,
            inventoryTurnover,
            debtorsTurnover,
            tolToTnwRatio,
            ebitda
          };
        });

        setResult({
          analysis: processedAnalysis,
          projections: parsedData.projections
        });
        setHasSaved(false);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 font-heading">
          Analyze Your Financial Statements
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload pictures, PDFs, or Excel files of your balance sheets and P&L statements. Our AI will normalize the different formats, extract key metrics, and provide projections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Documents
            </h3>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*,application/pdf,.xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Click or drag files here</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, PDF, Excel, CSV</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Selected files ({files.length}):</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 truncate">
                      {f.type === 'application/pdf' ? (
                        <FileText className="w-4 h-4 shrink-0" />
                      ) : f.name.match(/\.(xlsx|xls|csv)$/i) ? (
                        <FileSpreadsheet className="w-4 h-4 shrink-0" />
                      ) : (
                        <FileImage className="w-4 h-4 shrink-0" />
                      )}
                      <span className="truncate">{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={analyzeImages}
              disabled={isAnalyzing || files.length === 0}
              className="w-full mt-6 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Statements'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20"
              >
                <PieChart className="w-16 h-16 mb-4 opacity-20" />
                <p>Upload documents and run analysis to see results here.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20"
              >
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                <p className="animate-pulse">AI is reading and normalizing your financial data...</p>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative space-y-6`}
              >
                <div className={`space-y-6`}>
                  {/* Raw Data Section */}
                  <div className="bg-card border rounded-xl overflow-hidden shadow-sm mb-8">
                  <div className="p-5 border-b bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Raw Extracted Data
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Data exactly as extracted from the documents before mapping.</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.analysis.map(a => (
                      <div key={`raw-${a.year}`} className="space-y-3">
                        <h4 className="font-medium text-primary border-b pb-2">{a.year}</h4>
                        <ul className="space-y-2 text-sm">
                          {a.rawLineItems.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                              <span className="text-muted-foreground truncate pr-2" title={item.name}>{item.name}</span>
                              <span className="font-medium">{item.value.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Activity className="w-4 h-4" />
                      <h4 className="text-sm font-medium">Latest NWC/TCA</h4>
                    </div>
                    <p className="text-2xl font-medium">
                      {result.analysis[result.analysis.length - 1].nwcToTcaPercentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <DollarSign className="w-4 h-4" />
                      <h4 className="text-sm font-medium">Latest Net Working Capital</h4>
                    </div>
                    <p className="text-2xl font-medium">
                      {result.analysis[result.analysis.length - 1].netWorkingCapital.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <h4 className="text-sm font-medium">Latest Long Term Sources</h4>
                    </div>
                    <p className="text-2xl font-medium">
                      {result.analysis[result.analysis.length - 1].longTermSources.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Comprehensive Charts Dashboard */}
                <div className="space-y-6">
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Financial Trends Dashboard
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Liquidity & Solvency */}
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Liquidity & Solvency</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={result.analysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Line type="monotone" dataKey="currentRatio" name="Current Ratio" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="debtEquityRatio" name="Debt-Equity" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Profitability */}
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Profitability Margins (%)</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={result.analysis}>
                            <defs>
                              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorOp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Area type="monotone" dataKey="operatingProfitRatio" name="Operating Margin %" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOp)" />
                            <Area type="monotone" dataKey="netProfitRatio" name="Net Margin %" stroke="#10b981" fillOpacity={1} fill="url(#colorNet)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Efficiency */}
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Efficiency (Turnover)</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.analysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="inventoryTurnover" name="Inventory Turnover" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="debtorsTurnover" name="Debtors Turnover" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sources vs Uses */}
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Sources vs Uses</h4>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.analysis}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="year" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="longTermSources" name="LT Sources" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="longTermUses" name="LT Uses" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                          <th className="px-6 py-3">Particulars</th>
                          {result.analysis.map(a => (
                            <th key={a.year} className="px-6 py-3 text-right">{a.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Capital</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.capital.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Long Term Debt</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.longTermDebt.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border bg-muted/20">
                          <td className="px-6 py-4 font-medium">Long Term Sources (A)</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right font-medium">{a.longTermSources.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Fixed Assets</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.fixedAssets.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Investments</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.investments.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Other Non-Current Assets</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.otherNonCurrentAssets.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border bg-muted/20">
                          <td className="px-6 py-4 font-medium">Long Term Uses (B)</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right font-medium">{a.longTermUses.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border bg-primary/5">
                          <td className="px-6 py-4 font-medium text-primary">Net Working Capital (A - B)</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right font-medium text-primary">{a.netWorkingCapital.toLocaleString()}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Total Current Assets</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.totalCurrentAssets.toLocaleString()}</td>)}
                        </tr>
                        <tr className="bg-primary/10">
                          <td className="px-6 py-4 font-medium text-primary">NWC / TCA %</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right font-medium text-primary">{a.nwcToTcaPercentage.toFixed(2)}%</td>)}
                        </tr>
                        
                        {/* New Ratios */}
                        <tr><td colSpan={result.analysis.length + 1} className="px-6 py-3 bg-muted/50 font-semibold text-xs uppercase text-muted-foreground">Key Financial Ratios</td></tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Current Ratio</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.currentRatio.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Debt-Equity Ratio</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.debtEquityRatio.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Net Profit Ratio</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.netProfitRatio.toFixed(2)}%</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Operating Profit Ratio</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.operatingProfitRatio.toFixed(2)}%</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">DSCR</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.dscr.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Inventory Turnover</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.inventoryTurnover.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">Debtors Turnover</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.debtorsTurnover.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4 font-medium">TOL / TNW Ratio</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right">{a.tolToTnwRatio.toFixed(2)}</td>)}
                        </tr>
                        <tr className="border-b border-border bg-muted/20">
                          <td className="px-6 py-4 font-medium">EBITDA</td>
                          {result.analysis.map(a => <td key={a.year} className="px-6 py-4 text-right font-medium">{a.ebitda.toLocaleString()}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Health Interpretations */}
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b bg-muted/20">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Financial Health Interpretations (Latest Year: {result.analysis[result.analysis.length - 1].year})
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Analysis of key ratios to determine if the values are healthy, warning, or poor.</p>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Current Ratio', value: result.analysis[result.analysis.length - 1].currentRatio, format: 'number' },
                      { name: 'Debt-Equity Ratio', value: result.analysis[result.analysis.length - 1].debtEquityRatio, format: 'number' },
                      { name: 'Net Profit Ratio', value: result.analysis[result.analysis.length - 1].netProfitRatio, format: 'percent' },
                      { name: 'Operating Profit Ratio', value: result.analysis[result.analysis.length - 1].operatingProfitRatio, format: 'percent' },
                      { name: 'DSCR', value: result.analysis[result.analysis.length - 1].dscr, format: 'number' },
                      { name: 'Inventory Turnover', value: result.analysis[result.analysis.length - 1].inventoryTurnover, format: 'number' },
                      { name: 'Debtors Turnover', value: result.analysis[result.analysis.length - 1].debtorsTurnover, format: 'number' },
                      { name: 'TOL / TNW Ratio', value: result.analysis[result.analysis.length - 1].tolToTnwRatio, format: 'number' },
                      { name: 'NWC / TCA %', value: result.analysis[result.analysis.length - 1].nwcToTcaPercentage, format: 'percent' },
                    ].map(ratio => {
                      const health = getRatioHealth(ratio.name, ratio.value);
                      return (
                        <div key={ratio.name} className="border rounded-lg p-4 flex flex-col gap-2 bg-background">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm">{ratio.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{ratio.value.toFixed(2)}{ratio.format === 'percent' ? '%' : ''}</span>
                              {health.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
                              {health.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                              {health.status === 'bad' && <XCircle className="w-4 h-4 text-red-500" />}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                            <Info className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{health.interpretation}</span>
                          </div>
                          <div className={`text-xs font-medium mt-auto pt-2 ${
                            health.status === 'good' ? 'text-green-600 dark:text-green-400' :
                            health.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Projections */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary">
                    <TrendingUp className="w-5 h-5" />
                    AI Projections & Insights
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {result.projections}
                  </p>
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
