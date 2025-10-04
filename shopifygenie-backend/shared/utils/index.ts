// Shared utilities for ShopifyGenie microservices

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

// JWT Utilities
export class JWTUtils {
  static generateToken(payload: any, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  static generateAccessToken(userId: string, email: string, role: string, secret: string): string {
    return this.generateToken(
      { userId, email, role, type: 'access' },
      secret,
      '15m'
    );
  }

  static generateRefreshToken(userId: string, secret: string): string {
    return this.generateToken(
      { userId, type: 'refresh' },
      secret,
      '7d'
    );
  }

  static verifyToken(token: string, secret: string): any {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}

// Password Utilities
export class PasswordUtils {
  static async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateRandomPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

// ID Utilities
export class IDUtils {
  static generateId(): string {
    return randomUUID();
  }

  static generateShortId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}

// Date Utilities
export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static toISOString(date: Date): string {
    return date.toISOString();
  }

  static fromISOString(dateString: string): Date {
    return new Date(dateString);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }
}

// Validation Utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// HTTP Utilities
export class HTTPUtils {
  static getStatusCode(error: any): number {
    if (error.statusCode) return error.statusCode;
    if (error.status) return error.status;
    if (error.code === 'VALIDATION_ERROR') return 400;
    if (error.code === 'UNAUTHORIZED') return 401;
    if (error.code === 'FORBIDDEN') return 403;
    if (error.code === 'NOT_FOUND') return 404;
    if (error.code === 'CONFLICT') return 409;
    return 500;
  }

  static createErrorResponse(message: string, statusCode: number = 500, details?: any) {
    return {
      success: false,
      error: message,
      statusCode,
      details,
    };
  }

  static createSuccessResponse(data: any, message?: string) {
    return {
      success: true,
      data,
      message,
    };
  }

  static createPaginatedResponse(data: any[], page: number, limit: number, total: number) {
    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Service Communication Utilities
export class ServiceUtils {
  static async makeServiceRequest(
    serviceUrl: string,
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const url = `${serviceUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Service request failed');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Service communication error: ${error.message}`);
    }
  }

  static getServiceUrl(serviceName: string, port: number, path: string = ''): string {
    return `http://localhost:${port}/${path}`;
  }
}

// Logging Utilities
export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}

// Configuration Utilities
export class ConfigUtils {
  static getEnvVar(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required`);
    }
    return value || defaultValue!;
  }

  static getEnvNumber(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required`);
    }
    return value ? parseInt(value, 10) : defaultValue!;
  }

  static getEnvBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is required`);
    }
    return value ? value.toLowerCase() === 'true' : defaultValue!;
  }
}

// Database Utilities
export class DatabaseUtils {
  static generateConnectionString(
    type: 'sqlite' | 'postgresql' | 'mysql',
    config: {
      host?: string;
      port?: number;
      database?: string;
      username?: string;
      password?: string;
      file?: string;
    }
  ): string {
    switch (type) {
      case 'sqlite':
        return `sqlite:${config.file || 'database.sqlite'}`;
      case 'postgresql':
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      case 'mysql':
        return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      default:
        throw new Error(`Unsupported database type: ${type}`);
    }
  }

  static getPostgresConfig(serviceName: string) {
    return {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env[`${serviceName.toUpperCase()}_DB_NAME`] || `${serviceName}_db`,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
    };
  }

  static getPostgresConnectionString(serviceName: string): string {
    const config = this.getPostgresConfig(serviceName);
    return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
  }
}

// Export all utilities
export const utils = {
  JWT: JWTUtils,
  Password: PasswordUtils,
  ID: IDUtils,
  Date: DateUtils,
  Validation: ValidationUtils,
  HTTP: HTTPUtils,
  Service: ServiceUtils,
  Logger,
  Config: ConfigUtils,
  Database: DatabaseUtils,
};
