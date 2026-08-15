/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { isMobileOS } from "@web/core/browser/feature_detection";

export class ScatterChart extends Component {
  static template = "mba_bi_dashboard.ScatterChart";
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
        this.render_scatter_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_scatter_chart();
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

  render_scatter_chart() {
    let rawData = this.props.recordSets;
    const container = document.getElementById("scatter_chart__" + this.props.chartId);

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    if (!container) return;

    if (typeof rawData == "object" && !Array.isArray(rawData)) {
      this.state.isError = true;
      this.state.errorMessage = rawData.message || "Error al cargar datos";
      return;
    }

    if (!rawData || rawData.length === 0) {
      this.state.isError = true;
      this.state.errorMessage = "No Data to display!";
      return;
    }

    this.state.isError = false;
    this.state.errorMessage = false;

    this.chartInstance = echarts.init(container);

    const categories = rawData.map((d) => d.category);
    const valueKeys = Object.keys(rawData[0]).filter(
      (k) => !["category", "record_id", "isSubGroupBy"].includes(k)
    );

    const palette = this.themePalettes[this.props.theme] || this.themePalettes.animated;

    const formatLabel = (text, maxLength = 15) => {
      if (!text || typeof text !== "string") return text;
      return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    };

    const symbols = ["triangle", "circle", "diamond", "rect", "roundRect"];

    const series = valueKeys.map((key, idx) => ({
      name: key.replace(/^ - /, ""),
      type: "scatter",
      symbol: symbols[idx % symbols.length],
      symbolSize: 12,
      itemStyle: {
        color: palette[idx % palette.length],
      },
      data: rawData.map((d) => ({
        value: [d.category, d[key] || 0],
        category: d.category,
        record_id: d.record_id,
      })),
      emphasis: {
        focus: "series",
        itemStyle: {
          shadowBlur: 8,
          shadowColor: "rgba(0,0,0,0.3)",
        },
      },
    }));

    const option = {
      color: palette,
      animationDuration: 800,
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          const val = Number(params.value[1]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return `<strong>${params.value[0]}</strong><br/>${params.marker} ${params.seriesName}: <strong>${val}</strong>`;
        },
      },
      legend: {
        show: valueKeys.length > 1,
        bottom: 0,
        type: "scroll",
      },
      grid: {
        left: "5%",
        right: "5%",
        top: "10%",
        bottom: valueKeys.length > 1 ? "15%" : "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          interval: 0,
          rotate: isMobileOS() ? -35 : (categories.length > 6 ? -25 : 0),
          formatter: (value) => formatLabel(value, isMobileOS() ? 10 : 16),
          color: "#495057",
          fontSize: 11,
        },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", opacity: 0.3 } },
        axisLabel: {
          formatter: (val) => val >= 1000 ? (val / 1000).toFixed(0) + "k" : val,
        },
      },
      series: series,
    };

    this.chartInstance.setOption(option);

    this.chartInstance.on("click", (params) => {
      if (this.props.update_chart && params.data) {
        this.props.update_chart(parseInt(this.props.chartId), "scatter_chart", {
          category: params.data.category,
          record_id: params.data.record_id,
        });
      }
    });

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

