from odoo import models, api
import logging
from odoo import tools

_logger = logging.getLogger(__name__)

class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def get_filter_options(self, filters=None):
        filters = filters or {}
        
        # Base domain for all queries
        base_domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'))
        ]

        # Helper function to create domain for each filter option
        def get_domain(exclude_filter=None):
            domain = base_domain.copy()
            for filter_key, filter_value in filters.items():
                if filter_value and filter_key != exclude_filter:
                    if filter_key == 'project':
                        domain.append(('sh_re_project_id', '=', int(filter_value)))
                    elif filter_key == 'unitType':
                        domain.append(('x_studio_unit_type', '=', int(filter_value)))
                    elif filter_key == 'salesperson':
                        domain.append(('user_id', '=', int(filter_value)))
            return domain

        # Fetch projects, excluding project filter
        projects_domain = get_domain(exclude_filter='project')
        projects = self.env['sale.order'].read_group(projects_domain, ['sh_re_project_id'], ['sh_re_project_id'])
        projects_list = [
            {"value": str(proj['sh_re_project_id'][0]), "formattedValue": proj['sh_re_project_id'][1]}
            for proj in projects if proj['sh_re_project_id']
        ]

        # Fetch unit types, excluding unitType filter
        unit_types_domain = get_domain(exclude_filter='unitType')
        unit_types = self.env['sale.order'].read_group(unit_types_domain, ['x_studio_unit_type'], ['x_studio_unit_type'])
        unit_types_list = [
            {"value": str(unit['x_studio_unit_type'][0]), "formattedValue": unit['x_studio_unit_type'][1]}
            for unit in unit_types if unit['x_studio_unit_type']
        ]

        # Fetch salespersons, excluding salesperson filter
        salespersons_domain = get_domain(exclude_filter='salesperson')
        salespersons = self.env['sale.order'].read_group(salespersons_domain, ['user_id'], ['user_id'])
        salespersons_list = [
            {"value": str(sp['user_id'][0]), "formattedValue": sp['user_id'][1]}
            for sp in salespersons if sp['user_id']
        ]

        return {
            'projects': projects_list,
            'unit_types': unit_types_list,
            'salespersons': salespersons_list,
        }

    @api.model
    def get_dashboard_statistics(self, filters=None):
        
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'))
        ]
        filters = filters or {}
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))

        top_customers = self.read_group(domain, ['partner_id', 'sh_product_price_in_order_line'], ['partner_id'], orderby='sh_product_price_in_order_line desc', limit=10)
        top_salespeople = self.read_group(domain, ['user_id', 'sh_product_price_in_order_line'], ['user_id'], orderby='sh_product_price_in_order_line desc', limit=10)
        unit_types = self.env['sale.order']._read_group(
            domain,
            ['sh_re_project_id', 'x_studio_unit_type'],
            [
            'id:count',  # Count of sale.order records per group
            'sh_product_price_in_order_line:sum'  # Sum of sh_product_price_in_order_line
            ]
        )

        unit_type_summary = [
            {
            'project': sh_re_project_id.name if sh_re_project_id else '',
            'unit_type': unit_type.name,
            'count_of_unit': count,
            'sum_of_sales_price': total_price
            }
            for sh_re_project_id, unit_type, count, total_price in unit_types
            if unit_type  # Exclude null unit types
        ]
        top_customers_dict = {
            customer['partner_id'][1]: customer['sh_product_price_in_order_line']
            for customer in top_customers if customer['partner_id']
        }
        total_sales = self.env['sale.order'].read_group(domain, ['sh_product_price_in_order_line:sum'], [])[0].get('sh_product_price_in_order_line', 0)
        active_deals = self.env['sale.order'].search_count(domain)
        agencies_domain = domain + [('sh_re_agency_name_id', '!=', False)]
        agencies = self.env['sale.order'].search(agencies_domain).mapped('sh_re_agency_name_id.name')
        distinct_agencies_count = len(set(agency.lower() for agency in agencies if agency))
        customer_count_data = self.env['sale.order'].search(domain).mapped('partner_id')
        distinct_customer_count = len(customer_count_data)
        top_agencies = self.env['sale.order'].read_group(
            domain, ['sh_re_agency_name_id', 'sh_product_price_in_order_line'], ['sh_re_agency_name_id'],
            orderby='sh_product_price_in_order_line desc', limit=10
        )
        top_agencies_dict = {
            agency['sh_re_agency_name_id'][1]: agency['sh_product_price_in_order_line']
            for agency in top_agencies if agency['sh_re_agency_name_id']
        }
        top_salespersons = self.env['sale.order'].read_group(
            domain, ['user_id', 'sh_product_price_in_order_line'], ['user_id'],
            orderby='sh_product_price_in_order_line desc', limit=10
        )
        top_salespersons_dict = {
            sp['user_id'][1]: sp['sh_product_price_in_order_line']
            for sp in top_salespersons if sp['user_id']
        }
        sales_dict = {
            record['user_id'][1]: record['sh_product_price_in_order_line']
            for record in top_salespeople if record['user_id']
        }
        result = self.env['sale.order'].read_group(
            domain, ['sh_sale_process_state', 'sh_product_price_in_order_line:sum'], ['sh_sale_process_state']
        )
        state_count_dict = {res['sh_sale_process_state']: res['sh_product_price_in_order_line'] for res in result}

        return {
            'total_sales': total_sales or 0,
            'active_deals': active_deals or 0,
            'agencies': distinct_agencies_count or 0,
            'customers': distinct_customer_count or 0,
            'top_agencies': top_agencies_dict,
            'top_salespersons': top_salespersons_dict,
            'top_customers': top_customers_dict,
            'unit_type_summary': unit_type_summary,
            'sales_price_by_state': state_count_dict,
            'top_salespersons_by_deals': sales_dict,

        }

    @api.model
    def get_active_deals_statistics(self, filters=None):
        filters = filters or {}
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'))
        ]
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))

        active_deals_by_reg_state = self.read_group(domain,['sh_registration_state','__count'], ['sh_registration_state'])
        active_deals_count_by_reg_state = {
            res['sh_registration_state']: res['sh_registration_state_count']
            for res in active_deals_by_reg_state
            if res['sh_registration_state']  # Ensure no null keys
        }

        total_sales = self.env['sale.order'].read_group(domain, ['sh_product_price_in_order_line:sum'], [])[0].get('sh_product_price_in_order_line', 0)
        active_deals = self.env['sale.order'].search_count(domain)
        customer_groups = self.env['sale.order'].read_group(
            domain=[('partner_id', '!=', False)] + domain,
            fields=['partner_id'],
            groupby=['partner_id'],
            lazy=False
        )
        distinct_customer_count = len(customer_groups)
        salesperson_groups = self.env['sale.order'].read_group(
            domain=[('user_id', '!=', False)] + domain,
            fields=['user_id'],
            groupby=['user_id'],
            lazy=False
        )
        active_deals_by_unit_type = self.read_group(
            domain,
            ['x_studio_unit_type', '__count'],
            ['x_studio_unit_type']
        )
        deals_count_by_unit_type = {
            res['x_studio_unit_type'][1]: res['x_studio_unit_type_count']
            for res in active_deals_by_unit_type
            if res['x_studio_unit_type']  # Ensure no null keys
        }

        distinct_salesperson_count = len(salesperson_groups)
        top_salespeople = self.env['sale.order'].read_group(domain,['user_id', '__count'],groupby=['user_id'],orderby='__count desc',limit=10)
        top_salespeople_data = { group['user_id'][1]:group['user_id_count'] for group in top_salespeople if group['user_id'] } or {}
        top_agencies = self.env['sale.order'].read_group(domain,['sh_re_agency_name_id', '__count'],groupby=['sh_re_agency_name_id'],orderby='__count desc',limit=10)
        top_agencies_data = {group['sh_re_agency_name_id'][1]: group['sh_re_agency_name_id_count']for group in top_agencies if group['sh_re_agency_name_id']}
        top_customers = self.env['sale.order'].read_group(domain,fields=['partner_id', '__count'],groupby=['partner_id'],orderby='__count desc',limit=10)
        top_customers_data = {group['partner_id'][1]: group['partner_id_count'] for group in top_customers if group['partner_id']}
        return {
            'total_sales': total_sales or 0,
            'active_deals': active_deals or 0,
            'customers': distinct_customer_count or 0,
            'saleperson': distinct_salesperson_count or 0,
            'top_salespersons_by_deals': top_salespeople_data,
            'top_agencies_by_deals': top_agencies_data,
            'top_customers_by_deals': top_customers_data,
            'active_deals_by_state': active_deals_count_by_reg_state,
            'active_deals_by_unit_type': deals_count_by_unit_type,
        }

    @api.model
    def get_units_inventory_statistics(self, filters=None):
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'))
        ]
        availablity_domain =[("sale_ok", "=", True),("default_code", "!=", False),("sh_state", "in", ["available", "blocked"])]
        unit_summery_domain = [("sale_ok", "=", True),("default_code", "!=", False)]
        filters = filters or {}
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
            availablity_domain.append(('sh_re_project_id', '=', int(filters['project'])))
            unit_summery_domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
            availablity_domain.append(('sh_unit_type_id', '=', int(filters['unitType'])))
            unit_summery_domain.append(('sh_unit_type_id', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))

        # Fetch only required fields for available products
        products = self.env['product.product'].search_read(
            fields = ['sh_re_project_id', 'sh_unit_type_id', 'lst_price', 'sh_state', 'sh_re_total_area', 'sh_price'],
            domain = availablity_domain,
            order='sh_re_project_id, sh_unit_type_id'
        )

        unit_type_asking_stats = {}
        state_asking_stats = {}
        total_asking_price = 0.0

        for product in products:
            lst_price = product.get('lst_price') or 0.0
            total_asking_price += lst_price

            project_id, project = (product['sh_re_project_id'] or [None, ''])[:2]
            unit_type_id, unit_type_name = (product['sh_unit_type_id'] or [None, ''])[:2]
            state = product.get('sh_state') or ''

            # Group by (project_id, unit_type_id)
            if project_id and unit_type_id:
                key_ut = (project_id, unit_type_id)
            stats_ut = unit_type_asking_stats.setdefault(key_ut, {
                'Project': project,
                'unit_type': unit_type_name,
                'count_of_unit': 0,
                'max_of_asking_price': float('-inf'),
                'minimum_asking_price': float('inf'),
                'total_price': 0.0
            })
            stats_ut['count_of_unit'] += 1
            stats_ut['max_of_asking_price'] = max(stats_ut['max_of_asking_price'], lst_price)
            stats_ut['minimum_asking_price'] = min(stats_ut['minimum_asking_price'], lst_price)
            stats_ut['total_price'] += lst_price

            # Group by (project_id, state)
            if project_id and unit_type_id:
                key_st = (project_id, unit_type_id)
            stats_st = state_asking_stats.setdefault(key_st, {
                'Project': project,
                'state': state,
                'unit_type': unit_type_name,
                'count_of_unit': 0,
                'sum_of_square_ft': 0.0,
                'sum_of_price_sqft': 0.0,
                'sum_of_asking_price': 0.0
            })
            stats_st['count_of_unit'] += 1
            stats_st['sum_of_square_ft'] += product.get('sh_re_total_area') or 0.0
            stats_st['sum_of_price_sqft'] += product.get('sh_price') or 0.0
            stats_st['sum_of_asking_price'] += lst_price

        # Prepare mapped results
        unit_type_asking_stats_mapped = [
            {
            'Project': stats['Project'],
            'unit_type': stats['unit_type'],
            'count_of_unit': stats['count_of_unit'],
            'max_of_asking_price': stats['max_of_asking_price'] if stats['max_of_asking_price'] != float('-inf') else 0.0,
            'minimum_asking_price': stats['minimum_asking_price'] if stats['minimum_asking_price'] != float('inf') else 0.0,
            'average_asking_price': stats['total_price'] / stats['count_of_unit'] if stats['count_of_unit'] else 0.0
            }
            for stats in unit_type_asking_stats.values()
        ]

        state_asking_stats_mapped = list(state_asking_stats.values())

        
        unit_type_stats = self.env['sale.order']._read_group(
            domain,
            ['sh_re_project_id', 'x_studio_unit_type'],
            ['id:count', 'sh_product_price_in_order_line:max', 'sh_product_price_in_order_line:min', 'sh_product_price_in_order_line:avg']
        )
        unit_type_sqft_stats = self.env['sale.order']._read_group(
            domain,
            ['sh_re_project_id', 'x_studio_unit_type'],
            ['id:count', 'x_studio_square_ft:max', 'x_studio_square_ft:min', 'x_studio_square_ft:avg']
        )


        available_unit_type_sqft = self.env['product.product']._read_group(
            availablity_domain,
            ['sh_unit_type_id'],
            ['id:count', 'sh_re_total_area:max', 'sh_re_total_area:min', 'sh_re_total_area:avg']
        )


        available_unit_type_sqft_mapped = [
            {
            'project': unit_type.sh_project_id_for_unit_type.name if unit_type.sh_project_id_for_unit_type else '',
            'unit_type': unit_type.name,
            'count_of_unit': count,
            'max_of_avail_square_feet': max_price or 0.0,
            'min_of_avail_square_feet': min_price or 0.0,
            'average_of_avail_square_feet': avg_price or 0.0
            }
            for unit_type, count, max_price, min_price, avg_price in available_unit_type_sqft if unit_type
        ]

        unit_type_discount_stats = self.env['sale.order']._read_group(
            domain,
            ['sh_re_project_id', 'x_studio_unit_type'],
            ['id:count', 'sh_discount:max', 'sh_discount:min', 'sh_discount:avg', 'sh_discount_amount:sum']
        )
        # Map the data to a dictionary sh_re_total_area
        unit_type_stats_mapped = [
            {
            'project': sh_re_project_id.name if sh_re_project_id else '',
            'unit_type': unit_type.name,
            'count_of_unit': count,
            'max_of_selling_price': max_price,
            'minimum_selling_price': min_price,
            'average_selling_price': avg_price
            }
            for sh_re_project_id, unit_type, count, max_price, min_price, avg_price in unit_type_stats if unit_type
        ]
        unit_type_sqft_mapped = [
            {
            'project': sh_re_project_id.name if sh_re_project_id else '',
            'unit_type': unit_type.name,
            'count_of_unit': count,
            'max_of_square_feet': max_price,
            'min_of_square_feet': min_price,
            'average_of_square_feet': avg_price
            }
            for sh_re_project_id, unit_type, count, max_price, min_price, avg_price in unit_type_sqft_stats if unit_type
        ]
        unit_type_discount_mapped = [
            {
            'project': sh_re_project_id.name if sh_re_project_id else '',
            'unit_type': unit_type.name,
            'count_of_unit': count,
            'min_of_discount': min_price,
            'average_of_discount': avg_price,
            'max_of_discount': max_price,
            'sum_of_discount_amount': discount_amount_sum
            }
            for sh_re_project_id, unit_type, count, max_price, min_price, avg_price, discount_amount_sum in unit_type_discount_stats
            if unit_type
        ]

        total_sales = self.env['sale.order'].read_group(domain, ['sh_product_price_in_order_line:sum'], [])[0].get('sh_product_price_in_order_line', 0)
        total_sold_units = self.env['sale.order'].read_group(domain, ['sh_product_in_order_line:count'], [])[0].get('sh_product_in_order_line', 0)
        total_sqft = self.env['sale.order'].read_group(domain, ['x_studio_square_ft:sum'], [])[0].get('x_studio_square_ft', 0)
        
        available_units = self.env['product.product'].read_group(availablity_domain, ['sh_unit_no:count'], [])[0].get('sh_unit_no', 0)
        total_available_square_ft = self.env['product.product'].read_group(availablity_domain, ['sh_re_total_area:sum'], [])[0].get('sh_re_total_area', 0)
        grouped_unit_summery= self.env['product.product'].read_group(domain=unit_summery_domain,fields=['sh_state'],groupby=['sh_state'],orderby='sh_state_count desc')
        unit_type_summery = {group['sh_state']: group['sh_state_count'] for group in grouped_unit_summery if group['sh_state']}
    
        
        
        return {
            'total_units_sold': total_sales or 0, 
            'total_sold_units': total_sold_units or 0,
            'total_sqft': total_sqft or 0,
            'available_units': available_units or 0,
            'unit_type_summary': unit_type_summery,
            'total_available_square_ft': total_available_square_ft or 0,
            'total_asking_price': total_asking_price or 0,
            'selling_prices': unit_type_stats_mapped,
            'asking_prices': unit_type_asking_stats_mapped,
            'avail_sqft_stats': available_unit_type_sqft_mapped,
            'sqft_stats': unit_type_sqft_mapped,
            'discount_stats': unit_type_discount_mapped,
            'avail_sate_stats': state_asking_stats_mapped,
        }
    @api.model
    def get_sales_demographics_statistics(self, filters=None):
        filters = filters or {}
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', (
                'reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'
            )),
            ('partner_id.sh_re_nationality_id', '!=', False)
        ]
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))

        # Nationality statistics
        sale_orders = self.env['sale.order'].search(domain)
        nationality_count = {}
        for order in sale_orders:
            nationality = order.partner_id.sh_re_nationality_id.name if order.partner_id.sh_re_nationality_id else ''
            if nationality:
                nationality_count[nationality] = nationality_count.get(nationality, 0) + 1

        total_order_count = sum(nationality_count.values())
        nationalities = []
        top_nationalities_data = {}
        for idx, (nationality, count) in enumerate(sorted(nationality_count.items(), key=lambda x: x[1], reverse=True)):
            percentage = round((count / total_order_count * 100), 2) if total_order_count else 0.0
            nationalities.append({
                'Serial Number': idx + 1,
                'Nationality': nationality,
                'Deals Count': count,
                'Percentage': percentage
            })
            top_nationalities_data[nationality] = count

        # Residence statistics
        top_residence_data = {'UAE Resident': 0, 'Non-UAE Resident': 0}
        for order in sale_orders:
            country = order.partner_id.sh_re_country_of_residence_id
            if country:
                if country.code == 'AE':
                    top_residence_data['UAE Resident'] += 1
                else:
                    top_residence_data['Non-UAE Resident'] += 1

        return {
            'top_nationalities': top_nationalities_data,
            'nationalities': nationalities,
            'residences': top_residence_data,
        }
     
    @api.model
    def get_sales_payments_statistics(self, filters=None):
        # Get allowed company IDs
        company_ids = self.env.context.get('allowed_company_ids', [self.env.company.id])

        # Base domain for filtering
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 
                                        'payment_clearance', 'handover', 'title_deed')),
            ('company_id', 'in', company_ids),
        ]

        # Apply filters to the domain
        filters = filters or {}
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))


        # Step 1: Use read_group to get order_count per sh_sale_process_state
        grouped_counts = self.read_group(
            domain=domain,
            fields=['sh_sale_process_state'],
            groupby=['sh_sale_process_state'],
            lazy=False
        )
        order_counts = {
            group['sh_sale_process_state']: group['__count']
            for group in grouped_counts if group['sh_sale_process_state']
        }

        # Step 2: Fetch sale orders
        sale_orders = self.env['sale.order'].search_read(
            domain=domain,
            fields=[
                'sh_sale_process_state',
                'sh_re_project_id',  # Add project field
                'sh_product_price_in_order_line',
                'total_paid_amount',
                'sh_invoiced_paid_amount_in_percent',
                'invoiced_due_amount'
            ],
            order='sh_re_project_id, sh_sale_process_state'  # Sort by project and state
        )

        # Step 3: Aggregate in Python by state and project
        statewise_payment_stats = {}
        for order in sale_orders:
            state = order['sh_sale_process_state']
            project = order['sh_re_project_id'] and order['sh_re_project_id'][1] or 'No Project'  # Get project name or fallback
            if not state:
                continue

            # Create a composite key for state and project
            key = (state, project)
            if key not in statewise_payment_stats:
                statewise_payment_stats[key] = {
                    'sum_of_sales_price': 0.0,
                    'total_paid_amount': 0.0,
                    'amount_paid_list': [],
                    'sum_of_invoiced_due': 0.0,
                    'order_count': order_counts.get(state, 0)  # Note: order_count is still per state
                }

            stats = statewise_payment_stats[key]
            stats['sum_of_sales_price'] += order['sh_product_price_in_order_line'] or 0.0
            stats['total_paid_amount'] += order['total_paid_amount'] or 0.0
            stats['amount_paid_list'].append(order['sh_invoiced_paid_amount_in_percent'] or 0.0)
            stats['sum_of_invoiced_due'] += order['invoiced_due_amount'] or 0.0

        # Step 4: Map the results
        statewise_payment_stats_mapped = [
            {
                'state': state,
                'project': project,
                'sum_of_sales_price': stats['sum_of_sales_price'],
                'total_paid_amount': stats['total_paid_amount'],
                'average_amount_paid': (
                    sum(stats['amount_paid_list']) / len(stats['amount_paid_list'])
                    if stats['amount_paid_list'] else 0.0
                ),
                'sum_of_due_amount': stats['sum_of_invoiced_due'],
                'order_count': stats['order_count']
            }
            for (state, project), stats in statewise_payment_stats.items()
        ]

        # SQL query for detailed payment stats
        params = [
            'sale',
            ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed'),
            5000, 5000, 5000,
        ] + list(company_ids)
        company_ids_placeholder = ','.join(['%s'] * len(company_ids))
        extra_conditions = f' AND so.company_id IN ({company_ids_placeholder})'

        # Dynamically build filter conditions
        if filters:
            if 'project' in filters and filters['project']:
                extra_conditions += ' AND so.sh_re_project_id = %s'
                params.append(int(filters['project']))
            if 'unitType' in filters and filters['unitType']:
                extra_conditions += ' AND so.x_studio_unit_type = %s'
                params.append(filters['unitType'])
            if 'salesperson' in filters and filters['salesperson']:
                extra_conditions += ' AND so.user_id = %s'
                params.append(int(filters['salesperson']))

        query = """
            SELECT
                so.name AS sale_order,
                COALESCE(project.name->>'en_US', '') AS project,
                COALESCE(TO_CHAR(so.x_studio_reservation_date_1, 'DD/MM/YYYY'), '') AS reservation_date,
                COALESCE(so.sh_product_in_order_line::text, '') AS unit_no,
                COALESCE(unit_type.name, '') AS unit_type,
                COALESCE(so.sh_product_price_in_order_line, 0.0) AS sales_price,
                COALESCE(partner.name::text, '') AS customer,
                COALESCE(agency.name::text, '') AS agency,
                COALESCE(salesperson_partner.name, '') AS sales_person,
                COALESCE(so.sh_admin_fees_due_amount, 0.0) AS admin_fees_due_amount,
                COALESCE(so.sh_dld_fees_due_amount, 0.0) AS dld_fees_due_amount,
                COALESCE(so.sh_down_payment_due_amount, 0.0) AS down_payment_due_amount
            FROM sale_order so
            LEFT JOIN project_project project ON so.sh_re_project_id = project.id
            LEFT JOIN sh_unit_type unit_type ON so.x_studio_unit_type = unit_type.id
            LEFT JOIN res_partner partner ON so.partner_id = partner.id
            LEFT JOIN res_partner agency ON so.sh_re_agency_name_id = agency.id
            LEFT JOIN res_users users ON so.user_id = users.id
            LEFT JOIN res_partner salesperson_partner ON users.partner_id = salesperson_partner.id
            WHERE so.state = %s
            AND so.sh_sale_process_state IN %s
            AND (
                so.sh_admin_fees_due_amount >= %s
                OR so.sh_dld_fees_due_amount >= %s
                OR so.sh_down_payment_due_amount >= %s
            )
            {extra_conditions}
            ORDER BY so.x_studio_reservation_date_1 ASC
        """.format(extra_conditions=extra_conditions)

        self.env.cr.execute(query, params)
        sale_orders = self.env.cr.dictfetchall()

        payment_stats = [
            {
                'sl': index + 1,
                'sale_order': order.get('sale_order', ''),
                'project': order.get('project', ''),
                'reservation_date': order.get('reservation_date', ''),
                'unit_no': order.get('unit_no', ''),
                'unit_type': order.get('unit_type', ''),
                'sales_price': order.get('sales_price', 0.0),
                'customer': order.get('customer', ''),
                'agency': order.get('agency', ''),
                'salesperson': order.get('sales_person', ''),
                'admin_fees': order.get('admin_fees_due_amount', 0.0),
                'dld_fees': order.get('dld_fees_due_amount', 0.0),
                'down_payment': order.get('down_payment_due_amount', 0.0)
            }
            for index, order in enumerate(sale_orders)
        ]

        return {
            'statewise_payment_stats': statewise_payment_stats_mapped,
            'payment_stats': payment_stats,
        }
    @api.model
    def get_sales_collections_statistics(self, filters=None):
        """
        Fetch sh_partner_collection_status (name), its count, sh_re_project_id, sum of invoiced_due_amount,
        and calculate the percentage of each status from sale.order, grouped by sh_partner_collection_status.
        Handles non-stored computed field invoiced_due_amount.
        """
        # Define the domain to filter sale orders (e.g., only confirmed sales)
        domain = [
            ('state', '=', 'sale'),
            ('sh_sale_process_state', 'in', ('reservation', 'spa', 'registration', 'payment_clearance', 'handover', 'title_deed')),
            ('sh_collection_status_deal_level', '!=', False)
        ]
        filters = filters or {}
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('x_studio_unit_type', '=', int(filters['unitType'])))
        if filters.get('salesperson'):
            domain.append(('user_id', '=', int(filters['salesperson'])))

        # Use read_group to get counts and sh_re_project_id, grouped by sh_partner_collection_status
        grouped_data = self.env['sale.order'].read_group(
            domain=domain,
            fields=['sh_re_project_id', 'sh_collection_status_deal_level'],
            groupby=['sh_re_project_id', 'sh_collection_status_deal_level'],
            orderby='sh_re_project_id',
            lazy=False
        )

        # Calculate total count for percentage computation
        total_count = sum(record['__count'] for record in grouped_data)

        # Get selection field options for sh_collection_status_deal_level
        status_field = self.env['sale.order']._fields['sh_collection_status_deal_level']
        status_names = dict(status_field.selection)  # Maps IDs to names (e.g., 'high_risk': 'High Risk')

        # Process results, manually compute invoiced_due_amount sum
        result = []
        for record in grouped_data:
            # Handle sh_re_project_id (many2one field)
            project_id = record.get('sh_re_project_id', False)
            project_name = ''
            if project_id:
                project_name = project_id[1] if isinstance(project_id, (tuple, list)) and len(project_id) > 1 else ''

            # Get collection status ID and convert to name
            status_id = record.get('sh_collection_status_deal_level', 'Unknown')
            status_name = status_names.get(status_id, status_id)  # Get display name or fallback to ID

            # Get count and compute percentage
            count = record.get('__count', 0)
            percentage = (count / total_count * 100) if total_count > 0 else 0.0

            # Fetch records for this project and status to sum invoiced_due_amount
            group_domain = domain + [
                ('sh_re_project_id', '=', project_id[0] if isinstance(project_id, (tuple, list)) else project_id),
                ('sh_collection_status_deal_level', '=', status_id)
            ]
            sale_orders = self.env['sale.order'].search(group_domain)
            due_amount_sum = sum(sale_order.invoiced_due_amount for sale_order in sale_orders)

            result.append({
                'project': project_name,
                'collection_status': status_name,  # Use display name
                'count_of_deals': count,
                'total_dues': due_amount_sum,
                'percentage': round(percentage, 0)
            })

        # Sort results by  project and priority
        status_priority = {
            'High Risk': 0,
            'Medium Risk': 1,
            'Low Risk': 2,
            'Unknown': 3  # Place Unknown or other statuses at the end
        }
        result = sorted(result, key=lambda x: (x['project'], status_priority.get(status_names.get(x['collection_status'], x['collection_status']), 3)))

        # Return the results
        return {
            'collection_due': result,
        }
    @api.model
    def get_available_units_statistics(self, filters=None, page=1, page_size=500):
        """
        Fetch available units statistics based on the provided filters with pagination support.
        
        Args:
            filters (dict): Optional filters for project, unitType, and salesperson
            page (int): Page number for pagination (default: 1)
            page_size (int): Number of records per page (default: 40)
        
        Returns:
            dict: Available units statistics with pagination metadata
        """
        domain = [
            ('sale_ok', '=', True),
            ('default_code', '!=', False),
            ('sh_state', 'in', ['available', 'blocked'])
        ]
        filters = filters or {}
        if filters.get('project'):
            domain.append(('sh_re_project_id', '=', int(filters['project'])))
        if filters.get('unitType'):
            domain.append(('sh_unit_type_id', '=', int(filters['unitType'])))
        if filters.get('state'):
            domain.append(('sh_state', '=', filters['state']))

        # Calculate offset for pagination
        offset = (page - 1) * page_size

        # Fetch only required fields for available products
        try:
            # Count total records for pagination metadata
            total_records = self.env['product.product'].search_count(domain)
            
            available_units = self.env['product.product'].search_read(
                fields=[
                    'sh_unit_type_id',
                    'default_code',
                    'lst_price',
                    'sh_state',
                    'sh_re_total_area',
                    'sh_property_name',
                    'sh_unit_view_id',
                    'sh_unit_type_variant_id',
                    'sh_unit_series',
                    'sh_no_of_parking_space',
                    'sh_usage',
                    'sh_suit_area',
                    'sh_balcony_area',
                    'sh_approximate_unit_area_m2',
                    # 'sh_purchase_asking_price',
                    'sh_no_of_bedrooms',
                    'sh_no_of_bathroom',
                    'sh_furnished'
                ],
                domain=domain,
                order='sh_unit_type_id ASC',
                limit=page_size,
                offset=offset
            )
            
            # Fetch unit type records to access sh_project_id_for_unit_type
            unit_type_ids = [unit['sh_unit_type_id'][0] for unit in available_units if unit['sh_unit_type_id']]
            unit_types = {rec.id: rec for rec in self.env['sh.unit.type'].browse(unit_type_ids)}

            available_unit_stats = [
                {
                    'project': unit_types.get(unit['sh_unit_type_id'][0]).sh_project_id_for_unit_type.name if unit['sh_unit_type_id'] and unit_types.get(unit['sh_unit_type_id'][0]) and unit_types.get(unit['sh_unit_type_id'][0]).sh_project_id_for_unit_type else '',
                    'unit_no': unit['default_code'] or '',
                    'unit_type': unit['sh_unit_type_id'][1] if unit['sh_unit_type_id'] else '',
                    'bedrooms': unit.get('sh_no_of_bedrooms', 0),
                    'bathrooms': unit.get('sh_no_of_bathroom', 0),
                    'status': unit['sh_state'] or '',
                    'unit_name': unit.get('sh_property_name', ''),
                    'unit_view': unit['sh_unit_view_id'][1] if unit['sh_unit_view_id'] else '',
                    'unit_variant': unit['sh_unit_type_variant_id'][1] if unit['sh_unit_type_variant_id'] else '',
                    'usage': unit.get('sh_usage', ''),
                    'unit_series': unit['sh_unit_series'] or '',
                    'parking_slots': unit.get('sh_no_of_parking_space', 0),
                    'suit_area': unit.get('sh_suit_area', 0.0),
                    'balcony_area': unit.get('sh_balcony_area', 0.0),
                    'total_area_sqft': unit['sh_re_total_area'] or 0.0,
                    'total_area_m2': unit.get('sh_approximate_unit_area_m2', 0.0),
                    # 'purchase_asking_price': unit.get('sh_purchase_asking_price', 0.0),
                    'selling_price': unit['lst_price'] or 0.0,
                    'furnished': unit.get('sh_furnished', False),
                }
                for unit in available_units
            ]
            
            # Calculate pagination metadata
            total_pages = (total_records + page_size - 1) // page_size
            
            return {
                'available_units_stats': available_unit_stats,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': total_records,
                    'total_pages': total_pages,
                    'has_next': page < total_pages,
                    'has_previous': page > 1
                }
            }
            
        except Exception as e:
            _logger.error("Error fetching product records: %s", str(e))
            return {
                'available_units_stats': [],
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': 0,
                    'total_pages': 0,
                    'has_next': False,
                    'has_previous': False
                }
            }
