import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldAlert, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { forecastApi } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const FarmerForecast: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<number>(7);

  const fetchForecast = async (selectedPeriod: number) => {
    setLoading(true);
    try {
      const res = await forecastApi.getOverview(selectedPeriod);
      setData(res);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(period);
  }, [period]);

  const {
    totalPredictedDemand,
    totalCurrentDemand,
    overallTrend,
    overallExpectedChange,
    topTrendingProduct,
    recommendation,
    chartData,
    productForecasts
  } = data || {};

  const noData = productForecasts?.length === 0;

  return (
    <DashboardLayout
      portalType="FARMER"
      title="AI Demand Forecast"
      subtitle="Data-driven insights to help you plan your next harvest and optimize inventory."
    >
      <div className="space-y-8">
        
        {/* Period Selector Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
             </div>
             <div>
                <h3 className="font-bold text-sm text-slate-900">Forecast Period</h3>
                <p className="text-[11px] text-slate-500">Adjust the time horizon for predictions</p>
             </div>
           </div>
           
           <select 
             value={period}
             onChange={(e) => setPeriod(Number(e.target.value))}
             className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500"
           >
             <option value={7}>Next 7 Days</option>
             <option value={14}>Next 14 Days</option>
             <option value={30}>Next 30 Days</option>
           </select>
        </div>

        {noData && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Insufficient Data for Forecast</h3>
              <p className="text-xs mt-1 leading-relaxed">
                {recommendation || "Not enough historical order data is currently available to generate a reliable forecast. Continue collecting marketplace sales data to improve future predictions."}
              </p>
            </div>
          </div>
        )}

        {loading ? (
            <div className="py-20"><Loader message={`Analyzing data for next ${period} days...`} /></div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Predicted Demand</span>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {totalPredictedDemand || 0} <span className="text-sm font-bold text-slate-500">units</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Next {period} days (vs {totalCurrentDemand || 0} units previously)
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Overall Trend</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      overallTrend === 'Increasing' ? 'bg-emerald-50 text-emerald-600' : 
                      overallTrend === 'Decreasing' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {overallTrend === 'Increasing' ? <TrendingUp className="w-5 h-5" /> :
                    overallTrend === 'Decreasing' ? <TrendingDown className="w-5 h-5" /> :
                    <Minus className="w-5 h-5" />}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-2">
                  {overallTrend || 'Stable'}
                  {overallExpectedChange !== 0 && (
                      <span className={`text-sm font-bold ${overallExpectedChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {overallExpectedChange > 0 ? '+' : ''}{overallExpectedChange}%
                      </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium line-clamp-1" title={recommendation}>
                  {recommendation || 'Maintain current supply levels.'}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Top Growth Product</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
                  {topTrendingProduct?.name || 'N/A'}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {topTrendingProduct ? `Predicted: ${topTrendingProduct.predictedDemand} ${topTrendingProduct.unit} (${topTrendingProduct.expectedChange > 0 ? '+' : ''}${topTrendingProduct.expectedChange}%)` : 'Not enough data'}
                </p>
              </div>
            </div>

            {/* Demand Chart */}
            {!noData && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Historical vs Predicted Demand</h3>
                    <p className="text-xs text-slate-500">Visualizing past performance against future AI predictions</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-500">
                          <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                          Historical Data
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                          <div className="w-3 h-3 bg-emerald-400 rounded-sm"></div>
                          Forecast ({period} Days)
                      </div>
                  </div>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '1rem',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="historical"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHist)"
                        name="Historical"
                        connectNulls
                      />
                      {/* Using dashed stroke for predicted data to visually distinguish it */}
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPred)"
                        name="Forecast"
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Product Forecast List */}
            {!noData && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Product-Level AI Forecasts</h3>
                  <p className="text-xs text-slate-500 mt-1">Detailed predictions and inventory insights for your listed produce</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-bold">Product</th>
                        <th className="px-6 py-4 font-bold">Current Demand</th>
                        <th className="px-6 py-4 font-bold">Predicted Demand</th>
                        <th className="px-6 py-4 font-bold">Trend / Change</th>
                        <th className="px-6 py-4 font-bold">Confidence</th>
                        <th className="px-6 py-4 font-bold">Why this forecast?</th>
                        <th className="px-6 py-4 font-bold">Inventory & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productForecasts.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.currentDemand} {item.unit}</td>
                          <td className="px-6 py-4">
                              <div className="font-bold text-brand-700">
                                  {item.forecastStatus === 'INSUFFICIENT_DATA' ? (
                                      <span>Forecast Pending</span>
                                  ) : (
                                      <span>{item.predictedDemand} {item.unit}</span>
                                  )}
                              </div>
                              {item.forecastStatus === 'INSUFFICIENT_DATA' && (
                                  <span className="block text-[11px] text-slate-500 font-medium mt-0.5">Collecting more order history</span>
                              )}
                              {item.forecastStatus === 'PRELIMINARY' && (
                                  <span className="block text-[11px] text-amber-600 font-semibold mt-0.5">Preliminary Estimate</span>
                              )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-1">
                                {item.forecastStatus === 'INSUFFICIENT_DATA' ? (
                                    <>
                                        <span className="font-medium text-slate-700">Trend Unavailable</span>
                                        <span className="text-[11px] text-slate-500 font-medium">More historical periods required</span>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant={item.trend.includes('Increasing') ? 'emerald' : item.trend.includes('Decreasing') ? 'red' : item.trend.includes('Stable') ? 'gray' : 'amber'} 
                                            size="sm"
                                        >
                                            {item.trend}
                                        </Badge>
                                        {item.forecastStatus === 'VALID' && item.expectedChange !== null && item.expectedChange !== 0 && (
                                            <span className={`font-bold ${item.expectedChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {item.expectedChange > 0 ? '+' : ''}{item.expectedChange}%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                                {item.forecastStatus === 'INSUFFICIENT_DATA' ? (
                                    <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded w-fit">Insufficient Data</span>
                                ) : item.forecastStatus === 'PRELIMINARY' ? (
                                    <>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                                            Low Confidence
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-medium">Limited Historical Data</span>
                                    </>
                                ) : (
                                    <>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.confidence >= 75 ? 'text-emerald-600' : item.confidence >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                            {item.confidence >= 75 ? 'High Confidence' : item.confidence >= 50 ? 'Medium Confidence' : 'Low Confidence'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${item.confidence >= 75 ? 'bg-emerald-500' : item.confidence >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} 
                                                    style={{ width: `${item.confidence}%` }} 
                                                />
                                            </div>
                                            <span className="font-bold text-slate-600">{item.confidence}%</span>
                                        </div>
                                    </>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="text-[11px] text-slate-600 min-w-[180px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <span className="font-bold block mb-1">Insight:</span>
                                {item.insight}
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="space-y-1.5 min-w-[200px]">
                                  <div className="text-[11px] font-semibold text-slate-500 flex justify-between">
                                      <span>Current Stock: {item.inventory} {item.unit}</span>
                                      {item.predictedDemand > item.inventory ? (
                                        <span className="text-red-500">Shortage Expected</span>
                                      ) : (
                                        <span className="text-emerald-500">Sufficient</span>
                                      )}
                                  </div>
                                  <p className="text-[11px] text-slate-700 leading-relaxed">
                                      {item.recommendation}
                                  </p>
                              </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};
