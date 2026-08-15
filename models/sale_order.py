# -*- coding: utf-8 -*-
from odoo import api, fields, models


class SaleOrder(models.Model):
    _inherit = "sale.order"

    x_mba_dias_cierre = fields.Float(
        string="Días de Cierre",
        compute="_compute_x_mba_dias_cierre",
        store=True,
        help="Días transcurridos entre la creación de la cotización y la confirmación de la venta."
    )

    @api.depends("state", "create_date", "date_order")
    def _compute_x_mba_dias_cierre(self):
        for order in self:
            if order.state in ("sale", "done") and order.create_date and order.date_order:
                diff_seconds = (order.date_order - order.create_date).total_seconds()
                order.x_mba_dias_cierre = max(0.0, round(diff_seconds / 86400.0, 2))
            else:
                order.x_mba_dias_cierre = 0.0
