from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
import logging
from .models import User, Product, CartItem, Order, OrderItem
from .serializers import UserSerializer, ProductSerializer, CartItemSerializer, OrderSerializer

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User created with email: {user.email}, password hash: {user.password}")
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        logger.error(f"Registration failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        logger.info(f"Attempting to authenticate user with email: {email}")
        user = authenticate(request, email=email, password=password)
        if user:
            logger.info(f"User {email} authenticated successfully")
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        else:
            logger.error(f"Authentication failed for user with email: {email}")
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_products_by_category(request, category):
    """Fetch products filtered by category."""
    if category.upper() == 'ALL':
        products = Product.objects.filter(available=True)
    else:
        products = Product.objects.filter(category=category.upper(), available=True)
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_categories(request):
    """Get all available product categories."""
    # Get unique categories actually used in the database
    used_categories = Product.objects.values_list('category', flat=True).distinct().order_by('category')
    
    # Map categories to their display names using the CATEGORY_CHOICES
    category_dict = dict(Product.CATEGORY_CHOICES)
    
    # Start with ALL (if not already in used_categories)
    categories = []
    if 'ALL' not in used_categories:
        categories.append({"value": "ALL", "label": "All"})
    
    # Add all categories with their display names
    for cat in used_categories:
        categories.append({"value": cat, "label": category_dict.get(cat, cat)})
    
    return Response(categories)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart_items(request):
    """Fetch the logged-in user's cart items."""
    cart_items = CartItem.objects.filter(user=request.user)
    serializer = CartItemSerializer(cart_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add a product to the logged-in user's cart or update quantity."""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)  # Default quantity is 1
    product = get_object_or_404(Product, id=product_id)
    cart_item, created = CartItem.objects.get_or_create(
        user=request.user, product=product,
        defaults={'quantity': quantity}
    )
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    """Remove a product from the cart."""
    cart_item = get_object_or_404(CartItem, user=request.user, product_id=product_id)
    cart_item.delete()
    return Response({'message': 'Item removed from cart'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order from the user's cart items."""
    # Get user's cart items
    cart_items = CartItem.objects.filter(user=request.user)
    
    if not cart_items.exists():
        return Response(
            {'error': 'Your cart is empty'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculate total amount
    total_amount = sum(
        item.product.price * item.quantity 
        for item in cart_items
    )
    
    # Create the order
    order = Order.objects.create(
        user=request.user,
        status='pending',
        total_amount=total_amount
    )
    
    # Create order items from cart items
    order_items = []
    for cart_item in cart_items:
        order_items.append(OrderItem(
            order=order,
            product=cart_item.product,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        ))
    
    # Bulk create order items
    OrderItem.objects.bulk_create(order_items)
    
    # Clear the user's cart
    cart_items.delete()
    
    # Return the created order
    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """Fetch all orders for the logged-in user."""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_detail(request, order_id):
    """Fetch details of a specific order."""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)
