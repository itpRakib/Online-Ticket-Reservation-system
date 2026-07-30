import sys
from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        if any(cmd in sys.argv for cmd in ['migrate', 'makemigrations', 'collectstatic', 'help']):
            return

        try:
            from django.contrib.auth.models import User
            from .models import UserProfile

            default_users = [
                {
                    'username': 'bd_goticket_root',
                    'email': 'admin@bdgoticket.com',
                    'first_name': 'System',
                    'last_name': 'Admin',
                    'password': 'Password123!',
                    'role': 'admin',
                    'phone': '01700000000',
                    'nid': '1000000000000',
                    'is_staff': True,
                    'is_superuser': True,
                },
                {
                    'username': 'admin',
                    'email': 'admin@matrix-transit.bd',
                    'first_name': 'Matrix',
                    'last_name': 'Admin',
                    'password': 'Password123!',
                    'role': 'admin',
                    'phone': '01711112222',
                    'nid': '1000000000001',
                    'is_staff': True,
                    'is_superuser': True,
                },
                {
                    'username': 'rakib002',
                    'email': 'rakib860068@gmail.com',
                    'first_name': 'Rakibul',
                    'last_name': 'Islam',
                    'password': 'Password123!',
                    'role': 'user',
                    'phone': '01817860068',
                    'nid': '1998269271829',
                },
                {
                    'username': 'rakib00245',
                    'email': 'rakib.00245@gmail.com',
                    'first_name': 'Rakibul',
                    'last_name': 'Islam',
                    'password': 'Password123!',
                    'role': 'user',
                    'phone': '01700000001',
                    'nid': '1998269271830',
                }
            ]

            for u_data in default_users:
                user, created = User.objects.get_or_create(
                    username=u_data['username'],
                    defaults={
                        'email': u_data['email'],
                        'first_name': u_data['first_name'],
                        'last_name': u_data['last_name'],
                        'is_staff': u_data.get('is_staff', False),
                        'is_superuser': u_data.get('is_superuser', False),
                    }
                )
                if created or not user.check_password(u_data['password']):
                    user.set_password(u_data['password'])
                    user.email = u_data['email']
                    user.first_name = u_data['first_name']
                    user.last_name = u_data['last_name']
                    user.is_staff = u_data.get('is_staff', False)
                    user.is_superuser = u_data.get('is_superuser', False)
                    user.save()

                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.phone = u_data['phone']
                profile.nid = u_data['nid']
                profile.role = u_data['role']
                profile.email_verified = True
                profile.phone_verified = True
                profile.nid_verified = True
                profile.save()
        except Exception:
            pass
