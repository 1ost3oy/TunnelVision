'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Dropzone } from '@/components/starwind/dropzone';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/starwind/dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Archive, Server, FileText } from 'lucide-react';

interface BackupFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: 'full' | 'config' | 'keys';
  servers: number;
}

export default function ServerBackupManager() {
  const [backups, setBackups] = useState<BackupFile[]>([
    {
      id: 'backup-1',
      name: 'TunnelVision-Full-Backup-2024',
      size: '2.4 MB',
      date: '2024-01-15',
      type: 'full',
      servers: 8
    },
    {
      id: 'backup-2', 
      name: 'Server-Configs-Iran-Germany',
      size: '156 KB',
      date: '2024-01-14',
      type: 'config',
      servers: 2
    }
  ]);
  const [status, setStatus] = useState<'success' | 'error' | 'info' | null>(null);
  const [message, setMessage] = useState('');

  const showStatus = (type: 'success' | 'error' | 'info', msg: string) => {
    setStatus(type);
    setMessage(msg);
    setTimeout(() => setStatus(null), 3000);
  };

  const createBackup = (type: 'full' | 'config' | 'keys') => {
    const backup: BackupFile = {
      id: `backup-${Date.now()}`,
      name: `${type === 'full' ? 'Full-Backup' : type === 'config' ? 'Config-Backup' : 'Keys-Backup'}-${new Date().toISOString().split('T')[0]}`,
      size: type === 'full' ? '2.1 MB' : type === 'config' ? '145 KB' : '89 KB',
      date: new Date().toISOString().split('T')[0],
      type,
      servers: type === 'full' ? 8 : type === 'config' ? 5 : 3
    };
    
    setBackups(prev => [backup, ...prev]);
    showStatus('success', `${type} backup created successfully`);
  };

  const downloadBackup = (backup: BackupFile) => {
    showStatus('info', `Downloading ${backup.name}...`);
  };

  const handleRestore = (files: File[]) => {
    showStatus('info', 'Restoring from backup...');
    setTimeout(() => {
      showStatus('success', `Restored ${files.length} backup file(s) successfully`);
    }, 2000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-500';
      case 'config': return 'bg-green-500';
      case 'keys': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Server Backup Manager</h1>
        <Badge variant="outline">{backups.length} Backups</Badge>
      </div>

      {status && (
        <Alert variant={status}>
          <AlertTitle>Backup Operation</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Archive className="w-5 h-5" />
              <span>Create Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => createBackup('full')}
                className="h-16 flex flex-col"
              >
                <Server className="w-6 h-6 mb-1" />
                Full System Backup
                <span className="text-xs opacity-75">All servers, configs & keys</span>
              </Button>
              
              <Button 
                onClick={() => createBackup('config')}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <FileText className="w-6 h-6 mb-1" />
                Configuration Only
                <span className="text-xs opacity-75">Server configs & settings</span>
              </Button>
              
              <Button 
                onClick={() => createBackup('keys')}
                variant="outline"
                className="h-16 flex flex-col"
              >
                <Archive className="w-6 h-6 mb-1" />
                SSH Keys Only
                <span className="text-xs opacity-75">Authentication keys</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restore Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Restore from Backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone 
              onFilesChange={handleRestore}
              accept={{
                'application/zip': ['.zip'],
                'application/json': ['.json'],
                'application/x-tar': ['.tar']
              }}
              maxFiles={5}
            >
              <div className="text-center py-8">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">Drop backup files here</p>
                <p className="text-sm text-muted-foreground">
                  Supports ZIP, JSON, and TAR formats
                </p>
              </div>
            </Dropzone>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded ${getTypeColor(backup.type)}`} />
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {backup.date} • {backup.size} • {backup.servers} servers
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {backup.type}
                    </Badge>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Backup Details</DialogTitle>
                          <DialogDescription>
                            Information about {backup.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Name:</span>
                              <div className="text-muted-foreground">{backup.name}</div>
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>
                              <div className="text-muted-foreground capitalize">{backup.type}</div>
                            </div>
                            <div>
                              <span className="font-medium">Size:</span>
                              <div className="text-muted-foreground">{backup.size}</div>
                            </div>
                            <div>
                              <span className="font-medium">Servers:</span>
                              <div className="text-muted-foreground">{backup.servers}</div>
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>
                              <div className="text-muted-foreground">{backup.date}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                          </DialogClose>
                          <Button onClick={() => downloadBackup(backup)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm"
                      onClick={() => downloadBackup(backup)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}