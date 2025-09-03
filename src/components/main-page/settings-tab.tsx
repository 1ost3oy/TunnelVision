'use client';

import { useState, useTransition, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/app/actions';
import { 
    IconClipboard,
    IconViewKey,
    IconEyeOff,
    IconCheck,
    IconSaveChanges,
    IconMongoUrl,
    IconGeminiApiKey,
    IconApiSecretKey,
} from '@/components/common/abstract-icons';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SettingsState = {
    mongodbUri: string;
    apiKey: string;
    geminiApiKey: string;
};

export function SettingsTab() {
    const [settings, setSettings] = useState<SettingsState>({ mongodbUri: '', apiKey: '', geminiApiKey: '' });
    const [isPending, startTransition] = useTransition();
    const [isFetching, startFetching] = useTransition();
    const [hasCopied, setHasCopied] = useState<string | null>(null);
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const { toast } = useToast();

    useEffect(() => {
        startFetching(async () => {
            const currentSettings = await getSettings();
            setSettings(currentSettings as SettingsState);
        });
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateSettings(settings);
            if (result.success) {
                toast({ title: 'Settings Updated', description: 'Your new settings have been saved.' });
            } else {
                toast({ variant: 'destructive', title: 'Update Failed', description: result.message });
            }
        });
    };

    const handleCopyToClipboard = (key: string, value: string) => {
        navigator.clipboard.writeText(value);
        setHasCopied(key);
        setTimeout(() => setHasCopied(null), 2000);
    };

    const generateSecretKey = (): string => {
        const randomBytes = crypto.getRandomValues(new Uint8Array(16));
        const hexString = Array.from(randomBytes, byte => 
            byte.toString(16).padStart(2, '0')
        ).join('');
        return `secret_${hexString}`;
    };

    const handleGenerateNewKey = () => {
        const newKey = generateSecretKey();
        setSettings(prev => ({ ...prev, apiKey: newKey }));
    };

    const toggleShowKey = (key: string) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Manage your application-wide settings here. Changes are saved to the `.env` file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="mongodbUri" className="flex items-center gap-2">
                        <IconMongoUrl className="h-4 w-4" />
                        MongoDB:
                    </Label>
                     <div className="flex items-center gap-2">
                        <Input 
                            id="mongodbUri" 
                            type={showKeys.mongodbUri ? 'text' : 'password'} 
                            value={settings.mongodbUri} 
                            onChange={handleInputChange} 
                        />
                        <Button variant="ghost" size="icon" onClick={() => toggleShowKey('mongodbUri')}>
                            {showKeys.mongodbUri ? <IconEyeOff className="h-4 w-4" /> : <IconViewKey className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="apiKey" className="flex items-center gap-2">
                        <IconApiSecretKey className="h-4 w-4" />
                        API:
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="apiKey" 
                            type={showKeys.apiKey ? 'text' : 'password'} 
                            value={settings.apiKey} 
                            onChange={handleInputChange} 
                        />
                        <Button variant="ghost" size="icon" onClick={() => toggleShowKey('apiKey')}>
                            {showKeys.apiKey ? <IconEyeOff className="h-4 w-4" /> : <IconViewKey className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard('apiKey', settings.apiKey)}>
                            {hasCopied === 'apiKey' ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconClipboard className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleGenerateNewKey}>Generate New Key</Button>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="geminiApiKey" className="flex items-center gap-2">
                        <IconGeminiApiKey className="h-4 w-4" />
                        Gemini:
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="geminiApiKey" 
                            type={showKeys.geminiApiKey ? 'text' : 'password'} 
                            value={settings.geminiApiKey} 
                            onChange={handleInputChange} 
                        />
                         <Button variant="ghost" size="icon" onClick={() => toggleShowKey('geminiApiKey')}>
                            {showKeys.geminiApiKey ? <IconEyeOff className="h-4 w-4" /> : <IconViewKey className="h-4 w-4" />}
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard('geminiApiKey', settings.geminiApiKey)}>
                            {hasCopied === 'geminiApiKey' ? <IconCheck className="h-4 w-4 text-green-500" /> : <IconClipboard className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin" /> : <IconSaveChanges />}
                    Apply
                </Button>
            </CardFooter>
        </Card>
    );
}
