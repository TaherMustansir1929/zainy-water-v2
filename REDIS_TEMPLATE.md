# Redis Next.js Starter Template - Complete Setup Guide

This template provides a production-ready Redis integration for Next.js applications with TypeScript support, featuring session management, caching, and temporary storage capabilities.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Project Structure](#project-structure)
5. [Code Implementation](#code-implementation)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Best Practices](#best-practices)

## 🔧 Prerequisites

- Node.js 18+ 
- Next.js 13+
- Redis server (local or cloud)
- TypeScript

## 📦 Installation

### 1. Install Dependencies

```bash
npm install redis
npm install --save-dev @types/node
```

### 2. Install Redis Server

#### Option A: Local Installation (macOS)
```bash
brew install redis
brew services start redis
```

#### Option B: Local Installation (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Option C: Docker
```bash
docker run -d --name redis -p 6379:6379 redis:latest
```

#### Option D: Cloud Redis
- [Redis Cloud](https://redis.com/try-free/)
- [AWS ElastiCache](https://aws.amazon.com/elasticache/)
- [Upstash Redis](https://upstash.com/)

## 🔑 Environment Setup

Create a `.env.local` file in your project root:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_password_here
REDIS_DATABASE=0

# App Configuration
REDIS_APP_NAME=my-next-app
```

For production, update your environment variables accordingly.

## 📁 Project Structure

```
src/
├── lib/
│   ├── redis/
│   │   ├── client.ts          # Singleton Redis client
│   │   ├── storage.ts         # Custom Redis storage class
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.ts          # Public exports
│   └── utils/
└── pages/api/                # API routes using Redis
```

## 💻 Code Implementation

### 1. TypeScript Types (`src/lib/redis/types.ts`)

```typescript
// Storage type definitions
export type StorageType = 'session' | 'cache' | 'temp';

// User roles for session storage
export type UserRole = 'mod' | 'admin' | 'user';

// Base storage value type
export type StorageValue = string | number | boolean | string[] | number[] | StorageObject | StorageObject[];

export interface StorageObject {
  [key: string]: StorageValue;
}

// Session data interface (example)
export interface SessionData extends StorageObject {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: string[];
  loginTime: number;
  lastActivity: number;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}

// Cache data interface (example)
export interface CacheData extends StorageObject {
  id: string;
  data: any;
  timestamp: number;
  source: string;
  metadata?: {
    version: string;
    tags: string[];
  };
}

// Temporary storage interface (example)
export interface TempData extends StorageObject {
  token: string;
  purpose: 'password-reset' | 'email-verification' | 'otp' | 'file-upload';
  userId?: string;
  expiresAt: number;
  attempts?: number;
}

// Redis client configuration
export interface RedisConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

// Storage configuration
export interface StorageConfig {
  appName: string;
  ttl: {
    session: number; // 24 hours in seconds
    cache: number;   // 2 hours in seconds  
    temp: number;    // 10 minutes in seconds
  };
}

// Key generation options
export interface KeyOptions {
  type: StorageType;
  identifier: string;
  role?: UserRole;
}

// Storage operation result
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 2. Redis Client Singleton (`src/lib/redis/client.ts`)

```typescript
import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from './types';

class RedisClientSingleton {
  private static instance: RedisClientSingleton;
  private client: RedisClientType | null = null;
  private isConnecting = false;

  private constructor() {}

  public static getInstance(): RedisClientSingleton {
    if (!RedisClientSingleton.instance) {
      RedisClientSingleton.instance = new RedisClientSingleton();
    }
    return RedisClientSingleton.instance;
  }

  public async getClient(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client && this.client.isOpen) {
        return this.client;
      }
    }

    return this.connect();
  }

  private async connect(): Promise<RedisClientType> {
    this.isConnecting = true;

    try {
      const config: RedisConfig = {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        database: parseInt(process.env.REDIS_DATABASE || '0'),
      };

      this.client = createClient({
        url: config.url,
        password: config.password,
        database: config.database,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.error('Redis connection failed after 5 retries');
              return false;
            }
            return Math.min(retries * 50, 500);
          },
        },
      });

      // Event listeners
      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
      });

      await this.client.connect();
      
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  public isConnected(): boolean {
    return this.client?.isOpen || false;
  }
}

export const redisClient = RedisClientSingleton.getInstance();
```

### 3. Custom Redis Storage Class (`src/lib/redis/storage.ts`)

```typescript
import { RedisClientType } from 'redis';
import { redisClient } from './client';
import {
  StorageType,
  UserRole,
  StorageValue,
  StorageObject,
  SessionData,
  CacheData,
  TempData,
  StorageConfig,
  KeyOptions,
  StorageResult,
} from './types';

export class RedisStorage {
  private client: RedisClientType | null = null;
  private config: StorageConfig;

  constructor() {
    this.config = {
      appName: process.env.REDIS_APP_NAME || 'my-next-app',
      ttl: {
        session: 24 * 60 * 60, // 24 hours
        cache: 2 * 60 * 60,    // 2 hours  
        temp: 10 * 60,         // 10 minutes
      },
    };
  }

  private async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      this.client = await redisClient.getClient();
    }
    return this.client;
  }

  private generateKey(options: KeyOptions): string {
    const { type, identifier, role } = options;
    let key = `app:${this.config.appName}:${type}:`;
    
    if (type === 'session' && role) {
      key += `${role}:${identifier}`;
    } else {
      key += identifier;
    }
    
    return key;
  }

  private getTTL(type: StorageType): number {
    return this.config.ttl[type];
  }

  // Generic set method
  private async setValue<T extends StorageValue>(
    key: string,
    value: T,
    ttl: number
  ): Promise<StorageResult<boolean>> {
    try {
      const client = await this.getClient();
      const serializedValue = JSON.stringify(value);
      
      await client.setEx(key, ttl, serializedValue);
      
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to set value: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Generic get method
  private async getValue<T>(key: string): Promise<StorageResult<T | null>> {
    try {
      const client = await this.getClient();
      const value = await client.get(key);
      
      if (value === null) {
        return { success: true, data: null };
      }
      
      const parsedValue = JSON.parse(value) as T;
      return { success: true, data: parsedValue };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get value: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Session Storage Methods
  async setSession(
    identifier: string,
    data: SessionData,
    role: UserRole = 'user'
  ): Promise<StorageResult<boolean>> {
    const key = this.generateKey({ type: 'session', identifier, role });
    return this.setValue(key, data, this.getTTL('session'));
  }

  async getSession(
    identifier: string,
    role: UserRole = 'user'
  ): Promise<StorageResult<SessionData | null>> {
    const key = this.generateKey({ type: 'session', identifier, role });
    return this.getValue<SessionData>(key);
  }

  async deleteSession(
    identifier: string,
    role: UserRole = 'user'
  ): Promise<StorageResult<boolean>> {
    try {
      const client = await this.getClient();
      const key = this.generateKey({ type: 'session', identifier, role });
      const result = await client.del(key);
      
      return { success: true, data: result > 0 };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async updateSession(
    identifier: string,
    data: Partial<SessionData>,
    role: UserRole = 'user'
  ): Promise<StorageResult<SessionData | null>> {
    const existingResult = await this.getSession(identifier, role);
    
    if (!existingResult.success || !existingResult.data) {
      return existingResult;
    }

    const updatedData = { ...existingResult.data, ...data };
    const setResult = await this.setSession(identifier, updatedData, role);
    
    if (!setResult.success) {
      return { success: false, error: setResult.error };
    }
    
    return { success: true, data: updatedData };
  }

  // Cache Storage Methods
  async setCache(
    identifier: string,
    data: CacheData
  ): Promise<StorageResult<boolean>> {
    const key = this.generateKey({ type: 'cache', identifier });
    return this.setValue(key, data, this.getTTL('cache'));
  }

  async getCache(identifier: string): Promise<StorageResult<CacheData | null>> {
    const key = this.generateKey({ type: 'cache', identifier });
    return this.getValue<CacheData>(key);
  }

  async deleteCache(identifier: string): Promise<StorageResult<boolean>> {
    try {
      const client = await this.getClient();
      const key = this.generateKey({ type: 'cache', identifier });
      const result = await client.del(key);
      
      return { success: true, data: result > 0 };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete cache: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Temporary Storage Methods
  async setTemp(
    identifier: string,
    data: TempData
  ): Promise<StorageResult<boolean>> {
    const key = this.generateKey({ type: 'temp', identifier });
    return this.setValue(key, data, this.getTTL('temp'));
  }

  async getTemp(identifier: string): Promise<StorageResult<TempData | null>> {
    const key = this.generateKey({ type: 'temp', identifier });
    return this.getValue<TempData>(key);
  }

  async deleteTemp(identifier: string): Promise<StorageResult<boolean>> {
    try {
      const client = await this.getClient();
      const key = this.generateKey({ type: 'temp', identifier });
      const result = await client.del(key);
      
      return { success: true, data: result > 0 };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete temp data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Utility Methods
  async exists(type: StorageType, identifier: string, role?: UserRole): Promise<StorageResult<boolean>> {
    try {
      const client = await this.getClient();
      const key = this.generateKey({ type, identifier, role });
      const exists = await client.exists(key);
      
      return { success: true, data: exists === 1 };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to check existence: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getTTLRemaining(type: StorageType, identifier: string, role?: UserRole): Promise<StorageResult<number>> {
    try {
      const client = await this.getClient();
      const key = this.generateKey({ type, identifier, role });
      const ttl = await client.ttl(key);
      
      return { success: true, data: ttl };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get TTL: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async clearAll(type?: StorageType): Promise<StorageResult<number>> {
    try {
      const client = await this.getClient();
      let pattern = `app:${this.config.appName}:`;
      
      if (type) {
        pattern += `${type}:*`;
      } else {
        pattern += '*';
      }
      
      const keys = await client.keys(pattern);
      
      if (keys.length === 0) {
        return { success: true, data: 0 };
      }
      
      const result = await client.del(keys);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getKeys(type?: StorageType): Promise<StorageResult<string[]>> {
    try {
      const client = await this.getClient();
      let pattern = `app:${this.config.appName}:`;
      
      if (type) {
        pattern += `${type}:*`;
      } else {
        pattern += '*';
      }
      
      const keys = await client.keys(pattern);
      return { success: true, data: keys };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get keys: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Health check
  async ping(): Promise<StorageResult<string>> {
    try {
      const client = await this.getClient();
      const result = await client.ping();
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: `Redis ping failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const storage = new RedisStorage();
```

### 4. Public Exports (`src/lib/redis/index.ts`)

```typescript
// Export main storage instance
export { storage } from './storage';

// Export types
export type {
  StorageType,
  UserRole,
  StorageValue,
  StorageObject,
  SessionData,
  CacheData,
  TempData,
  StorageConfig,
  KeyOptions,
  StorageResult,
  RedisConfig,
} from './types';

// Export client for advanced usage
export { redisClient } from './client';
```

## 🚀 Usage Examples

### 1. Session Management

```typescript
// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { storage, SessionData } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;
  
  // Authenticate user (implement your logic)
  const user = await authenticateUser(username, password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create session data
  const sessionData: SessionData = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role as 'mod' | 'admin' | 'user',
    permissions: user.permissions,
    loginTime: Date.now(),
    lastActivity: Date.now(),
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
    },
  };

  // Store session
  const result = await storage.setSession(user.id, sessionData, user.role);
  
  if (!result.success) {
    return res.status(500).json({ message: 'Failed to create session' });
  }

  res.status(200).json({ 
    message: 'Login successful',
    sessionId: user.id,
  });
}

// Middleware to check session
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/redis';

export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  
  if (!sessionId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await storage.getSession(sessionId);
  
  if (!result.success || !result.data) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Update last activity
  await storage.updateSession(sessionId, {
    lastActivity: Date.now(),
  });

  return NextResponse.next();
}
```

### 2. Database Caching

```typescript
// pages/api/users/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { storage, CacheData } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const cacheKey = `users-${id}`;

  // Try to get from cache first
  const cacheResult = await storage.getCache(cacheKey);
  
  if (cacheResult.success && cacheResult.data) {
    console.log('Cache hit for user:', id);
    return res.status(200).json(cacheResult.data.data);
  }

  // Cache miss, fetch from database
  console.log('Cache miss for user:', id);
  const user = await fetchUserFromDatabase(id as string);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Cache the result
  const cacheData: CacheData = {
    id: cacheKey,
    data: user,
    timestamp: Date.now(),
    source: 'database',
    metadata: {
      version: '1.0',
      tags: ['user', 'profile'],
    },
  };

  await storage.setCache(cacheKey, cacheData);
  
  res.status(200).json(user);
}
```

### 3. Temporary Data (OTP/Tokens)

```typescript
// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { storage, TempData } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  
  // Generate reset token
  const resetToken = generateSecureToken();
  
  // Store temporary data
  const tempData: TempData = {
    token: resetToken,
    purpose: 'password-reset',
    userId: email, // or user ID
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  };

  const result = await storage.setTemp(resetToken, tempData);
  
  if (!result.success) {
    return res.status(500).json({ message: 'Failed to create reset token' });
  }

  // Send email with token (implement your email logic)
  await sendPasswordResetEmail(email, resetToken);
  
  res.status(200).json({ message: 'Password reset email sent' });
}

// pages/api/auth/reset-password.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, newPassword } = req.body;
  
  // Get temp data
  const result = await storage.getTemp(token);
  
  if (!result.success || !result.data) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  const { userId, purpose, expiresAt, attempts = 0 } = result.data;
  
  if (purpose !== 'password-reset' || Date.now() > expiresAt) {
    await storage.deleteTemp(token);
    return res.status(400).json({ message: 'Token expired' });
  }

  if (attempts >= 3) {
    await storage.deleteTemp(token);
    return res.status(429).json({ message: 'Too many attempts' });
  }

  // Update password (implement your logic)
  const updated = await updateUserPassword(userId, newPassword);
  
  if (!updated) {
    // Increment attempts
    await storage.setTemp(token, {
      ...result.data,
      attempts: attempts + 1,
    });
    return res.status(400).json({ message: 'Failed to update password' });
  }

  // Clean up temp data
  await storage.deleteTemp(token);
  
  res.status(200).json({ message: 'Password updated successfully' });
}
```

### 4. React Hook for Session Management

```typescript
// hooks/useSession.ts
import { useEffect, useState } from 'react';
import { SessionData } from '@/lib/redis';

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/session');
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return {
    session,
    loading,
    logout,
    refreshSession: fetchSession,
  };
}

