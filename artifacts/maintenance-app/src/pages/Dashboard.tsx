import { useGetStats, useListReports } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from "@/components/ui";
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS, formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: reports, isLoading: reportsLoading } = useListReports();
  const [, setLocation] = useLocation();

  const recentReports = reports?.slice(0, 5) || [];

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        
        {/* Header Area */}
        <div className="flex items-center justify-between relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-10 shadow-xl shadow-slate-900/10">
          {/* Subtle industrial background effect */}
          <div className="absolute inset-0 opacity-20 bg-[url('/images/industrial-abstract.png')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
          
          <div className="relative z-10 text-white">
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2">Panel de Control</h1>
            <p className="text-slate-300 max-w-xl">Resumen operativo y estado general de los reportes de mantenimiento activos.</p>
          </div>
          <div className="relative z-10 hidden sm:block">
            <Button size="lg" onClick={() => setLocation("/reports")}>
              Ver Todos <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Reportes" 
            value={stats?.total} 
            loading={statsLoading} 
            icon={<ClipboardList className="w-6 h-6 text-blue-600" />} 
            className="border-l-4 border-l-blue-600"
          />
          <StatCard 
            title="Pendientes" 
            value={stats?.pending} 
            loading={statsLoading} 
            icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
            className="border-l-4 border-l-amber-500"
          />
          <StatCard 
            title="En Proceso" 
            value={stats?.inProgress} 
            loading={statsLoading} 
            icon={<Clock className="w-6 h-6 text-primary" />}
            className="border-l-4 border-l-primary"
          />
          <StatCard 
            title="Resueltos" 
            value={stats?.resolved} 
            loading={statsLoading} 
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
            className="border-l-4 border-l-emerald-500"
          />
        </div>

        {/* Recent Reports Table */}
        <Card className="shadow-lg shadow-slate-200/40">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Reportes Recientes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLocation("/reports")}>
              Gestionar
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {reportsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-lg font-medium">No hay reportes recientes</p>
                <p className="text-sm">Todo el equipo está funcionando correctamente.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">ID / Título</th>
                      <th className="px-6 py-4 font-semibold">Prioridad</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold">Creado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((report) => (
                      <tr 
                        key={report.id} 
                        onClick={() => setLocation(`/reports/${report.id}`)}
                        className="bg-white border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 truncate max-w-xs">{report.title}</div>
                          <div className="text-xs text-slate-500">#{report.id} • {report.equipment?.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={report.priority}>{PRIORITY_LABELS[report.priority]}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={report.status}>{STATUS_LABELS[report.status]}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(report.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, loading, icon, className }: { title: string, value?: number, loading: boolean, icon: React.ReactNode, className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-display font-bold text-slate-900">{value || 0}</p>
          )}
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
