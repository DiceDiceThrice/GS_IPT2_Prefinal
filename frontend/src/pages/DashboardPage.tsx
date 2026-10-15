import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { reports } from '@/api/hooks'
import type { DashboardReport } from '@/types'
import LoadingState from '@/components/LoadingState'

export default function DashboardPage() {
  const { data: report, isLoading } = reports.useDashboard() as {
    data: DashboardReport | undefined
    isLoading: boolean
  }

  if (isLoading) return <LoadingState />

  const transactions = report?.transactions ?? []

  const stats = [
    { label: 'Variants', value: report?.variants ?? 0 },
    { label: 'Units in stock', value: report?.units ?? 0 },
    {
      label: 'Inventory value',
      value: `$${Number(report?.inventory_value ?? 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Net total</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                    No transactions yet
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, i) => (
                  <TableRow key={i}>
                    <TableCell className="capitalize">{tx.type}</TableCell>
                    <TableCell className="text-right">${Number(tx.net_total ?? 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{tx.order_count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
