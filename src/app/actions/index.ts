'use server';

import { getDb, getServersCollection, getTunnelsCollection } from './db';
import { 
    getServers, 
    addServer, 
    updateServer, 
    updateServers, 
    deleteServer, 
    pingServer, 
    cleanupServer 
} from './server-actions';
import { getSshKeys, connectWithKeyManagement } from './ssh';
import { getTunnels, deleteTunnel, pingTunnel } from './tunnels/core';
import { createCombinedTunnel, createTunnel } from './tunnels/creation';
import { saveTunnelConfig } from './tunnels/persistence';
import { createMeshNetwork } from './tunnels/netmaker';
import { exportSettings, importSettings, getSettings, updateSettings } from './settings-actions';

// Explicitly export all the functions to comply with "use server"
export {
    getDb,
    getServersCollection,
    getTunnelsCollection,
    getServers,
    addServer,
    updateServer,
    updateServers,
    deleteServer,
    pingServer,
    cleanupServer,
    getSshKeys,
    connectWithKeyManagement,
    getTunnels,
    deleteTunnel,
    pingTunnel,
    createCombinedTunnel,
    createTunnel,
    saveTunnelConfig,
    createMeshNetwork,
    exportSettings,
    importSettings,
    getSettings,
    updateSettings,
};
