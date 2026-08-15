/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { isMobileOS } from "@web/core/browser/feature_detection";
import { themePalettes } from "../../js/theme_palettes";

export class LineChart extends Component {
  static template = "mba_bi_dashboard.LineChart";
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
    this.resizeObserver = null;
    this.state = useState({ isError: false, errorMessage: false });

    this.themePalettes = themePalettes;

    useEffect(
      () => {
        this.render_line_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_line_chart();
    });

    onWillUnmount(() => {
      if (this.resizeHandler) {
        window.removeEventListener("resize", this.resizeHandler);
        this.resizeHandler = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.chartInstance) {
        this.chartInstance.dispose();
        this.chartInstance = null;
      }
    });
  }

  render_line_chart() {
    var rawData = this.props.recordSets;
    const container = document.getElementById("line_chart__" + this.props.chartId);

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    if (!container) return;

    if (typeof rawData === "object" && !Array.isArray(rawData)) {
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
    const computedStyle = getComputedStyle(document.documentElement);
    const textDark = computedStyle.getPropertyValue("--o-gray-900").trim() || "#212529";
    const textMuted = computedStyle.getPropertyValue("--o-gray-700").trim() || "#495057";

    const clean = (n) => Math.round(Number(n) * 100) / 100;
    const formatNumber = (n) => clean(n).toLocaleString("es-PA", { maximumFractionDigits: 2 });
    const formatLabel = (text, maxLength = 15) => {
      if (!text || typeof text !== "string") return text;
      return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    };

    const series = valueKeys.map((key, idx) => ({
      name: key,
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: palette[idx % palette.length],
      },
      itemStyle: {
        color: palette[idx % palette.length],
      },
      data: rawData.map((d) => ({
        value: clean(d[key] || 0),
        record_id: d.record_id,
        category: d.category,
      })),
      emphasis: {
        focus: "series",
      },
    }));

    const option = {
      color: palette,
      animationDuration: 800,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        formatter: (params) => {
          if (!params || !params.length) return "";
          let res = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((item) => {
            res += `${item.marker} ${item.seriesName}: <strong>${formatNumber(item.value)}</strong><br/>`;
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
        left: "5%",
        right: "5%",
        top: "10%",
        bottom: valueKeys.length > 1 ? "15%" : "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        boundaryGap: false,
        axisLabel: {
          interval: 0,
          rotate: isMobileOS() ? -35 : (categories.length > 6 ? -25 : 0),
          formatter: (value) => formatLabel(value, isMobileOS() ? 10 : 16),
          color: textMuted,
          fontSize: 11,
        },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", opacity: 0.3 } },
        axisLabel: {
          color: textMuted,
          formatter: (val) => val >= 1000 ? (val / 1000).toFixed(0) + "k" : val,
        },
      },
      series: series,
    };

    this.chartInstance.setOption(option);

    this.chartInstance.on("click", (params) => {
      if (this.props.update_chart && params.data) {
        this.props.update_chart(parseInt(this.props.chartId), "line_chart", {
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

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    });
    this.resizeObserver.observe(container);
  }
}

