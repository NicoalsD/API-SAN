export interface Env {
  puerto: number;
  baseDatos: {
    host: string;
    puerto: number;
    usuario: string;
    contrasena: string;
    nombre: string;
    sincronizar: boolean;
  };
}
