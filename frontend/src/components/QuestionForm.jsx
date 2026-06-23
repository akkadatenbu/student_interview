// frontend/src/components/QuestionForm.jsx
'use client';

import { useInterview } from '@/hooks/useInterview';

export default function QuestionForm() {
  const { 
    visibleQuestions, 
    answers, 
    saveAnswer,
    loading,
    submitInterview
  } = useInterview();
  
  // ฟังก์ชันสำหรับการตอบคำถาม
  const handleAnswerChange = (questionId, value) => {
    saveAnswer(questionId, value);
  };
  
  // สร้าง UI element สำหรับคำถามแต่ละประเภท
  const renderQuestionInput = (question) => {
    const questionId = question.question_id;
    const currentAnswer = answers[questionId] || '';
    
    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="พิมพ์คำตอบของคุณที่นี่"
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="พิมพ์คำตอบของคุณที่นี่"
          />
        );
        
      case 'radio':
        try {
          const options = question.answer_options ?
            question.answer_options.split('||').map(opt => opt.trim()) :
            [];
          
          return (
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`question-${questionId}-option-${index}`}
                    name={`question-${questionId}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={() => handleAnswerChange(questionId, option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`question-${questionId}-option-${index}`}
                    className="ml-2 block text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          );
        } catch (error) {
          console.error(`Error rendering radio options for question ${questionId}:`, error);
          return (
            <div className="text-red-500">
              เกิดข้อผิดพลาดในการแสดงตัวเลือก
            </div>
          );
        }
        
      case 'checkbox':
        try {
          const options = question.answer_options ?
            question.answer_options.split('||').map(opt => opt.trim()) :
            [];
          
          // แปลงคำตอบเป็น array ถ้าเป็น string
          const selectedOptions = currentAnswer ? 
            (typeof currentAnswer === 'string' ? currentAnswer.split(',').map(opt => opt.trim()) : currentAnswer) : 
            [];
          
          return (
            <div className="space-y-2">
              {options.map((option, index) => {
                const isChecked = selectedOptions.includes(option);
                
                return (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`question-${questionId}-option-${index}`}
                      value={option}
                      checked={isChecked}
                      onChange={() => {
                        // อัปเดตรายการตัวเลือกที่เลือก
                        const newSelectedOptions = isChecked
                          ? selectedOptions.filter(opt => opt !== option)
                          : [...selectedOptions, option];
                        
                        handleAnswerChange(questionId, newSelectedOptions.join(','));
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`question-${questionId}-option-${index}`}
                      className="ml-2 block text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          );
        } catch (error) {
          console.error(`Error rendering checkbox options for question ${questionId}:`, error);
          return (
            <div className="text-red-500">
              เกิดข้อผิดพลาดในการแสดงตัวเลือก
            </div>
          );
        }
        
      case 'select':
        try {
          const options = question.answer_options ?
            question.answer_options.split('||').map(opt => opt.trim()) :
            [];
          
          return (
            <select
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(questionId, e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกคำตอบ --</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } catch (error) {
          console.error(`Error rendering select options for question ${questionId}:`, error);
          return (
            <div className="text-red-500">
              เกิดข้อผิดพลาดในการแสดงตัวเลือก
            </div>
          );
        }
        
      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกตัวเลข"
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="พิมพ์คำตอบของคุณที่นี่"
          />
        );
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitInterview();
  };
  
  if (visibleQuestions.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="text-center py-8">
          <p className="text-lg text-gray-500">กำลังโหลดคำถาม...</p>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">แบบสัมภาษณ์</h2>
      
      <div className="space-y-6">
        {visibleQuestions.map((question) => (
          <div key={question.question_id} className="border-b pb-4 last:border-b-0">
            <label className="block text-gray-700 font-medium mb-2">
              {question.question_id}. {question.question_text}
              {question.condition_display && (
                <span className="text-sm text-gray-500 ml-2">({question.condition_display})</span>
              )}
            </label>
            {renderQuestionInput(question)}
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกการสัมภาษณ์'}
        </button>
      </div>
    </form>
  );
}