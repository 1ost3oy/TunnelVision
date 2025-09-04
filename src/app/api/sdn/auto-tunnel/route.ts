import { NextRequest, NextResponse } from 'next/server';
import { getSettingsCollection } from '@/app/actions/db';

// GET: دریافت تنظیمات و وضعیت فعلی اتو-تانل از دیتابیس
export async function GET() {
  try {
    const settingsCol = await getSettingsCollection();
    const doc = await settingsCol.findOne({ key: 'autoTunnel' });

    // توضیح: مقدار پیش‌فرض برای جلوگیری از نبودن فیلدهای جدید در بارگذاری اولیه
    const defaultConfig = {
      enabled: false,
      topology: 'mesh',
      tunnelType: 'wireguard',
      autoHealing: true,
      loadBalancing: true,
      routeAll: false,
      egressServerId: undefined as string | undefined,
    };

    const payload = doc ? {
      config: { ...defaultConfig, ...(doc.config || {}) },
      tunnels: doc.tunnels || [],
      updatedAt: doc.updatedAt || null
    } : {
      config: defaultConfig,
      tunnels: [],
      updatedAt: null
    };

    return NextResponse.json({ success: true, ...payload });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: ذخیره تنظیمات/وضعیت اتو-تانل در دیتابیس
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, tunnels } = body || {};

    if (!config && !tunnels) {
      return NextResponse.json({ success: false, error: 'No content to update' }, { status: 400 });
    }

    const settingsCol = await getSettingsCollection();
    const update: any = { updatedAt: new Date() };
    if (config) update.config = config;
    if (tunnels) update.tunnels = tunnels;

    await settingsCol.updateOne(
      { key: 'autoTunnel' },
      { $set: update },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}