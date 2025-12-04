import React from 'react';
// Import professional icons from lucide-react instead of emojis
import { 
  DollarSign, Package, CheckCircle, Settings, Clock, BarChart2, Calendar, Users, ShoppingBag, Truck 
} from 'lucide-react'; // Added 'Truck' icon for Shipped Orders

// Import Recharts components
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';


// --- NEW/FIXED HELPER COMPONENT: Day of Week Orders Chart (Starts with Sunday, Fixes invisible zero bars, Fixes X-Axis label visibility) ---

const DayOfWeekOrdersChart = ({ data }) => {
    // Map Django/Postgres WEEKDAY (1=Sunday, 2=Monday, ... 7=Saturday) to standard labels
    const dayLabels = {
        1: 'Sun',
        2: 'Mon',
        3: 'Tue',
        4: 'Wed',
        5: 'Thu',
        6: 'Fri',
        7: 'Sat',
    };

    // Define the desired sort order (FIXED: Start with Sunday)
    const sortedDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Format data to ensure all days are present for a full chart and sorted Sun-Sat
    const formattedData = sortedDays.map(dayLabel => {
        // Find the numeric day key from the label (e.g., 'Sun' -> 1)
        const dayNumKey = Object.keys(dayLabels).find(key => dayLabels[key] === dayLabel);
        // Find the data item that matches this numeric key
        const dayData = data.find(item => item.day_of_week_num === parseInt(dayNumKey));
        
        const actualCount = dayData ? dayData.count : 0;
        
        return {
            day: dayLabel,
            // FIX: If count is 0, set it to a tiny number (0.1) so the bar is visible as a line.
            count: actualCount === 0 ? 0.1 : actualCount, 
            // Store the actual value for the tooltip
            actualCount: actualCount
        };
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col">
            <h4 className="text-xl font-semibold mb-4 text-gray-700">Orders by Day of Week (All Time)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    // FIX: Increased bottom margin from 5 to 30 to prevent X-axis labels from being cut off.
                    margin={{ top: 5, right: 20, left: 0, bottom: 30 }} 
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="day" 
                        stroke="#6b7280"
                    />
                    {/* The YAxis domain should handle the small 0.1 value fine */}
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                        labelFormatter={(label) => `Day: ${label}`}
                        // FIX: Use the 'actualCount' for the tooltip display
                        formatter={(value, name, props) => [props.payload.actualCount, 'Total Orders']}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <Bar dataKey="count" name="Orders" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


// --- EXISTING HELPER COMPONENTS: Charts & Cards ---

const WeeklyOrdersSummaryCard = ({ weeklyOrders }) => {
    
  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col justify-center items-center text-center">
      <Calendar className="w-16 h-16 mb-4 text-purple-600"/>
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Orders (Last 7 Days)</h4>
      <p className="text-6xl font-extrabold text-purple-600">
        {weeklyOrders}
      </p>
      <p className="mt-4 text-gray-500">
        A rolling total providing weekly trend data.
      </p>
    </div>
  );
};


const DailyOrdersChart = ({ data }) => {
  const formatDay = (timestamp) => {
    if (!timestamp) return '';
    // Assuming timestamp is 'YYYY-MM-DD'
    const date = new Date(timestamp);
    return date.toLocaleString('default', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col lg:col-span-2"> 
      <h4 className="text-xl font-semibold mb-4 text-gray-700">Daily Order Trend (Last 30 Days)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }} // Reduced right margin for mobile
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDay} 
            stroke="#6b7280"
            // Adjust tick count for smaller screens
            tickCount={data.length > 15 ? 7 : data.length}
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => [value, 'Orders']}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <Line type="monotone" dataKey="count" name="Daily Orders" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Renders a proper Pie Chart for Order Status Distribution using Recharts.
 */
const OrderDistributionPieChart = ({ data }) => {
  const statusColors = {
    'DELIVERED': '#10b981', 
    'PROCESSING': '#f59e0b', 
    'PENDING': '#f97316', 
    'CANCELLED': '#ef4444', 
    'SHIPPED': '#3b82f6',   
    'DRAFT': '#9ca3af',     
  };

  const chartData = data.map(item => ({
    // Format status: 'DELIVERED' -> 'Delivered'
    name: item.status.charAt(0) + item.status.slice(1).toLowerCase().replace('_', ' '),
    value: item.count,
    color: statusColors[item.status] || '#6b7280',
  })).filter(item => item.value > 0); 

  // Function to display the label text outside the chart
  const renderCustomizedLabel = ({ 
      cx, cy, midAngle, outerRadius, percent, index 
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={chartData[index].color} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col">
      <h4 className="text-xl font-semibold mb-6 text-gray-700">Order Status Distribution</h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60} 
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={2} 
            labelLine={true} 
            label={renderCustomizedLabel} 
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(value, name, props) => [`${value} orders`, props.payload.name]}
             contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            wrapperStyle={{ paddingLeft: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};


const MonthlyOrdersChart = ({ data }) => {
  const formatMonth = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col">
      <h4 className="text-xl font-semibold mb-4 text-gray-700">Monthly Order Volume</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth} 
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            labelFormatter={formatMonth}
            formatter={(value) => [value, 'Orders']}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <Legend />
          <Line type="monotone" dataKey="count" name="Orders" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};


const YearlyOrdersChart = ({ data }) => {
  const formatYear = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.getFullYear();
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex flex-col">
      <h4 className="text-xl font-semibold mb-4 text-gray-700">Yearly Order Trend</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="year" 
            tickFormatter={formatYear}
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            labelFormatter={formatYear}
            formatter={(value) => [value, 'Orders']}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <Legend />
          <Bar dataKey="count" name="Orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


// --- Main AdminStats Component ---

const AdminStats = ({ stats, productAnalytics }) => {
  if (!stats) return <div className="text-center p-8 text-lg font-medium text-blue-600">📊 Loading Admin Statistics...</div>;

  // --- Calculations for Display ---
  // Safety check for array existence before reducing
  const totalOrders = Array.isArray(stats.monthly_orders) 
    ? stats.monthly_orders.reduce((sum, item) => sum + item.count, 0)
    : 0;
  
  const deliveredOrders = Array.isArray(stats.status_distribution)
    ? stats.status_distribution.find(s => s.status === 'DELIVERED')?.count || 0
    : 0;
    
  const processingOrders = Array.isArray(stats.status_distribution)
    ? stats.status_distribution.find(s => s.status === 'PROCESSING')?.count || 0
    : 0;
    
  // ADDED: Calculation for Shipped Orders
  const shippedOrders = Array.isArray(stats.status_distribution)
    ? stats.status_distribution.find(s => s.status === 'SHIPPED')?.count || 0
    : 0;
  
  // Calculate WEEKLY orders by slicing the last 7 entries of the daily data and summing their counts.
  const dailyData = Array.isArray(stats.daily_orders) ? stats.daily_orders : [];
  const weeklyOrders = dailyData.slice(-7).reduce((sum, item) => sum + item.count, 0);
  
  // Calculate the percentage of delivered orders
  const deliveredPercentage = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0.0';

  // Format currency
  const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;


  // --- Helper Component for Stat Cards ---
  const StatCard = ({ title, value, icon: Icon, className = 'text-gray-900', secondaryText }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 transition duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
        <div className={`text-2xl ${className}`}>
          {Icon && <Icon className="w-6 h-6" />} {/* Use lucide icon component */}
        </div>
      </div>
      <p className={`mt-1 text-3xl font-extrabold ${className}`}>
        {value}
      </p>
      {secondaryText && (
        <p className="mt-2 text-xs text-gray-400">{secondaryText}</p>
      )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-2 flex items-center">
         <BarChart2 className="w-7 h-7 mr-2 text-blue-600" /> 
         Admin Dashboard Analytics
      </h2>
      
      {/* 1. Key Performance Indicators (KPIs) Grid */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Key Metrics Overview</h3>
        {/* Expanded to 5 columns on large screens to include SHIPPED orders, or wrap to 3+2/4+1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"> 
          
          {/* 1. Total Revenue */}
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.total_revenue)} 
            icon={DollarSign} 
            className="text-green-600"
            secondaryText="Revenue from DELIVERED orders"
          />
          
          {/* 2. Total Orders */}
          <StatCard 
            title="Total Orders" 
            value={totalOrders} 
            icon={ShoppingBag} 
            className="text-indigo-600"
            secondaryText="Total orders placed in history"
          />
          
          {/* 3. Delivered Orders */}
          <StatCard 
            title="Delivered Orders" 
            value={deliveredOrders} 
            icon={CheckCircle} 
            className="text-teal-600"
            secondaryText={`${deliveredPercentage}% of total orders`}
          />
          
          {/* 4. Shipped Orders */}
          <StatCard 
            title="Shipped Orders" 
            value={shippedOrders} 
            icon={Truck} 
            className="text-blue-600"
            secondaryText={`Orders currently in transit`}
          />
          
          {/* 5. Processing Orders */}
          <StatCard 
            title="Processing Orders" 
            value={processingOrders} 
            icon={Settings} 
            className="text-amber-600"
            secondaryText={`New orders awaiting dispatch`}
          />
        </div>
      </section>

      {/* 2. Analytics Charts Section - Grouping all charts for a clean layout */}
      <section>
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Order Trends & Visualization</h3>
        
        {/* Top Row: Weekly Summary Card & Pie (Focus on immediate data/distribution) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Weekly Orders Summary Card */}
          <WeeklyOrdersSummaryCard 
            weeklyOrders={weeklyOrders} 
          />

          {/* Order Distribution Pie Chart */}
          {Array.isArray(stats.status_distribution) && stats.status_distribution.length > 0 ? (
            <OrderDistributionPieChart 
              data={stats.status_distribution} 
            />
          ) : (
             <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex items-center justify-center text-gray-500 italic">
                <Package className="w-5 h-5 mr-2" /> Order Status Distribution data not available.
            </div>
          )}
        </div>

        {/* Middle Row: Daily Trend (Full Width) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Daily Orders Chart (Spans 2 columns on large screen to give better X-Axis space) */}
          {Array.isArray(stats.daily_orders) && stats.daily_orders.length > 0 ? (
            <div className="lg:col-span-2">
                <DailyOrdersChart 
                    data={stats.daily_orders} 
                />
            </div>
          ) : (
             <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex items-center justify-center text-gray-500 italic lg:col-span-2">
                <Clock className="w-5 h-5 mr-2" /> Daily Order Trend data not available.
            </div>
          )}
        </div>

        {/* Bottom Row: Monthly, Day of Week, Yearly (3-column layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Monthly Orders Line Chart */}
          {Array.isArray(stats.monthly_orders) && stats.monthly_orders.length > 0 ? (
            <MonthlyOrdersChart 
              data={stats.monthly_orders} 
            />
          ) : (
             <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex items-center justify-center text-gray-500 italic">
                <Calendar className="w-5 h-5 mr-2" /> Monthly Order Volume data not available.
            </div>
          )}


          {/* Day of Week Orders Chart (FIXED) */}
          {Array.isArray(stats.orders_by_day_of_week) && stats.orders_by_day_of_week.length > 0 ? (
            <DayOfWeekOrdersChart 
              data={stats.orders_by_day_of_week} 
            />
          ) : (
             <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex items-center justify-center text-gray-500 italic">
                <Users className="w-5 h-5 mr-2" /> Orders by Day of Week data not available.
            </div>
          )}
          
          {/* Yearly Orders Bar Chart */}
          {Array.isArray(stats.yearly_orders) && stats.yearly_orders.length > 0 ? (
            <YearlyOrdersChart 
              data={stats.yearly_orders} 
            />
          ) : (
             <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-96 flex items-center justify-center text-gray-500 italic">
                <BarChart2 className="w-5 h-5 mr-2" /> Yearly Order Trend data not available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminStats;