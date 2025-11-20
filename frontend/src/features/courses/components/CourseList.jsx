import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from './CourseCard';
import Button from '../common/Button';
import { Loader } from '../common/Loader';

const CourseList = ({ courses = [], loading = false, hasMore = false, onLoadMore }) => {
  if (loading && courses.length === 0) {
    return <div className="flex justify-center items-center py-12"><Loader /></div>;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </AnimatePresence>
      </motion.div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} loading={loading} size="lg">
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
