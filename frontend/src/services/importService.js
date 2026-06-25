// frontend/src/services/importService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const importService = {
  // อ่าน headers จาก CSV ของนักศึกษา
  async getStudentHeaders(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/students/import/headers`, { method: 'POST', body: formData });
    return res.json();
  },

  // Import นักศึกษา
  async importStudents(file, mapping, mode = 'full', academicYearImport = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('mode', mode);
    if (academicYearImport) formData.append('academic_year_import', academicYearImport);
    const res = await fetch(`${API_URL}/students/import`, { method: 'POST', body: formData });
    return res.json();
  },

  // อ่าน headers จาก CSV ของผู้สัมภาษณ์
  async getInterviewerHeaders(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/interviewers/import/headers`, { method: 'POST', body: formData });
    return res.json();
  },

  // Import ผู้สัมภาษณ์
  async importInterviewers(file, mapping) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    const res = await fetch(`${API_URL}/interviewers/import`, { method: 'POST', body: formData });
    return res.json();
  },
};
