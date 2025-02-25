from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
import logging

# Set up logging configuration
logger = logging.getLogger(__name__)

User = get_user_model()

class EmailBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            # Find the user by email
            user = User.objects.get(email=email)
            logger.info(f"User found: {user.email}")
            
            # Check if the password matches
            if user.check_password(password):
                logger.info("Password matches")
                return user
            else:
                logger.warning("Password does not match")
                return None
        except User.DoesNotExist:
            logger.error(f"User with email {email} does not exist")
            return None
