const DBService = require('../services/dbService');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcrypt');

exports.getAllAdmins = asyncHandler(async (req, res) => {
  const rows = await DBService.read(
    'SELECT admin_id, full_name, email, created_at FROM admins ORDER BY created_at DESC'
  );
  res.json({ status: 'success', data: rows });
});

exports.getAdminById = asyncHandler(async (req, res) => {
  const rows = await DBService.read(
    'SELECT admin_id, full_name, email, created_at FROM admins WHERE admin_id = ?',
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ status: 'error', error: 'Admin not found' });
  }
  res.json({ status: 'success', data: rows[0] });
});

exports.createAdmin = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ status: 'error', error: 'All fields required' });
  }

  const existing = await DBService.read('SELECT admin_id FROM admins WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ status: 'error', error: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await DBService.write(
    'INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)',
    [full_name, email, hashedPassword]
  );

  res.status(201).json({
    status: 'success',
    data: { admin_id: result.insertId, full_name, email }
  });
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;
  const adminId = req.params.id;

  const admin = await DBService.read('SELECT admin_id FROM admins WHERE admin_id = ?', [adminId]);
  if (admin.length === 0) {
    return res.status(404).json({ status: 'error', error: 'Admin not found' });
  }

  if (email) {
    const existing = await DBService.read(
      'SELECT admin_id FROM admins WHERE email = ? AND admin_id != ?',
      [email, adminId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', error: 'Email already in use' });
    }
  }

  let sql = 'UPDATE admins SET full_name = ?, email = ?';
  const params = [full_name || admin[0].full_name, email || admin[0].email];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql += ', password_hash = ?';
    params.push(hashedPassword);
  }

  sql += ' WHERE admin_id = ?';
  params.push(adminId);

  await DBService.write(sql, params);

  res.json({ status: 'success', message: 'Admin updated' });
});

exports.deleteAdmin = asyncHandler(async (req, res) => {
  const result = await DBService.write('DELETE FROM admins WHERE admin_id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ status: 'error', error: 'Admin not found' });
  }
  res.json({ status: 'success', message: 'Admin deleted' });
});