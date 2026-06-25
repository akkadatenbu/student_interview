// frontend/src/components/ImportResult.jsx
'use client';

export default function ImportResult({ result, errors }) {
  if (!result) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* แจ้งเตือน reset */}
      {result.reset_to_99 > 0 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          ✅ Reset นักศึกษาปี <strong>{result.academic_year_import}</strong> จำนวน <strong>{result.reset_to_99} คน</strong> เป็น status 99 ก่อน import
        </div>
      )}

      {/* สรุปผล */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{result.total}</p>
          <p className="text-sm text-blue-600">แถวทั้งหมด</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{result.inserted}</p>
          <p className="text-sm text-green-600">เพิ่มใหม่</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">{result.updated}</p>
          <p className="text-sm text-yellow-600">อัปเดต</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{result.skipped}</p>
          <p className="text-sm text-red-600">ข้ามไป (error)</p>
        </div>
      </div>

      {/* Error log */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-700 mb-2">รายการที่มีข้อผิดพลาด ({errors.length} แถว)</h3>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {errors.map((err, i) => (
              <div key={i} className="text-sm text-red-600">
                <span className="font-medium">แถว {err.row}:</span> {err.reason}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
