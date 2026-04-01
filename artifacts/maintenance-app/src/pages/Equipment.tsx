import { useState } from "react";
import { useListEquipment, useCreateEquipment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListEquipmentQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, Button, Modal, Input, Label, Textarea } from "@/components/ui";
import { Plus, Wrench } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  location: z.string().min(2, "Ubicación requerida"),
  description: z.string().optional(),
});

export default function Equipment() {
  const { data: equipment, isLoading } = useListEquipment();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Catálogo de Equipos</h1>
          <p className="text-slate-500">Administre el inventario de maquinaria e instalaciones.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Nuevo Equipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-500">Cargando equipos...</div>
        ) : equipment?.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
            No hay equipos registrados. Añada uno para comenzar.
          </div>
        ) : (
          equipment?.map((eq) => (
            <Card key={eq.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{eq.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-3">{eq.location}</p>
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{eq.description || "Sin descripción adicional."}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  Registrado: {formatDate(eq.createdAt)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateEquipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

function CreateEquipmentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutate: create, isPending } = useCreateEquipment();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    create({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey() });
        form.reset();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Equipo">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del Equipo / Máquina</Label>
          <Input {...form.register("name")} placeholder="Ej. Compresor Principal A" />
          {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Ubicación Físca</Label>
          <Input {...form.register("location")} placeholder="Ej. Planta Sur, Sector 4" />
          {form.formState.errors.location && <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Descripción (Opcional)</Label>
          <Textarea {...form.register("description")} placeholder="Detalles, marca, modelo..." />
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isPending}>Guardar Equipo</Button>
        </div>
      </form>
    </Modal>
  );
}
