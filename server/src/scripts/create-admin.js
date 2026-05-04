import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('--- Tạo tài khoản Quản trị viên ---');
  
  const username = await askQuestion('Nhập tên đăng nhập: ');
  const email = await askQuestion('Nhập email: ');
  const password = await askQuestion('Nhập mật khẩu: ');
  const fullName = await askQuestion('Nhập họ và tên: ');

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'admin')`,
      [username, email, passwordHash, fullName]
    );
    console.log('\n✅ Tạo tài khoản thành công!');
  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
  } finally {
    rl.close();
  }
}

createAdmin();
