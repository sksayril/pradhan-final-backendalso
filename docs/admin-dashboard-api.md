# Admin Dashboard API

## Overview

The Admin Dashboard API provides comprehensive statistics, analytics, and chart-based data for administrators to monitor and manage the entire system. It includes all key metrics for students, society members, investments, loans, fees, and academic activities.

## Key Features

- **Complete System Overview**: Total users, active users, new registrations
- **Financial Analytics**: Investment amounts, loan disbursements, fee collections
- **Chart-Based Data**: Monthly trends, growth analytics, department-wise statistics
- **Real-Time Statistics**: Pending approvals, system health, recent activities
- **Performance Metrics**: User engagement, course enrollments, attendance tracking

## API Endpoints

### 1. Get Comprehensive Admin Dashboard

```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Admin",
      "email": "admin@example.com",
      "role": "admin",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "overview": {
      "totalUsers": 1250,
      "totalStudents": 1000,
      "totalSocietyMembers": 250,
      "totalAdmins": 5,
      "activeUsers": 1200,
      "newUsersThisMonth": 45
    },
    "investments": {
      "cdInvestments": {
        "total": 150,
        "totalAmount": 7500000,
        "pending": 12,
        "approved": 138
      },
      "regularInvestments": {
        "total": 200,
        "totalAmount": 10000000,
        "pending": 8
      },
      "combined": {
        "totalInvestments": 350,
        "totalAmount": 17500000
      }
    },
    "loans": {
      "totalRequests": 75,
      "totalAmount": 3750000,
      "pending": 5,
      "approved": 60,
      "disbursed": 3000000
    },
    "fees": {
      "totalRequests": 500,
      "totalAmount": 2500000,
      "pending": 25,
      "totalPayments": 475,
      "totalCollected": 2375000
    },
    "academics": {
      "totalCourses": 25,
      "totalBatches": 50,
      "totalEnrollments": 800,
      "activeEnrollments": 750,
      "totalAttendanceRecords": 15000,
      "attendanceThisMonth": 3000
    },
    "charts": {
      "userGrowth": {
        "students": [
          { "month": "Jan 2023", "count": 45 },
          { "month": "Feb 2023", "count": 52 },
          { "month": "Mar 2023", "count": 38 }
        ],
        "societyMembers": [
          { "month": "Jan 2023", "count": 12 },
          { "month": "Feb 2023", "count": 15 },
          { "month": "Mar 2023", "count": 8 }
        ]
      },
      "financial": {
        "cdInvestments": [
          { "month": "Jan 2023", "count": 8, "amount": 400000 },
          { "month": "Feb 2023", "count": 12, "amount": 600000 },
          { "month": "Mar 2023", "count": 10, "amount": 500000 }
        ],
        "loans": [
          { "month": "Jan 2023", "count": 5, "amount": 250000 },
          { "month": "Feb 2023", "count": 7, "amount": 350000 },
          { "month": "Mar 2023", "count": 6, "amount": 300000 }
        ],
        "fees": [
          { "month": "Jan 2023", "count": 45, "amount": 225000 },
          { "month": "Feb 2023", "count": 52, "amount": 260000 },
          { "month": "Mar 2023", "count": 48, "amount": 240000 }
        ]
      }
    },
    "monthlyStats": {
      "current": {
        "students": 45,
        "societyMembers": 12,
        "cdInvestments": { "count": 8, "amount": 400000 },
        "loans": { "count": 5, "amount": 250000 },
        "fees": { "count": 45, "amount": 225000 }
      },
      "last": {
        "students": 38,
        "societyMembers": 8,
        "cdInvestments": { "count": 10, "amount": 500000 },
        "loans": { "count": 6, "amount": 300000 },
        "fees": { "count": 48, "amount": 240000 }
      },
      "growth": {
        "students": 18,
        "societyMembers": 50,
        "cdInvestments": -20,
        "loans": -17,
        "fees": -6
      }
    },
    "departmentStats": {
      "students": [
        { "_id": "Computer Science", "count": 300 },
        { "_id": "Electronics", "count": 250 },
        { "_id": "Mechanical", "count": 200 }
      ],
      "societyMembers": [
        { "_id": "Computer Science", "count": 80 },
        { "_id": "Electronics", "count": 60 },
        { "_id": "Mechanical", "count": 50 }
      ],
      "courses": [
        { "_id": "Computer Science", "count": 10 },
        { "_id": "Electronics", "count": 8 },
        { "_id": "Mechanical", "count": 7 }
      ]
    },
    "statusBreakdowns": {
      "cdInvestments": [
        { "_id": "approved", "count": 138 },
        { "_id": "pending", "count": 12 },
        { "_id": "active", "count": 120 }
      ],
      "loans": [
        { "_id": "approved", "count": 60 },
        { "_id": "pending", "count": 5 },
        { "_id": "disbursed", "count": 50 }
      ],
      "feeRequests": [
        { "_id": "paid", "count": 475 },
        { "_id": "pending", "count": 25 }
      ],
      "enrollments": [
        { "_id": "active", "count": 750 },
        { "_id": "completed", "count": 50 }
      ]
    },
    "recentActivities": {
      "students": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
          "firstName": "John",
          "lastName": "Doe",
          "studentId": "PETF123456",
          "email": "john@example.com",
          "createdAt": "2024-01-15T10:30:00.000Z"
        }
      ],
      "societyMembers": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "firstName": "Jane",
          "lastName": "Smith",
          "memberId": "202511001",
          "email": "jane@example.com",
          "createdAt": "2024-01-14T09:15:00.000Z"
        }
      ],
      "cdInvestments": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
          "cdId": "CD12345678",
          "investmentAmount": 50000,
          "status": "pending",
          "requestDate": "2024-01-15T08:00:00.000Z",
          "userId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "firstName": "John",
            "lastName": "Doe",
            "studentId": "PETF123456"
          }
        }
      ],
      "loanRequests": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
          "loanAmount": 100000,
          "status": "pending",
          "requestDate": "2024-01-15T07:30:00.000Z",
          "userId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
            "firstName": "Jane",
            "lastName": "Smith",
            "memberId": "202511001"
          }
        }
      ],
      "feePayments": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d5",
          "amount": 5000,
          "paymentDate": "2024-01-15T06:45:00.000Z",
          "userId": {
            "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
            "firstName": "John",
            "lastName": "Doe",
            "studentId": "PETF123456"
          }
        }
      ]
    },
    "summary": {
      "totalRevenue": 5375000,
      "totalInvestments": 17500000,
      "totalPendingApprovals": 50,
      "systemHealth": {
        "activeUsers": 1200,
        "activeCourses": 25,
        "activeBatches": 50,
        "systemUptime": 86400
      }
    }
  }
}
```

