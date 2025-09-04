'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/starwind/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/starwind/label';
import { Progress } from '@/components/starwind/progress';
import { Loader2, Network, Zap } from 'lucide-react';

// توضیح: انواع محلی برای تنظیمات و وضعیت تونل‌ها
// این نوع‌ها با API سمت سرور سازگار هستند

type AutoTunnelConfig = {
  enabled: boolean;
  topology: 'mesh' | 'star' | 'ring';
  tunnelType: 'wireguard' | 'openvpn' | 'ipsec';
  autoHealing: boolean;
  loadBalancing: boolean;
  // توضیح: شناسه سرور Egress در حالت Star (اختیاری)
  egressServerId?: string;
  // توضیح: اگر true باشد، کل ترافیک اینترنتی از طریق Egress هدایت می‌شود (0.0.0.0/0)
  routeAll: boolean;
};

type TunnelStatus = {
  id: string;
  from: string;
  to: string;
  status: 'active' | 'creating' | 'failed';
  latency: number;
  bandwidth: number;
};

// توضیح: نوع زوج اتصال برنامهریزی‌شده برای استقرار
type PlannedPair = { fromId: string; toId: string };

export function SDNAutoTunnel({ servers }: { servers: any[] }) {
  const [config, setConfig] = useState<AutoTunnelConfig>({
    enabled: false,
    topology: 'mesh',
    tunnelType: 'wireguard',
    autoHealing: true,
    loadBalancing: true,
    routeAll: false,
    egressServerId: undefined,
  });
  const [tunnels, setTunnels] = useState<TunnelStatus[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  // توضیح: واکشی تنظیمات ذخیره‌شده از API در زمان mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/sdn/auto-tunnel', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load auto-tunnel config');
        const data = await res.json();
        if (!mounted) return;
        if (data?.config) setConfig(data.config);
        if (Array.isArray(data?.tunnels)) setTunnels(data.tunnels);
      } catch (e) {
        // silent fail
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // توضیح: ذخیره خودکار تنظیمات هنگام تغییر
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/sdn/auto-tunnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config }),
          signal: controller.signal,
        });
      } catch { /* ignore */ }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [config]);

  // توضیح: ذخیره وضعیت تونل‌ها پس از ایجاد/حذف
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        await fetch('/api/sdn/auto-tunnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tunnels }),
          signal: controller.signal,
        });
      } catch { /* ignore */ }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [tunnels]);

  // توضیح: تولید زوج‌های اتصال براساس توپولوژی انتخاب‌شده (برای نمایش و همچنین استقرار)
  const plannedPairs: PlannedPair[] = useMemo(() => {
    if (!Array.isArray(servers) || servers.length < 2) return [];

    if (config.topology === 'mesh') {
      // اتصال همه به همه
      return servers.flatMap((s1, i) =>
        servers.slice(i + 1).map((s2: any) => ({ fromId: s1.id, toId: s2.id }))
      );
    }

    if (config.topology === 'star') {
      if (!config.egressServerId) return [];
      // اتصال همه سرورها به هاب Egress
      return servers
        .filter((s: any) => s.id !== config.egressServerId)
        .map((s: any) => ({ fromId: s.id, toId: config.egressServerId as string }));
    }

    if (config.topology === 'ring') {
      // اتصال هر سرور به سرور بعدی به صورت حلقه‌ای
      return servers.map((s: any, i: number) => ({ fromId: s.id, toId: servers[(i + 1) % servers.length].id }));
    }

    return [];
  }, [servers, config.topology, config.egressServerId]);

  // توضیح: ساخت برچسب قابل‌نمایش برای سرور (نام خوانا یا شناسه)
  function getServerLabel(s?: any) {
    return s?.name || s?.id || 'Unknown';
  }

  const deployAutoTunnels = async () => {
    // توضیح: شبیه‌سازی فرآیند استقرار بر اساس plannedPairs و بروزرسانی UI
    setIsDeploying(true);
    setDeployProgress(0);

    const totalConnections = plannedPairs.length;
    if (totalConnections === 0) {
      setIsDeploying(false);
      return;
    }

    for (let i = 0; i < totalConnections; i++) {
      // شبیه‌سازی تاخیر استقرار
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDeployProgress(((i + 1) / totalConnections) * 100);

      const fromId = plannedPairs[i].fromId;
      const toId = plannedPairs[i].toId;
      const fromServer = servers.find((s: any) => s.id === fromId);
      const toServer = servers.find((s: any) => s.id === toId);
      const newTunnel = {
        id: `auto-${Date.now()}-${i}`,
        from: fromServer?.name || fromServer?.id || 'Unknown',
        to: toServer?.name || toServer?.id || 'Unknown',
        status: Math.random() > 0.05 ? 'active' : 'failed',
        latency: Math.floor(Math.random() * 50) + 10,
        bandwidth: Math.floor(Math.random() * 900) + 100,
      } as const;
      setTunnels((prev) => [...prev, newTunnel as any]);
    }

    setIsDeploying(false);
  };

  const destroyAllTunnels = () => {
    setTunnels([]);
    setConfig((prev) => ({ ...prev, enabled: false }));
  };

  return (
    <div className="space-y-4">
      {/* Auto-Tunnel Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Auto-Tunnel Controller
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-tunnel">Enable Auto-Tunneling</Label>
            <Switch
              id="auto-tunnel"
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig((prev) => ({ ...prev, enabled }))}
            />
          </div>

          {config.enabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Network Topology</Label>
                  <Select value={config.topology} onValueChange={(value: 'mesh' | 'star' | 'ring') => setConfig((prev) => ({ ...prev, topology: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mesh">Full Mesh (All-to-All)</SelectItem>
                      <SelectItem value="star">Star (Hub-Spoke)</SelectItem>
                      <SelectItem value="ring">Ring (Circular)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tunnel Type</Label>
                  <Select value={config.tunnelType} onValueChange={(value: 'wireguard' | 'openvpn' | 'ipsec') => setConfig((prev) => ({ ...prev, tunnelType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wireguard">WireGuard</SelectItem>
                      <SelectItem value="openvpn">OpenVPN</SelectItem>
                      <SelectItem value="ipsec">IPsec</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.topology === 'star' && (
                  <div className="col-span-2">
                    <Label>Egress Hub (Outside Iran)</Label>
                    <Select value={config.egressServerId} onValueChange={(value: string) => setConfig(prev => ({ ...prev, egressServerId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select egress server" />
                      </SelectTrigger>
                      <SelectContent>
                        {servers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name || s.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">تمام سرورها به هاب انتخابی متصل می‌شوند و از آن به اینترنت آزاد می‌رسند.</p>
                  </div>
                )}

                <div className="flex items-center justify-between col-span-2">
                  <Label htmlFor="auto-healing">Auto-Healing</Label>
                  <Switch id="auto-healing" checked={config.autoHealing} onCheckedChange={(autoHealing) => setConfig((prev) => ({ ...prev, autoHealing }))} />
                </div>
                <div className="flex items-center justify-between col-span-2">
                  <Label htmlFor="load-balancing">Load Balancing</Label>
                  <Switch id="load-balancing" checked={config.loadBalancing} onCheckedChange={(loadBalancing) => setConfig((prev) => ({ ...prev, loadBalancing }))} />
                </div>
                <div className="flex items-center justify-between col-span-2">
                  <Label htmlFor="route-all">Route all Internet via Egress (0.0.0.0/0)</Label>
                  <Switch id="route-all" checked={config.routeAll} onCheckedChange={(routeAll) => setConfig(prev => ({ ...prev, routeAll }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Connection Preview</Label>
                <div className="min-h-24 max-h-60 overflow-y-auto border rounded p-3 text-sm">
                  {plannedPairs.length === 0 ? (
                    <div className="text-muted-foreground">هیچ اتصال برنامه‌ریزی‌شده‌ای وجود ندارد. {config.topology === 'star' ? 'ابتدا هاب Egress را انتخاب کنید.' : 'تعداد سرورها باید حداقل ۲ باشد.'}</div>
                  ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plannedPairs.map((p, idx) => {
                        const from = servers.find(s => s.id === p.fromId);
                        const to = servers.find(s => s.id === p.toId);
                        return (
                          <li key={`${p.fromId}-${p.toId}-${idx}`} className="flex items-center justify-between gap-2 px-2 py-1 bg-muted rounded whitespace-normal break-words">
                            <span className="flex-1">{getServerLabel(from)} ↔ {getServerLabel(to)}</span>
                            <Badge variant="secondary" className="shrink-0 ml-2">{config.tunnelType.toUpperCase()}</Badge>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={deployAutoTunnels} disabled={isDeploying || servers.length < 2 || (config.topology === 'star' && !config.egressServerId)}>
                  {isDeploying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Deploy
                </Button>
                <Button variant="destructive" onClick={destroyAllTunnels} disabled={isDeploying}>Destroy All</Button>
              </div>

              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Deployment Progress</span>
                    <span>{Math.round(deployProgress)}%</span>
                  </div>
                  <Progress value={deployProgress} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Auto-Tunnels */}
      {tunnels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Auto-Tunnels</span>
              <Badge variant="secondary">{tunnels.length} tunnels</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tunnels.map((tunnel) => (
                <div key={tunnel.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {tunnel.from} ↔ {tunnel.to}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.tunnelType.toUpperCase()} | {tunnel.latency}ms | {tunnel.bandwidth}Mbps
                    </div>
                  </div>
                  <Badge
                    variant={tunnel.status === 'active' ? 'default' : tunnel.status === 'creating' ? 'secondary' : 'destructive'}
                  >
                    {tunnel.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controller Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Controller Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-Discovery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Key Exchange</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Route Management</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Health Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Failover Handling</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Policy Enforcement</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}