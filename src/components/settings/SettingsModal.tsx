import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { EmailService } from "@/services/emailService";
import { NotificationService } from "@/services/notificationService";
import { Bell, Mail, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [serviceId, setServiceId] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [browserPermission, setBrowserPermission] = useState(Notification.permission);
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Load saved settings
    useEffect(() => {
        if (open) {
            const config = EmailService.getConfig();
            setServiceId(config.serviceId);
            setTemplateId(config.templateId);
            setPublicKey(config.publicKey);
            setEmailEnabled(config.enabled);
            setBrowserPermission(Notification.permission);
        }
    }, [open]);

    const handleSave = () => {
        EmailService.saveConfig(serviceId, templateId, publicKey, emailEnabled);
        onOpenChange(false);
    };

    const handleRequestPermission = async () => {
        const granted = await NotificationService.requestPermission();
        setBrowserPermission(granted ? "granted" : "denied");
    };

    const handleTestEmail = async () => {
        setTestStatus('loading');
        try {
            // Save temp config first for the test
            EmailService.saveConfig(serviceId, templateId, publicKey, true);
            await EmailService.testConnection("test@example.com");
            setTestStatus('success');
            setTimeout(() => setTestStatus('idle'), 3000);
        } catch (error) {
            console.error(error);
            setTestStatus('error');
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Notification Settings"
            className="sm:max-w-[500px]"
        >
            <div className="grid gap-6 py-4">
                {/* Browser Notifications */}
                <div className="flex items-center justify-between space-x-4 p-3 rounded-lg border bg-card/50">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                            <Bell className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col space-y-0.5">
                            <span className="text-sm font-medium">Browser Notifications</span>
                            <span className="text-xs text-muted-foreground">
                                Popups when trials are ending.
                            </span>
                        </div>
                    </div>
                    {browserPermission === 'granted' ? (
                        <Badge variant="success">Active</Badge>
                    ) : (
                        <Button size="sm" variant="outline" onClick={handleRequestPermission}>
                            Enable
                        </Button>
                    )}
                </div>

                {/* Email Notifications */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg border bg-card/50">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full mt-0.5">
                                <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col space-y-0.5">
                                <span className="text-sm font-medium">Email Alerts via EmailJS</span>
                                <span className="text-xs text-muted-foreground">
                                    Requires a free EmailJS account.
                                </span>
                            </div>
                        </div>
                        <Switch
                            checked={emailEnabled}
                            onCheckedChange={setEmailEnabled}
                        />
                    </div>

                    {emailEnabled && (
                        <div className="grid gap-4 animate-slide-up border rounded-lg p-4 bg-muted/30">
                            <div className="grid gap-2">
                                <label htmlFor="serviceId" className="text-xs font-medium">Service ID</label>
                                <Input id="serviceId" value={serviceId} onChange={e => setServiceId(e.target.value)} placeholder="service_xxx" className="h-8" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="templateId" className="text-xs font-medium">Template ID</label>
                                <Input id="templateId" value={templateId} onChange={e => setTemplateId(e.target.value)} placeholder="template_xxx" className="h-8" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="publicKey" className="text-xs font-medium">Public Key</label>
                                <Input id="publicKey" type="password" value={publicKey} onChange={e => setPublicKey(e.target.value)} placeholder="public_xxx" className="h-8" />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleTestEmail}
                                    disabled={testStatus === 'loading' || !serviceId || !templateId || !publicKey}
                                    className="h-8 text-xs"
                                >
                                    {testStatus === 'loading' ? "Sending..." : (
                                        <>
                                            {testStatus === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500 mr-2" />}
                                            {testStatus === 'error' && <AlertCircle className="h-3 w-3 text-destructive mr-2" />}
                                            {testStatus === 'idle' && "Test Connection"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Save Settings
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
