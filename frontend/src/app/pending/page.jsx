'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { studentService } from '@/services/studentService';
import { useInterview } from '@/hooks/useInterview';
import { Lock, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 30;

export default function PendingPage() {
  const { interviewer, isAdmin } = useInterview();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(undefined); // undefined = รอโหลดปี
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const facultyFilter = isAdmin ? null : interviewer?.staff_faculty;

  useEffect(() => {
    if (!interviewer) return;
    studentService.getAcademicYears().then(res => {
      if (res.success && res.data.length > 0) {
        setAcademicYears(res.data);
        setSelectedYear(res.data[0]); // ปีล่าสุด
      } else {
        setSelectedYear(null); // ไม่มีปี = แสดงทั้งหมด
      }
    }).catch(() => { setSelectedYear(null); });
  }, [interviewer]);

  useEffect(() => {
    if (!interviewer || selectedYear === undefined) return; // รอให้ปีโหลดก่อน
    const fetch = async () => {
      try {
        setLoading(true);
        setPage(1);
        const response = await studentService.getNotInterviewedStudents(selectedYear);
        if (response.success) {
          const data = facultyFilter
            ? response.data.filter(s => s.faculty === facultyFilter)
            : response.data;
          setStudents(data);
        } else {
          setError('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [interviewer, facultyFilter, selectedYear]);

  // reset page เมื่อค้นหา
  useEffect(() => { setPage(1); }, [search]);

  if (!interviewer) {
    return (
      <div className="px-4 sm:px-0 flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock size={48} className="text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กรุณายืนยันตัวตนก่อน</h2>
          <p className="text-gray-500 mb-6">กรอกรหัสบุคลากรที่หน้าสัมภาษณ์ก่อนจึงจะดูข้อมูลได้</p>
          <Link href="/interview" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            ไปยืนยันรหัสบุคลากร
          </Link>
        </div>
      </div>
    );
  }

  const filtered = students.filter(s =>
    s.student_name?.includes(search) ||
    String(s.student_id).includes(search) ||
    s.program?.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">นักศึกษารอสัมภาษณ์</h1>
          {!isAdmin && <p className="text-sm text-gray-500 mt-1">คณะ: {interviewer.staff_faculty}</p>}
          {isAdmin && <p className="text-sm text-blue-600 mt-1">ผู้บริหาร — แสดงข้อมูลทุกคณะ</p>}
        </div>
        {academicYears.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">ปีการศึกษา:</label>
            <select
              value={selectedYear || ''}
              onChange={e => setSelectedYear(e.target.value !== '' ? parseInt(e.target.value) : null)}
              className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              ทั้งหมด <span className="font-semibold text-gray-900">{filtered.length}</span> คน
            </span>
            {search && (
              <span className="text-xs text-blue-600">
                (กรองจาก {students.length} คน)
              </span>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัส, หรือหลักสูตร..."
            className="w-full sm:w-72 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">รหัสนักศึกษา</th>
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                    <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase">หลักสูตร</th>
                    <th className="py-2 px-4 border-b text-center text-xs font-medium text-gray-500 uppercase">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((student, index) => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-xs text-gray-400">{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="py-2 px-4 text-sm text-gray-900">{student.student_id}</td>
                      <td className="py-2 px-4 text-sm text-gray-900">{student.student_name}</td>
                      <td className="py-2 px-4 text-sm text-gray-600">{student.faculty}</td>
                      <td className="py-2 px-4 text-sm text-gray-600">{student.program}</td>
                      <td className="py-2 px-4 text-center">
                        <Link
                          href={`/interview?student_id=${student.student_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          สัมภาษณ์
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        {students.length === 0 ? 'นักศึกษาทุกคนได้รับการสัมภาษณ์แล้ว' : 'ไม่พบนักศึกษาที่ตรงกับการค้นหา'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  หน้า {page} / {totalPages} &nbsp;·&nbsp; แสดง {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} จาก {filtered.length} คน
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-8 h-8 rounded text-sm font-medium ${
                            page === item
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
