// Skeleton building blocks — use for every loading state

export function Sk({ w = "100%", h = 16, rounded = 6 }: { w?: string | number; h?: number; rounded?: number }) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: rounded, flexShrink: 0 }}
    />
  )
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-2">
      <Sk w="60%" h={10} />
      <Sk w="50%" h={36} rounded={8} />
      <Sk w="80%" h={10} />
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <Sk h={14} w={i === 0 ? "70%" : i === cols - 1 ? "40%" : "85%"} />
        </td>
      ))}
    </tr>
  )
}

// Table skeleton wrapper
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  )
}

// Card skeleton (for list views)
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Sk w="40%" h={14} />
        <Sk w={60} h={22} rounded={12} />
      </div>
      <Sk w="70%" h={12} />
      <Sk w="50%" h={12} />
    </div>
  )
}

// Dashboard full skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <Sk w="40%" h={14} />
          <Sk w="100%" h={200} rounded={8} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <Sk w="40%" h={14} />
          <Sk w="100%" h={200} rounded={8} />
        </div>
      </div>
    </div>
  )
}

// Rapport list skeleton
export function RapportListSkeleton() {
  return (
    <div className="space-y-3">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sk w={40} h={40} rounded={12} />
            <div className="space-y-2">
              <Sk w={220} h={14} />
              <Sk w={160} h={11} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sk w={70} h={26} rounded={20} />
            <Sk w={60} h={32} rounded={8} />
          </div>
        </div>
      ))}
    </div>
  )
}
