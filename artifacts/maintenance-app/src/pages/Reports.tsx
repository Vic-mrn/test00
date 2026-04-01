import { useState } from "react";
import { useLocation } from "wouter";
import { useListReports, useListEquipment, useListUsers, useCreateReport, ReportStatus, ReportPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListReportsQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, Badge, Button, Input, Select, Modal, Label, Textarea } from "@/components/ui";
import { Plus, Search, Filter } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS, formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const createReportSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(5, "Mínimo 5 caracteres"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  equipmentId: z.coerce.number().min(1, "Seleccione un equipo"),
  reportedById: z.coerce.number().min(1, "Seleccione quien reporta"),
});

export default function Reports() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: reports, isLoading } = useListReports();

  const filteredReports = reports?.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.equipment?.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Reportes</h1>
          <p className="text-slate-500">Gestione y de seguimiento a las incidencias.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Nuevo Reporte
        </Button>
      </div>

      <Card className="mb-6 shadow-sm border-slate-200">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar por título o equipo..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-64">
            <Filter className="w-5 h-5 text-slate-400" />
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-lg shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Reporte</th>
                <th className="px-6 py-4 font-semibold">Equipo</th>
                <th className="px-6 py-4 font-semibold">Prioridad</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Asignado a</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando reportes...</td></tr>
              ) : filteredReports?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No se encontraron reportes.</td></tr>
              ) : (
                filteredReports?.map((report) => (
                  <tr 
                    key={report.id} 
                    onClick={() => setLocation(`/reports/${report.id}`)}
                    className="bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]">{report.title}</div>
                      <div className="text-xs text-slate-500">#{report.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {report.equipment?.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={report.priority}>{PRIORITY_LABELS[report.priority]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={report.status}>{STATUS_LABELS[report.status]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {report.assignedTo?.name || <span className="text-slate-400 italic">Sin asignar</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {formatDate(report.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

function CreateReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data: equipment } = useListEquipment();
  const { data: users } = useListUsers();
  const { mutate: createReport, isPending } = useCreateReport();

  const form = useForm<z.infer<typeof createReportSchema>>({
    resolver: zodResolver(createReportSchema),
    defaultValues: { priority: "medium" },
  });

  const onSubmit = (data: z.infer<typeof createReportSchema>) => {
    createReport({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
        form.reset();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Reporte" description="Ingrese los detalles de la incidencia.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label>Título del Reporte</Label>
          <Input {...form.register("title")} placeholder="Ej. Falla en motor principal" />
          {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Equipo Afectado</Label>
          <Select {...form.register("equipmentId")}>
            <option value="">Seleccione un equipo...</option>
            {equipment?.map(e => <option key={e.id} value={e.id}>{e.name} - {e.location}</option>)}
          </Select>
          {form.formState.errors.equipmentId && <p className="text-xs text-red-500">{form.formState.errors.equipmentId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select {...form.register("priority")}>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>¿Quién Reporta?</Label>
          <Select {...form.register("reportedById")}>
            <option value="">Seleccione usuario...</option>
            {users?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </Select>
          {form.formState.errors.reportedById && <p className="text-xs text-red-500">{form.formState.errors.reportedById.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Descripción Detallada</Label>
          <Textarea {...form.register("description")} placeholder="Describa el problema encontrado..." className="h-32" />
          {form.formState.errors.description && <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>}
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isPending}>Crear Reporte</Button>
        </div>
      </form>
    </Modal>
  );
}
