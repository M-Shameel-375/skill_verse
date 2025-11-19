import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FaPlus, FaSearch, FaFilter, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ExchangeList from '../components/skillExchange/ExchangeList';
import ExchangeCard from '../components/skillExchange/ExchangeCard';
import SkillExchangeDashboard from '../components/skillExchange/SkillExchangeDashboard';
import SkillMatcher from '../components/skillExchange/SkillMatcher';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

const SkillExchange = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [view, setView] = useState('marketplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skillCategory: 'all',
    level: 'all',
    sortBy: 'recent',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access skill exchanges');
      navigate('/login');
    }
  }, [user, navigate]);

  const skillCategories = [
    'All',
    'Programming',
    'Web Development',
    'Design',
    'Mobile Dev',
    'Cloud & DevOps',
    'Data Science',
    'Machine Learning',
    'Business',
    'Marketing',
    'Languages',
    'Music',
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <>
      <Helmet>
        <title>Skill Exchange - SkillVerse</title>
        <meta name="description" content="Exchange skills with other learners in the community" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold">Skill Exchange</h1>
                <p className="text-blue-100 mt-2">Share your skills and learn from others in the community</p>
              </div>
              <Button
                variant="primary"
                icon={<FaPlus />}
                onClick={() => navigate('/skill-exchange/create')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                New Exchange
              </Button>
            </div>

            {/* View Tabs */}
            <div className="flex gap-3">
              {['marketplace', 'my-exchanges', 'matcher', 'dashboard'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    view === v
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {v === 'marketplace' && '🏪 Marketplace'}
                  {v === 'my-exchanges' && '🔄 My Exchanges'}
                  {v === 'matcher' && '💫 Matcher'}
                  {v === 'dashboard' && '📊 Dashboard'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Marketplace View */}
          {view === 'marketplace' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Search & Filter Bar */}
              <Card>
                <div className="p-6 space-y-4">
                  <div className="flex gap-4 flex-col md:flex-row items-end">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-4 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                      <FaFilter /> Filters
                    </button>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={filters.skillCategory}
                          onChange={(e) => setFilters({ ...filters, skillCategory: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {skillCategories.map((cat) => (
                            <option key={cat} value={cat.toLowerCase()}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                        <select
                          value={filters.level}
                          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {levels.map((lv) => (
                            <option key={lv} value={lv.toLowerCase()}>
                              {lv}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="recent">Most Recent</option>
                          <option value="rating">Highest Rated</option>
                          <option value="popular">Most Popular</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Exchange List */}
              <ExchangeList searchTerm={searchTerm} filters={filters} />
            </motion.div>
          )}

          {/* My Exchanges View */}
          {view === 'my-exchanges' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <div className="p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">Your active exchanges will appear here</p>
                  <div className="space-y-3">
                    <p className="text-gray-700">🔄 Web Design ⟷ Python Programming</p>
                    <p className="text-gray-700">💻 React.js ⟷ UI/UX Design</p>
                    <p className="text-gray-700">📱 Mobile Dev ⟷ Cloud AWS</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Matcher View */}
          {view === 'matcher' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkillMatcher />
            </motion.div>
          )}

          {/* Dashboard View */}
          {view === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkillExchangeDashboard />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default SkillExchange;
