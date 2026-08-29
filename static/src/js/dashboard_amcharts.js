/** @odoo-module **/

import { Component, onWillStart, onMounted, useState, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { DashboardChartWrapper } from "../js/dashboard_chart_wrapper";
import { loadJS } from "@web/core/assets";
import { isMobileOS } from "@web/core/browser/feature_detection";
import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";

export class DashboardAmcharts extends Component {
  setup() {
    this.auto_reload_duration = 15000;
    this.dashboard_user = false;
    this.timer = false;
    this.ui = useService("ui");
    this.editLayout = false;
    this.fileInputRef = useRef("fileInput");
    this.orm = useService("orm");
    this.action = useService("action");
    this.dialog = useService("dialog");
    this.state = useState({
      editMode: false,
      charts: [],
      downloadDetails: {},
      name: "",
    });
    this.reloadKey = useState({ value: 0 });
    this.grid = false;

    onWillStart(async () => {
      await loadJS("/mba_bi_dashboard/static/src/lib/jspdf.js");
      await this.get_chart_details();
    });

    onMounted(() => {
      this.grid = GridStack.init(
        {
          staticGrid: true,
          float: false,
          styleInHead: true,
          disableOneColumnMode: true,
          cellHeight: 90,
          width: 12,
          verticalMargin: 3,
        },
        document.getElementsByClassName("grid-stack")[0],
      );
      if (isMobileOS()) {
        this.grid.column(1);
      }
      this.update_timer();
    });

    this.onUpdateExport = (chartId, chartDetails) => {
      this.state.downloadDetails[chartId] = chartDetails;
    };

    this.export_json = async (ev) => {
      let json_data = await this.orm.call(
        "dashboard.dashboard",
        "dashboard_export_json",
        [this.props.action.params.record],
      );
      const jsonString = JSON.stringify(json_data, null, 2);
      const bom = "\uFEFF";
      const blob = new Blob([bom + jsonString], {
        type: "application/json;charset=utf-8",
      });
      const filename = this.state.name + ".json";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    this.onUploadClick = (ev) => {
      this.fileInputRef.el.click();
    };

    this.onFileChange = (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported_chart = await this.orm.call(
            "dashboard.dashboard",
            "dashboard_import_json",
            [
              [this.props.action.params.record],
              { json_payload: JSON.parse(e.target.result) },
            ],
          );
          if (imported_chart.type == "error") {
            this.dialog.add(ConfirmationDialog, {
              title: _t("Hold up!"),
              body: _t(
                "We can’t create charts due to following unknown models and fields.\n\n" +
                  imported_chart.message,
              ),
            });
          } else {
            window.location.reload();
          }
        } catch (err) {
          this.dialog.add(ConfirmationDialog, {
            title: _t("Hold up!"),
            body: _t("Invalid JSON file"),
          });
        }
      };
      reader.readAsText(file);
      ev.target.value = "";
    };

    this.onPrintDashboard = (ev) => {
      var self = this;
      const dashboard = document.getElementsByClassName("grid-stack")[0];
      const dateRanges = dashboard.querySelectorAll(".o_bottom .o_date_range");

      let maxBottom = 0;
      let maxRight = 0;
      const children = dashboard.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        var child_date_range = child.querySelectorAll(
          ".o_bottom .o_date_range",
        );
        var client_width = child.querySelector(
          ".grid-stack-item-content",
        ).clientWidth;
        if (child_date_range.length > 0) {
          if (client_width < 301) {
            child_date_range.forEach((el) => {
              el.style.fontSize = "9px";
            });
          } else if (client_width > 300 && client_width < 601) {
            child_date_range.forEach((el) => {
              el.style.fontSize = "11px";
            });
          } else {
            child_date_range.forEach((el) => {
              el.style.fontSize = "13px";
            });
          }
        }
        const bottom = child.offsetTop + child.offsetHeight;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
        const right = child.offsetLeft + child.offsetWidth;
        if (right > maxRight) {
          maxRight = right;
        }
      }

      const captureWidth = maxRight > 0 ? maxRight + 10 : dashboard.scrollWidth;
      const captureHeight = maxBottom > 0 ? maxBottom + 10 : dashboard.scrollHeight;

      dashboard.style.height = captureHeight + "px";
      dashboard.style.overflow = "visible";

      setTimeout(() => {
        self.ui.block();
        html2canvas(dashboard, {
          useCORS: true,
          scale: 2,
          scrollX: 0,
          scrollY: 0,
          windowWidth: dashboard.scrollWidth,
          windowHeight: dashboard.scrollHeight,
        })
          .then((canvas) => {
            // Crear canvas recortado exactamente al área de los widgets
            const scale = 2;
            const cropW = Math.min(canvas.width, Math.round(captureWidth * scale));
            const cropH = Math.min(canvas.height, Math.round(captureHeight * scale));

            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            const ctx = croppedCanvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, cropW, cropH);
            ctx.drawImage(
              canvas,
              0,
              0,
              cropW,
              cropH,
              0,
              0,
              cropW,
              cropH
            );

            const imgData = croppedCanvas.toDataURL("image/png");

            // Determinar orientacion óptima (horizontal si es ancho, vertical si es alto)
            const isLandscape = cropW > cropH * 1.25;
            const orientation = isLandscape ? "landscape" : "portrait";

            const pdf = new jspdf.jsPDF({
              orientation: orientation,
              unit: "pt",
              format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const printWidth = pageWidth - margin * 2;
            const printHeight = (cropH * printWidth) / cropW;

            let position = margin;
            let heightLeft = printHeight;

            if (printHeight <= pageHeight - margin * 2) {
              pdf.addImage(imgData, "PNG", margin, margin, printWidth, printHeight);
            } else {
              pdf.addImage(imgData, "PNG", margin, position, printWidth, printHeight);
              heightLeft -= (pageHeight - margin * 2);
              while (heightLeft > 0) {
                position = position - pageHeight + margin;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", margin, position, printWidth, printHeight);
                heightLeft -= pageHeight;
              }
            }

            pdf.save(this.state.name + ".pdf");

            // Reset styles
            dateRanges.forEach((el, i) => {
              el.style.fontSize = "1vh";
            });
            self.ui.unblock();
          })
          .catch((error) => {
            console.error("PDF generation failed:", error);
            self.ui.unblock();
          });
      }, 500);
    };

    this.onSendEmail = async (ev) => {
      let emailData = {};

      for (const key in this.state.downloadDetails) {
        emailData[key] = {
          name: this.state.downloadDetails[key].name,
          image: await this.state.downloadDetails[key].exporting.export("png"),
          chart_type: this.state.downloadDetails[key].chart_type,
        };
      }
      let emailResponse = await this.orm.call(
        "dashboard.dashboard",
        "action_dashboard_send",
        [[this.props.action.params.record], { emailData }],
      );
      if (!emailResponse) {
        this.dialog.add(ConfirmationDialog, {
          title: _t("Hold up!"),
          body: _t(
            "We can’t send this beauty without an email template.\nGive your admin a nudge to set things up first!",
          ),
        });
      } else {
        this.action.doAction(emailResponse);
      }
    };

    this.onEditDiscard = (ev) => window.location.reload();

    this.editChart = (chartId, name, onHandleEdit) => {
      this.editLayout = true;
      var self = this;
      this.action.doAction(
        {
          name: "Edit: " + name,
          type: "ir.actions.act_window",
          res_model: "dashboard.chart",
          views: [[false, "form"]],
          res_id: parseInt(chartId),
          target: "new",
        },
        {
          onClose: () => {
            self.editLayout = false;
          },
          props: {
            onSave: (record, params) => {
              window.location.reload();
            },
          },
        },
      );
    };

    this.onEditLayout = (ev) => {
      if (this.state.editMode) {
        this.saveLayout();
      }
      this.state.editMode = !this.state.editMode;
      this.grid.setStatic(!this.state.editMode);
    };

    this.onAddLayout = (ev) => {
      this.editLayout = true;
      var self = this;
      this.action.doAction(
        {
          type: "ir.actions.act_window",
          res_model: "dashboard.chart",
          views: [[false, "form"]],
          res_id: false,
          context: { default_dashboard_id: self.props.action.params.record },
          target: "new",
        },
        {
          onClose: () => {
            self.editLayout = false;
          },
          props: {
            onSave: (record, params) => {
              window.location.reload();
            },
          },
        },
      );
    };
  }

  async get_chart_details() {
    [
      this.auto_reload_duration,
      this.state.charts,
      this.state.name,
      this.dashboard_user,
    ] = await this.orm.call("dashboard.dashboard", "get_charts_details", [
      this.props.action.params.record,
    ]);
  }

  update_timer() {
    var self = this;
    self.timer = setTimeout(() => {
      if (!self.editLayout) {
        this.reloadKey.value += 1;
      }
      self.update_timer();
    }, self.auto_reload_duration);
  }

  async saveLayout() {
    const layout = [];
    document.querySelectorAll(".grid-stack .grid-stack-item").forEach((el) => {
      const chartId = parseInt(el.getAttribute("data-chart-id"));
      const x =
        parseInt(el.getAttribute("data-gs-x") || el.getAttribute("gs-x")) || 0;
      const y =
        parseInt(el.getAttribute("data-gs-y") || el.getAttribute("gs-y")) || 0;
      const w = parseInt(
        el.getAttribute("data-gs-width") || el.getAttribute("gs-w"),
      );
      const h = parseInt(
        el.getAttribute("data-gs-height") || el.getAttribute("gs-h"),
      );
      layout.push({
        chartId,
        x,
        y,
        w,
        h,
      });
    });
    await this.orm.call("dashboard.dashboard", "write", [
      [this.props.action.params.record],
      { grid_stack_dimensions: layout },
    ]);
    this.render();
  }
}

DashboardAmcharts.template = "mba_bi_dashboard.DashboardAmcharts";
DashboardAmcharts.components = { DashboardChartWrapper };

registry.category("actions").add("dashboard_amcharts", DashboardAmcharts);
