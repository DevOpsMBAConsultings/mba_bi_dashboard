/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { themePalettes } from "../../js/theme_palettes";

export class PieChart extends Component {
  static template = "mba_bi_dashboard.PieChart";
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
        this.render_pie_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_pie_chart();
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

  render_pie_chart() {
    let data = this.props.recordSets;
    const container = document.getElementById("pie_chart__" + this.props.chartId);

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

    this.chartInstance = echarts.init(container);

    const palette = this.themePalettes[this.props.theme] || this.themePalettes.animated;
    const computedStyle = getComputedStyle(document.documentElement);
    const textDark = computedStyle.getPropertyValue("--o-gray-900").trim() || "#212529";
    const textMuted = computedStyle.getPropertyValue("--o-gray-700").trim() || "#495057";

    const clean = (n) => Math.round(Number(n) * 100) / 100;
    const formatNumber = (n) => clean(n).toLocaleString("es-PA", { maximumFractionDigits: 2 });

    const chartData = data.map((item) => {
      let val = item.value;
      if (val === undefined) {
        const valKey = Object.keys(item).find(
          (k) => !["category", "record_id", "isSubGroupBy"].includes(k)
        );
        val = valKey ? item[valKey] : 0;
      }
      return {
        name: item.category,
        value: clean(val || 0),
        record_id: item.record_id,
      };
    });

    const option = {
      color: palette,
      animationDuration: 800,
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          return `<strong>${params.name}</strong><br/>${params.marker} Valor: <strong>${formatNumber(params.value)}</strong> (${params.percent}%)`;
        },
      },
      legend: {
        bottom: 0,
        type: "scroll",
        textStyle: { color: textMuted },
      },
      series: [
        {
          name: this.props.name || "Pie Chart",
          type: "pie",
          radius: "62%",
          center: ["50%", "45%"],
          data: chartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            formatter: "{b}: {d}%",
            fontSize: 11,
            color: textDark,
          },
        },
      ],
    };

    this.chartInstance.setOption(option);

    this.chartInstance.on("click", (params) => {
      if (this.props.update_chart && params.data) {
        this.props.update_chart(parseInt(this.props.chartId), "pie_chart", {
          category: params.data.name,
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

