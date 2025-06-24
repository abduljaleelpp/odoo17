# -*- coding: utf-8 -*-
{
    'name': "Awesome Dashboard",

    'summary': """
        module for  dashboards
    """,

    'description': """
        module for dashboards
    """,

    'author': "Abdul Jaleel",
    'website': "https://www.irth.ae/",
    'category': 'Sales',
    'version': '0.2',
    'application': True,
    'installable': True,
    'depends': ['base', 'web', 'sale', 'crm'],

    'data': [
        'security/security.xml',
        'views/views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'awesome_dashboard/static/src/**/*',
            ('remove', 'awesome_dashboard/static/src/dashboard/**/*'),
        ],
        'awesome_dashboard.dashboard': [
            'awesome_dashboard/static/src/dashboard/**/*'
        ]

    },
    'license': 'AGPL-3'
}