### 2. Get Quick Stats

```http
GET /api/admin/dashboard/quick-stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "pendingApprovals": 50,
    "totalRevenue": 5375000,
    "activeCourses": 25
  }
}
```

## Dashboard Data Structure

### Overview Statistics
- **Total Users**: Combined count of students and society members
- **Total Students**: Count of all registered students
- **Total Society Members**: Count of all registered society members
- **Total Admins**: Count of all admin users
- **Active Users**: Count of active (non-deactivated) users
- **New Users This Month**: Count of users registered in current month

### Investment Analytics
- **CD Investments**: Certificate of Deposit investment statistics
- **Regular Investments**: Standard investment application statistics
- **Combined**: Total investment metrics across all types

### Loan Management
- **Total Requests**: All loan requests submitted
- **Total Amount**: Sum of all loan amounts requested
- **Pending**: Loan requests awaiting approval
- **Approved**: Loan requests that have been approved
- **Disbursed**: Total amount actually disbursed to users

### Fee Management
- **Total Requests**: All fee payment requests
- **Total Amount**: Sum of all fee amounts requested
- **Pending**: Fee requests awaiting processing
- **Total Payments**: Count of completed payments
- **Total Collected**: Sum of all collected fees

### Academic Statistics
- **Total Courses**: Count of all courses in the system
- **Total Batches**: Count of all course batches
- **Total Enrollments**: Count of all student enrollments
- **Active Enrollments**: Count of currently active enrollments
- **Attendance Records**: Total attendance records
- **Monthly Attendance**: Attendance records for current month

### Chart Data

#### User Growth Charts
- **Monthly Student Registration**: 12-month trend of new student registrations
- **Monthly Society Member Registration**: 12-month trend of new society member registrations

#### Financial Charts
- **CD Investment Trends**: Monthly CD investment counts and amounts
- **Loan Trends**: Monthly loan request counts and amounts
- **Fee Collection Trends**: Monthly fee payment counts and amounts

### Monthly Statistics
- **Current Month**: Statistics for the current month
- **Last Month**: Statistics for the previous month
- **Growth Percentages**: Month-over-month growth calculations

