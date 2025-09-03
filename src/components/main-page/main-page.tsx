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
import { 
  IconCreateTunnel,
  IconCombinedTunnel,
  IconNetmaker,
  IconSettings,
} from '@/components/common/abstract-icons';

const EMPTY_FUNCTION = () => {};

const sanitizeString = (str: string) => str.replace(/[<>"'&]/g, '');

type PlainServer = Omit<Server, '_id' | 'sshKeyConfigured'> & {
  id: string;
  sshKeyConfigured?: boolean;
};
type PlainTunnel = Omit<Tunnel, '_id'> & {
  id: string;
};

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

      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm px-4 md:px-6 z-10 animate-pulse-slow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient-x"></div>
        <div className="flex items-center gap-2 relative z-10">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <div className="relative">
              <Logo className="h-7 w-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <span className="font-headline">TunnelVision</span>
          </a>
        </div>
        

        
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 relative z-10">
          <div className="ml-auto flex-1 sm:flex-initial"></div>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
        {/* Animated Network Graphic - Above Cards */}
        <div className="flex justify-center mb-4">
          <div className="relative w-48 h-12">
            {/* Moving Data Packets */}
            <div className="absolute top-5 left-0 w-3 h-3 bg-primary rounded-full animate-move-right shadow-lg"></div>
            <div className="absolute top-5 left-0 w-3 h-3 bg-secondary rounded-full animate-move-right-delay shadow-lg"></div>
            <div className="absolute top-5 left-0 w-3 h-3 bg-accent rounded-full animate-move-right-delay2 shadow-lg"></div>
            
            {/* Tunnel Lines */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-gradient-to-r from-primary/40 via-secondary/60 to-accent/40 animate-pulse rounded-full"></div>
            <div className="absolute top-3 left-12 right-12 h-1 bg-gradient-to-r from-accent/30 via-primary/50 to-secondary/30 animate-pulse-delay rounded-full"></div>
            
            {/* Connection Nodes */}
            <div className="absolute top-3 left-3 w-4 h-4 border-2 border-primary rounded-full animate-pulse-node bg-primary/20"></div>
            <div className="absolute top-3 right-3 w-4 h-4 border-2 border-secondary rounded-full animate-pulse-node-delay bg-secondary/20"></div>
          </div>
        </div>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="single" className="h-12">
                  <div className="relative">
                    <IconCreateTunnel className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="combined" className="h-12">
                  <div className="relative">
                    <IconCombinedTunnel className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="netmaker" className="h-12">
                  <div className="relative">
                    <IconNetmaker className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="settings" className="h-12">
                  <div className="relative">
                    <IconSettings className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-spin"></div>
                  </div>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="single">
                <SingleTunnelTab
                  selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                  setSelectedServers={setSelectedServers}
                  setLogs={setLogs}
                  isPending={isPending}
                  startTransition={EMPTY_FUNCTION}
                  logs={logs}
                />
              </TabsContent>
              <TabsContent value="combined">
                <CombinedTunnelTab
                  selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                  isPending={isPending}
                  setLogs={setLogs}
                  startTransition={EMPTY_FUNCTION}
                  onMoveServer={moveServer}
                />
              </TabsContent>
              <TabsContent value="netmaker">
                <NetmakerTab 
                  selectedServers={selectedServers.map(s => ({...s, name: sanitizeString(s.name), ipAddress: sanitizeString(s.ipAddress), username: sanitizeString(s.username)}))}
                  isPending={isPending}
                  startTransition={EMPTY_FUNCTION}
                  setLogs={setLogs}
                />
              </TabsContent>
              <TabsContent value="settings">
                <SettingsTab />
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
      </main>
    </div>
  );
}