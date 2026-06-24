'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { Bot, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, Loader } from 'lucide-react';

const RISK_CONFIG = {
  'สูง':       { color: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500',    icon: AlertTriangle },
  'ปานกลาง':  { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500', icon: Info },
  'ต่ำ':       { color: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500',  icon: CheckCircle },
};

export default function AIAnalysis({ interviewId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`ai/analyze/${interviewId}`, {});
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? (RISK_CONFIG[result.risk_level] || RISK_CONFIG['ต่ำ']) : null;
  const RiskIcon = risk?.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-purple-600" />
          <h2 className="text-base font-semibold text-gray-800">วิเคราะห์ด้วย AI</h2>
          {result && (
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${risk.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
              ความเสี่ยง: {result.risk_level}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={() => setExpanded(v => !v)} className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          {!result && (
            <button
              onClick={analyze}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-300"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : <Bot size={14} />}
              {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ด้วย AI'}
            </button>
          )}
          {result && (
            <button
              onClick={analyze}
              disabled={loading}
              className="text-xs text-purple-600 hover:underline"
            >
              วิเคราะห์ใหม่
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {result && expanded && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`p-4 rounded-lg border ${risk.color}`}>
            <div className="flex items-start gap-2">
              <RiskIcon size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk factors */}
            {result.risk_factors?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">ปัจจัยเสี่ยงที่พบ</h3>
                <ul className="space-y-1">
                  {result.risk_factors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-400 mt-0.5">•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">จุดเด่น</h3>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-blue-700 uppercase mb-2">คำแนะนำสำหรับอาจารย์</h3>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="font-bold mt-0.5">{i + 1}.</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 text-right">วิเคราะห์โดย AI — ใช้เป็นข้อมูลประกอบการตัดสินใจเท่านั้น</p>
        </div>
      )}
    </div>
  );
}
