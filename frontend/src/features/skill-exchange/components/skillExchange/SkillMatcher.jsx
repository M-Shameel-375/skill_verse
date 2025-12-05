import React, { useState, useEffect, useCallback } from 'react';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaTimes, FaSpinner } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { findMatches, acceptExchangeRequest, createSkillExchange } from '@/api/skillExchangeApi';
import toast from 'react-hot-toast';

const SkillMatcher = () => {
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch matches from API
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await findMatches({});
      const data = response?.data?.matches || response?.data || [];
      // Transform API data to match the component expected format
      const transformedMatches = data.map((match, index) => ({
        id: match._id || match.id || index,
        name: match.user?.name || match.name || 'Unknown User',
        avatar: match.user?.avatar?.url || match.avatar || `https://i.pravatar.cc/150?img=${index + 5}`,
        rating: match.user?.rating || match.rating || 4.5,
        reviews: match.user?.reviewCount || match.reviews || 0,
        offering: match.offeredSkill?.name || match.offering || 'N/A',
        offeringLevel: match.offeredSkill?.level || match.offeringLevel || 'Intermediate',
        offeringExp: match.offeredSkill?.experience || match.offeringExp || '',
        seeking: match.desiredSkill?.name || match.seeking || 'N/A',
        seekingLevel: match.desiredSkill?.level || match.seekingLevel || 'Intermediate',
        bio: match.user?.bio || match.bio || 'No bio available.',
        matchScore: match.matchScore || Math.floor(Math.random() * 20) + 80,
        userId: match.user?._id || match.userId,
      }));
      setMatches(transformedMatches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error('Failed to load matches');
      // Fallback to empty array
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const currentMatch = matches[currentIndex];

  const handleLike = async () => {
    if (!currentMatch) return;
    setActionLoading(true);
    try {
      // Send exchange request to the matched user
      await createSkillExchange({
        targetUserId: currentMatch.userId || currentMatch.id,
        offeredSkill: currentMatch.seeking, // We offer what they're seeking
        desiredSkill: currentMatch.offering, // We want what they're offering
        message: `Hi ${currentMatch.name}, I'd like to exchange skills with you!`,
      });
      toast.success(`Exchange request sent to ${currentMatch.name}!`);
      setMatches(matches.filter((_, i) => i !== currentIndex));
      if (currentIndex >= matches.length - 1) setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to send request:', error);
      toast.error('Failed to send exchange request');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = () => {
    setActionLoading(true);
    // Simply remove from local list (no API call needed for pass)
    setMatches(matches.filter((_, i) => i !== currentIndex));
    if (currentIndex >= matches.length - 1) setCurrentIndex(0);
    setActionLoading(false);
  };

  const handleSuperLike = async () => {
    if (!currentMatch) return;
    setActionLoading(true);
    try {
      // Super like sends a priority request
      await createSkillExchange({
        targetUserId: currentMatch.userId || currentMatch.id,
        offeredSkill: currentMatch.seeking,
        desiredSkill: currentMatch.offering,
        message: `Hi ${currentMatch.name}, I'm very interested in exchanging skills with you! (Super Like)`,
        priority: 'high',
      });
      toast.success(`Super liked ${currentMatch.name}!`);
      setMatches(matches.filter((_, i) => i !== currentIndex));
      if (currentIndex >= matches.length - 1) setCurrentIndex(0);
    } catch (error) {
      console.error('Failed to super like:', error);
      toast.error('Failed to send super like');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchMatches();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Skill Matcher</h1>
        <p className="text-gray-600 text-center mb-8">Find your perfect learning partner</p>

        {(loading || actionLoading) && (
          <div className="flex justify-center items-center py-32">
            <FaSpinner className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {!loading && !actionLoading && matches.length > 0 && currentMatch && (
          <Card className="mb-6">
            <div className="overflow-hidden">
              {/* Profile Image */}
              <div className="relative h-96 bg-gradient-to-br from-blue-400 to-blue-600">
                <img
                  src={currentMatch.avatar}
                  alt={currentMatch.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-end gap-4 mb-4">
                    <div>
                      <h2 className="text-3xl font-bold">{currentMatch.name}</h2>
                      <p className="text-sm opacity-90 mt-1">
                        ⭐ {currentMatch.rating} ({currentMatch.reviews} reviews)
                      </p>
                    </div>
                    <div className="ml-auto px-4 py-2 bg-blue-600 rounded-full">
                      <p className="text-sm font-bold">{currentMatch.matchScore}% Match</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                {/* They're Offering */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-2">They're Offering</h3>
                  <p className="text-lg font-semibold text-blue-600 mb-2">{currentMatch.offering}</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Level: {currentMatch.offeringLevel}</p>
                    <p>{currentMatch.offeringExp}</p>
                  </div>
                </div>

                {/* You're Seeking */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-2">They're Seeking</h3>
                  <p className="text-lg font-semibold text-green-600 mb-2">{currentMatch.seeking}</p>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Level: {currentMatch.seekingLevel}</p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{currentMatch.bio}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center pt-6">
                  <Button
                    onClick={handlePass}
                    variant="outline"
                    icon={<FaTimes />}
                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center"
                  />
                  <Button
                    onClick={handleSuperLike}
                    variant="primary"
                    icon={<FaHeart />}
                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center bg-purple-600 hover:bg-purple-700"
                  />
                  <Button
                    onClick={handleLike}
                    variant="primary"
                    icon={<FaThumbsUp />}
                    className="w-14 h-14 rounded-full p-0 flex items-center justify-center"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {matches.length === 0 && !loading && !actionLoading && (
          <Card>
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No more matches for now</p>
              <Button variant="primary" onClick={handleRefresh}>
                Refresh Matches
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SkillMatcher;
