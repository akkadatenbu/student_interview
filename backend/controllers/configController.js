const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config/app-config.json');

const readConfig = () => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
};

const writeConfig = (data) => {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const getConfig = (req, res) => {
  const config = readConfig();
  // ไม่ส่ง key ออกไปตรงๆ แค่บอกว่ามีหรือเปล่า
  res.json({
    success: true,
    data: {
      groq_api_key_set: !!config.groq_api_key,
      groq_model: config.groq_model || 'llama3-8b-8192',
    }
  });
};

const saveConfig = (req, res) => {
  const { groq_api_key, groq_model } = req.body;
  const config = readConfig();
  if (groq_api_key !== undefined) config.groq_api_key = groq_api_key;
  if (groq_model !== undefined) config.groq_model = groq_model;
  writeConfig(config);
  res.json({ success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
};

module.exports = { getConfig, saveConfig, readConfig };
