# from odoo import http
# from odoo.http import request

# class AwesomeDashboardController(http.Controller):

#     @http.route("/awesome_dashboard/statistics", type="json", auth="user")
#     def get_statistics(self, filters=None, method="get_dashboard_statistics", **kwargs):
#         """
#         Delegates to a specific sale.order method based on the 'method' parameter.
#         Expects filters as a dictionary: {'project': value, 'unitType': value, 'salesperson': value}
#         """
#         filters = filters or {}
#         sale_order = request.env["sale.order"].sudo()
#         method_map = {
#             "get_dashboard_statistics": sale_order.get_dashboard_statistics,
#             "get_active_deals_statistics": sale_order.get_active_deals_statistics,
#             "get_units_inventory_statistics": sale_order.get_units_inventory_statistics,
#         }
#         if method not in method_map:
#             raise ValueError(f"Invalid method: {method}")
#         return method_map[method](filters)