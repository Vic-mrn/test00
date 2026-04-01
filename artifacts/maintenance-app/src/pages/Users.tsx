import { useState } from "react";
import { useListUsers, useCreateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListUsersQueryKey } from "@workspace/api-client-react";
import Layout from "@/components/Layout";
import { Card, CardContent, Button, Modal, Input, Label, Select, Badge } from "@/components/ui";
import { Plus, Users as UsersIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ROLE_LABELS, formatDate } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  role: z.enum(["reporter", "technician", "admin"]),
});

export default function Users() {
  const { data: users, isLoading } = useListUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Personal</h1>
          <p className="text-slate-500">Gestione técnicos, reportadores y administradores.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-5 h-5" /> Nuevo Usuario
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando usuarios...</td></tr>
              ) : (
                users?.map((u) => (
                  <tr key={u.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UsersIcon className="w-4 h-4" />
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'technician' ? 'primary' : 'default'}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}

function CreateUserModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient();
  const { mutate: create, isPending } = useCreateUser();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: "reporter" }
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    create({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        form.reset();
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Usuario">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre Completo</Label>
          <Input {...form.register("name")} placeholder="Juan Pérez" />
          {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Correo Electrónico</Label>
          <Input type="email" {...form.register("email")} placeholder="juan@empresa.com" />
          {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Rol del Sistema</Label>
          <Select {...form.register("role")}>
            <option value="reporter">Reportador (Solo crea reportes)</option>
            <option value="technician">Técnico (Atiende reportes)</option>
            <option value="admin">Administrador (Control total)</option>
          </Select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={isPending}>Guardar Usuario</Button>
        </div>
      </form>
    </Modal>
  );
}
