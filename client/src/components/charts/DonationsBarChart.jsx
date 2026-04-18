import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Per-bar color palette picks from the module accent tokens (Tailwind 500 shades)
const PALETTE = ['#10b981', '#f97316', '#0891b2', '#ec4899', '#f59e0b', '#8b5cf6'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-medium px-3 py-2 text-sm">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-primary-600 font-bold tabular-nums">{payload[0].value} submissions</p>
      </div>
    );
  }
  return null;
}

export default function DonationsBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eff6ff', radius: 4 }} />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
