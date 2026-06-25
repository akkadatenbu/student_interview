'use client';

import { useState, useRef, useEffect } from 'react';
import { importService } from '@/services/importService';
import { studentService } from '@/services/studentService';
import ImportResult from './ImportResult';

const FIELDS_FULL = [
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
  { key: 'student_status',   label: 'สถานะนักศึกษา',   required: false },
];

const FIELDS_STATUS = [
  { key: 'student_id',     label: 'รหัสนักศึกษา',  required: true },
  { key: 'student_status', label: 'สถานะนักศึกษา', required: true },
];

const MODES = [
  {
    key: 'full',
    label: 'นำเข้าข้อมูลครบ',
    desc: 'เพิ่มหรืออัปเดตข้อมูลนักศึกษาทั้งหมด (upsert)',
    note: 'ต้องมี: รหัสนักศึกษา, ชื่อ, หลักสูตร, คณะ, วิทยาเขต, ระดับ',
  },
  {
    key: 'status',
    label: 'อัปเดตสถานะเท่านั้น',
    desc: 'เปลี่ยน student_status ของนักศึกษาที่มีอยู่แล้ว',
    note: 'ต้องมีแค่: รหัสนักศึกษา, สถานะนักศึกษา',
  },
];

export default function StudentImport() {
  const [mode, setMode] = useState('full');
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [step, setStep] = useState('mode'); // mode | upload | mapping | result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    studentService.getAcademicYears().then(res => {
      if (res.success) setAcademicYears(res.data);
    }).catch(() => {});
  }, []);

  const activeFields = mode === 'status' ? FIELDS_STATUS : FIELDS_FULL;

  const handleModeSelect = (m) => {
    setMode(m);
    setStep('upload');
    setError('');
  };

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
      const autoMap = {};
      activeFields.forEach(field => {
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
    const missing = activeFields.filter(f => f.required && !mapping[f.key]);
    if (missing.length > 0) {
      setError(`กรุณา map field ที่จำเป็น: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await importService.importStudents(file, mapping, mode, selectedYear || null);
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
    setFile(null); setCsvHeaders([]); setMapping({});
    setStep('mode'); setError(''); setSelectedYear('');
    setImportResult(null); setImportErrors([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-5">

      {/* Step: เลือก Mode */}
      {step === 'mode' && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">เลือกประเภทการนำเข้า:</p>
          {/* เลือกปีการศึกษาก่อน */}
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm font-medium text-amber-800 mb-2">
              ปีการศึกษาที่ต้องการนำเข้า
              <span className="ml-2 font-normal text-amber-600">(ไม่บังคับ)</span>
            </p>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-amber-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">— ไม่ระบุปีการศึกษา (นำเข้าปกติ) —</option>
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {selectedYear && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ⚠️ ระบบจะ <strong>reset student_status = 99</strong> ของนักศึกษาปี {selectedYear} ทั้งหมด
                ก่อน import — นักศึกษาที่ไม่อยู่ในไฟล์จะถูกซ่อนออกจากระบบ (ถือว่าลาออก)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => handleModeSelect(m.key)}
                className="text-left p-4 border-2 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors border-gray-200"
              >
                <p className="font-semibold text-gray-800 mb-1">{m.label}</p>
                <p className="text-sm text-gray-500 mb-2">{m.desc}</p>
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{m.note}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === 'upload' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep('mode')} className="text-sm text-blue-600 hover:underline">← เปลี่ยนประเภท</button>
            <span className="text-gray-400">|</span>
            <span className="text-sm font-medium text-gray-700">
              {MODES.find(m => m.key === mode)?.label}
            </span>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-2">อัปโหลดไฟล์ CSV</p>
            <p className="text-xs text-gray-400 mb-4">
              {mode === 'status' ? 'ต้องการแค่ 2 คอลัมน์: รหัสนักศึกษา + สถานะ' : 'ต้องการคอลัมน์ข้อมูลนักศึกษาครบ'}
            </p>
            <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              เลือกไฟล์
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            </label>
            {loading && <p className="mt-4 text-gray-500">กำลังอ่านไฟล์...</p>}
          </div>
        </div>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-700">ไฟล์: <span className="text-blue-600">{file?.name}</span></p>
              <p className="text-sm text-gray-500">
                โหมด: <span className="font-medium">{MODES.find(m => m.key === mode)?.label}</span>
              </p>
            </div>
            <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 underline">เริ่มใหม่</button>
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
                {activeFields.map(field => (
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
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mode === 'status' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              โหมดนี้จะอัปเดตเฉพาะ <strong>student_status</strong> — นักศึกษาที่ไม่มีใน DB จะถูกข้ามไป
            </div>
          )}
          {selectedYear && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              ⚠️ ปีการศึกษา <strong>{selectedYear}</strong>: นักศึกษาทั้งหมดจะถูก reset เป็น 99 ก่อน
              แล้วนักศึกษาในไฟล์นี้จะกลับมาเป็น 10 — นักศึกษาที่ไม่อยู่ในไฟล์ = ลาออก (ซ่อนจากระบบ)
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button onClick={handleImport} disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'กำลัง Import...' : 'เริ่ม Import'}
            </button>
            <button onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">ยกเลิก</button>
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
          <button onClick={handleReset} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Import ไฟล์ใหม่
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}
    </div>
  );
}
