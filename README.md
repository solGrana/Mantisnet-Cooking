# Mantisnet Cooking

Mantisnet Cooking es una aplicación de recetas que permite a los usuarios visualizar recetas y a los administradores agregar, editar y eliminarlas, con soporte para subir imágenes. La aplicación utiliza una base de datos PostgreSQL para almacenar las recetas y Cloudinary para gestionar las imágenes subidas.

## Características
- Visualización de recetas.
- Agregar nuevas recetas con una imagen, descripción, etc.
- Editar y eliminar recetas existentes.
- Autenticación de administradores.
- Conexión a una base de datos PostgreSQL alojada en Supabase.
- Carga de imágenes usando Cloudinary.

## Tecnologías utilizadas
- **Node.js** y **Express** para crear el servidor.
- **PostgreSQL** para almacenar las recetas.
- **Supabase** como hosting de la base de datos PostgreSQL.
- **Multer** para manejar la subida de archivos.
- **Cloudinary** para almacenar imágenes de forma externa.
- **fs-extra** para manipular archivos en el servidor.
- **dotenv** para manejar variables de entorno.
- **Render** para el despliegue de la aplicación.

