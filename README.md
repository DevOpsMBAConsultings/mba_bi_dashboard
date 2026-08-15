# Tableros de Inteligencia de Negocio BI (MBA Consultings)

![MBA Consultings](https://mbaconsultings.com)

**Módulo Técnico:** `mba_bi_dashboard`  
**Versión:** `18.0.1.0.0`  
**Licencia:** LGPL-3  
**Autor:** MBA Consultings, Brooks Gonzalez  
**Sitio Web:** [https://mbaconsultings.com](https://mbaconsultings.com)  

---

## 📊 Descripción

Suite avanzada de **Inteligencia de Negocios (BI) y Analítica Ejecutiva** diseñada para **Odoo 18 Community Edition**, adaptada para la gestión financiera, comercial, operativa y fiscal de empresas en Panamá.

Permite a directores, gerentes y analistas crear cuadros de mando 100% interactivos con tecnología de arrastrar y soltar (*drag-and-drop*), KPIs en tiempo real, agregaciones dinámicas y exportación de informes ejecutivos.

---

## 🚀 Características Principales

- **+15 Tipos de Visualización Dinámica**:
  - Indicadores clave de rendimiento (KPIs) con comparativas contra periodos anteriores.
  - Tarjetas de resumen métrico (*Tile Views*).
  - Gráficos de Barras, Columnas y Columnas Apiladas.
  - Gráficos de Líneas y Áreas.
  - Gráficos Circulares (*Pie*) y de Dona (*Doughnut*).
  - Gráficos de Embudo de Ventas (*Funnel*) y Pirámides.
  - Gráficos de Radar y Radiales.
  - Gráficos de Dispersión (*Scatter*).
  - Medidores de objetivos (*Meter / Gauge*).
  - Vistas de Lista y Tableros de Tareas / Actividades (*To-Do*).
- **Diseño Nativo Odoo 18 CE**:
  - Estilizado con SCSS nativo (`$o-gray-*`, `$o-brand-primary`, `$o-success`).
  - Totalmente responsivo en navegadores de escritorio y dispositivos móviles.
- **Motor Drag & Drop con GridStack**:
  - Reorganización visual fluida en cuadrícula flexible de 12 a 36 columnas.
  - Redimensionamiento y guardado de coordenadas en tiempo real.
- **Analítica y Agregación Flexible**:
  - Operaciones: Suma, Promedio, Conteo, Mínimo y Máximo.
  - Agrupación cronológica: Día, Semana, Mes, Trimestre y Año.
  - Dominios y filtros avanzados basados en cualquier modelo de Odoo (`account.move`, `sale.order`, `stock.picking`, `crm.lead`, `purchase.order`, etc.).
- **Exportación y Automatización**:
  - Descarga directa de datos a **Excel (XLSX)**, **CSV** o captura en **Imagen PNG**.
  - Impresión integral del tablero a **PDF**.
  - Programación de envíos automáticos por correo electrónico mediante tareas programadas (`ir.cron`).
  - Exportación e importación de la configuración completa del tablero en formato **JSON**.

---

## 🇵🇦 Tableros Recomendados para Panamá

1. **Tablero Ejecutivo General**:
   - Ingresos Netos, Margen Bruto, Ticket Promedio.
   - Top 10 Clientes y Top 10 Productos con mayor volumen de facturación.
2. **Tablero Financiero y Fiscal (DGI / FE)**:
   - Débito y Crédito Fiscal de ITBMS (7%, 10%, 15%, Exento).
   - Facturación Electrónica (PAC): Estado de facturas autorizadas vs pendientes.
   - Antigüedad de Saldos / Aging de Cartera (0-30, 31-60, 61-90, 90+ días).
   - Compromisos de Cuentas por Pagar (CxP) y Posición de Bancos/Caja.
3. **Tablero Comercial y Ventas**:
   - Pipeline de Oportunidades y Tasa de Conversión.
   - Ventas por Asesor Comercial y por Zona Geográfica (Provincias de Panamá).
4. **Tablero de Inventario y Operaciones**:
   - Valorización de Inventario por Almacén / Categoría.
   - Días de Inventario (DSI) y Alerta de Quiebre de Stock.

---

## 🛠️ Instalación y Configuración

1. Colocar el módulo dentro de la ruta de addons:
   ```bash
   /opt/odoo/custom-addons/mba_bi_dashboard
   ```
2. Actualizar la lista de aplicaciones en Odoo o ejecutar mediante CLI:
   ```bash
   odoo-bin -c /etc/odoo18.conf -u mba_bi_dashboard -d odoo18 --stop-after-init
   ```
3. Ingresar al menú **Tableros BI** en Odoo 18.

---

## 🏢 Contacto y Soporte

Desarrollado con excelencia por **MBA Consultings**.

- 🌐 **Sitio Web:** [https://mbaconsultings.com](https://mbaconsultings.com)  
- ✉️ **Contacto:** `brooks@mbaconsultings.com`  
- 🇵🇦 **Ciudad de Panamá, Panamá**