class ProductProduct(models.Model):
    _inherit = "product.product"
    
    # Add custom fields or methods here as needed
    @api.model
    def get_filter_available_options(self, filters=None):
        filters = filters or {}
        
        # Base domain for all queries
        base_domain = [
            ('sale_ok', '=', True),
            ('default_code', '!=', False),
            ('sh_state', 'in', ['available', 'blocked'])
        ]

        # Helper function to create domain for each filter option
        def get_domain(exclude_filter=None):
            domain = base_domain.copy()
            for filter_key, filter_value in filters.items():
                if filter_value and filter_key != exclude_filter:
                    if filter_key == 'project':
                        domain.append(('sh_re_project_id', '=', int(filter_value)))
                    elif filter_key == 'unitType':
                        domain.append(('sh_unit_type_id', '=', int(filter_value)))
                    elif filter_key == 'state':
                        domain.append(('sh_state', '=', filter_value))
            return domain

        # Fetch projects, excluding project filter
        projects_domain = get_domain(exclude_filter='project')
        products = self.env['product.product'].search(projects_domain)
        template_ids = products.mapped('product_tmpl_id').ids
        projects = self.env['product.template'].read_group(
            [('id', 'in', template_ids), ('sh_re_project_id', '!=', False)],
            ['sh_re_project_id'],
            ['sh_re_project_id']
        )
        projects_list = [
            {
                "value": str(project['sh_re_project_id'][0]),
                "formattedValue": project['sh_re_project_id'][1] or ""
            }
            for project in projects if project['sh_re_project_id']
        ]

        # Fetch unit types, excluding unitType filter
        unit_types_domain = get_domain(exclude_filter='unitType')
        unit_types = self.env['product.product'].read_group(
            unit_types_domain,
            ['sh_unit_type_id'],
            ['sh_unit_type_id']
        )
        unit_types_list = [
            {
                "value": str(unit['sh_unit_type_id'][0]),
                "formattedValue": unit['sh_unit_type_id'][1] or ""
            }
            for unit in unit_types if unit['sh_unit_type_id']
        ]

        # Fetch states, excluding state filter
        states_domain = get_domain(exclude_filter='state')
        states = self.env['product.product'].read_group(
            states_domain,
            ['sh_state'],
            ['sh_state']
        )
        state_list = [
            {"value": state['sh_state'], "formattedValue": state['sh_state'].capitalize()}
            for state in states if state['sh_state']
        ]
        
        return {
            'projects': projects_list,
            'unit_types': unit_types_list,
            'states': state_list,
        }

