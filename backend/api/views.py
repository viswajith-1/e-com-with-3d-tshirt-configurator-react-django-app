import os
import razorpay
from django.conf import settings 
from rest_framework import viewsets, status, permissions, generics 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
# Import ExtractWeekDay, TruncHour, TruncMonth, TruncYear
from django.db.models.functions import TruncMonth, TruncYear, TruncHour, ExtractWeekDay 
from django.db.models import Count, Sum, F 
from datetime import date, timedelta # Import for date filtering

from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer, UserSerializer, OrderItemSerializer

# --- User Authentication Views ---

class RegisterView(APIView):
    """
    API endpoint for new user registration.
    Handles POST requests to create a new user.
    """
    permission_classes = [permissions.AllowAny] # Anyone can register

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens for the new user immediately after registration
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                # UPDATED: Include necessary login details for frontend storage
                'username': user.username,
                'isAdmin': user.is_staff, 
                'userId': user.id,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    API endpoint for user login.
    Authenticates users and returns JWT tokens.
    """
    permission_classes = [permissions.AllowAny] # Anyone can attempt to log in

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'isAdmin': user.is_staff, # Let the frontend know if the user is an admin
                'userId': user.id,
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# --- E-commerce ViewSets ---

# api/views.py

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing products.
    - List and Retrieve actions are allowed for any user.
    - Create, Update, and Delete actions are restricted to admin users.
    """
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer

    def get_permissions(self):
        # --- REPLACE THE OLD METHOD WITH THIS ---
        if self.action == 'create':
            # Allow any logged-in user to create a custom product
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only allow admins to modify or delete existing products
            self.permission_classes = [permissions.IsAdminUser]
        else:
            # Allow anyone to view products (list, retrieve)
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        # ... (this method remains unchanged) ...
        queryset = Product.objects.all().order_by('-created_at')
        is_featured = self.request.query_params.get('is_featured')
        is_trending = self.request.query_params.get('is_trending')
        is_bestseller = self.request.query_params.get('is_bestseller')

        if is_featured == 'true':
            queryset = queryset.filter(is_featured=True)

        if is_trending == 'true':
            queryset = queryset.filter(is_trending=True)

        if is_bestseller == 'true':
            queryset = queryset.filter(is_bestseller=True)

        return queryset


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and viewing customer orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in to access orders

    def get_queryset(self):
        # Users can only view their own orders, not others'.
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the customer for the new order.
        serializer.save(customer=self.request.user)

class UpdateOrderStatusView(APIView):
    """
    API endpoint for admins to update the status of an order.
    """
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        if not new_status or new_status not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Invalid status provided"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- Razorpay Integration Views ---

