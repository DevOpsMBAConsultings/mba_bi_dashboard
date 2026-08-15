/** @odoo-module **/

import { Component, onMounted, onWillUnmount, useEffect, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class MeterChart extends Component {
  static template = "mba_bi_dashboard.MeterChart";
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

    useEffect(
      () => {
        this.render_meter_chart();
      },
      () => [this.props.chartId, this.props.recordSets, this.props.data, this.props.theme]
    );

    onMounted(() => {
      this.render_meter_chart();
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

  render_meter_chart() {
    let data = this.props.recordSets;
    const container = document.getElementById("meter_chart__" + this.props.chartId);

    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }

    if (!container) return;

    if (typeof data == "object" && !Array.isArray(data) && data.type == "error") {
      this.state.isError = true;
      this.state.errorMessage = data.message;
      return;
    }

    if (!data) {
      this.state.isError = true;
      this.state.errorMessage = "No Data to display!";
      return;
    }

    this.state.isError = false;
    this.state.errorMessage = false;

    this.chartInstance = echarts.init(container);

    const clean = (n) => Math.round(Number(n) * 100) / 100;
    const targetVal = clean(Number(data.target) || 100);
    const currentVal = clean(Number(data.current_value) || 0);

    const computedStyle = getComputedStyle(document.documentElement);
    const textDark = computedStyle.getPropertyValue("--o-gray-900").trim() || "#212529";
    const textMuted = computedStyle.getPropertyValue("--o-gray-700").trim() || "#495057";

    const option = {
      animationDuration: 1000,
      series: [
        {
          type: "gauge",
          center: ["50%", "70%"],
          radius: "100%",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: targetVal,
          splitNumber: 5,
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: [
                [0.3, "#e06d53"],
                [0.7, "#ffac00"],
                [1, "#28a745"],
              ],
            },
          },
          progress: {
            show: true,
            roundCap: true,
            width: 14,
            itemStyle: {
              color: "#71639e",
            },
          },
          pointer: {
            length: "60%",
            width: 5,
            itemStyle: {
              color: textMuted,
            },
          },
          axisTick: {
            distance: -20,
            length: 5,
            lineStyle: { color: "#999", width: 1 },
          },
          splitLine: {
            distance: -24,
            length: 10,
            lineStyle: { color: "#999", width: 2 },
          },
          axisLabel: {
            distance: -16,
            color: textMuted,
            fontSize: 10,
            formatter: (val) => val >= 1000 ? (val / 1000).toFixed(0) + "k" : val,
          },
          title: {
            show: true,
            offsetCenter: [0, "25%"],
            fontSize: 12,
            color: textMuted,
          },
          detail: {
            valueAnimation: true,
            formatter: (val) => val,
            fontSize: 22,
            fontWeight: "bold",
            offsetCenter: [0, "-15%"],
            color: textDark,
          },
          data: [
            {
              value: currentVal,
              name: `Meta: ${targetVal}`,
            },
          ],
        },
      ],
    };

    this.chartInstance.setOption(option);

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

