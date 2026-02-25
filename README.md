# Guía de Anatomía 3D - Ejecución Local

Este proyecto es una aplicación de anatomía interactiva construida con **React**, **Three.js** y **Tailwind CSS**.

## Requisitos
- [Node.js](https://nodejs.org/) (v18.0.0 o superior)
- npm (viene incluido con Node.js)

## Instalación

1. Clona o descarga este repositorio en tu máquina local.
2. Abre una terminal en la carpeta raíz del proyecto.
3. Instala las dependencias:
   ```bash
   npm install
   ```

## Desarrollo

Para iniciar el servidor de desarrollo con recarga en vivo:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000` (o el puerto que indique la terminal).

## Producción

Para crear una versión optimizada para producción en la carpeta `dist/`:
```bash
npm run build
```

## Características
- **Visor 3D**: Carga archivos `.glb` y realiza disecciones virtuales por capas (Huesos, Músculos, Nervios, Vasos).
- **Guía Anatómica**: Información detallada del miembro superior con láminas de Gray's Anatomy.
- **Quiz Interactivo**: Evalúa tus conocimientos con un sistema de preguntas dinámico.

## Solución de Problemas
Si las imágenes no cargan en tu entorno local, asegúrate de tener conexión a internet, ya que la app utiliza proxies externos para garantizar la visualización de las láminas médicas.
