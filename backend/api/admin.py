from django.contrib import admin
from .models import Product, Order, OrderItem

# The @admin.register decorator is a clean way to register your models.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Product model in the admin interface.
    """
    list_display = ('name', 'price', 'stock', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')

# OrderItem is best managed "inline" with the Order, so we define that here.
class OrderItemInline(admin.TabularInline):
    """
    Allows editing OrderItems directly within the Order detail page.
    """
    model = OrderItem
    raw_id_fields = ['product'] 
    extra = 0 
    readonly_fields = ('price',) 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Customizes the display of the Order model in the admin interface.
    
    Allows editing of customer, status, and total_price on both the list and detail pages.
    Removes the custom restriction on adding new orders to allow full CRUD control.
    """
    list_display = ('id', 'customer', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id', 'customer__username') 
    inlines = [OrderItemInline] 
    
    # 1. ALLOW FULL EDITING ON DETAIL PAGE (Removed: customer, status, total_price)
    # Only keep critical fields like timestamps and external IDs read-only.
    readonly_fields = ('created_at', 'razorpay_order_id', 'razorpay_payment_id',)
    
    # 2. ALLOW FULL EDITING ON LIST PAGE (Added: customer, status, total_price)
    # All fields listed here must also be in list_display. 'id' cannot be included.
    list_editable = ('status', 'customer', 'total_price',)
    
    # 3. ALLOW DELETION AND ADDITION (Removed restrictive method)
    # The has_add_permission method has been removed entirely. 
    # This enables the 'Add Order' button and ensures default delete permissions are honored.
    # The 'Delete selected objects' action will now be available if the user has delete permission.
    
# We don't need to register OrderItem separately because it's handled by the inline.