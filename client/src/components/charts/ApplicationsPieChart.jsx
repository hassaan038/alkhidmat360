import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// loan=cyan, ration=orange, orphan=pink — match module accents
const COLORS = ['#06b6d4', '#f97316', '#ec4899', '#8b5cf6'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-medium px-3 py-2 text-sm">
        <p className="font-semibold text-gray-900">{payload[0].name}</p>
        <p className="font-bold tabular-nums" style={{ color: payload[0].payload?._color || '#06b6d4' }}>
          {payload[0].value} applications
        </p>
      </div>
    );
  }
  return null;
}

export default function ApplicationsPieChart({ data }) {
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
        No application data yet
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const enriched = data.map((d, i) => ({ ...d, _color: COLORS[i % COLORS.length] }));

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: '55%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enriched}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={2}
              labelLine={false}
            >
              {enriched.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry._color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{total}</p>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">total</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {enriched.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry._color }}
            />
            <span className="text-xs text-gray-700 truncate">{entry.name}</span>
            <span className="ml-auto text-xs font-semibold text-gray-900 tabular-nums">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
