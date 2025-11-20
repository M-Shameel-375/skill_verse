import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const SkillsList = ({ skills, isOwnProfile, onAddSkill, onRemoveSkill, onUpdateSkill }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate', endorsements: 0 });

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      onAddSkill?.(newSkill);
      setNewSkill({ name: '', level: 'intermediate', endorsements: 0 });
      setShowAddForm(false);
      toast.success('Skill added!');
    }
  };

  const handleRemoveSkill = (skillId) => {
    onRemoveSkill?.(skillId);
    toast.success('Skill removed');
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-blue-100 text-blue-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
      expert: 'bg-purple-100 text-purple-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
          {isOwnProfile && (
            <Button
              size="sm"
              variant="primary"
              icon={<FaPlus />}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              Add Skill
            </Button>
          )}
        </div>

        {/* Add Skill Form */}
        {showAddForm && isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 rounded-lg space-y-4 border border-blue-200"
          >
            <div>
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner</option>\n                <option value=\"intermediate\">Intermediate</option>\n                <option value=\"advanced\">Advanced</option>\n                <option value=\"expert\">Expert</option>\n              </select>\n              <Button size=\"sm\" variant=\"primary\" onClick={handleAddSkill}>\n                Add\n              </Button>\n            </div>\n          </motion.div>\n        )}\n\n        {/* Skills Grid */}\n        {skills && skills.length > 0 ? (\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            {skills.map((skill) => (\n              <motion.div\n                key={skill._id}\n                initial={{ opacity: 0, y: 10 }}\n                animate={{ opacity: 1, y: 0 }}\n                className=\"p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors\"\n              >\n                <div className=\"flex items-start justify-between mb-3\">\n                  <div className=\"flex-1\">\n                    <h3 className=\"font-semibold text-gray-900\">{skill.name}</h3>\n                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${getLevelColor(skill.level)}`}>\n                      {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}\n                    </span>\n                  </div>\n                  {isOwnProfile && (\n                    <div className=\"flex gap-2\">\n                      <button\n                        onClick={() => onUpdateSkill?.(skill._id)}\n                        className=\"p-2 text-blue-600 hover:bg-blue-50 rounded\"\n                      >\n                        <FaEdit size={14} />\n                      </button>\n                      <button\n                        onClick={() => handleRemoveSkill(skill._id)}\n                        className=\"p-2 text-red-600 hover:bg-red-50 rounded\"\n                      >\n                        <FaTrash size={14} />\n                      </button>\n                    </div>\n                  )}\n                </div>\n                <div className=\"flex items-center gap-4 text-sm text-gray-600\">\n                  <div className=\"flex items-center gap-1\">\n                    <FaStar className=\"text-yellow-500\" />\n                    <span>{skill.endorsements || 0} endorsements</span>\n                  </div>\n                </div>\n              </motion.div>\n            ))}\n          </div>\n        ) : (\n          <div className=\"text-center py-8\">\n            <p className=\"text-gray-600 mb-4\">No skills yet</p>\n            {isOwnProfile && (\n              <Button size=\"sm\" variant=\"outline\" onClick={() => setShowAddForm(true)}>\n                Add Your First Skill\n              </Button>\n            )}\n          </div>\n        )}\n      </div>\n    </Card>\n  );\n};\n\nexport default SkillsList;
