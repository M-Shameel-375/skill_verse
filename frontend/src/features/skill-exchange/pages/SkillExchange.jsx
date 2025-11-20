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
import { Button } from '../../../components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/Select';
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
                onClick={() => navigate('/skill-exchange/create')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <FaPlus className="mr-2 h-4 w-4" />
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
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 flex-col md:flex-row items-end">
                    <div className="flex-1 relative">
                      <FaSearch className="absolute left-4 top-3 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <FaFilter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={filters.skillCategory}
                          onValueChange={(value) => setFilters({ ...filters, skillCategory: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {skillCategories.map((cat) => (
                              <SelectItem key={cat} value={cat.toLowerCase()}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select
                          value={filters.level}
                          onValueChange={(value) => setFilters({ ...filters, level: value })}
                        >
                          <SelectTrigger id="level">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((lv) => (
                              <SelectItem key={lv} value={lv.toLowerCase()}>
                                {lv}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sort-by">Sort By</Label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                        >
                          <SelectTrigger id="sort-by">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
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
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">Your active exchanges will appear here</p>
                  <div className="space-y-3">
                    <p className="text-gray-700">🔄 Web Design ⟷ Python Programming</p>
                    <p className="text-gray-700">💻 React.js ⟷ UI/UX Design</p>
                    <p className="text-gray-700">📱 Mobile Dev ⟷ Cloud AWS</p>
                  </div>
                </CardContent>
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
