# ⚽ PENAL - Sistema Inteligente de Análisis de Penales

<div align="center">

![PENAL Logo](public/logo-penal-generic.png)

**Sistema web avanzado para análisis de penales de fútbol mediante Machine Learning, Computer Vision y AWS Cloud Services**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS](https://img.shields.io/badge/AWS-RDS_|_S3_|_SageMaker-FF9900?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![YOLOv11](https://img.shields.io/badge/YOLOv11-Detection-00FFFF?style=flat)](https://github.com/ultralytics/ultralytics)

</div>

---

## 📖 Descripción

PENAL es una aplicación web frontend desarrollada en React que permite a entrenadores, analistas deportivos y jugadores de fútbol analizar penales mediante tecnologías de inteligencia artificial. El sistema integra detección de jugadores con YOLOv11, almacenamiento de videos en AWS S3, base de datos PostgreSQL en RDS y predicciones de Machine Learning con AWS SageMaker.

### Características Principales

- **Visualización de Videos con Análisis de Posturas**: Explora videos de penales con análisis detallado de posiciones del arquero
- **Carga de Videos**: Sistema completo para subir nuevos videos de penales con metadatos
- **Predicción Inteligente**: Predicciones en tiempo real sobre la dirección del tiro usando ML
- **Gestión de Jugadores**: Base de datos completa con estadísticas y análisis de jugadores
- **Detección de Jugadores**: Identificación automática de jugadores en videos usando YOLOv11
- **Estadísticas Detalladas**: Análisis completo de penales por jugador, equipo y competencia

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  HomePage    │  │ PlayersView  │  │PenaltySelect │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ UploadForm   │  │ VideoPlayer  │  │ Prediction   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Flask/Python)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Players API  │  │  Videos API  │  │Prediction API│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ YOLOv11      │  │  Pose Est.   │                            │
│  └──────────────┘  └──────────────┘                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AWS CLOUD SERVICES                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ RDS          │  │ S3 Bucket    │  │ SageMaker    │          │
│  │ PostgreSQL   │  │ (Videos)     │  │ (ML Models)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 16 o superior ([Descargar](https://nodejs.org/))
- **npm** 7 o superior (incluido con Node.js)
- **Python** 3.8+ (para el backend)
- **Git** para clonar el repositorio
- **Cuenta AWS** con acceso a RDS, S3 y SageMaker (opcional para desarrollo)

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/marifortu45/PFI-PENAL-2025-FRONTEND.git
cd PFI-PENAL-2025-FRONTEND
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-scripts` 5.0.1
- `lucide-react` ^0.263.1 (iconos)
- `web-vitals` ^2.1.4

### 3. Configurar Variables de Entorno (Opcional)

Si necesitas configurar la URL del backend, crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Nota**: Por defecto, la aplicación usa `http://localhost:5000/api` como URL del backend.

### 4. Iniciar la Aplicación

```bash
npm start
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`

---

## 🎮 Uso del Sistema

### Página Principal (HomePage)

La pantalla principal presenta 4 módulos principales:

#### 1. 🎥 Ver Videos con Posturas
- Explora la biblioteca de videos de penales
- Visualiza análisis de posturas del arquero
- Filtra por jugador, equipo o competencia
- Reproduce videos con overlays de análisis

**Navegación**: Home → Ver Videos → Selector de Penales → Reproductor de Video

#### 2. 📤 Cargar Video Nuevo
- Sube nuevos videos de penales para análisis
- Completa metadatos del video (jugador, equipo, competencia)
- El sistema procesa automáticamente el video
- Almacena el video en AWS S3

**Flujo de trabajo**:
1. Home → Cargar Video
2. Completar formulario de datos
3. Seleccionar archivo de video
4. Confirmar y subir

**Metadatos requeridos**:
- Nombre del jugador
- Equipo del jugador
- Equipo rival
- Competencia
- Resultado del penal (Gol/Atajado/Afuera)
- Dirección del tiro (Izquierda/Centro/Derecha)
- Altura del tiro (Arriba/Medio/Abajo)
- Pie usado (Izquierdo/Derecho)

#### 3. 🎯 Predicción de Penal
Sistema de dos pasos para predicción inteligente:

**Paso 1: Upload y Detección**
- Sube un video de penal
- YOLOv11 detecta automáticamente jugadores
- Visualiza el video procesado con cajas de detección
- Identifica IDs de jugadores únicos

**Paso 2: Configuración y Predicción**
- Selecciona los IDs de jugadores a analizar
- Indica el pie del pateador (L/R)
- Obtiene predicción de dirección del tiro
- Visualiza probabilidades y confianza

**Características de la Predicción**:
- Análisis de posturas en tiempo real
- Múltiples modelos de ML (LSTM, CNN, ensemble)
- Predicción de 9 zonas de la portería
- Métricas de confianza y explicabilidad

#### 4. 👥 Ver Jugadores
- Lista completa de jugadores en la base de datos
- Búsqueda por nombre
- Estadísticas individuales por jugador
- Historial de penales ejecutados

**Funcionalidades**:
- Ver penales de un jugador específico
- Análisis de tendencias
- Sugerencias personalizadas para arqueros

---

## 📁 Estructura del Proyecto

```
PFI-PENAL-2025-FRONTEND/
│
├── public/
│   ├── favicon.ico                    # Favicon del sitio
│   ├── index.html                     # HTML principal
│   └── logo-penal-generic.png         # Logo de la aplicación
│
├── src/
│   ├── components/                    # Componentes React
│   │   ├── HomePage.jsx               # Página principal (4 módulos)
│   │   ├── PlayersView.jsx            # Lista de jugadores
│   │   ├── PlayerPenalties.jsx        # Penales de un jugador
│   │   ├── PlayerSuggestion.jsx       # Sugerencias para arqueros
│   │   ├── PenaltySelector.jsx        # Selector de videos
│   │   ├── VideoPlayer.jsx            # Reproductor con análisis
│   │   ├── UploadForm.jsx             # Formulario de metadatos
│   │   ├── UploadVideo.jsx            # Subida de archivo
│   │   ├── ConfirmationScreen.jsx     # Confirmación de upload
│   │   ├── PredictionUpload.jsx       # Upload + detección YOLOv11
│   │   ├── PredictionResults.jsx      # Resultados de predicción
│   │   └── ComingSoon.jsx             # Placeholder para futuras features
│   │
│   ├── App.jsx                        # Componente principal y routing
│   ├── index.js                       # Entry point de React
│   └── index.css                      # Estilos globales
│
├── .gitignore                         # Archivos ignorados por git
├── package.json                       # Dependencias y scripts
├── package-lock.json                  # Lockfile de dependencias
├── tailwind.config.js                 # Configuración de Tailwind CSS
└── README.md                          # Este archivo
```

### 📦 Componentes Principales

| Componente | Descripción | Props Principales |
|------------|-------------|-------------------|
| `HomePage` | Pantalla principal con 4 módulos | `onNavigate` |
| `PlayersView` | Lista y búsqueda de jugadores | `onNavigate` |
| `PlayerPenalties` | Historial de penales por jugador | `playerId, onNavigate, onSelectPenalty` |
| `PlayerSuggestion` | Sugerencias tácticas para arqueros | `playerId, onNavigate` |
| `PenaltySelector` | Galería de videos de penales | `onNavigate, onSelectPenalty` |
| `VideoPlayer` | Reproductor con análisis de posturas | `penaltyId, onNavigate` |
| `UploadForm` | Formulario de metadatos de video | `onNavigate, onContinue` |
| `UploadVideo` | Subida de archivo de video | `formData, onNavigate, onContinue` |
| `ConfirmationScreen` | Confirmación de video subido | `uploadData, onNavigate` |
| `PredictionUpload` | Upload + detección con YOLOv11 | `onNavigate, onPredictionComplete` |
| `PredictionResults` | Visualización de predicciones | `predictionData, onNavigate` |

---

## 🔧 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`
Inicia la aplicación en modo desarrollo.
- Abre [http://localhost:3000](http://localhost:3000) en el navegador
- La página se recarga automáticamente al hacer cambios
- Verás errores de lint en la consola

### `npm test`
Ejecuta el test runner en modo interactivo.

### `npm run build`
Crea la aplicación para producción en la carpeta `build/`.
- Optimiza React para mejor rendimiento
- Minifica el código
- Los nombres de archivos incluyen hashes para caching

### `npm run eject`
**⚠️ Nota**: Esta es una operación irreversible.
Expone todas las configuraciones de webpack, Babel, ESLint, etc.

---

## 🎨 Diseño y Estilos

El proyecto utiliza **Tailwind CSS** para el diseño, con una paleta de colores personalizada:

### Tema Visual
- **Colores principales**: Azules y cielos (blue-500 a blue-950)
- **Fondo**: Gradientes oscuros (slate-900, blue-950)
- **Acentos**: Sky blue (#60A5FA, #3B82F6)
- **Efectos**: Glassmorphism, sombras suaves, transiciones fluidas

### Paleta de Colores Personalizada
```javascript
'penal-blue': {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',  // Azul principal
  500: '#3b82f6',  // Azul botones
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',  // Azul oscuro
  950: '#172554',
}
```

### Componentes UI
- Cards con glassmorphism (`bg-white/5 backdrop-blur-sm`)
- Botones con gradientes y hover effects
- Iconos de Lucide React
- Animaciones y transiciones suaves

---

## 🔌 Integración con Backend API

La aplicación frontend consume una API REST desarrollada en Flask. Configurada por defecto en `http://localhost:5000/api`.

### Endpoints Utilizados

#### **Jugadores**
```
GET  /api/players              # Obtener todos los jugadores
GET  /api/players/<id>         # Obtener jugador específico
GET  /api/players/<id>/stats   # Estadísticas del jugador
```

#### **Videos y Penales**
```
GET  /api/penalties            # Obtener todos los penales
GET  /api/penalties/<id>       # Obtener penal específico
GET  /api/video/<path>         # Stream de video desde S3
GET  /api/video/temp/<name>    # Video temporal procesado
```

#### **Upload de Videos**
```
POST /api/upload/video         # Subir video nuevo
     Body: FormData con video + metadatos
     Response: { penalty_id, s3_url, message }
```

#### **Predicción**
```
POST /api/prediction/upload-video
     Body: FormData con video
     Response: { temp_id, filepath, video_info }

POST /api/prediction/detect-players
     Body: { filepath, temp_id }
     Response: { detected_player_ids, stats, processed_video_filename }

POST /api/prediction/predict
     Body: { filepath, temp_id, player_ids[], player_foot }
     Response: { prediction, probabilities, confidence, models_results }
```

#### **Health Check**
```
GET  /api/health               # Estado de la API y base de datos
```

---

## 🤖 Tecnologías de Machine Learning

### YOLOv11 - Detección de Jugadores
- **Modelo**: YOLOv11 entrenado en datasets de fútbol
- **Función**: Detectar y trackear jugadores en el video
- **Output**: Bounding boxes con IDs únicos por jugador

### Modelos de Predicción
El sistema utiliza múltiples modelos para predicción:

1. **LSTM (Long Short-Term Memory)**
   - Análisis de secuencias temporales de posturas
   - Captura patrones de movimiento

2. **CNN (Convolutional Neural Network)**
   - Análisis de frames individuales
   - Extracción de características visuales

3. **Modelo Ensemble**
   - Combina predicciones de múltiples modelos
   - Mayor precisión y robustez

### AWS SageMaker
- **Entrenamiento**: Entrenamiento distribuido de modelos
- **Deploy**: Endpoints para inferencia en tiempo real
- **Monitoreo**: Tracking de performance de modelos
