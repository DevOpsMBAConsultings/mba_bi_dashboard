/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class MapChart extends Component {
  static template = "mba_bi_dashboard.MapChart";
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
      animated: ["#e0f3f8", "#71639e", "#2c3e50"],
      frozen: ["#e0f7fa", "#007bff", "#1c3b70"],
      kelly: ["#e8f5e9", "#28a745", "#1b5e20"],
      material: ["#e3f2fd", "#2196f3", "#0d47a1"],
      moonrise: ["#eceff1", "#607d8b", "#263238"],
      spirited: ["#fff3e0", "#e67e22", "#b71c1c"],
    };

    useEffect(
      () => {
        this.render_map_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_map_chart();
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

  render_map_chart() {
    let data = this.props.recordSets;
    const container = document.getElementById("map_chart__" + this.props.chartId);

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    if (!container) return;

    if (typeof data == "object" && !Array.isArray(data)) {
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

    if (window.am5geodata_worldLow) {
      echarts.registerMap("world", window.am5geodata_worldLow);
    }

    this.chartInstance = echarts.init(container);

    let maxVal = 0;
    data.forEach((d) => {
      const v = Number(d.value) || 0;
      if (v > maxVal) maxVal = v;
    });
    if (maxVal === 0) maxVal = 100;

    const mapColors = this.themePalettes[this.props.theme] || this.themePalettes.animated;

    const chartData = data.map((d) => ({
      name: d.name || d.category,
      value: d.value || 0,
      id: d.id,
      record_id: d.record_id,
    }));

    const option = {
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          if (isNaN(params.value)) {
            return `<strong>${params.name}</strong><br/>Sin datos`;
          }
          const val = Number(params.value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          return `<strong>${params.name}</strong><br/>Valor: <strong>${val}</strong>`;
        },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        text: ["Alto", "Bajo"],
        realtime: false,
        calculable: true,
        inRange: {
          color: mapColors,
        },
        bottom: 10,
        left: 10,
        textStyle: {
          fontSize: 10,
          color: "#495057",
        },
      },
      series: [
        {
          name: this.props.name || "World Map",
          type: "map",
          map: "world",
          roam: true,
          emphasis: {
            label: { show: true, fontSize: 11 },
            itemStyle: { areaColor: "#ffac00" },
          },
          itemStyle: {
            borderColor: "#ced4da",
            borderWidth: 0.8,
          },
          data: chartData,
        },
      ],
    };

    this.chartInstance.setOption(option);

    this.chartInstance.on("click", (params) => {
      if (this.props.update_chart && params.data) {
        this.props.update_chart(parseInt(this.props.chartId), "map_chart", {
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
  }
}

