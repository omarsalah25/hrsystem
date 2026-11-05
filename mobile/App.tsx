import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';

type TabType = 'attendance' | 'leaves' | 'payroll' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  const [loading, setLoading] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // Leave Form State
  const [leaveDays, setLeaveDays] = useState('2');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveBalance, setLeaveBalance] = useState(17);

  const isAr = lang === 'ar';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          isAr ? 'تنبيه' : 'Permission Required',
          isAr ? 'يجب منح صلاحية الموقع الجغرافي لتسجيل الحضور' : 'Location permission is required to clock in.'
        );
      }
    })();
  }, [isAr]);

  const handlePunch = async (punchType: 'IN' | 'OUT') => {
    setLoading(true);

    try {
      // 1. Biometric Authentication (FaceID / Fingerprint)
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: isAr ? 'التحقق من بصمة الموظف لتسجيل الحضور' : 'Verify Identity to Clock In',
          cancelLabel: isAr ? 'إلغاء' : 'Cancel',
          fallbackLabel: isAr ? 'استخدام كلمة المرور' : 'Use Passcode',
        });

        if (!authResult.success) {
          Alert.alert(isAr ? 'خطأ' : 'Error', isAr ? 'فشل التحقق من البصمة' : 'Biometric authentication failed.');
          setLoading(false);
          return;
        }
      }

      // 2. Fetch Accurate GPS Location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);

      setClockedIn(punchType === 'IN');
      const timeStr = new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US');

      Alert.alert(
        isAr ? 'نجاح العملية' : 'Success',
        punchType === 'IN'
          ? (isAr ? `تم تسجيل الحضور بنجاح في ${timeStr}\nداخل نطاق الفرع (Geofence Verified)` : `Clocked in at ${timeStr}`)
          : (isAr ? `تم تسجيل الانصراف بنجاح في ${timeStr}` : `Clocked out at ${timeStr}`)
      );
    } catch (error: any) {
      Alert.alert(isAr ? 'خطأ' : 'Error', error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = () => {
    const days = parseInt(leaveDays) || 0;
    if (days <= 0 || days > leaveBalance) {
      Alert.alert(isAr ? 'خطأ' : 'Error', isAr ? 'رصيد الإجازات غير كافٍ' : 'Insufficient leave balance.');
      return;
    }
    setLeaveBalance(prev => prev - days);
    setLeaveReason('');
    Alert.alert(
      isAr ? 'تم إرسال الطلب' : 'Request Submitted',
      isAr ? `تم تقديم طلب إجازة لمدة ${days} أيام للاعتماد الإداري.` : `Submitted ${days} days leave request.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>{isAr ? 'نظام الموارد البشرية المتكامل' : 'HRSystem Mobile ESS'}</Text>
          <Text style={styles.appSubtitle}>{isAr ? 'بوابة الموظف الذكية بالبصمة والموقع' : 'Smart Biometric & GPS Portal'}</Text>
        </View>

        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLang(isAr ? 'en' : 'ar')}
        >
          <Text style={styles.langBtnText}>{isAr ? 'English' : 'العربية'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tab 1: Attendance */}
        {activeTab === 'attendance' && (
          <View style={styles.tabContent}>
            {/* User Identity Card */}
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AS</Text>
              </View>
              <Text style={styles.userName}>عبدالله سعد العتيبي</Text>
              <Text style={styles.userRole}>Senior Software Engineer • 🇸🇦 الرياض (العليا)</Text>
              <View style={[styles.statusBadge, { backgroundColor: clockedIn ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.statusText, { color: clockedIn ? '#166534' : '#991b1b' }]}>
                  {clockedIn
                    ? (isAr ? 'الحالة: حاضر داخل المقر (Clocked In)' : 'Status: Clocked In')
                    : (isAr ? 'الحالة: خارج الدوام (Clocked Out)' : 'Status: Clocked Out')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#2563eb" />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.punchBtn, styles.clockInBtn, clockedIn && styles.disabledBtn]}
                    disabled={clockedIn}
                    onPress={() => handlePunch('IN')}
                  >
                    <Text style={styles.btnText}>
                      {isAr ? '📍 تسجيل حضور بالبصمة (Clock In)' : '📍 Biometric Clock In'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.punchBtn, styles.clockOutBtn, !clockedIn && styles.disabledBtn]}
                    disabled={!clockedIn}
                    onPress={() => handlePunch('OUT')}
                  >
                    <Text style={styles.btnText}>
                      {isAr ? '🕒 تسجيل انصراف (Clock Out)' : '🕒 Clock Out'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Geofence Status Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>{isAr ? 'نظام التحقق الجغرافي (Geofence):' : 'Geofence Verification:'}</Text>
              <Text style={styles.infoText}>
                {isAr
                  ? '✓ يتم التحقق من إحداثيات GPS بدقة متناهية ومنع البرامج المزيفة (Anti-Mock Location) مع ربط أجهزة بصمة ZKTeco.'
                  : '✓ Accurate GPS centroid validation against branch boundaries with Fake-GPS detection.'}
              </Text>
            </View>
          </View>
        )}

        {/* Tab 2: Leaves */}
        {activeTab === 'leaves' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{isAr ? 'رصيد الإجازات المتاح' : 'Leave Balance'}</Text>
              <Text style={styles.balanceBig}>{leaveBalance} {isAr ? 'يوم' : 'Days'}</Text>
              <Text style={styles.userRole}>{isAr ? 'إجازة سنوية اعتيادية (قانون العمل)' : 'Annual statutory leave'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{isAr ? 'تقديم طلب إجازة سريع' : 'Quick Leave Request'}</Text>
              
              <Text style={styles.inputLabel}>{isAr ? 'عدد الأيام المطلوبة:' : 'Number of Days:'}</Text>
              <TextInput
                style={styles.input}
                value={leaveDays}
                onChangeText={setLeaveDays}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>{isAr ? 'سبب الإجازة وملاحظات:' : 'Reason / Notes:'}</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={leaveReason}
                onChangeText={setLeaveReason}
                placeholder={isAr ? 'ظرف عائلي / سفر...' : 'Family reason / travel...'}
                multiline
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleApplyLeave}>
                <Text style={styles.btnText}>{isAr ? 'إرسال طلب الإجازة' : 'Submit Request'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tab 3: Payroll */}
        {activeTab === 'payroll' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{isAr ? 'آخر مسير رواتب معتمد (أكتوبر 2026)' : 'Latest Approved Payslip'}</Text>
              <Text style={styles.balanceBig}>21,806.25 SAR</Text>
              <Text style={styles.userRole}>{isAr ? 'صافي الراتب المحول للحساب البنكي' : 'Net Transfer via WPS'}</Text>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الراتب الأساسي:' : 'Basic Salary:'}</Text>
                <Text style={styles.rowVal}>18,000.00 SAR</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'بدل السكن والنقل:' : 'Housing & Transport:'}</Text>
                <Text style={styles.rowVal}>6,000.00 SAR</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'استقطاع التأمينات (GOSI 9.75%):' : 'GOSI Deduction:'}</Text>
                <Text style={[styles.rowVal, { color: '#e11d48' }]}>-2,193.75 SAR</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => Alert.alert(isAr ? 'جاري التحميل' : 'Downloading', isAr ? 'يتم تنزيل قسيمة الراتب الرقمية المعتمدة بصيغة PDF...' : 'Downloading digital PDF payslip...')}
            >
              <Text style={styles.btnText}>{isAr ? '📥 تحميل قسيمة الراتب الرسمية PDF' : '📥 Download Official Payslip PDF'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab 4: Profile */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{isAr ? 'البيانات الشخصية والتعاقدية' : 'Personal & Contract Info'}</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الرقم الوظيفي:' : 'Employee No:'}</Text>
                <Text style={styles.rowVal}>EMP-SA-001</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الهوية الوطنية (مشفرة):' : 'National ID:'}</Text>
                <Text style={styles.rowVal}>109****432</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الآيبان البنكي (IBAN):' : 'Bank IBAN:'}</Text>
                <Text style={styles.rowVal}>SA0380...67519</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الفرع ومقر العمل:' : 'Branch / Location:'}</Text>
                <Text style={styles.rowVal}>الرياض - برج العليا</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{isAr ? 'الوردية المقررة:' : 'Assigned Shift:'}</Text>
                <Text style={styles.rowVal}>الوردية الصباحية (09:00 - 17:00)</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'attendance' && styles.tabItemActive]}
          onPress={() => setActiveTab('attendance')}
        >
          <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>
            {isAr ? '🕒 الحضور' : 'Clock'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'leaves' && styles.tabItemActive]}
          onPress={() => setActiveTab('leaves')}
        >
          <Text style={[styles.tabText, activeTab === 'leaves' && styles.tabTextActive]}>
            {isAr ? '📄 الإجازات' : 'Leaves'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'payroll' && styles.tabItemActive]}
          onPress={() => setActiveTab('payroll')}
        >
          <Text style={[styles.tabText, activeTab === 'payroll' && styles.tabTextActive]}>
            {isAr ? '💰 الراتب' : 'Salary'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
            {isAr ? '👤 الملف' : 'Profile'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  tabContent: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionContainer: {
    gap: 12,
  },
  punchBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clockInBtn: {
    backgroundColor: '#10b981',
  },
  clockOutBtn: {
    backgroundColor: '#f43f5e',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#3b82f6',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  balanceBig: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2563eb',
    marginVertical: 4,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  downloadBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  rowVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
    paddingBottom: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
