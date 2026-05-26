<h1 align="center">🩺 DermaScan</h1>

<p align="center">
  <strong>Sistema Web de Apoyo al Diagnóstico de Cáncer de Piel mediante IA Híbrida</strong>
</p>

## 📋 Descripción del Proyecto
DermaScan es una plataforma web *Full Stack* (end-to-end) diseñada para asistir a especialistas médicos en la detección temprana del cáncer de piel. El sistema permite gestionar historiales clínicos de pacientes y realizar análisis de imágenes dermatoscópicas utilizando un modelo de Inteligencia Artificial híbrido que combina la extracción de características locales y globales de la lesión.

## ✨ Características Principales
- **Autenticación Segura:** Acceso exclusivo para personal médico y especialistas autorizados mediante Supabase Auth.
- **Gestión de Pacientes (CRUD):** Registro, visualización, edición y eliminación de historiales clínicos.
- **Diagnóstico Asistido por IA:** Análisis de imágenes dermatoscópicas en tiempo real.
- **Clasificación Binaria:** Predicción inteligente de lesiones (Maligno / Benigno) con un Score de probabilidad.
- **Panel de Observaciones:** Espacio integrado para agregar notas médicas y confirmación del diagnóstico final.

## 🏗️ Arquitectura y Tecnologías (Stack PERN Modificado)

### Frontend (Interfaz de Usuario)
- **React 18** + **Vite:** Para un desarrollo ultrarrápido y componentes reactivos.
- **Tailwind CSS:** Diseño UI/UX moderno, limpio y responsivo enfocado en entornos clínicos.
- **React Router v7:** Navegación Single Page Application (SPA) fluida y protección de rutas.
- **Context API:** Gestión nativa del estado global (Autenticación y Casos médicos).
- **Despliegue:** [Vercel](https://vercel.com/)

### Backend & IA (Motor de Inferencia)
- **FastAPI:** API RESTful de altísimo rendimiento para el procesamiento asíncrono.
- **PyTorch:** Framework core de Deep Learning utilizado para cargar y ejecutar los tensores del modelo.
- **Modelo Híbrido:** Integración de **CNN** (Redes Neuronales Convolucionales) para visión local + **ViT** (Vision Transformers) para contexto global.
- **Pydantic:** Validación estricta y segura de las estructuras de datos.
- **Despliegue:** [Railway](https://railway.app/)

### Base de Datos & Persistencia
- **Supabase:** Plataforma Backend-as-a-Service.
- **PostgreSQL:** Motor de base de datos relacional para almacenar perfiles y diagnósticos.

## 📊 Rendimiento del Modelo de IA
El modelo híbrido propuesto ha sido evaluado con rigurosidad científica, demostrando superioridad frente a arquitecturas individuales estándar:
- **AUC-ROC:** 0.9731
- **Sensibilidad:** 91% en la detección de lesiones malignas.
- *Impacto Clínico:* Demostró una alta capacidad de filtrado, reduciendo drásticamente los falsos negativos en etapas tempranas.

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/dermascan.git](https://github.com/tu-usuario/dermascan.git)
cd dermascan
