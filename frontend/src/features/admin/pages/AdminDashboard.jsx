import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaUserShield, FaExclamationTriangle, FaChartBar, FaUsers, FaCog } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const AdminDashboard = ({ user }) => {
  const adminFeatures = [
    {
      title: 'Dispute Management',
      description: 'Manage user disputes and conflicts',
      icon: FaExclamationTriangle,
      path: '/admin/disputes',
      color: 'text-red-600',
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and insights',
      icon: FaChartBar,
      path: '/admin/analytics',
      color: 'text-blue-600',
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: FaUsers,
      path: '/admin/users',
      color: 'text-green-600',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: FaCog,
      path: '/admin/settings',
      color: 'text-purple-600',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - SkillVerse</title>
        <meta name="description" content="Admin dashboard for managing the SkillVerse platform" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FaUserShield className="text-3xl text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">
              Welcome back, {user?.name || 'Admin'}! Manage the SkillVerse platform from here.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <FaUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <FaChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Published courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disputes</CardTitle>
                <FaExclamationTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">Pending disputes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <FaChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$--</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <feature.icon className={`text-2xl ${feature.color}`} />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link to={feature.path}>
                    <Button className="w-full">
                      Access {feature.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;