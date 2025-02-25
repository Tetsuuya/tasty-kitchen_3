from django.urls import path
from .views import RegisterView, LoginView, UserDetailView, LogoutView, ProductListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('products/', ProductListView.as_view(), name='product-list'),  # Ensure this endpoint is defined
]