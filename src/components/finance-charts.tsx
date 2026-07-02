"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const trend = [
  { name: "Week 1", income: 120000, expenses: 52000 },
  { name: "Week 2", income: 180000, expenses: 76000 },
  { name: "Week 3", income: 240000, expenses: 95000 },
  { name: "Week 4", income: 210000, expenses: 68000 }
];

const fallbackMix = [
  { name: "Photography", value: 55 },
  { name: "Printing", value: 18 },
  { name: "Online", value: 15 },
  { name: "Design", value: 12 }
];

export function FinanceCharts({ serviceIncome = fallbackMix }: { serviceIncome?: { name: string; value: number }[] }) {
  const mix = serviceIncome.length > 0 ? serviceIncome : fallbackMix;
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="card p-5">
        <h2 className="mb-4 text-xl font-black">Income vs Expenses</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#061a38" />
              <Bar dataKey="expenses" fill="#d8a84f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card p-5">
        <h2 className="mb-4 text-xl font-black">Service Income Breakdown</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={mix} dataKey="value" nameKey="name" outerRadius={95} label>
                {mix.map((_, index) => <Cell key={index} fill={["#061a38", "#d8a84f", "#5f6b7a", "#111111"][index]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
