import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
ActivityIndicator,
Pressable,
SafeAreaView,
ScrollView,
StyleSheet,
Text,
View,
Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

const COLORS = {
green: '#1B4332',
greenLight: '#2D6A4F',
gold: '#D4A853',
ivory: '#F7F4EE',
white: '#FFFFFF',
muted: '#8A9B91',
border: '#E8E3D9',
red: '#B45353',
};

const KAABA = {
latitude: 21.422487,
longitude: 39.826206,
};

type Coordinates = {
latitude: number;
longitude: number;
};

type CompassQuality = 'high' | 'medium' | 'low' | 'unknown';

function normalizeAngle(angle: number): number {
return ((angle % 360) + 360) % 360;
}

function getAngularDifference(target: number, current: number): number {
return ((target - current + 540) % 360) - 180;
}

function getQiblaBearing(
coordinates: Coordinates,
): number {
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

const latitude = toRadians(coordinates.latitude);
const kaabaLatitude = toRadians(KAABA.latitude);
const longitudeDifference = toRadians(
KAABA.longitude - coordinates.longitude,
);

const y = Math.sin(longitudeDifference);
const x =
Math.cos(latitude) * Math.tan(kaabaLatitude) -
Math.sin(latitude) * Math.cos(longitudeDifference);

return normalizeAngle(toDegrees(Math.atan2(y, x)));
}

function getDistanceToKaaba(
coordinates: Coordinates,
): number {
const earthRadiusKm = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const latitude1 = toRadians(coordinates.latitude);
const latitude2 = toRadians(KAABA.latitude);
const latitudeDifference = toRadians(
KAABA.latitude - coordinates.latitude,
);
const longitudeDifference = toRadians(
KAABA.longitude - coordinates.longitude,
);

const a =
Math.sin(latitudeDifference / 2) ** 2 +
Math.cos(latitude1) *
Math.cos(latitude2) *
Math.sin(longitudeDifference / 2) ** 2;

const safeA = Math.min(1, Math.max(0, a));

return (
2 *
earthRadiusKm *
Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))
);
}

function getCompassQuality(accuracy: number): CompassQuality {
if (!Number.isFinite(accuracy) || accuracy < 0) {
return 'unknown';
}

// Android may report a quality level from 1 to 3.
if (Platform.OS === 'android' && Number.isInteger(accuracy)) {
if (accuracy === 3) return 'high';
if (accuracy === 2) return 'medium';
if (accuracy === 1) return 'low';
}

// On iOS, heading accuracy is generally reported in degrees.
if (accuracy <= 15) return 'high';
if (accuracy <= 30) return 'medium';
return 'low';
}

function formatDistance(distanceKm: number): string {
if (distanceKm < 1) {
return ${Math.round(distanceKm * 1000)} متر;
}

return ${Math.round(distanceKm).toLocaleString('en-US')} كم;
}

