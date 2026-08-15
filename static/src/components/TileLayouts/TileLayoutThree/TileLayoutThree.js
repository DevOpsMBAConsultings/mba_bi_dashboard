/** @odoo-module **/

import { Component, onMounted, useEffect, useState, markup } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class TileLayoutThree extends Component {
  static template = "mba_bi_dashboard.TileLayoutThree";
  static props = {
    data: Object,
  };

  setup() {
    this.state = useState({
      data: this.props.data,
      kpi_icon: "",
    });
    useEffect(
      () => {
        this.state.data = this.props.data;
        if (this.state.data && this.state.data.default_icon) {
          this.state.kpi_icon = markup(`<i class="fa fa-${this.state.data.default_icon} fa-2x"></i>`);
        }
      },
      () => [this.props.data],
    );
  }
}
