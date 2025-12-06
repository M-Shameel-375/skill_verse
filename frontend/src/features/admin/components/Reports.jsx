import React, { useState, useEffect, useCallback } from 'react';
import { FaDownload, FaFileAlt, FaCalendarAlt, FaFilter, FaSpinner, FaEye } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getReports, downloadReport } from '@/api/adminApi';
import { format } from 'date-fns';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('30d');

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getReports({
        type: filterType !== 'all' ? filterType : undefined,
        period: filterPeriod,
      });
      const data = response.data || response;

      const reportList = data.reports || data || [];
      setReports(reportList.map(report => ({
        id: report._id,
        title: report.title || report.name || 'Report',
        type: report.type || 'General',
        description: report.description || 'Generated report',
        generatedAt: report.createdAt ? format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm') : 'N/A',
        size: report.size || 'N/A',
        downloadUrl: report.downloadUrl || report.url,
        status: report.status || 'available',
      })));
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setReports([]);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterPeriod]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = async (reportId, reportTitle) => {
    try {
      setDownloading(reportId);
      const response = await downloadReport(reportId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const handleViewReport = (report) => {
    // Open report in new tab or modal
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    } else {
      toast.info('Report preview not available');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and download system reports</p>
        </div>
        <Button
          onClick={fetchReports}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FaFileAlt className="mr-2" />
          Refresh Reports
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="user">User Reports</option>
                <option value="course">Course Reports</option>
                <option value="payment">Payment Reports</option>
                <option value="analytics">Analytics Reports</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-500" />
              <span className="text-sm font-medium">Period:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardContent className="p-4">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500">No reports available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <FaFileAlt className="text-blue-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Type: {report.type}</span>
                        <span>Generated: {report.generatedAt}</span>
                        {report.size && <span>Size: {report.size}</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleViewReport(report)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <FaEye className="mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDownload(report.id, report.title)}
                    disabled={downloading === report.id}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {downloading === report.id ? (
                      <FaSpinner className="animate-spin mr-1" />
                    ) : (
                      <FaDownload className="mr-1" />
                    )}
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;