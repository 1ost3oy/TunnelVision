'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/starwind/card';
import { Button } from '@/components/starwind/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/starwind/alert';
import { Dropzone, DropzoneFilesList, DropzoneLoadingIndicator, DropzoneUploadIndicator } from '@/components/starwind/dropzone';
import { Badge } from '@/components/ui/badge';
import { Server, Upload, FileText, CheckCircle } from 'lucide-react';

interface ImportedServer {
  id: string;
  name: string;
  ip: string;
  location: string;
  status: 'imported' | 'validated' | 'error';
}

export default function ServerImportManager() {
  const [importedServers, setImportedServers] = useState<ImportedServer[]>([]);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | 'info' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileUpload = (files: File[]) => {
    setImportStatus('info');
    setStatusMessage('Processing server configuration files...');

    // Simulate file processing
    setTimeout(() => {
      const newServers: ImportedServer[] = files.map((file, index) => ({
        id: `server-${Date.now()}-${index}`,
        name: file.name.replace('.json', '').replace('.csv', ''),
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: ['Iran', 'Germany', 'Netherlands', 'Singapore'][Math.floor(Math.random() * 4)],
        status: 'imported'
      }));

      setImportedServers(prev => [...prev, ...newServers]);
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${files.length} server configuration(s)`);
    }, 2000);
  };

  const validateServer = (serverId: string) => {
    setImportedServers(prev => prev.map(server => 
      server.id === serverId 
        ? { ...server, status: 'validated' }
        : server
    ));
    setImportStatus('success');
    setStatusMessage('Server configuration validated successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'imported': return 'bg-blue-500';
      case 'validated': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Server Import Manager</h1>
        <Badge variant="outline">{importedServers.length} Servers</Badge>
      </div>

      {importStatus && (
        <Alert variant={importStatus}>
          <AlertTitle>Import Status</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Import Server Configurations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Dropzone 
                onFilesChange={handleFileUpload}
                accept={{
                  'application/json': ['.json'],
                  'text/csv': ['.csv'],
                  'text/plain': ['.txt']
                }}
                maxFiles={10}
              >
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Drop server config files here</p>
                  <p className="text-sm text-muted-foreground">
                    Supports JSON, CSV, and TXT formats
                  </p>
                </div>
                <DropzoneFilesList />
                <DropzoneLoadingIndicator />
                <DropzoneUploadIndicator />
              </Dropzone>
              
              <div className="text-xs text-muted-foreground">
                <p>Supported formats:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>JSON: Server configuration objects</li>
                  <li>CSV: IP, Name, Location columns</li>
                  <li>TXT: Line-separated server entries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Import Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {importedServers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-4" />
                <p>No servers imported yet</p>
                <p className="text-sm">Upload configuration files to see preview</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {importedServers.map((server) => (
                  <div key={server.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(server.status)}`} />
                        <div>
                          <div className="font-medium">{server.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {server.ip} • {server.location}
                          </div>
                        </div>
                      </div>
                      {server.status === 'imported' && (
                        <Button 
                          size="sm" 
                          onClick={() => validateServer(server.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Validate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Summary */}
      {importedServers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{importedServers.length}</div>
                <div className="text-sm text-muted-foreground">Total Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importedServers.filter(s => s.status === 'validated').length}
                </div>
                <div className="text-sm text-muted-foreground">Validated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importedServers.filter(s => s.status === 'imported').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importedServers.filter(s => s.status === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <Button 
                onClick={() => {
                  setImportedServers([]);
                  setImportStatus('info');
                  setStatusMessage('Import cleared');
                }}
                variant="outline"
              >
                Clear Import
              </Button>
              <Button 
                onClick={() => {
                  setImportStatus('success');
                  setStatusMessage('All servers added to TunnelVision');
                }}
                disabled={importedServers.filter(s => s.status === 'validated').length === 0}
              >
                Add to TunnelVision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}