### Department Statistics
- **Student Distribution**: Count of students by department
- **Society Member Distribution**: Count of society members by department
- **Course Distribution**: Count of courses by department

### Status Breakdowns
- **CD Investment Status**: Distribution of CD investments by status
- **Loan Status**: Distribution of loans by status
- **Fee Request Status**: Distribution of fee requests by status
- **Enrollment Status**: Distribution of enrollments by status

### Recent Activities
- **Recent Students**: Latest 5 student registrations
- **Recent Society Members**: Latest 5 society member registrations
- **Recent CD Investments**: Latest 5 CD investment requests
- **Recent Loan Requests**: Latest 5 loan requests
- **Recent Fee Payments**: Latest 5 fee payments

### System Summary
- **Total Revenue**: Combined revenue from fees and loan disbursements
- **Total Investments**: Combined investment amounts
- **Pending Approvals**: Total pending items requiring admin action
- **System Health**: Key system health indicators

## Usage Examples

### Frontend Integration

```javascript
// Get comprehensive dashboard data
const getAdminDashboard = async () => {
  const response = await fetch('/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Get quick stats for widgets
const getQuickStats = async () => {
  const response = await fetch('/api/admin/dashboard/quick-stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  return response.json();
};

// Usage in React component
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getAdminDashboard();
        setDashboardData(data.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{dashboardData.overview.totalUsers}</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p>₹{dashboardData.summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Pending Approvals</h3>
          <p>{dashboardData.summary.totalPendingApprovals}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        <UserGrowthChart data={dashboardData.charts.userGrowth} />
        <FinancialChart data={dashboardData.charts.financial} />
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <RecentStudents students={dashboardData.recentActivities.students} />
        <RecentInvestments investments={dashboardData.recentActivities.cdInvestments} />
      </div>
    </div>
  );
};
```

### Chart Implementation Example

```javascript
// User Growth Chart Component
const UserGrowthChart = ({ data }) => {
  const chartData = {
    labels: data.students.map(item => item.month),
    datasets: [
      {
        label: 'Students',
        data: data.students.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Society Members',
        data: data.societyMembers.map(item => item.count),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }
    ]
  };

  return (
    <div className="chart-container">
      <h3>User Growth Trend</h3>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

// Financial Chart Component
const FinancialChart = ({ data }) => {
  const chartData = {
    labels: data.cdInvestments.map(item => item.month),
    datasets: [
      {
        label: 'CD Investments',
        data: data.cdInvestments.map(item => item.amount),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'Loans',
        data: data.loans.map(item => item.amount),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
      },
      {
        label: 'Fees',
        data: data.fees.map(item => item.amount),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
      }
    ]
  };

  return (
    <div className="chart-container">
      <h3>Financial Trends</h3>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};
```

## Performance Considerations

### Data Aggregation
- All statistics are calculated using MongoDB aggregation pipelines
- Parallel execution of queries for optimal performance
- Cached results for frequently accessed data

### Chart Data Optimization
- 12-month rolling window for trend analysis
- Pre-calculated monthly statistics
- Efficient aggregation queries

### Real-Time Updates
- Dashboard data is calculated on-demand
- Consider implementing caching for high-traffic scenarios
- Use quick-stats endpoint for widget updates

## Security Features

1. **Admin Authentication**: All endpoints require admin authentication
2. **Authorization**: Only admin users can access dashboard data
3. **Data Sanitization**: All data is properly sanitized before response
4. **Rate Limiting**: API endpoints have rate limiting protection

## Error Handling

### Common Error Responses

#### Authentication Error
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

#### Server Error
```json
{
  "success": false,
  "message": "Internal server error while fetching admin dashboard data"
}
```

## Best Practices

1. **Caching**: Implement client-side caching for dashboard data
2. **Real-time Updates**: Use WebSocket connections for real-time updates
3. **Performance**: Load dashboard data asynchronously
4. **User Experience**: Show loading states and error handling
5. **Data Visualization**: Use appropriate chart types for different data
6. **Responsive Design**: Ensure dashboard works on all device sizes

## Future Enhancements

1. **Real-time Notifications**: Push notifications for important events
2. **Custom Dashboards**: Allow admins to customize dashboard layout
3. **Export Functionality**: Export dashboard data to PDF/Excel
4. **Advanced Analytics**: Machine learning insights and predictions
5. **Mobile App**: Dedicated mobile dashboard application
6. **API Versioning**: Version control for dashboard API changes
