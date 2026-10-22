import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationRoute } from '../types';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onNavigate: (route: NavigationRoute) => void;
  returnTo?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, returnTo = 'admin-products' }) => {
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onNavigate({ name: (returnTo as any) || 'admin-products' });
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Unable to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@perfumestore.com');
    setPassword('Admin123!');
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        {/* BRAND BADGE */}
        <View style={styles.header}>
          <View style={styles.tagRow}>
            <Ionicons name="sparkles" size={13} color="#dfba73" />
            <Text style={styles.tagText}>ATELIER CONCIERGE</Text>
          </View>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>
            Sign in with administrative credentials to manage inventory and monitor orders.
          </Text>
        </View>

        {/* ERROR BANNER */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#f87171" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* EMAIL INPUT */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={16} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. admin@perfumestore.com"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Security Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={16} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#6b7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#9ca3af"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.loginBtn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <View style={styles.btnInner}>
              <Ionicons name="log-in-outline" size={18} color="#000000" />
              <Text style={styles.loginBtnText}>Access Admin Panel</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* DEMO CREDENTIALS QUICK FILL */}
        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Ionicons name="key-outline" size={14} color="#dfba73" />
            <Text style={styles.demoTitle}>Default Admin Credentials</Text>
          </View>
          <Text style={styles.demoDetails}>
            Email: <Text style={styles.demoHighlight}>admin@perfumestore.com</Text>
            {'\n'}
            Password: <Text style={styles.demoHighlight}>Admin123!</Text>
          </Text>
          <TouchableOpacity style={styles.quickFillBtn} onPress={handleUseDemo}>
            <Text style={styles.quickFillBtnText}>Auto-fill Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* RETURN TO STOREFRONT */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => onNavigate({ name: 'home' })}
        >
          <Ionicons name="arrow-back" size={15} color="#9ca3af" />
          <Text style={styles.returnBtnText}>Return to Customer Storefront</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 520,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: '#0c0d14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    width: '100%',
    maxWidth: 460,
    padding: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.8,
    shadowRadius: 36,
  },
  cardMobile: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#dfba73',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 340,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: '#dfba73',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#dfba73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  demoBox: {
    marginTop: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoTitle: {
    color: '#dfba73',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoDetails: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 18,
  },
  demoHighlight: {
    color: '#ffffff',
    fontWeight: '600',
  },
  quickFillBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quickFillBtnText: {
    color: '#dfba73',
    fontSize: 10.5,
    fontWeight: '700',
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  returnBtnText: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
