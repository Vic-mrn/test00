import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetReport, useUpdateReport, useListUsers } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetReportQueryKey, getListReportsQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, Label, Textarea, Modal } from "@/components/ui";
import { ArrowLeft, UserPlus, CheckCircle, Wrench, FileText, User, Calendar } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS, formatDate } from "@/lib/utils";

export default function ReportDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const reportId = parseInt(id || "0", 10);
  
  const { data: report, isLoading } = useGetReport(reportId);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  if (isLoading) return <Layout><div className="p-8 text-center text-slate-500">Cargando reporte...</div></Layout>;
  if (!report) return <Layout><div className="p-8 text-center text-red-500">Reporte no encontrado</div></Layout>;

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => setLocation("/reports")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Reportes
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-slate-900">{report.title}</h1>
              <Badge variant={report.status} className="text-sm px-3 py-1">{STATUS_LABELS[report.status]}</Badge>
            </div>
            <p className="text-slate-500 flex items-center gap-2">
              <span className="font-mono text-slate-400">#{report.id}</span>
              <span>•</span>
              <span>Creado el {formatDate(report.createdAt)}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {report.status === 'pending' && (
              <Button onClick={() => setIsAssignModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="w-4 h-4" /> Asignar Técnico
              </Button>
            )}
            {report.status === 'in_progress' && (
              <Button onClick={() => setIsResolveModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="w-4 h-4" /> Marcar Resuelto
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Descripción</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{report.description}</p>
              
              {report.notes && (
                <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">Notas de Resolución</h4>
                  <p className="text-amber-900/80">{report.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-lg flex items-center gap-2"><Wrench className="w-5 h-5 text-primary" /> Detalles Técnicos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Prioridad</Label>
                <Badge variant={report.priority} className="text-sm">{PRIORITY_LABELS[report.priority]}</Badge>
              </div>
              
              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Equipo Afectado</Label>
                <div className="font-medium text-slate-900">{report.equipment?.name}</div>
                <div className="text-sm text-slate-500">{report.equipment?.location}</div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <User className="w-3 h-3" /> Reportado Por
                </Label>
                <div className="font-medium text-slate-900">{report.reportedBy?.name}</div>
              </div>

              <div>
                <Label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Asignado A
                </Label>
                {report.assignedTo ? (
                  <div className="font-medium text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-lg border border-indigo-100">
                    {report.assignedTo.name}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">Sin asignar</div>
                )}
              </div>

              {report.resolvedBy && (
                <div className="pt-4 border-t border-slate-100">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Resuelto Por
                  </Label>
                  <div className="font-medium text-emerald-700">{report.resolvedBy.name}</div>
                  <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(report.resolvedAt)}
                  </div>
                  {report.resolutionTime && (
                    <div className="text-sm text-slate-500 mt-1">
                      Tiempo: {Math.round(report.resolutionTime / 60)}h {report.resolutionTime % 60}m
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignModal reportId={reportId} isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} />
      <ResolveModal reportId={reportId} isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} />
    </Layout>
  );
}

function AssignModal({ reportId, isOpen, onClose }: { reportId: number, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: users } = useListUsers();
  const { mutate: updateReport, isPending } = useUpdateReport();
  const [assignedToId, setAssignedToId] = useState("");

  const handleAssign = () => {
    if (!assignedToId) return;
    updateReport(
      { id: reportId, data: { status: "in_progress", assignedToId: parseInt(assignedToId, 10) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(reportId) });
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          onClose();
        }
      }
    );
  };

  const technicians = users?.filter(u => u.role === "technician" || u.role === "admin") || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Técnico" description="Asigne este reporte para que pase a estado En Proceso.">
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>Seleccionar Técnico</Label>
          <Select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)}>
            <option value="">Seleccione...</option>
            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!assignedToId} isLoading={isPending}>Asignar</Button>
        </div>
      </div>
    </Modal>
  );
}

function ResolveModal({ reportId, isOpen, onClose }: { reportId: number, isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: users } = useListUsers();
  const { mutate: updateReport, isPending } = useUpdateReport();
  const [resolvedById, setResolvedById] = useState("");
  const [notes, setNotes] = useState("");

  const handleResolve = () => {
    if (!resolvedById) return;
    updateReport(
      { id: reportId, data: { status: "resolved", resolvedById: parseInt(resolvedById, 10), notes } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(reportId) });
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          onClose();
        }
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Marcar como Resuelto" description="Registre los detalles de la solución.">
      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <Label>¿Quién lo resolvió?</Label>
          <Select value={resolvedById} onChange={(e) => setResolvedById(e.target.value)}>
            <option value="">Seleccione...</option>
            {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Notas de Reparación</Label>
          <Textarea 
            placeholder="Detalle el trabajo realizado y piezas cambiadas..." 
            className="h-32"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleResolve} disabled={!resolvedById} isLoading={isPending} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Resolución</Button>
        </div>
      </div>
    </Modal>
  );
}
