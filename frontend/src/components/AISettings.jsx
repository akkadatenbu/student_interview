'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Bot, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

const MODELS = [
  { id: 'llama-3.1-8b-instant',       label: 'LLaMA 3.1 8B Instant (เร็ว, แนะนำ)' },
  { id: 'llama-3.3-70b-versatile',    label: 'LLaMA 3.3 70B Versatile (แม่นยำกว่า)' },
  { id: 'llama-3.1-70b-versatile',    label: 'LLaMA 3.1 70B Versatile' },
  { id: 'gemma2-9b-it',               label: 'Gemma 2 9B' },
];

export default function AISettings() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('llama3-8b-8192');
  const [showKey, setShowKey] = useState(false);
  const [keySet, setKeySet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('config').then(res => {
      if (res.success) {
        setKeySet(res.data.groq_api_key_set);
        setModel(res.data.groq_model || 'llama3-8b-8192');
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { groq_model: model };
      if (apiKey.trim()) body.groq_api_key = apiKey.trim();
      await api.post('config', body);
      setKeySet(true);
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('ต้องการลบ API Key ออกจากระบบ?')) return;
    await api.post('config', { groq_api_key: '' });
    setKeySet(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Bot size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">ตั้งค่า AI วิเคราะห์การสัมภาษณ์</h3>
          <p className="text-sm text-gray-500">ใช้ Groq API สำหรับวิเคราะห์ข้อมูลนักศึกษาและระบุนักศึกษาที่ควรดูแลเป็นพิเศษ</p>
        </div>
      </div>

      {/* Status */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${keySet ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
        <div className={`w-2 h-2 rounded-full ${keySet ? 'bg-green-500' : 'bg-yellow-500'}`} />
        {keySet ? 'มี API Key ในระบบแล้ว — ระบบ AI พร้อมใช้งาน' : 'ยังไม่มี API Key — กรุณาใส่ key เพื่อเปิดใช้งาน AI'}
      </div>

      {/* API Key input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Groq API Key {keySet && <span className="text-green-600 font-normal">(มีอยู่แล้ว — ใส่ใหม่เพื่อเปลี่ยน)</span>}
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={keySet ? 'ใส่ key ใหม่เพื่อเปลี่ยน...' : 'gsk_xxxxxxxxxxxxxxxxxxxx'}
              className="w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setShowKey(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          รับ API Key ได้ที่ <span className="text-purple-600">console.groq.com</span> → API Keys (ใช้ฟรี)
        </p>
      </div>

      {/* Model selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">โมเดล AI</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || (!apiKey.trim() && model === (keySet ? model : 'llama3-8b-8192'))}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:bg-gray-300"
        >
          {saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saving ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว!' : 'บันทึกการตั้งค่า'}
        </button>
        {keySet && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50"
          >
            ลบ API Key
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">การทำงานของ AI:</p>
        <p>• วิเคราะห์คำตอบการสัมภาษณ์และระบุปัจจัยเสี่ยง</p>
        <p>• ประเมินระดับความเสี่ยง: สูง / ปานกลาง / ต่ำ</p>
        <p>• ให้คำแนะนำอาจารย์ที่ดูแล</p>
        <p>• API Key ถูกเก็บไว้บน server ไม่เปิดเผยต่อผู้ใช้ทั่วไป</p>
      </div>
    </div>
  );
}
