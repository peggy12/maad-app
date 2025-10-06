// Modern React Components for enhanced UI
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Smartphone } from 'lucide-react';

// Loading Spinner Component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`} />
  );
}

// Feature Card Component
export function FeatureCard({ icon: Icon, title, description, color = 'blue' }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="card p-6 cursor-pointer group"
    >
      <div className={`${colorClasses[color]} mb-3 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}

// Status Badge Component
export function StatusBadge({ status, label }: { 
  status: 'online' | 'offline' | 'busy' | 'away';
  label?: string;
}) {
  const statusStyles = {
    online: 'bg-green-100 text-green-700 border-green-200',
    offline: 'bg-gray-100 text-gray-700 border-gray-200',
    busy: 'bg-red-100 text-red-700 border-red-200',
    away: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  const dotStyles = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[status]}`} />
      {label || status}
    </span>
  );
}

// Quick Action Button
export function QuickActionButton({ icon: Icon, label, onClick, variant = 'primary' }: {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${variants[variant]}`}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
}

// Animated Counter Component
export function AnimatedCounter({ value, label, prefix = '', suffix = '' }: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="text-2xl font-bold text-gray-900 mb-1"
      >
        {prefix}{value.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-sm text-gray-500">{label}</div>
    </motion.div>
  );
}

// Welcome Screen Component
export function WelcomeScreen() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Chat',
      description: 'Intelligent conversations with Base44 AI technology',
      color: 'blue' as const
    },
    {
      icon: Zap,
      title: 'Facebook Jobs',
      description: 'Smart job discovery from Facebook pages',
      color: 'green' as const
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise security',
      color: 'purple' as const
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Responsive design that works on any device',
      color: 'orange' as const
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-white" size={40} />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to MAAD
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your intelligent AI assistant powered by Base44. Start conversations, discover job opportunities, and get things done efficiently.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default {
  LoadingSpinner,
  FeatureCard,
  StatusBadge,
  QuickActionButton,
  AnimatedCounter,
  WelcomeScreen
};