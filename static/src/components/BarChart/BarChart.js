/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { isMobileOS } from "@web/core/browser/feature_detection";

export class BarChart extends Component {
  static template = "mba_bi_dashboard.BarChart";
  static props = {
    chartId: String,
    name: String,
    isDirty: { optional: true, type: Boolean },
    data: { optional: true, type: Object },
    update_chart: { optional: true, type: Function },
    theme: String,
    recordSets: Object,
    export: { optional: true, type: Function },
  };

  setup() {
    this.orm = useService("orm");
    this.chartInstance = null;
    this.resizeHandler = null;
    this.state = useState({ isError: false, errorMessage: false });

    // Paletas de temas compatibles con Odoo 18
    this.themePalettes = {
      animated: ["#71639e", "#17a2b8", "#28a745", "#ffac00", "#e06d53", "#6f42c1", "#20c997", "#007bff"],
      frozen: ["#007bff", "#17a2b8", "#6f42c1", "#5bc0de", "#337ab7", "#4b9cd3", "#2a6496", "#1c3b70"],
      kelly: ["#28a745", "#ffac00", "#e06d53", "#71639e", "#17a2b8", "#6f42c1", "#d9534f", "#f0ad4e"],
      material: ["#2196f3", "#4caf50", "#ff9800", "#e91e63", "#9c27b0", "#00bcd4", "#ff5722", "#607d8b"],
      moonrise: ["#2c3e50", "#34495e", "#7f8c8d", "#95a5a6", "#bdc3c7", "#16a085", "#27ae60", "#2980b9"],
      spirited: ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#34495e"],
    };

    useEffect(
      () => {
        this.render_bar_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_bar_chart();
    });

    onWillUnmount(() => {
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
        this.resizeHandler = null;
      }
      if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
    });
  }

  render_bar_chart() {
    const data = this.props.recordSets;
    const container = document.getElementById("bar_chart__" + this.props.chartId);

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    if (!container) return;

    if (typeof data === "object" && !Array.isArray(data)) {
      this.state.isError = true;
      this.state.errorMessage = data.message || "Error al cargar datos";
      return;
    }

    if (!data || data.length === 0) {
      this.state.isError = true;
      this.state.errorMessage = "No Data to display!";
      return;
    }

    this.state.isError = false;
    this.state.errorMessage = false;

    // Inicializar instancia de Apache ECharts
    this.chartInstance = echarts.init(container);

    const isSubGroup = Boolean(data[0] && data[0].isSubGroupBy);
    const categories = data.map((d) => d.category);
    
    // Obtener campos de medida (excluyendo metadatos)
    const valueKeys = Object.keys(data[0]).filter(
      (k) => !["category", "record_id", "isSubGroupBy"].includes(k)
    );

    const palette = this.themePalettes[this.props.theme] || this.themePalettes.animated;
    const computedStyle = getComputedStyle(document.documentElement);
    const textDark = computedStyle.getPropertyValue("--o-gray-900").trim() || "#212529";
    const textMuted = computedStyle.getPropertyValue("--o-gray-700").trim() || "#495057";

    const formatLabel = (text, maxLength = 18) => {
      if (!text || typeof text !== "string") return text;
      return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    };

    const series = valueKeys.map((key, idx) => ({
      name: key,
      type: "bar",
      barMaxWidth: 30,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: palette[idx % palette.length],
      },
      data: data.map((d) => ({
        value: d[key] || 0,
        record_id: d.record_id,
        category: d.category,
      })),
      label: {
        show: true,
        position: "insideLeft",
        formatter: (params) => {
          const val = params.value;
          return val !== null && val !== undefined ? val : "";
        },
        color: textDark,
        fontWeight: "bold",
        fontSize: 11,
      },
      emphasis: {
        focus: "series",
      },
    }));

    const option = {
      color: palette,
      animationDuration: 800,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          if (!params || !params.length) return "";
          let res = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((item) => {
            res += `${item.marker} ${item.seriesName}: <strong>${item.value}</strong><br/>`;
          });
          return res;
        },
      },
      legend: {
        show: valueKeys.length > 1,
        bottom: 0,
        type: "scroll",
        textStyle: { color: textMuted },
      },
      grid: {
        left: isMobileOS() ? "28%" : "22%",
        right: "8%",
        top: "6%",
        bottom: valueKeys.length > 1 ? "12%" : "6%",
        containLabel: false,
      },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", opacity: 0.3 } },
        axisLabel: {
          color: textMuted,
          formatter: (val) => {
            return val >= 1000 ? (val / 1000).toFixed(0) + "k" : val;
          },
        },
      },
      yAxis: {
        type: "category",
        data: categories,
        inverse: true, // Orden superior a inferior (de mayor a menor)
        axisLabel: {
          interval: 0,
          formatter: (value) => formatLabel(value, isMobileOS() ? 12 : 20),
          color: textMuted,
          fontSize: 11,
        },
      },
      series: series,
    };

    this.chartInstance.setOption(option);

    // Evento de interactividad y drill-down
    this.chartInstance.on("click", (params) => {
      if (this.props.update_chart && params.data) {
        this.props.update_chart(parseInt(this.props.chartId), "bar_chart", {
          category: params.data.category,
          record_id: params.data.record_id,
        });
      }
    });

    // Soporte para exportación a imagen
    if (this.props.export) {
      this.props.export({
        export: async (type = "png") => {
          return this.chartInstance.getDataURL({
            type: "png",
            pixelRatio: 2,
            backgroundColor: "#fff",
          });
        },
      });
    }

    // Auto resize
    if (!this.resizeHandler) {
      this.resizeHandler = () => {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      };
      window.addEventListener("resize", this.resizeHandler);
    }
  }
}

