import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NutritionData } from '../types';
import { AlertCircle, CheckCircle, Flame, Droplet, Wheat, Beef, Camera } from 'lucide-react';

interface ResultViewProps {
  data: NutritionData;
  onScanAgain: () => void;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6']; // Protein (Green), Fat (Yellow), Carbs (Blue)

export const ResultView: React.FC<ResultViewProps> = ({ data, onScanAgain }) => {
  
  if (!data.isFoodLabel) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-fadeIn">
        <div className="bg-orange-100 p-4 rounded-full text-orange-500">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">无法识别？</h2>
        <p className="text-stone-600">
          未能检测到营养成分表。图片看起来像是 **{data.productName}**。
          请尝试更清晰地拍摄配料表或营养成分表。
        </p>
        <button
          onClick={onScanAgain}
          className="px-8 py-3 bg-stone-900 text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
        >
          重试
        </button>
      </div>
    );
  }

  const chartData = [
    { name: '蛋白质', value: data.protein || 0 },
    { name: '脂肪', value: data.fat || 0 },
    { name: '碳水', value: data.carbs || 0 },
  ];
  
  // Filter out zero values for cleaner chart
  const activeChartData = chartData.filter(d => d.value > 0);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto pb-24 animate-fadeIn">
      
      {/* Header Summary */}
      <div className="px-6 py-6 bg-white rounded-b-3xl shadow-sm border-b border-stone-100 z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-stone-800 truncate leading-tight">{data.productName}</h1>
        <p className="text-stone-500 text-sm mt-1 flex items-center gap-1">
          <CheckCircle size={14} className="text-emerald-500" /> 分析完成
        </p>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        
        {/* Calories & Macros Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Calorie Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-stone-400 mb-2">
              <Flame size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">能量</span>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-stone-800">{data.calories}</span>
              <span className="text-stone-500 text-sm ml-1">千卡</span>
            </div>
          </div>

          {/* Chart Card */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center relative">
             <div className="absolute text-center">
                 <span className="text-[10px] text-stone-400 font-bold">营养占比</span>
             </div>
            <div className="w-full h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={35}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Macros */}
        <div className="grid grid-cols-3 gap-3">
          <MacroItem label="蛋白质" value={data.protein} unit="克" icon={<Beef size={16}/>} color="text-emerald-600" bg="bg-emerald-50" />
          <MacroItem label="碳水" value={data.carbs} unit="克" icon={<Wheat size={16}/>} color="text-blue-600" bg="bg-blue-50" />
          <MacroItem label="脂肪" value={data.fat} unit="克" icon={<Droplet size={16}/>} color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* Health Summary */}
        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
          <h3 className="font-bold text-emerald-900 mb-2 text-sm uppercase tracking-wide">AI 健康简评</h3>
          <p className="text-emerald-800 leading-relaxed text-sm">
            {data.healthSummary}
          </p>
          
          <div className="mt-4 space-y-2">
            {data.pros && data.pros.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {data.pros.map((pro, i) => (
                   <span key={i} className="px-2 py-1 bg-white text-emerald-700 text-xs rounded-md border border-emerald-100 font-medium">
                     👍 {pro}
                   </span>
                 ))}
               </div>
            )}
            {data.cons && data.cons.length > 0 && (
               <div className="flex flex-wrap gap-2">
                 {data.cons.map((con, i) => (
                   <span key={i} className="px-2 py-1 bg-white text-orange-700 text-xs rounded-md border border-orange-100 font-medium">
                     ⚠️ {con}
                   </span>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
           <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wide">主要配料</h3>
           <ul className="space-y-2">
             {data.ingredients.slice(0, 8).map((ing, i) => (
               <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                 <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-stone-300 flex-shrink-0"></span>
                 {ing}
               </li>
             ))}
             {data.ingredients.length > 8 && (
               <li className="text-xs text-stone-400 italic pt-1">
                 + 还有 {data.ingredients.length - 8} 种配料...
               </li>
             )}
           </ul>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <button 
          onClick={onScanAgain}
          className="w-full pointer-events-auto bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          再扫一个
        </button>
      </div>
    </div>
  );
};

const MacroItem: React.FC<{ label: string; value: number; unit: string; icon: React.ReactNode; color: string; bg: string }> = ({ label, value, unit, icon, color, bg }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${bg}`}>
    <div className={`mb-1 ${color}`}>{icon}</div>
    <span className="text-lg font-bold text-stone-800">{value}</span>
    <span className="text-xs text-stone-500 font-medium">{label}</span>
  </div>
);