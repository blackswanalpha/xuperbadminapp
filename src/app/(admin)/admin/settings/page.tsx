'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Save,
    Globe,
    Bell,
    Shield,
    Key,
    Mail,
    Smartphone,
    Lock,
    Eye,
    EyeOff,
    Copy,
    Check
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { Tabs, TabPanel } from '@/components/shared/tabs'

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setLoading(false)
    }

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
        { id: 'integrations', label: 'Integrations', icon: <Key size={18} /> },
    ]

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Settings
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Manage your admin preferences and system configurations
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all"
                    style={{
                        backgroundColor: colors.adminPrimary,
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    className="px-6 pt-2"
                />

                <div className="p-6">
                    <TabPanel className={activeTab === 'general' ? 'block' : 'hidden'}>
                        <GeneralSettings />
                    </TabPanel>
                    <TabPanel className={activeTab === 'notifications' ? 'block' : 'hidden'}>
                        <NotificationSettings />
                    </TabPanel>
                    <TabPanel className={activeTab === 'security' ? 'block' : 'hidden'}>
                        <SecuritySettings />
                    </TabPanel>
                    <TabPanel className={activeTab === 'integrations' ? 'block' : 'hidden'}>
                        <IntegrationSettings />
                    </TabPanel>
                </div>
            </div>
        </div>
    )
}

function GeneralSettings() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Application Name
                    </label>
                    <input
                        type="text"
                        defaultValue="XuperB Admin"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all"
                        style={{
                            borderColor: colors.borderLight,
                            // focus ring color would need tailwind config or inline style for exact match
                        }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Support Email
                    </label>
                    <input
                        type="email"
                        defaultValue="support@xuperb.com"
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all"
                        style={{ borderColor: colors.borderLight }}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        System Description
                    </label>
                    <textarea
                        rows={4}
                        defaultValue="Comprehensive fleet management and administration system."
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all resize-none"
                        style={{ borderColor: colors.borderLight }}
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    Regional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                            Timezone
                        </label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border outline-none bg-white"
                            style={{ borderColor: colors.borderLight }}
                            defaultValue="Africa/Nairobi"
                        >
                            <option value="UTC">UTC</option>
                            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                            Currency
                        </label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border outline-none bg-white"
                            style={{ borderColor: colors.borderLight }}
                            defaultValue="KES"
                        >
                            <option value="KES">Kenyan Shilling (KES)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

function NotificationSettings() {
    const [emailNotifs, setEmailNotifs] = useState(true)
    const [smsNotifs, setSmsNotifs] = useState(false)
    const [marketingEmails, setMarketingEmails] = useState(false)

    const Toggle = ({ checked, onChange, label, description }: any) => (
        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="relative flex items-center mt-1">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="peer sr-only"
                />
                <div
                    onClick={() => onChange(!checked)}
                    className={`w-11 h-6 rounded-full cursor-pointer transition-colors ${checked ? '' : 'bg-gray-200'
                        }`}
                    style={{ backgroundColor: checked ? colors.adminPrimary : undefined }}
                >
                    <div
                        className={`absolute top-1 left-1 bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform ${checked ? 'translate-x-5 border-transparent' : ''
                            }`}
                    />
                </div>
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-medium" style={{ color: colors.textPrimary }}>{label}</h4>
                <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{description}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    <Mail size={18} />
                    Email Preferences
                </h3>
                <div className="space-y-3">
                    <Toggle
                        checked={emailNotifs}
                        onChange={setEmailNotifs}
                        label="System Alerts"
                        description="Receive emails about critical system events and errors."
                    />
                    <Toggle
                        checked={marketingEmails}
                        onChange={setMarketingEmails}
                        label="Weekly Reports"
                        description="Get a weekly summary of fleet performance and stats."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    <Smartphone size={18} />
                    SMS Notifications
                </h3>
                <div className="space-y-3">
                    <Toggle
                        checked={smsNotifs}
                        onChange={setSmsNotifs}
                        label="Real-time Alerts"
                        description="Receive SMS for high-priority incidents like accidents or theft."
                    />
                </div>
            </div>
        </div>
    )
}

function SecuritySettings() {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="space-y-8">
            <div>
                <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    <Lock size={18} />
                    Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                            Current Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all"
                            style={{ borderColor: colors.borderLight }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all"
                                style={{ borderColor: colors.borderLight }}
                            />
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 outline-none transition-all"
                            style={{ borderColor: colors.borderLight }}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    <Shield size={18} />
                    Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                        <h4 className="font-medium text-blue-900">Enable 2FA</h4>
                        <p className="text-sm text-blue-700 mt-1">
                            Add an extra layer of security to your admin account.
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                        Setup Now
                    </button>
                </div>
            </div>
        </div>
    )
}

function IntegrationSettings() {
    const [copied, setCopied] = useState('')

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(''), 2000)
    }

    const ApiKeyRow = ({ id, name, keyDisplay }: any) => (
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50">
            <div>
                <h4 className="font-medium text-sm" style={{ color: colors.textPrimary }}>{name}</h4>
                <code className="text-xs text-gray-500 mt-1 block font-mono bg-gray-100 px-2 py-1 rounded w-fit">
                    {keyDisplay}
                </code>
            </div>
            <button
                onClick={() => copyToClipboard('pk_live_ExampleKey123', id)}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Copy Key"
            >
                {copied === id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
        </div>
    )

    return (
        <div className="space-y-6">
            <div>
                <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    <Key size={18} />
                    API Keys
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                    Manage your API keys for third-party integrations. Do not share your secret keys.
                </p>

                <div className="space-y-3">
                    <ApiKeyRow id="google-maps" name="Google Maps API" keyDisplay="AIzaSy...XyZ8" />
                    <ApiKeyRow id="stripe" name="Stripe Publishable Key" keyDisplay="pk_live...7aB2" />
                    <ApiKeyRow id="sendgrid" name="SendGrid API Key" keyDisplay="SG.2d9...kL9p" />
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    Webhooks
                </h3>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    + Add New Webhook
                </button>
            </div>
        </div>
    )
}