// pages/api/session.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: 'No session' });
  }

  const result = await storage.getSession(sessionId);
  
  if (!result.success || !result.data) {
    return res.status(401).json({ message: 'Invalid session' });
  }

  res.status(200).json(result.data);
}
```

## 📚 API Reference

### RedisStorage Class Methods

#### Session Methods
- `setSession(identifier, data, role?)`: Store session data
- `getSession(identifier, role?)`: Retrieve session data  
- `updateSession(identifier, data, role?)`: Update existing session
- `deleteSession(identifier, role?)`: Delete session

#### Cache Methods
- `setCache(identifier, data)`: Store cache data
- `getCache(identifier)`: Retrieve cache data
- `deleteCache(identifier)`: Delete cache data

#### Temporary Storage Methods
- `setTemp(identifier, data)`: Store temporary data
- `getTemp(identifier)`: Retrieve temporary data
- `deleteTemp(identifier)`: Delete temporary data

#### Utility Methods
- `exists(type, identifier, role?)`: Check if key exists
- `getTTLRemaining(type, identifier, role?)`: Get remaining TTL
- `clearAll(type?)`: Clear all data or by type
- `getKeys(type?)`: Get all keys or by type
- `ping()`: Health check

## ✅ Best Practices

### 1. Error Handling
Always check the `success` property in results:

```typescript
const result = await storage.getSession(sessionId);
if (!result.success) {
  console.error('Redis error:', result.error);
  // Handle error appropriately
}
```

### 2. Environment Variables
Keep sensitive data in environment variables:

```env
REDIS_URL=redis://username:password@host:port
REDIS_PASSWORD=your_secure_password
```

### 3. Key Naming Convention
Follow the established pattern:
- Sessions: `app:my-app:session:user:123`
- Cache: `app:my-app:cache:users-table`
- Temp: `app:my-app:temp:reset-token-abc`

### 4. Connection Management
The singleton pattern ensures efficient connection reuse. For graceful shutdowns:

```typescript
// In your app shutdown logic
import { redisClient } from '@/lib/redis';

