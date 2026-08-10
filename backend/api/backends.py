# pyrefly: ignore [missing-import]
from django.contrib.auth.backends import ModelBackend
# pyrefly: ignore [missing-import]
from django.contrib.auth.models import User
# pyrefly: ignore [missing-import]
from django.db.models import Q

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if not username:
            return None

        clean_username = username.strip()
        formatted_phone = clean_username
        clean_digits = clean_username.replace('+', '').replace('-', '').replace(' ', '')
        if clean_digits.isdigit():
            if formatted_phone.startswith('0'):
                formatted_phone = '+88' + formatted_phone
            elif not formatted_phone.startswith('+88'):
                formatted_phone = '+880' + formatted_phone

        try:
            # Look up user by case-insensitive username, email, or phone number
            user = User.objects.filter(
                Q(username__iexact=clean_username) | 
                Q(email__iexact=clean_username) | 
                Q(profile__phone=clean_username) | 
                Q(profile__phone=formatted_phone)
            ).first()
            if not user:
                raise User.DoesNotExist()
        except (User.DoesNotExist, User.MultipleObjectsReturned):
            # Run the password hash checks anyway to prevent timing attacks
            User().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
