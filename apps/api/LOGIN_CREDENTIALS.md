# 🔐 Demo Login Credentials

## SmartSchedule Test Accounts

These demo accounts have been created in the database for testing purposes.

### 📋 Login Credentials

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `student@demo.com` | `TestPassword123!` | STUDENT | Student account - can view schedules and set preferences |
| `faculty@demo.com` | `TestPassword123!` | FACULTY | Faculty account - can manage assignments and availability |
| `committee@demo.com` | `TestPassword123!` | COMMITTEE | Committee account - can generate and manage schedules |
| `admin@demo.com` | `TestPassword123!` | COMMITTEE | Admin account - full committee access |

### 🚀 How to Login

1. Go to: `http://localhost:3000/login`
2. Enter one of the email addresses above
3. Enter password: `TestPassword123!`
4. Click "Login"

### ⚠️ Note

- All demo accounts use the same password: `TestPassword123!`
- These are test accounts only - change passwords in production
- To create new users, use the registration endpoint or create-mock-users script

### 🔄 Creating More Users

To create more demo users, run:
```bash
cd apps/api
npx tsx src/scripts/create-mock-users.ts
```

This will recreate all demo users with the same credentials.

