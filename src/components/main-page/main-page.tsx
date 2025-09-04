'use client';

import type { Server, Tunnel } from '@/lib/types';
import { useMainPage } from '@/hooks/use-main-page';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Logo } from '@/components/common/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { ServerFormSheet } from './server-form-sheet';
import { ServerListTab } from './server-list-tab';
import { TerminalOutput } from './terminal-output';
import { TunnelList } from './tunnel-list';
import { SingleTunnelTab } from './single-tunnel-tab';
import { CombinedTunnelTab } from './combined-tunnel-tab';
import { NetmakerTab } from './netmaker-tab';
import { SettingsTab } from './settings-tab';
import { AIChat } from './ai-chat';
import { SDNNetworkVisualizer } from './sdn-network-visualizer';
import { 
  IconCreateTunnel,
  IconCombinedTunnel,
  IconNetmaker,
  IconSettings,
} from '@/components/common/abstract-icons';
import { SDNIcon } from '@/components/common/sdn-icon';

const EMPTY_FUNCTION = () => {};

const sanitizeString = (str: string) => str.replace(/[<>\"'&]/g, '');

type PlainServer = Omit<Server, '_id' | 'sshKeyConfigured'> & {
  id: string;
  sshKeyConfigured?: boolean;
};
type PlainTunnel = Omit<Tunnel, '_id'> & {
  id: string;
};

// MainPage: صفحه اصلی داشبورد. این تابع UI اصلی را رندر می‌کند.
// توضیح: برای واضح‌تر شدن انیمیشن هدر، شدت لایه‌های پس‌زمینه و ضخامت/اندازه عناصر متحرک افزایش یافته و پالس کلی هدر حذف شده است.
export function MainPage({
  initialServers,
  initialTunnels,
}: {
  initialServers: PlainServer[];
  initialTunnels: PlainTunnel[];
}) {
  const {
    servers,
    tunnels,
    selectedServers,
    logs,
    serverFormOpen,
    serverToEdit,
    filter,
    pingStates,
    activeTab,
    isPending,
    fileInputRef,
    selectionLimit,
    isSelectionLimited,
    filteredServers,
    setFilter,
    setActiveTab,
    setServerFormOpen,
    setLogs,
    setSelectedServers,
    handleSelectServer,
    handlePingServer,
    handlePingTunnel,
    handleSaveTunnel,
    handleExport,
    handleImportClick,
    handleImport,
    moveServer,
    handleDeleteServer,
    handleCleanupServer,
    handleDeleteTunnel,
    handleOpenAddServerSheet,
    handleOpenEditServerSheet,
    router,
  } = useMainPage(initialServers, initialTunnels);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ServerFormSheet
        open={serverFormOpen}
        onOpenChange={setServerFormOpen}
        onSuccess={() => router.refresh()}
        server={serverToEdit}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept="application/json"
        className="hidden"
      />

      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm px-4 md:px-6 z-10 overflow-hidden">
        <div className="absolute inset-y-0 left-[5%] right-[5%] bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-gradient-x"></div>
        {/* Animated Background - Similar to Network Graphic (width reduced to 90%) */}
        <div className="absolute inset-y-0 left-[5%] right-[5%] opacity-25">
          {/* Moving Data Packets */}
          <div className="absolute top-6 left-0 w-2 h-2 bg-primary rounded-full animate-move-right drop-shadow-md"></div>
          <div className="absolute top-6 left-0 w-2 h-2 bg-secondary rounded-full animate-move-right-delay drop-shadow-md"></div>
          <div className="absolute top-6 left-0 w-2 h-2 bg-accent rounded-full animate-move-right-delay2 drop-shadow-md"></div>
          
          {/* Tunnel Lines */}
          <div className="absolute top-7 left-8 right-8 h-1 bg-gradient-to-r from-primary/60 via-secondary/70 to-accent/60 animate-pulse rounded-full"></div>
          <div className="absolute top-4 left-16 right-16 h-1 bg-gradient-to-r from-accent/50 via-primary/60 to-secondary/50 animate-pulse-delay rounded-full"></div>
          
          {/* Connection Nodes */}
          <div className="absolute top-4 left-6 w-2 h-2 border-2 border-primary rounded-full animate-pulse-node bg-primary/30 drop-shadow-sm"></div>
          <div className="absolute top-4 right-6 w-2 h-2 border-2 border-secondary rounded-full animate-pulse-node-delay bg-secondary/30 drop-shadow-sm"></div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <div className="relative flex flex-col items-start leading-none">
              <div className="relative">
                <Logo className="h-7 w-7 text-primary" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              <span className="mt-0.5 text-xs font-medium text-muted-foreground">Vision</span>
            </div>
          </a>
        </div>
        

        
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 relative z-10">
          <div className="ml-auto flex-1 sm:flex-initial"></div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
        {/* (Removed) Animated Network Graphic - Above Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4 animate-slide-in-left">
            <ServerListTab
              servers={servers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
              tunnels={tunnels}
              pingStates={pingStates}
              filteredServers={filteredServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
              selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
              filter={sanitizeString(filter)}
              isPending={isPending}
              setFilter={setFilter}
              onSelectServer={handleSelectServer}
              onPingServer={handlePingServer}
              onMoveServer={moveServer}
              onDeleteServer={handleDeleteServer}
              onCleanupServer={handleCleanupServer}
              onAddServer={handleOpenAddServerSheet}
              onEditServer={handleOpenEditServerSheet}
              onExport={handleExport}
              onImportClick={handleImportClick}
              selectionLimit={selectionLimit}
              isSelectionLimited={isSelectionLimited}
            />
            <TerminalOutput logs={logs} isPending={isPending} />
          </div>

          <div className="flex flex-col gap-4 animate-slide-in-right">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="single" className="h-12" disabled={selectedServers.length === 0}>
                  <div className="relative">
                    <IconCreateTunnel className={`w-8 h-8 ${selectedServers.length === 0 ? 'opacity-50' : ''}`} />
                    {selectedServers.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>}
                  </div>
                </TabsTrigger>
                <TabsTrigger value="combined" className="h-12" disabled={selectedServers.length === 0}>
                  <div className="relative">
                    <IconCombinedTunnel className={`w-8 h-8 ${selectedServers.length === 0 ? 'opacity-50' : ''}`} />
                    {selectedServers.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>}
                  </div>
                </TabsTrigger>
                <TabsTrigger value="sdn" className="h-12">
                  <div className="relative">
                    <SDNIcon className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="netmaker" className="h-12" disabled={selectedServers.length === 0}>
                  <div className="relative">
                    <IconNetmaker className={`w-8 h-8 ${selectedServers.length === 0 ? 'opacity-50' : ''}`} />
                    {selectedServers.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>}
                  </div>
                </TabsTrigger>
                <TabsTrigger value="settings" className="h-12" disabled={selectedServers.length === 0}>
                  <div className="relative">
                    <IconSettings className={`w-8 h-8 ${selectedServers.length === 0 ? 'opacity-50' : ''}`} />
                    {selectedServers.length > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-spin"></div>}
                  </div>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                {selectedServers.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <IconCreateTunnel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Servers Selected</h3>
                      <p className="text-muted-foreground">Please select servers to create single tunnels.</p>
                    </div>
                  </div>
                ) : (
                  <SingleTunnelTab
                    selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                    setSelectedServers={setSelectedServers}
                    setLogs={setLogs}
                    isPending={isPending}
                    startTransition={EMPTY_FUNCTION}
                    logs={logs}
                  />
                )}
              </TabsContent>
              <TabsContent value="combined">
                {selectedServers.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <IconCombinedTunnel className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Servers Selected</h3>
                      <p className="text-muted-foreground">Please select servers to create combined tunnels.</p>
                    </div>
                  </div>
                ) : (
                  <CombinedTunnelTab
                    selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                    isPending={isPending}
                    setLogs={setLogs}
                    startTransition={EMPTY_FUNCTION}
                    onMoveServer={moveServer}
                  />
                )}
              </TabsContent>
              <TabsContent value="sdn">
                <SDNNetworkVisualizer servers={servers} />
              </TabsContent>
              <TabsContent value="netmaker">
                {selectedServers.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <IconNetmaker className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Servers Selected</h3>
                      <p className="text-muted-foreground">Please select servers to use Netmaker.</p>
                    </div>
                  </div>
                ) : (
                  <NetmakerTab 
                    selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                    isPending={isPending}
                    startTransition={EMPTY_FUNCTION}
                    setLogs={setLogs}
                  />
                )}
              </TabsContent>
              <TabsContent value="settings">
                {selectedServers.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-center">
                    <div>
                      <IconSettings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Servers Selected</h3>
                      <p className="text-muted-foreground">Please select servers to access settings.</p>
                    </div>
                  </div>
                ) : (
                  <SettingsTab 
                    servers={servers}
                    tunnels={tunnels}
                    logs={logs}
                  />
                )}
              </TabsContent>
            </Tabs>
            <TunnelList
              tunnels={tunnels}
              servers={servers}
              onDelete={handleDeleteTunnel}
              onPing={handlePingTunnel}
              onSave={handleSaveTunnel}
            />
          </div>
        </div>
        <AIChat 
          servers={servers} 
          tunnels={tunnels} 
          logs={logs} 
        />
      </main>
    </div>
  );
}