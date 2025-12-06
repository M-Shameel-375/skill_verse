// ============================================
// RECOMMENDED SKILLS COMPONENT
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaArrowRight, FaSpinner, FaStar, FaUsers } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCourses } from '@/api/courseApi';
import { findMatches } from '@/api/skillExchangeApi';

const RecommendedSkills = ({ userSkills = [], userInterests = [] }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [skillMatches, setSkillMatches] = useState([]);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch courses and skill exchange matches
      const [coursesRes, matchesRes] = await Promise.all([
        getCourses({ limit: 6, sort: '-rating' }).catch(() => ({ data: { courses: [] } })),
        findMatches({ limit: 4 }).catch(() => ({ data: { matches: [] } })),
      ]);

      const courses = coursesRes.data?.courses || [];
      const matches = matchesRes.data?.matches || matchesRes.data || [];

      // Format course recommendations
      setRecommendations(courses.slice(0, 4).map(course => ({
        id: course._id,
        title: course.title,
        category: course.category,
        rating: course.rating?.average?.toFixed(1) || 'N/A',
        students: course.enrolledCount || 0,
        thumbnail: course.thumbnail?.url,
        type: 'course',
      })));

      // Format skill exchange matches
      setSkillMatches(matches.slice(0, 3).map(match => ({
        id: match._id,
        skill: match.skillOffered?.name || match.offeredSkill?.name || 'Skill',
        wantedSkill: match.skillWanted?.name || match.wantedSkill?.name || 'Skill',
        user: match.user?.name || 'User',
        avatar: match.user?.profileImage?.url,
        type: 'exchange',
      })));

    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [userSkills, userInterests]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <FaSpinner className="animate-spin text-2xl text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommended Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" />
            Recommended for You
          </CardTitle>
          <Button variant="link" onClick={() => navigate('/courses')}>
            View All <FaArrowRight className="ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recommendations yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/courses/${item.id}`)}
                >
                  <img
                    src={item.thumbnail || 'https://via.placeholder.com/80x60'}
                    alt={item.title}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" /> {item.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers /> {item.students}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Exchange Matches */}
      {skillMatches.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skill Exchange Matches</CardTitle>
            <Button variant="link" onClick={() => navigate('/skill-exchange')}>
              View All <FaArrowRight className="ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/skill-exchange/${match.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={match.avatar || `https://ui-avatars.com/api/?name=${match.user}`}
                      alt={match.user}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{match.user}</p>
                      <p className="text-sm text-gray-600">
                        Offers: <span className="text-blue-600">{match.skill}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Wants:</p>
                    <p className="text-sm font-medium text-green-600">{match.wantedSkill}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecommendedSkills;