process.on('SIGTERM', async () => {
  await redisClient.disconnect();
  process.exit(0);
});
```

### 5. Monitoring and Logging
Implement proper logging for production:

```typescript
const result = await storage.getSession(sessionId);
if (!result.success) {
  logger.error('Redis operation failed', {
    operation: 'getSession',
    sessionId,
    error: result.error,
  });
}
```

### 6. Type Safety
Always use the provided TypeScript interfaces:

```typescript
// Good
const sessionData: SessionData = {
  userId: '123',
  username: 'john',
  // ... other required fields
};

// Avoid
const sessionData = {
  // Missing type safety
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure Redis server is running
   - Check REDIS_URL in environment variables

2. **Authentication failed**
   - Verify REDIS_PASSWORD is correct
   - Check if Redis requires authentication

3. **JSON parsing errors**
   - Ensure stored data is properly serializable
   - Check for circular references in objects

4. **TTL not working**
   - Verify Redis version supports SETEX
   - Check if data is being overwritten without TTL

### Debug Mode

Add debug logging:

```typescript
// In client.ts, enable Redis debug
const client = createClient({
  // ... other options
  socket: {
    debug: process.env.NODE_ENV === 'development',
  },
});
```

This template provides a production-ready Redis integration for your Next.js application with comprehensive TypeScript support and best practices built-in.