-- 账户表（主表，以邮箱为唯一标识，但邮箱可以为空）
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE, -- 邮箱作为唯一标识，但可以为空（NULL）
  name TEXT, -- 默认名称（优先使用）
  image_url TEXT, -- 默认头像
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  last_login_at INTEGER
);

-- 账户登录方式表（一个账户可以关联多个登录方式）
CREATE TABLE IF NOT EXISTS account_providers (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'github', 或其他
  provider_id TEXT NOT NULL, -- OAuth provider 的用户 ID
  provider_email TEXT, -- 该登录方式对应的邮箱（可能为空）
  provider_name TEXT, -- 该登录方式对应的名称
  provider_image_url TEXT, -- 该登录方式对应的头像
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  last_used_at INTEGER,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_id) -- 每个provider的provider_id必须唯一
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS account_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_account_providers_account_id ON account_providers(account_id);
CREATE INDEX IF NOT EXISTS idx_account_providers_provider ON account_providers(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_account_providers_email ON account_providers(provider_email) WHERE provider_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_account_id ON account_sessions(account_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON account_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON account_sessions(expires_at);

