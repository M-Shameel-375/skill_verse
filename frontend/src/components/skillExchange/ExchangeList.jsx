import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import ExchangeCard from './ExchangeCard';
import Button from '../common/Button';

const ExchangeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Mock data
  const mockExchanges = [
    {
      _id: '1',
      title: 'Learn React in exchange for Python tutoring',
      description: 'I can teach React fundamentals. Looking for someone to help me with Python data structures.',
      offering: 'React',
      seeking: 'Python',
      duration: '1-2',
      matchCount: 3,
      user: { _id: '1', name: 'John Doe', avatar: '', rating: 4.8 },
    },
    {
      _id: '2',
      title: 'JavaScript expertise for UI/UX design guidance',
      description: 'Advanced JavaScript developer wanting to learn modern UI/UX principles.',
      offering: 'JavaScript',
      seeking: 'UI/UX Design',
      duration: '2-3',
      matchCount: 5,
      user: { _id: '2', name: 'Jane Smith', avatar: '', rating: 4.9 },
    },
    {
      _id: '3',
      title: 'Node.js backend for Flutter mobile development',
      description: 'Expert in Node.js and REST APIs. Need Flutter mobile development skills.',
      offering: 'Node.js',
      seeking: 'Flutter',
      duration: '2-3',
      matchCount: 2,
      user: { _id: '3', name: 'Mike Johnson', avatar: '', rating: 4.7 },
    },
  ];

  const filteredExchanges = mockExchanges.filter((exchange) => {
    const matchesSearch =
      exchange.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.offering.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.seeking.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !selectedSkill || exchange.offering === selectedSkill || exchange.seeking === selectedSkill;
    return matchesSearch && matchesSkill;
  });

  const totalPages = Math.ceil(filteredExchanges.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedExchanges = filteredExchanges.slice(startIdx, startIdx + itemsPerPage);

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-400" />
          <select
            value={selectedSkill}
            onChange={(e) => {
              setSelectedSkill(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Skills</option>
            <option value="React">React</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Node.js">Node.js</option>
            <option value="Python">Python</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Flutter">Flutter</option>
          </select>
        </div>
      </div>

      {/* Exchanges Grid */}
      {paginatedExchanges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedExchanges.map((exchange) => (
            <ExchangeCard key={exchange._id} exchange={exchange} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No exchanges found matching your criteria</p>
          <Button variant="primary">Create an Exchange</Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExchangeList;
