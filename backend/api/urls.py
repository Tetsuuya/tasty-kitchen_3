from django.urls import path
from .views import (
    RegisterView, LoginView, UserDetailView, LogoutView,
    get_products_by_category, get_categories, get_cart_items,
    add_to_cart, remove_from_cart, create_order, get_orders,
    get_order_detail
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Product endpoints
    path('products/category/<str:category>/', get_products_by_category, name='products-by-category'),
    path('categories/', get_categories, name='categories'),
    
    # Cart endpoints
    path('cart/', get_cart_items, name='cart-items'),
    path('cart/add/', add_to_cart, name='add-to-cart'),
    path('cart/remove/<int:product_id>/', remove_from_cart, name='remove-from-cart'),
    
    # Order endpoints
    path('orders/', get_orders, name='get-orders'),
    path('orders/create/', create_order, name='create-order'),
    path('orders/<int:order_id>/', get_order_detail, name='order-detail'),
]