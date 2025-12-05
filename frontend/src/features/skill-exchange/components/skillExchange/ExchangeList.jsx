import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import ExchangeCard from './ExchangeCard';
import { Button } from '@/components/ui/Button';
import { getSkillExchanges } from '@/api/skillExchangeApi';
import toast from 'react-hot-toast';

const ExchangeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const itemsPerPage = 12;

  // Fetch exchanges from API
  const fetchExchanges = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Add search filter if present
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Add skill filter if selected
      if (selectedSkill) {
        params.offeredSkill = selectedSkill;
      }

      const response = await getSkillExchanges(params);
      
      if (response.data?.data) {
        const data = response.data.data;
        // Map API response to component format
        const mappedExchanges = (Array.isArray(data) ? data : data.exchanges || []).map(ex => ({
          _id: ex._id,
          title: ex.title || `${ex.offeredSkill?.name || 'Skill'} for ${ex.requestedSkill?.name || 'Skill'}`,
          description: ex.description || '',
          offering: ex.offeredSkill?.name || 'Not specified',
          seeking: ex.requestedSkill?.name || 'Not specified',
          duration: ex.estimatedDuration ? `${Math.floor(ex.estimatedDuration / 60)}-${Math.ceil(ex.estimatedDuration / 60) + 1}` : '1-2',
          matchCount: ex.matchCount || 0,
          user: {
            _id: ex.requester?._id,
            name: ex.requester?.name || 'Unknown',
            avatar: ex.requester?.profileImage?.url || '',
            rating: ex.requester?.rating || 4.5,
          },
        }));
        
        setExchanges(mappedExchanges);
        setPagination({
          page: response.data.pagination?.page || currentPage,
          totalPages: response.data.pagination?.pages || Math.ceil((response.data.pagination?.total || mappedExchanges.length) / itemsPerPage),
          total: response.data.pagination?.total || mappedExchanges.length,
        });
      }
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      toast.error('Failed to load exchanges');
      setExchanges([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedSkill]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchExchanges();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedSkill]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skill Exchange Marketplace</h1>
        <p className="text-gray-600">Trade skills with peers in your community</p>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills or exchanges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Skills</option>
            <option value="React">React</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Flutter">Flutter</option>
            <option value="Java">Java</option>
            <option value="TypeScript">TypeScript</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-600">
          Showing {exchanges.length} of {pagination.total} exchanges
        </p>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-blue-600 mr-3" />
          <span className="text-gray-600">Loading exchanges...</span>
        </div>
      ) : exchanges.length > 0 ? (
        /* Exchanges Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exchanges.map((exchange) => (
            <ExchangeCard key={exchange._id} exchange={exchange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No exchanges found matching your criteria</p>
          <Button variant="primary" onClick={() => { setSearchTerm(''); setSelectedSkill(''); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExchangeList;
