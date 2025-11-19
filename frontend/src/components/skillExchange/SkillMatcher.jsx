import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaTimes, FaSpinner } from 'react-icons/fa';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const SkillMatcher = () => {
  const [matches, setMatches] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 4.8,
      reviews: 32,
      offering: 'Web Design',
      offeringLevel: 'Advanced',
      offeringExp: '5 years experience',
      seeking: 'Python Programming',
      seekingLevel: 'Beginner-Intermediate',
      bio: 'Passionate about UI/UX design and love teaching. Available evenings.',
      matchScore: 92,
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=6',
      rating: 4.6,
      reviews: 18,
      offering: 'React.js',
      offeringLevel: 'Advanced',
      offeringExp: '4 years experience',
      seeking: 'Node.js',
      seekingLevel: 'Intermediate',
      bio: 'Full-stack developer, excellent at explaining complex concepts.',
      matchScore: 85,
    },
    {
      id: 3,
      name: 'Emma Davis',
      avatar: 'https://i.pravatar.cc/150?img=7',
      rating: 4.9,
      reviews: 56,
      offering: 'Mobile App Dev (React Native)',
      offeringLevel: 'Expert',
      offeringExp: '6 years experience',
      seeking: 'Cloud Architecture',
      seekingLevel: 'Intermediate-Advanced',
      bio: 'Patient mentor, loves collaborative learning. Flexible scheduling.',
      matchScore: 88,
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentMatch = matches[currentIndex];

  const handleLike = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`You liked ${currentMatch.name}!`);
      setMatches(matches.filter((_, i) => i !== currentIndex));
      if (currentIndex >= matches.length - 1) setCurrentIndex(0);
      else setCurrentIndex(currentIndex);
      setLoading(false);
    }, 800);
  };

  const handlePass = () => {
    setLoading(true);
    setTimeout(() => {
      setMatches(matches.filter((_, i) => i !== currentIndex));
      if (currentIndex >= matches.length - 1) setCurrentIndex(0);
      else setCurrentIndex(currentIndex);
      setLoading(false);
    }, 800);
  };

  const handleSuperLike = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`Super liked ${currentMatch.name}!`);
      setMatches(matches.filter((_, i) => i !== currentIndex));
      if (currentIndex >= matches.length - 1) setCurrentIndex(0);
      else setCurrentIndex(currentIndex);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Skill Matcher</h1>
        <p className="text-gray-600 text-center mb-8">Find your perfect learning partner</p>

        {loading && (
          <div className="flex justify-center items-center py-32">
            <FaSpinner className="animate-spin text-blue-600" size={40} />
          </div>
        )}

        {!loading && matches.length > 0 && currentMatch && (
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

        {matches.length === 0 && !loading && (
          <Card>
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No more matches for now</p>
              <Button variant="primary" onClick={() => toast.success('Refreshing matches...')}>
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
