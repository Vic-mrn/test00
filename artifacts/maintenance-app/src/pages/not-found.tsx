import { Link } from "wouter";
import { Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">404 - Página no encontrada</h1>
        <p className="text-slate-500 mb-8">La página que estás buscando no existe o ha sido movida.</p>
        <Button onClick={() => window.location.href = "/"} className="w-full">
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
}