# Initialize the Razorpay client from Django settings
# FIX: Now reading keys from settings.py where they are defined directly.
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class CreateRazorpayOrderView(APIView):
    """
    Creates a Razorpay order ID required to initialize the payment flow.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")
        try:
            order = Order.objects.get(id=order_id, customer=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if total_price is valid before multiplying
        if order.total_price <= 0:
             return Response({"error": "Order total price must be greater than zero."}, status=status.HTTP_400_BAD_REQUEST)
             
        # Amount must be in the smallest currency unit (e.g., paise for INR)
        amount = int(order.total_price * 100) 
        
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": amount,
                "currency": "INR",
                "receipt": f"order_rcptid_{order.id}",
            })
        except Exception as e:
            # Handle Razorpay API errors (e.g., invalid keys or parameters) gracefully
            print(f"Razorpay Order Creation Error: {e}")
            return Response({"error": "Razorpay API error during order creation.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        # Store the Razorpay order ID in our database
        order.razorpay_order_id = razorpay_order['id']
        order.save()

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "amount": amount,
            "currency": "INR",
            "name": "T-Shirt Store",
            "key": settings.RAZORPAY_KEY_ID # <--- Using settings key
        })

class VerifyPaymentView(APIView):
    """
    Verifies the payment signature returned by Razorpay after a successful payment.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        params_dict = {
            'razorpay_order_id': request.data.get("razorpay_order_id"),
            'razorpay_payment_id': request.data.get("razorpay_payment_id"),
            'razorpay_signature': request.data.get("razorpay_signature")
        }

        try:
            # This utility function will raise an exception if the signature is invalid
            razorpay_client.utility.verify_payment_signature(params_dict)
            
            order = Order.objects.get(razorpay_order_id=params_dict['razorpay_order_id'])
            order.razorpay_payment_id = params_dict['razorpay_payment_id']
            order.razorpay_signature = params_dict['razorpay_signature']
            order.status = 'PROCESSING'
            order.save()

            # Reduce the stock for each item in the order
            for item in order.items.all():
                item.product.stock -= item.quantity
                item.product.save()

            return Response({"status": "Payment Successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            # In case of verification failure, keep the order PENDING (default status)
            return Response({"error": "Payment Verification Failed", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# --- Admin Dashboard Views ---

class AdminDashboardStats(APIView):
    """
    Provides aggregated statistics for the admin dashboard, including hourly and day-of-week data.
    Restricted to admin users only.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = date.today()
        
        # 1. Group orders by month and count them
        monthly_orders = Order.objects.annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')
        
        # 2. Group orders by year and count them
        yearly_orders = Order.objects.annotate(year=TruncYear('created_at')).values('year').annotate(count=Count('id')).order_by('year')
        
        # 3. Count orders for each status type
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        
        # 4. Calculate total revenue from 'DELIVERED' orders only
        total_revenue = Order.objects.filter(status='DELIVERED').aggregate(total=Sum('total_price'))['total'] or 0

        # 5. Daily Order Trend (Last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        daily_orders = Order.objects.filter(
            created_at__date__gte=thirty_days_ago # Filter orders from the last 30 days
        ).extra({'date': "date(created_at)"}).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # 6. Hourly Order Trend (Today only)
        hourly_orders_today_raw = Order.objects.filter(
            created_at__date=today # Filter orders for today
        ).annotate(
            hour_group=TruncHour('created_at')
        ).values('hour_group').annotate(
            count=Count('id')
        ).order_by('hour_group')
        
        hourly_orders_today = [
            # Format datetime object to 'HH:00' string, e.g., '14:00'
            {'hour': item['hour_group'].strftime('%H:00'), 'count': item['count']}
            for item in hourly_orders_today_raw
        ]
        
        # Fill in hours with zero count for a continuous hourly graph
        all_hours = {f"{h:02d}:00": 0 for h in range(24)}
        for item in hourly_orders_today:
            all_hours[item['hour']] = item['count']

        hourly_orders_today_filled = [
            {'hour': hour, 'count': count} 
            for hour, count in sorted(all_hours.items())
        ]
        
        # 7. Orders by Day of Week (Aggregating all time data)
        # Note: ExtractWeekDay returns 1=Sunday, 2=Monday, ..., 7=Saturday
        orders_by_day_of_week = Order.objects.annotate(
            day_of_week_num=ExtractWeekDay('created_at')
        ).values('day_of_week_num').annotate(
            count=Count('id')
        ).order_by('day_of_week_num')
        
        return Response({
            "monthly_orders": list(monthly_orders),
            "yearly_orders": list(yearly_orders),
            "status_distribution": list(status_counts),
            "total_revenue": total_revenue,
            "daily_orders": list(daily_orders), 
            "hourly_orders_today": hourly_orders_today_filled, 
            "orders_by_day_of_week": list(orders_by_day_of_week), # <--- NEW FIELD
        })


# ADDED: New view for product-centric analytics (Stock and Top Sellers)
class AdminProductAnalytics(APIView):
    """
    Provides stock alerts and top-selling product data for the admin dashboard.
    Restricted to admin users only.
    """
    permission_classes = [permissions.IsAdminUser]
    
    # Define a default low stock threshold
    LOW_STOCK_THRESHOLD = 10 

    def get(self, request):
        # 1. Low Stock/Inventory Analysis
        # Fetch products where the current stock is below the threshold
        low_stock_products = Product.objects.filter(stock__lt=self.LOW_STOCK_THRESHOLD).order_by('stock')
        
        low_stock_data = [
            {
                'id': product.id,
                'name': product.name,
                'current_stock': product.stock,
                'threshold': self.LOW_STOCK_THRESHOLD
            }
            for product in low_stock_products
        ]
        
        # 2. Top Selling Products Analysis
        # Import OrderItem is assumed to be available in models and linked to Product.
        # Aggregate the quantity of items sold, grouped by product.
        # Filter: Only consider items from orders that are DELIVERED or SHIPPED
        top_selling_products_query = Order.objects.filter(
            status__in=['DELIVERED', 'SHIPPED']
        ).values(
            'items__product__name', 
            'items__product__id'
        ).annotate(
            total_sold=Sum('items__quantity')
        ).order_by('-total_sold')[:5] # Get the top 5
        
        top_selling_data = [
            {
                'id': item['items__product__id'],
                'name': item['items__product__name'],
                'total_sold': item['total_sold'],
            }
            for item in top_selling_products_query
        ]
        
        return Response({
            "low_stock_alerts": low_stock_data,
            "top_selling_products": top_selling_data,
            "low_stock_count": len(low_stock_data), # Count for easy KPI display
        })


class UserListAdminView(generics.ListAPIView):
    """
    API endpoint for admins to list all users.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

# ADDED: New view for retrieving, updating, and DESTROYING a single user.
class UserDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for admins to retrieve, update, or delete a single user.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class OrderListAdminView(generics.ListAPIView):
    """
    API endpoint for admins to list all orders.
    """
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]