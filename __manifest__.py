# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    "name": "Tableros de Inteligencia de Negocio BI (MBA Consultings)",
    "version": "18.0.1.0.29",
    "category": "Productivity/Analytics",
    "summary": "Cuadros de mando interactivos, KPIs ejecutivos y analítica en tiempo real para Panamá | MBA Consultings",
    "description": """
Tableros de Inteligencia de Negocio BI (MBA Consultings)
=========================================================

Suite ejecutiva de Inteligencia de Negocios y Analítica Visual diseñada para Odoo 18 Community Edition,
optimizada para la toma de decisiones estratégicas y adaptada al mercado empresarial de Panamá.

Características Principales:
-----------------------------
* **Visualizaciones Interactivas**: Soporte para más de 15 tipos de gráficos (Barras, Columnas, Líneas, Dona, Torta, Área, Embudo, Pirámide, Radar, Radial, Dispersión, Medidor, Mapas, Listas y Actividades).
* **Motor Drag-and-Drop con GridStack**: Reorganización y dimensionamiento flexible de widgets y tableros.
* **Métricas y KPIs en Tiempo Real**: Agregaciones dinámicas (Suma, Promedio, Conteo, Mínimo, Máximo) con agrupaciones por periodos fiscales y cronológicos.
* **Diseño Nativo Odoo 18 CE**: Integración estética completa con el framework web de Odoo 18, paleta armónica y rendimiento óptimo.
* **Exportación y Automatización**: Exportación de reportes en Excel, CSV, Imagen y PDF, con programación de envíos automáticos por correo electrónico.
* **Control de Seguridad y Acceso**: Gestión granular de permisos por usuarios y grupos de seguridad.
    """,
    "author": "MBA Consultings, Brooks Gonzalez",
    "website": "https://mbaconsultings.com",
    "license": "LGPL-3",
    "depends": [
        "web",
        "mail",
        "account",
        "sale_management",
        "stock",
        "purchase",
    ],
    "data": [
        "security/dashboard_security.xml",
        "security/ir.model.access.csv",
        "data/mail_template.xml",
        "views/ir_ui_menu_views.xml",
        "wizard/dashboard_access_view.xml",
        "wizard/mail_compose_message_views.xml",
        "views/dashboard_view.xml",
        "views/dashboard_chart_view.xml",
        "views/res_users_view.xml",
        "data/dashboard_data.xml",
        "data/dashboard_panama_data.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "mba_bi_dashboard/static/src/lib/html2canvas.js",
            "mba_bi_dashboard/static/src/lib/jspdf.js",
            "mba_bi_dashboard/static/src/lib/echarts/echarts.min.js",
            "mba_bi_dashboard/static/src/lib/amcharts/index.js",
            "mba_bi_dashboard/static/src/lib/amcharts/xy.js",
            "mba_bi_dashboard/static/src/lib/amcharts/exporting.js",
            "mba_bi_dashboard/static/src/lib/amcharts/map.js",
            "mba_bi_dashboard/static/src/lib/amcharts/worldLow.js",
            "mba_bi_dashboard/static/src/lib/amcharts/radar.js",
            "mba_bi_dashboard/static/src/lib/amcharts/flow.js",
            "mba_bi_dashboard/static/src/lib/amcharts/percent.js",
            "mba_bi_dashboard/static/src/lib/amcharts/hierarchy.js",
            "mba_bi_dashboard/static/src/lib/themes/**/*",
            "mba_bi_dashboard/static/src/lib/gridstack/**/*",
            "mba_bi_dashboard/static/src/js/dashboard_form_view.js",
            "mba_bi_dashboard/static/src/scss/dashboard_form_view.scss",
            "mba_bi_dashboard/static/src/js/form_dashboard_preview.js",
            "mba_bi_dashboard/static/src/xml/form_dashboard_preview.xml",
            "mba_bi_dashboard/static/src/js/fa_icon_widget.js",
            "mba_bi_dashboard/static/src/xml/fa_icon_widget.xml",
            "mba_bi_dashboard/static/src/js/dashboard_chart_wrapper.js",
            "mba_bi_dashboard/static/src/scss/dashboard_chart_wrapper.scss",
            "mba_bi_dashboard/static/src/xml/dashboard_chart_wrapper.xml",
            "mba_bi_dashboard/static/src/js/dashboard_amcharts.js",
            "mba_bi_dashboard/static/src/xml/dashboard_amcharts.xml",
            "mba_bi_dashboard/static/src/js/dashboard_selection/*",
            "mba_bi_dashboard/static/src/components/**/*",
            "mba_bi_dashboard/static/src/components/KPILayouts/**/*",
            "mba_bi_dashboard/static/src/components/TileLayouts/**/*",
        ],
    },
    "cloc_exclude": [
        "static/src/lib/**/*",
    ],
    "images": [
        "static/description/icon.png",
    ],
    "installable": True,
    "application": True,
    "auto_install": False,
    "uninstall_hook": "uninstall_hook",
}
