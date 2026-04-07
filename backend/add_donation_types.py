from licenses.models import DonationType

types_data = [
    {'name': 'Don Bronze', 'description': 'Support de base', 'amount': 2000, 'amount_eur': 3, 'icon': '🥉', 'order': 1},
    {'name': 'Don Argent', 'description': 'Support régulier', 'amount': 5000, 'amount_eur': 8, 'icon': '🥈', 'order': 2},
    {'name': 'Don Or', 'description': 'Support généreux', 'amount': 10000, 'amount_eur': 15, 'icon': '🥇', 'order': 3},
    {'name': 'Don Diamant', 'description': 'Support premium', 'amount': 20000, 'amount_eur': 30, 'icon': '💎', 'order': 4},
]

for t in types_data:
    obj, created = DonationType.objects.get_or_create(
        name=t['name'],
        defaults={
            'description': t['description'],
            'amount': t['amount'],
            'amount_eur': t['amount_eur'],
            'icon': t['icon'],
            'order': t['order'],
            'is_active': True
        }
    )
    if created:
        print(f'Created: {obj.icon} {obj.name}')
    else:
        print(f'Already exists: {obj.icon} {obj.name}')

print(f'\nTotal: {DonationType.objects.count()} types')
