// frontend/src/components/StudentImport.jsx
'use client';

import { useState, useRef } from 'react';
import { importService } from '@/services/importService';
import ImportResult from './ImportResult';

const STUDENT_FIELDS = [
  { key: 'student_id',       label: 'รหัสนักศึกษา',   required: true },
  { key: 'student_name',     label: 'ชื่อ-นามสกุล',    required: true },
  { key: 'program',          label: 'หลักสูตร',         required: true },
  { key: 'faculty',          label: 'คณะ',              required: true },
  { key: 'campus',           label: 'วิทยาเขต',         required: true },
  { key: 'level',            label: 'ระดับ',            required: true },
  { key: 'academic_year',    label: 'ปีการศึกษา',       required: false },
  { key: 'phone',            label: 'เบอร์โทรศัพท์',   required: false },
  { key: 'scholarship',      label: 'ทุนการศึกษา',     required: false },
  { key: 'graduated_school', label: 'โรงเรียนที่จบ',   required: false },
  { key: 'hometown',         label: 'ภูมิลำเนา',        required: false },
];

export default function StudentImport() {
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep] = useState('upload'); // upload | mapping | result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const fileRef = useRef();

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError('');
    setLoading(true);

    try {
      const res = await importService.getStudentHeaders(f);
      if (!res.success) throw new Error(res.message);

      setCsvHeaders(res.headers);
      // Auto-map ถ้า header ตรงกับ label ของ field
      const autoMap = {};
      STUDENT_FIELDS.forEach(field => {
        const matched = res.headers.find(h =>
          h.toLowerCase().includes(field.label.toLowerCase()) ||
          h.toLowerCase().includes(field.key.toLowerCase())
        );
        if (matched) autoMap[field.key] = matched;
      });
      setMapping(autoMap);
      setStep('mapping');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const missingRequired = STUDENT_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missingRequired.length > 0) {
      setError(`กรุณา map field ที่จำเป็น: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await importService.importStudents(file, mapping);
      if (!res.success) throw new Error(res.message);
      setImportResult(res.result);
      setImportErrors(res.errors || []);
      setStep('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setMapping({});
    setStep('upload');
    setError('');
    setImportResult(null);
    setImportErrors([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 mb-2">อัปโหลดไฟล์ CSV ข้อมูลนักศึกษา</p>
          <p className="text-sm text-gray-400 mb-4">รองรับไฟล์ .csv ขนาดไม่เกิน 10MB</p>
          <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            เลือกไฟล์
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
          {loading && <p className="mt-4 text-gray-500">กำลังอ่านไฟล์...</p>}
        </div>
      )}

      {/* Step: Column Mapping */}
      {step === 'mapping' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-700">ไฟล์: <span className="text-blue-600">{file?.name}</span></p>
              <p className="text-sm text-gray-500">กรุณา map คอลัมน์ CSV กับ field ในระบบ</p>
            </div>
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">
              เลือกไฟล์ใหม่
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-1/2">Field ในระบบ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-1/2">คอลัมน์ใน CSV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {STUDENT_FIELDS.map(field => (
                  <tr key={field.key} className={field.required ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={mapping[field.key] || ''}
                        onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value || undefined }))}
                        className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">— ไม่ map —</option>
                        {csvHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'กำลัง Import...' : 'เริ่ม Import'}
            </button>
            <button onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === 'result' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Import เสร็จสิ้น</h3>
          </div>
          <ImportResult result={importResult} errors={importErrors} />
          <button
            onClick={handleReset}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Import ไฟล์ใหม่
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
