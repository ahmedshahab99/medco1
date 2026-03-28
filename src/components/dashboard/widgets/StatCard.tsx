import React from "react";
import { Card } from "../../ui/Card";
import { StatCardData } from "../../../lib/types/dashboard";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({ data }: { data: StatCardData }) {
  const isPositive = data.trend >= 0;
  const Icon = data.icon;

  return (
    <Card className="flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6 text-blue-600" />}
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(data.trend)}%</span>
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800">{data.value}</h3>
        <p className="text-sm text-slate-500 mt-1 font-medium">{data.title}</p>
      </div>
    </Card>
  );
}
