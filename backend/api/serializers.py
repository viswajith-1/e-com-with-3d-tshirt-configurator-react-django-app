from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Order, OrderItem
from decimal import Decimal # <--- CRITICAL FIX: ADDED IMPORT

# Define the fixed shipping rate as a Decimal to ensure correct financial arithmetic
FIXED_SHIPPING_CHARGE = Decimal('40.00') # <--- CRITICAL FIX: DEFINED AS DECIMAL

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    It's used for user registration, ensuring the password is write-only for security.
    """
    is_staff = serializers.BooleanField(read_only=False, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        # Use the create_user method to handle password hashing automatically.
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        # Update user fields.
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        
        # Handle password change separately to ensure it is hashed.
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

    def validate_email(self, value):
        """
        Custom validation to ensure the email address is from the Gmail domain.
        """
        if not value.endswith('@gmail.com'):
            raise serializers.ValidationError("Only Gmail accounts are allowed for registration.")
        return value

class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for the Product model.
    It will convert all fields from the Product model into JSON format.
    """
    class Meta:
        model = Product
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the OrderItem model.
    - `product`: A read-only nested representation of the associated product.
    - `product_id`: A write-only field to specify which product to add when creating an order.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_id', 'quantity', 'price')


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model.
    This is a nested serializer that includes all the OrderItems associated with the order.
    """
    # 'items' will be a list of OrderItem objects, serialized by OrderItemSerializer.
    items = OrderItemSerializer(many=True)
    # 'customer' will be a read-only representation of the user who placed the order.
    customer = UserSerializer(read_only=True)

    class Meta:
        fields = ('id', 'customer', 'created_at', 'total_price', 'status', 'items', 'razorpay_order_id')
        model = Order
        read_only_fields = ('total_price', 'status', 'customer', 'razorpay_order_id')

    def create(self, validated_data):
        # Extract the nested 'items' data from the request payload.
        items_data = validated_data.pop('items')
        
        # Create the main Order instance first.
        order = Order.objects.create(**validated_data)
        
        # Initialize total_price as a Decimal, matching the type of product.price
        total_price = Decimal('0.00') 
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            
            # Critical business logic: Check for sufficient stock before proceeding.
            if product.stock < item_data['quantity']:
                order.delete() # Rollback the order creation if any item is out of stock.
                raise serializers.ValidationError(
                    f"Not enough stock for {product.name}. Only {product.stock} available."
                )
            
            # Use the product's current price, not a price from the frontend.
            item_price = product.price
            OrderItem.objects.create(
                order=order, 
                product=product, 
                quantity=item_data['quantity'], 
                price=item_price
            )
            total_price += item_price * item_data['quantity']
        
        # --- FIX: ADD THE FIXED SHIPPING CHARGE (Decimal + Decimal is valid) ---
        if total_price > 0:
            total_price += FIXED_SHIPPING_CHARGE
        
        # Update the order with the calculated FINAL total price.
        order.total_price = total_price
        order.save()
        
        return order