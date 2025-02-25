from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Product

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']  # Include 'username'
        extra_kwargs = {'password': {'write_only': True}}  # Prevent password from being returned

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])  # Hash the password
        return super().create(validated_data)


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

from rest_framework import serializers
from .models import CartItem

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_price = serializers.ReadOnlyField(source='product.price')
    product_image = serializers.ReadOnlyField(source='product.image_url')

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity']