export default function QiblaScreen() {
const [coordinates, setCoordinates] =
useState<Coordinates | null>(null);
const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
const [distanceKm, setDistanceKm] = useState<number | null>(null);
const [heading, setHeading] = useState<number | null>(null);
const [compassAccuracy, setCompassAccuracy] =
useState<CompassQuality>('unknown');
const [isLoading, setIsLoading] = useState(true);
const [isRefreshing, setIsRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [permissionDenied, setPermissionDenied] = useState(false);

const headingSubscriptionRef =
useRef<Location.LocationSubscription | null>(null);
const previousAlignedRef = useRef(false);
const mountedRef = useRef(true);
const locationRequestRef = useRef(false);

const relativeBearing =
qiblaBearing !== null && heading !== null
? getAngularDifference(qiblaBearing, heading)
: 0;

const isAligned =
heading !== null &&
qiblaBearing !== null &&
Math.abs(relativeBearing) <= 5;

const loadLocation = useCallback(async (manual = false) => {
if (locationRequestRef.current) return;

locationRequestRef.current = true;  

if (manual) {  
  setIsRefreshing(true);  
} else {  
  setIsLoading(true);  
}  

setError(null);  
setPermissionDenied(false);  

try {  
  if (Platform.OS === 'web') {  
    throw new Error(  
      'قد لا يدعم المتصفح حساس البوصلة المطلوب. افتح التطبيق على هاتفك.',  
    );  
  }  

  const servicesEnabled = await Location.hasServicesEnabledAsync();  

  if (!servicesEnabled) {  
    throw new Error('فعّل خدمة الموقع في إعدادات الهاتف ثم حاول مجددًا.');  
  }  

  let permission = await Location.getForegroundPermissionsAsync();  

  if (permission.status !== 'granted') {  
    permission = await Location.requestForegroundPermissionsAsync();  
  }  

  if (permission.status !== 'granted') {  
    if (mountedRef.current) {  
      setPermissionDenied(true);  
      setError('يلزم السماح بالوصول إلى الموقع لحساب اتجاه القبلة.');  
    }  
    return;  
  }  

  const position = await Location.getCurrentPositionAsync({  
    accuracy: Location.Accuracy.High,  
  });  

  const nextCoordinates: Coordinates = {  
    latitude: position.coords.latitude,  
    longitude: position.coords.longitude,  
  };  

  if (  
    !Number.isFinite(nextCoordinates.latitude) ||  
    !Number.isFinite(nextCoordinates.longitude) ||  
    Math.abs(nextCoordinates.latitude) > 90 ||  
    Math.abs(nextCoordinates.longitude) > 180  
  ) {  
    throw new Error('تعذر الحصول على إحداثيات موقع صالحة.');  
  }  

  const nextBearing = getQiblaBearing(nextCoordinates);  
  const nextDistance = getDistanceToKaaba(nextCoordinates);  

  if (!Number.isFinite(nextBearing) || !Number.isFinite(nextDistance)) {  
    throw new Error('تعذر حساب اتجاه القبلة. حاول مرة أخرى.');  
  }  

  if (mountedRef.current) {  
    setCoordinates(nextCoordinates);  
    setQiblaBearing(nextBearing);  
    setDistanceKm(nextDistance);  
  }  
} catch (caught) {  
  const message =  
    caught instanceof Error  
      ? caught.message  
      : 'حدث خطأ أثناء تحديد الموقع. حاول مرة أخرى.';  

  if (mountedRef.current) {  
    setError(message);  
  }  
} finally {  
  locationRequestRef.current = false;  

  if (mountedRef.current) {  
    setIsLoading(false);  
    setIsRefreshing(false);  
  }  
}

}, []);

useEffect(() => {
mountedRef.current = true;

loadLocation();  

if (Platform.OS === 'web') {  
  return () => {  
    mountedRef.current = false;  
  };  
}  

let cancelled = false;  

const startHeading = async () => {  
  try {  
    const permission = await Location.getForegroundPermissionsAsync();  

    if (permission.status !== 'granted' || cancelled) {  
      return;  
    }  

    const subscription = await Location.watchHeadingAsync((result) => {  
      if (cancelled || !mountedRef.current) return;  

      const rawHeading =  
        Number.isFinite(result.trueHeading) && result.trueHeading >= 0  
          ? result.trueHeading  
          : result.magHeading;  

      if (!Number.isFinite(rawHeading) || rawHeading < 0) {  
        return;  
      }  

      setHeading(normalizeAngle(rawHeading));  
      setCompassAccuracy(getCompassQuality(result.accuracy));  
    });  

    if (cancelled) {  
      subscription.remove();  
    } else {  
      headingSubscriptionRef.current = subscription;  
    }  
  } catch {  
    if (mountedRef.current && !cancelled) {  
      setError((current) =>  
        current ??  
        'تعذر تشغيل حساس البوصلة. تأكد من دعم الهاتف لهذه الميزة.',  
      );  
    }  
  }  
};  

startHeading();  

return () => {  
  cancelled = true;  
  mountedRef.current = false;  
  headingSubscriptionRef.current?.remove();  
  headingSubscriptionRef.current = null;  
};

}, [loadLocation]);

useEffect(() => {
if (!isAligned) {
previousAlignedRef.current = false;
return;
}

if (!previousAlignedRef.current) {  
  previousAlignedRef.current = true;  
  Haptics.notificationAsync(  
    Haptics.NotificationFeedbackType.Success,  
  ).catch(() => {});  
}

}, [isAligned]);

const refresh = useCallback(() => {
loadLocation(true);
}, [loadLocation]);

const qualityText: Record<CompassQuality, string> = {
high: 'جيدة',
medium: 'متوسطة',
low: 'ضعيفة',
unknown: 'غير معروفة',
};

const qualityColor =
compassAccuracy === 'high'
? COLORS.greenLight
: compassAccuracy === 'medium'
? '#A66D13'
: COLORS.red;

return (
<SafeAreaView style={styles.safeArea}>
<ScrollView  
contentContainerStyle={styles.scrollContent}  
showsVerticalScrollIndicator={false}  
>
<View style={styles.header}>
<View style={styles.headerIcon}>
<Text style={styles.headerIconText}>۞</Text>
</View>

<Text style={styles.headerTitle}>اتجاه القبلة</Text>  
      <Text style={styles.headerSubtitle}>  
        توجّه إلى بيت الله الحرام  
      </Text>  
    </View>  

    <View style={styles.mainCard}>  
      <View style={styles.statusRow}>  
        <View  
          style={[  
            styles.statusDot,  
            { backgroundColor: isAligned ? '#46A879' : COLORS.gold },  
          ]}  
        />  
        <Text style={styles.statusText}>  
          {isAligned  
            ? 'أنت الآن باتجاه القبلة'  
            : heading === null  
              ? 'بانتظار قراءة البوصلة'  
              : 'حرّك الهاتف حتى تتجه إلى القبلة'}  
        </Text>  
      </View>  

      <View style={styles.compassOuter}>  
        <View style={styles.compassRing}>  
          <View  
            style={[  
              styles.compassDial,  
              {  
                transform: [  
                  {  
                    rotate: `${heading === null ? 0 : -heading}deg`,  
                  },  
                ],  
              },  
            ]}  
          >  
            {Array.from({ length: 36 }, (_, index) => {  
              const major = index % 3 === 0;  

              return (  
                <View  
                  key={index}  
                  style={[  
                    styles.tickPosition,  
                    { transform: [{ rotate: `${index * 10}deg` }] },  
                  ]}  
                >  
                  <View  
                    style={[  
                      styles.tick,  
                      major ? styles.majorTick : styles.minorTick,  
                    ]}  
                  />  
                </View>  
              );  
            })}  

            {[  
              { label: 'N', angle: 0 },  
              { label: 'E', angle: 90 },  
              { label: 'S', angle: 180 },  
              { label: 'W', angle: 270 },  
            ].map((item) => (  
              <View  
                key={item.label}  
                style={[  
                  styles.directionPosition,  
                  { transform: [{ rotate: `${item.angle}deg` }] },  
                ]}  
              >  
                <Text  
                  style={[  
                    styles.directionLabel,  
                    { transform: [{ rotate: `${-item.angle}deg` }] },  
                  ]}  
                >  
                  {item.label}  
                </Text>  
              </View>  
            ))}  
          </View>  

          <View style={styles.centerPoint}>  
            <View style={styles.arrowArea}>  
              <View  
                style={[  
                  styles.qiblaArrow,  
                  {  
                    transform: [  
                      { rotate: `${relativeBearing}deg` },  
                    ],  
                  },  
                ]}  
              >  
                <View style={styles.arrowHead} />  
                <View style={styles.arrowStem} />  
              </View>  
            </View>  
            <View style={styles.centerDivider} />  
            <Text style={styles.centerArabic}>القبلة</Text>  
            <Text style={styles.centerEnglish}>QIBLA</Text>  
          </View>  
        </View>  

        <View style={styles.northPointer} />  
      </View>  

      <View style={styles.headingReadout}>  
        <View style={styles.readoutItem}>  
          <Text style={styles.readoutLabel}>اتجاه الهاتف</Text>  
          <Text style={styles.readoutValue}>  
            {heading === null ? '—' : `${Math.round(heading)}°`}  
          </Text>  
        </View>  

        <View style={styles.readoutDivider} />  

        <View style={styles.readoutItem}>  
          <Text style={styles.readoutLabel}>اتجاه القبلة</Text>  
          <Text style={styles.readoutValue}>  
            {qiblaBearing === null  
              ? '—'  
              : `${Math.round(qiblaBearing)}°`}  
          </Text>  
        </View>  
      </View>  

      <View style={styles.alignmentPanel}>  
        <View  
          style={[  
            styles.alignmentIcon,  
            { backgroundColor: isAligned ? '#E3F2E8' : '#F7EED9' },  
          ]}  
        >  
          <Text style={styles.alignmentIconText}>  
            {isAligned ? '✓' : '↑'}  
          </Text>  
        </View>  

        <View style={styles.alignmentCopy}>  
          <Text style={styles.alignmentTitle}>  
            {isAligned ? 'تمت المحاذاة' : 'زاوية التصحيح'}  
          </Text>  
          <Text style={styles.alignmentSubtitle}>  
            {heading === null || qiblaBearing === null  
              ? 'جارٍ تحديد الاتجاه...'  
              : isAligned  
                ? 'أنت ضمن نطاق 5 درجات من اتجاه القبلة'  
                : relativeBearing > 0  
                  ? 'أدر الهاتف نحو اليمين'  
                  : 'أدر الهاتف نحو اليسار'}  
          </Text>  
        </View>  

        <Text style={styles.alignmentDegrees}>  
          {heading === null || qiblaBearing === null  
            ? '—'  
            : `${Math.round(Math.abs(relativeBearing))}°`}  
        </Text>  
      </View>  
    </View>  

    <View style={styles.infoCard}>  
      <Text style={styles.sectionTitle}>معلومات الموقع</Text>  

      {isLoading ? (  
        <View style={styles.loadingRow}>  
          <ActivityIndicator color={COLORS.green} />  
          <Text style={styles.loadingText}>جارٍ تحديد موقعك...</Text>  
        </View>  
      ) : (  
        <>  
          <View style={styles.infoRow}>  
            <Text style={styles.infoLabel}>المسافة إلى الكعبة</Text>  
            <Text style={styles.infoValue}>  
              {distanceKm === null ? '—' : formatDistance(distanceKm)}  
            </Text>  
          </View>  

          <View style={styles.infoRow}>  
            <Text style={styles.infoLabel}>دقة البوصلة</Text>  
            <Text style={[styles.infoValue, { color: qualityColor }]}>  
              {qualityText[compassAccuracy]}  
            </Text>  
          </View>  

          <View style={styles.infoRow}>  
            <Text style={styles.infoLabel}>الموقع</Text>  
            <Text style={styles.infoValue}>  
              {coordinates  
                ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`  
                : 'غير متاح'}  
            </Text>  
          </View>  
        </>  
      )}  

      {compassAccuracy === 'low' && (  
        <View style={styles.warningBox}>  
          <Text style={styles.warningText}>  
            دقة البوصلة منخفضة. ابتعد عن المعادن والمغناطيس، وحرّك الهاتف  
            على شكل رقم 8 لمعايرة الحساس إذا لزم الأمر.  
          </Text>  
        </View>  
      )}  

      {error && (  
        <View style={styles.errorBox}>  
          <Text style={styles.errorText}>{error}</Text>  

          {permissionDenied && (  
            <Text style={styles.errorHint}>  
              يمكنك منح إذن الموقع من إعدادات التطبيق في الهاتف.  
            </Text>  
          )}  
        </View>  
      )}  

      <Pressable  
        accessibilityRole="button"  
        onPress={refresh}  
        disabled={isRefreshing}  
        style={({ pressed }) => [  
          styles.refreshButton,  
          pressed && styles.buttonPressed,  
          isRefreshing && styles.buttonDisabled,  
        ]}  
      >  
        {isRefreshing ? (  
          <ActivityIndicator color={COLORS.white} />  
        ) : (  
          <Text style={styles.refreshButtonText}>  
            تحديث الموقع  
          </Text>  
        )}  
      </Pressable>  
    </View>  

    <Text style={styles.footerText}>  
      للحصول على أفضل نتيجة، أمسك الهاتف بشكل مستوٍ وأبعده عن مصادر  
      التشويش المغناطيسي. اتجاه القبلة محسوب من موقعك الحالي.  
    </Text>  
  </ScrollView>  
</SafeAreaView>

);
}

const styles = StyleSheet.create({
safeArea: {
flex: 1,
backgroundColor: COLORS.ivory,
},
scrollContent: {
paddingHorizontal: 18,
paddingTop: 18,
paddingBottom: 36,
},
header: {
alignItems: 'center',
marginBottom: 22,
},
headerIcon: {
width: 54,
height: 54,
borderRadius: 18,
backgroundColor: COLORS.green,
alignItems: 'center',
justifyContent: 'center',
marginBottom: 10,
},
headerIconText: {
color: COLORS.gold,
fontSize: 31,
},
headerTitle: {
color: COLORS.green,
fontSize: 25,
fontWeight: '800',
},
headerSubtitle: {
color: COLORS.muted,
fontSize: 14,
marginTop: 5,
},
mainCard: {
backgroundColor: COLORS.white,
borderRadius: 26,
paddingHorizontal: 16,
paddingTop: 18,
paddingBottom: 16,
alignItems: 'center',
borderWidth: 1,
borderColor: COLORS.border,
},
statusRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 8,
marginBottom: 16,
},
statusDot: {
width: 8,
height: 8,
borderRadius: 4,
},
statusText: {
color: COLORS.green,
fontSize: 13,
fontWeight: '700',
},
compassOuter: {
width: 278,
height: 278,
alignItems: 'center',
justifyContent: 'center',
marginVertical: 8,
},
compassRing: {
width: 260,
height: 260,
borderRadius: 130,
borderWidth: 9,
borderColor: '#E9E3D6',
backgroundColor: '#FBF9F4',
alignItems: 'center',
justifyContent: 'center',
overflow: 'hidden',
},
compassDial: {
position: 'absolute',
width: 238,
height: 238,
borderRadius: 119,
alignItems: 'center',
justifyContent: 'center',
},
tickPosition: {
position: 'absolute',
width: 238,
height: 238,
alignItems: 'center',
},
tick: {
width: 2,
borderRadius: 2,
backgroundColor: '#B9B4A7',
},
majorTick: {
height: 12,
backgroundColor: COLORS.greenLight,
},
minorTick: {
height: 6,
},
directionPosition: {
position: 'absolute',
width: 238,
height: 238,
alignItems: 'center',
},
directionLabel: {
position: 'absolute',
top: 18,
color: COLORS.green,
fontSize: 13,
fontWeight: '800',
},
centerPoint: {
width: 116,
height: 116,
borderRadius: 58,
backgroundColor: COLORS.green,
borderWidth: 4,
borderColor: '#E8D5A2',
alignItems: 'center',
justifyContent: 'center',
},
arrowArea: {
width: 44,
height: 44,
alignItems: 'center',
justifyContent: 'center',
},
qiblaArrow: {
width: 30,
height: 40,
alignItems: 'center',
justifyContent: 'flex-start',
},
arrowHead: {
width: 0,
height: 0,
borderLeftWidth: 10,
borderRightWidth: 10,
borderBottomWidth: 18,
borderLeftColor: 'transparent',
borderRightColor: 'transparent',
borderBottomColor: COLORS.gold,
},
arrowStem: {
width: 5,
height: 15,
backgroundColor: COLORS.gold,
borderRadius: 3,
marginTop: -1,
},
centerDivider: {
width: 34,
height: 1,
backgroundColor: '#FFFFFF55',
marginTop: 2,
marginBottom: 5,
},
centerArabic: {
color: COLORS.white,
fontSize: 15,
fontWeight: '800',
},
centerEnglish: {
color: '#D9E3D9',
fontSize: 8,
letterSpacing: 2,
marginTop: 2,
},
northPointer: {
position: 'absolute',
top: -1,
width: 0,
height: 0,
borderLeftWidth: 8,
borderRightWidth: 8,
borderBottomWidth: 14,
borderLeftColor: 'transparent',
borderRightColor: 'transparent',
borderBottomColor: COLORS.gold,
},
headingReadout: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'center',
width: '100%',
marginTop: 17,
paddingVertical: 12,
borderTopWidth: 1,
borderTopColor: COLORS.border,
borderBottomWidth: 1,
borderBottomColor: COLORS.border,
},
readoutItem: {
flex: 1,
alignItems: 'center',
gap: 4,
},
readoutLabel: {
color: COLORS.muted,
fontSize: 12,
},
readoutValue: {
color: COLORS.green,
fontSize: 23,
fontWeight: '800',
},
readoutDivider: {
width: 1,
height: 38,
backgroundColor: COLORS.border,
},
alignmentPanel: {
width: '100%',
flexDirection: 'row',
alignItems: 'center',
gap: 10,
backgroundColor: COLORS.ivory,
borderRadius: 17,
padding: 12,
marginTop: 14,
},
alignmentIcon: {
width: 40,
height: 40,
borderRadius: 13,
alignItems: 'center',
justifyContent: 'center',
},
alignmentIconText: {
color: COLORS.green,
fontSize: 23,
fontWeight: '800',
},
alignmentCopy: {
flex: 1,
gap: 4,
},
alignmentTitle: {
color: COLORS.green,
fontSize: 14,
fontWeight: '800',
},
alignmentSubtitle: {
color: COLORS.muted,
fontSize: 11,
lineHeight: 17,
},
alignmentDegrees: {
color: COLORS.green,
fontSize: 20,
fontWeight: '800',
},
infoCard: {
backgroundColor: COLORS.white,
borderRadius: 22,
padding: 17,
marginTop: 16,
borderWidth: 1,
borderColor: COLORS.border,
},
sectionTitle: {
color: COLORS.green,
fontSize: 17,
fontWeight: '800',
marginBottom: 13,
textAlign: 'right',
},
loadingRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'flex-end',
gap: 10,
paddingVertical: 10,
},
loadingText: {
color: COLORS.muted,
fontSize: 13,
},
infoRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
paddingVertical: 11,
borderBottomWidth: 1,
borderBottomColor: '#F0EDE6',
gap: 10,
},
infoLabel: {
color: COLORS.muted,
fontSize: 13,
},
infoValue: {
color: COLORS.green,
fontSize: 13,
fontWeight: '700',
textAlign: 'left',
flexShrink: 1,
},
warningBox: {
backgroundColor: '#FFF5DE',
borderRadius: 12,
padding: 12,
marginTop: 12,
},
warningText: {
color: '#805B1D',
fontSize: 12,
lineHeight: 19,
textAlign: 'right',
},
errorBox: {
backgroundColor: '#FCEAEA',
borderRadius: 12,
padding: 12,
marginTop: 12,
},
errorText: {
color: COLORS.red,
fontSize: 12,
lineHeight: 19,
textAlign: 'right',
},
errorHint: {
color: COLORS.red,
fontSize: 11,
lineHeight: 17,
marginTop: 5,
textAlign: 'right',
},
refreshButton: {
backgroundColor: COLORS.green,
minHeight: 48,
borderRadius: 14,
alignItems: 'center',
justifyContent: 'center',
marginTop: 16,
paddingHorizontal: 18,
},
refreshButtonText: {
color: COLORS.white,
fontSize: 14,
fontWeight: '800',
},
buttonPressed: {
opacity: 0.82,
},
buttonDisabled: {
opacity: 0.65,
},
footerText: {
color: COLORS.muted,
fontSize: 12,
lineHeight: 20,
textAlign: 'center',
marginTop: 16,
paddingHorizontal: 8,
},
});
هل الاحداثيات تحديد اتجاه القبلة
خط العرض 21.422487
خط الطول  39.826206
موجود في الكود ام لا
