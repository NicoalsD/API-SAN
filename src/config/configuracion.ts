export interface Configuracion {
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

export default (): Configuracion => ({
  puerto: parseInt(process.env.PORT ?? '3000', 10),
  baseDatos: {
    host: process.env.DB_HOST ?? 'localhost',
    puerto: parseInt(process.env.DB_PORT ?? '5432', 10),
    usuario: process.env.POSTGRES_USER ?? 'postgres',
    contrasena: process.env.POSTGRES_PASSWORD ?? 'postgres',
    nombre: process.env.POSTGRES_DB ?? 'api_san',
    sincronizar: process.env.NODE_ENV !== 'production',
  },
});
