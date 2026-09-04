import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useApp } from "@/src/context/AppContext";
import { analyzeLink, analyzeMessage } from "@/src/lib/analyze";
import { HistoryItem, RiskLevel, ScamTrend } from "@/src/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

type Screen = "home" | "link" | "message" | "screenshot" | "trends" | "history" | "game";
type IconName = keyof typeof Feather.glyphMap;

const riskColors: Record<RiskLevel, string> = {
  LOW: "#24D6B5",
  MEDIUM: "#F5B942",
  HIGH: "#FF6B6B",
  UNASSESSED: "#8EA6B8",
};

const featureTiles: Array<{ label: string; caption: string; icon: IconName; screen: Screen; tone: "teal" | "blue" | "amber" }> = [
  { label: "Check Link", caption: "Spot risky URLs", icon: "link-2", screen: "link", tone: "teal" },
  { label: "Analyze Message", caption: "Decode scam signals", icon: "message-square", screen: "message", tone: "blue" },
  { label: "Screenshot Scanner", caption: "Review a screenshot", icon: "image", screen: "screenshot", tone: "amber" },
  { label: "Scam Trend Scanner", caption: "Know the latest tricks", icon: "activity", screen: "trends", tone: "blue" },
  { label: "Scan History", caption: "Your recent checks", icon: "clock", screen: "history", tone: "teal" },
  { label: "Offline Game", caption: "Learn while you play", icon: "play-circle", screen: "game", tone: "amber" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  const colors = useAppColors();
  return (
    <View style={compact ? styles.logoCompact : styles.logo}>
      <View style={styles.logoMark}>
        <Feather name="shield" size={compact ? 18 : 22} color={colors.primary} />
        <View style={styles.logoDot} />
      </View>
      {!compact && (
        <View>
          <Text style={[styles.logoText, { color: colors.foreground }]}>ScamGuard <Text style={{ color: colors.primary }}>AI</Text></Text>
          <Text style={[styles.logoSubtext, { color: colors.mutedForeground }]}>Pause. Check. Protect.</Text>
        </View>
      )}
    </View>
  );
}

function useAppColors() {
  return {
    background: "#07131F",
    foreground: "#E8F0F6",
    card: "#102333",
    primary: "#24D6B5",
    secondary: "#183346",
    muted: "#142A3A",
    mutedForeground: "#8EA6B8",
    border: "#24465A",
    danger: "#FF6B6B",
    warning: "#F5B942",
    blue: "#6BB7FF",
  };
}

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack: () => void }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screenHeader, { paddingTop: insets.top + 12 }]}>
      <Pressable testID="back-button" onPress={onBack} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? <Text style={[styles.screenSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function OfflinePill({ offline }: { offline: boolean }) {
  const colors = useAppColors();
  return (
    <View style={[styles.offlinePill, { backgroundColor: offline ? "rgba(245,185,66,0.14)" : "rgba(36,214,181,0.12)" }]}>
      <View style={[styles.statusDot, { backgroundColor: offline ? colors.warning : colors.primary }]} />
      <Text style={[styles.offlineText, { color: offline ? colors.warning : colors.primary }]}>{offline ? "Offline Mode" : "Connected"}</Text>
    </View>
  );
}

function RiskBadge({ risk, large = false }: { risk: RiskLevel; large?: boolean }) {
  const color = riskColors[risk];
  return (
    <View style={[styles.riskBadge, large && styles.riskBadgeLarge, { backgroundColor: `${color}18`, borderColor: `${color}45` }]}>
      <View style={[styles.riskDot, { backgroundColor: color }]} />
      <Text style={[styles.riskBadgeText, large && styles.riskBadgeTextLarge, { color }]}>{risk === "UNASSESSED" ? "ANALYSIS UNAVAILABLE" : `${risk} RISK`}</Text>
    </View>
  );
}

function PrimaryButton({ label, icon, onPress, disabled = false, secondary = false }: { label: string; icon?: IconName; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const colors = useAppColors();
  return (
    <Pressable testID={`button-${label.toLowerCase().replaceAll(" ", "-")}`} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, secondary && { backgroundColor: colors.secondary, borderColor: colors.border, borderWidth: 1 }, disabled && { opacity: 0.45 }, pressed && { opacity: 0.78 }]}>
      {icon ? <Feather name={icon} size={17} color={secondary ? colors.foreground : colors.background} /> : null}
      <Text style={[styles.primaryButtonText, { color: secondary ? colors.foreground : colors.background }]}>{label}</Text>
    </Pressable>
  );
}

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const colors = useAppColors();
  const { isOffline, history } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={[styles.homeContent, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Logo />
        <OfflinePill offline={isOffline} />
      </View>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR DIGITAL SAFETY LAYER</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Think before{`\n`}you tap.</Text>
          <Text style={[styles.heroBody, { color: colors.mutedForeground }]}>Check suspicious links, messages, and more with local rules that work even without internet.</Text>
        </View>
        <View style={styles.heroShield}><Feather name="shield" size={48} color={colors.primary} /><View style={styles.heroShieldRing} /></View>
      </View>
      <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick checks</Text><Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>Choose a tool</Text></View>
      <View style={styles.tileGrid}>
        {featureTiles.map((tile) => (
          <Pressable key={tile.label} testID={`tile-${tile.screen}`} onPress={() => onNavigate(tile.screen)} style={({ pressed }) => [styles.featureTile, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
            <View style={[styles.tileIcon, { backgroundColor: tile.tone === "teal" ? "rgba(36,214,181,0.14)" : tile.tone === "amber" ? "rgba(245,185,66,0.14)" : "rgba(107,183,255,0.14)" }]}>
              <Feather name={tile.icon} size={19} color={tile.tone === "teal" ? colors.primary : tile.tone === "amber" ? colors.warning : colors.blue} />
            </View>
            <Text style={[styles.tileLabel, { color: colors.foreground }]}>{tile.label}</Text>
            <Text style={[styles.tileCaption, { color: colors.mutedForeground }]}>{tile.caption}</Text>
            <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} style={styles.tileArrow} />
          </Pressable>
        ))}
      </View>
      <View style={[styles.safetyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.safetyIcon}><Feather name="lock" size={19} color={colors.primary} /></View>
        <View style={{ flex: 1 }}><Text style={[styles.safetyTitle, { color: colors.foreground }]}>Never share your secrets</Text><Text style={[styles.safetyBody, { color: colors.mutedForeground }]}>OTP · UPI PIN · ATM PIN · passwords</Text></View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>ScamGuard AI is a safety-assistance tool. No automated scan can guarantee that a website, message or call is completely safe. Always verify important information through official sources.</Text>
      {history.length > 0 ? <Text style={[styles.recentNote, { color: colors.mutedForeground }]}>{history.length} recent {history.length === 1 ? "scan" : "scans"} saved on this device</Text> : null}
    </ScrollView>
  );
}

function ResultCard({ result }: { result: ReturnType<typeof analyzeLink> }) {
  const colors = useAppColors();
  return (
    <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: `${riskColors[result.risk]}50` }]}>
      <View style={styles.resultTop}><RiskBadge risk={result.risk} large /></View>
      <Text style={[styles.resultTitle, { color: colors.foreground }]}>{result.title}</Text>
      <Text style={[styles.resultType, { color: colors.primary }]}>{result.scamType}</Text>
      <View style={styles.resultDivider} />
      <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>WHY IT WAS FLAGGED</Text>
      {result.reasons.map((reason) => <View key={reason} style={styles.reasonRow}><Feather name="alert-circle" size={15} color={riskColors[result.risk]} /><Text style={[styles.reasonText, { color: colors.foreground }]}>{reason}</Text></View>)}
      <View style={[styles.adviceBox, { backgroundColor: colors.muted }]}><Feather name="shield" size={17} color={colors.primary} /><Text style={[styles.adviceText, { color: colors.foreground }]}>{result.action}</Text></View>
    </View>
  );
}

function ScannerScreen({ kind, onBack }: { kind: "link" | "message"; onBack: () => void }) {
  const colors = useAppColors();
  const { addScan } = useApp();
  const isLink = kind === "link";
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeLink> | null>(null);
  const insets = useSafeAreaInsets();
  const placeholder = isLink ? "Paste a link or website name" : "Paste an SMS, WhatsApp, email, or social message";
  const handleAnalyze = async () => {
    if (!input.trim()) return;
    await Haptics.selectionAsync();
    const next = isLink ? analyzeLink(input) : analyzeMessage(input);
    setResult(next);
    await addScan(isLink ? "LINK" : "MESSAGE", next);
  };
  return (
    <KeyboardAwareScrollViewCompat style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 34 }} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <ScreenHeader title={isLink ? "Check a link" : "Analyze a message"} subtitle={isLink ? "Risk assessment, not a guarantee" : "Paste anything that feels off"} onBack={onBack} />
      <View style={styles.formBody}>
        <View style={[styles.tipBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}><Feather name="info" size={16} color={colors.primary} /><Text style={[styles.tipText, { color: colors.mutedForeground }]}>{isLink ? "Full URLs, website names, and shortened links are supported." : "Local pattern checks work offline and never send your text anywhere."}</Text></View>
        <Text style={[styles.inputLabel, { color: colors.foreground }]}>{isLink ? "Link to check" : "Message content"}</Text>
        <TextInput testID={`${kind}-input`} value={input} onChangeText={setInput} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} autoCapitalize="none" autoCorrect={false} multiline={!isLink} numberOfLines={isLink ? 1 : 7} textAlignVertical={isLink ? "center" : "top"} style={[styles.textInput, { color: colors.foreground, borderColor: input ? colors.primary : colors.border, backgroundColor: colors.card }, !isLink && { minHeight: 156 }]} />
        <PrimaryButton label={isLink ? "Assess link" : "Scan message"} icon="search" onPress={handleAnalyze} disabled={!input.trim()} />
        {result ? <ResultCard result={result} /> : <View style={styles.emptyHint}><Feather name={isLink ? "link" : "message-circle"} size={25} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your result will appear here</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>We look for signals, not certainty. Always verify through an official source.</Text></View>}
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function ScreenshotScreen({ onBack }: { onBack: () => void }) {
  const colors = useAppColors();
  const { addScan } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [didAttempt, setDidAttempt] = useState(false);
  const insets = useSafeAreaInsets();
  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo access needed", "Allow photo access to choose a screenshot for review.");
        return;
      }
      const selected = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
      if (!selected.canceled && selected.assets[0]?.uri) {
        setImageUri(selected.assets[0].uri);
        setDidAttempt(false);
      }
    } catch {
      Alert.alert("Could not open photos", "Please try again or check your device permissions.");
    }
  };
  const analyzeScreenshot = async () => {
    if (!imageUri) return;
    setDidAttempt(true);
    await addScan("SCREENSHOT", { risk: "UNASSESSED", title: "Screenshot not analyzed", scamType: "OCR / AI connection not configured", reasons: ["The screenshot was selected, but this build has no on-device OCR or connected image-analysis service."], action: "Do not act on the message yet. Verify any link, payment request, or account warning directly in the official app.", input: "Screenshot selected" });
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Screenshot scanner" subtitle="Select first, analyze honestly" onBack={onBack} />
      <View style={styles.formBody}>
        <View style={[styles.tipBanner, { backgroundColor: "rgba(245,185,66,0.12)", borderColor: "rgba(245,185,66,0.28)" }]}><Feather name="eye-off" size={16} color={colors.warning} /><Text style={[styles.tipText, { color: colors.foreground }]}>This build prepares the image flow but does not claim OCR or AI analysis until a real analyzer is connected.</Text></View>
        <Pressable testID="pick-screenshot" onPress={pickImage} style={({ pressed }) => [styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.card }, pressed && styles.pressed]}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" /> : <><View style={[styles.uploadIcon, { backgroundColor: colors.muted }]}><Feather name="image" size={25} color={colors.primary} /></View><Text style={[styles.uploadTitle, { color: colors.foreground }]}>Choose a screenshot</Text><Text style={[styles.uploadBody, { color: colors.mutedForeground }]}>From your phone gallery</Text></>}
        </Pressable>
        {imageUri ? <PrimaryButton label="Review screenshot" icon="search" onPress={analyzeScreenshot} /> : null}
        {didAttempt ? <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}><RiskBadge risk="UNASSESSED" large /><Text style={[styles.resultTitle, { color: colors.foreground }]}>Image selected, not analyzed</Text><Text style={[styles.resultType, { color: colors.warning }]}>No OCR / image AI available</Text><View style={styles.resultDivider} /><Text style={[styles.reasonText, { color: colors.mutedForeground }]}>The app will not invent a risk score from pixels it could not read. Connect an OCR or AI service later to detect suspicious links, OTP requests, KYC warnings, payment asks, job offers, courier threats, or APK instructions.</Text><View style={[styles.adviceBox, { backgroundColor: colors.muted }]}><Feather name="shield" size={17} color={colors.primary} /><Text style={[styles.adviceText, { color: colors.foreground }]}>Verify the message in its official app before acting.</Text></View></View> : null}
      </View>
    </ScrollView>
  );
}

function TrendsScreen({ onBack }: { onBack: () => void }) {
  const colors = useAppColors();
  const { trends, trendsSource, trendsUpdatedAt, isOffline, isUpdatingTrends, updateTrends } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const insets = useSafeAreaInsets();
  const handleUpdate = async () => {
    const ok = await updateTrends();
    setUpdateMessage(ok ? "Database refreshed from the trusted backend." : "Could not reach the update service. Showing the last saved database.");
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="🔥 Current Scam Trends" subtitle="Pattern library for awareness" onBack={onBack} />
      <View style={styles.formBody}>
        <View style={styles.trendsMeta}><View style={{ flex: 1 }}><Text style={[styles.metaTitle, { color: colors.foreground }]}>{trendsSource === "Offline database" || isOffline ? "Offline database" : "Trusted advisory database"}</Text><Text style={[styles.metaBody, { color: colors.mutedForeground }]}>{trendsUpdatedAt ? `Last updated ${new Date(trendsUpdatedAt).toLocaleDateString()}` : "Saved locally for offline use"}</Text></View><OfflinePill offline={isOffline} /></View>
        <PrimaryButton label={isUpdatingTrends ? "Updating…" : "Update scam database"} icon="refresh-cw" onPress={handleUpdate} disabled={isUpdatingTrends} secondary />
        {updateMessage ? <Text style={[styles.updateMessage, { color: colors.mutedForeground }]}>{updateMessage}</Text> : null}
        {trends.map((trend) => <TrendCard key={trend.id} trend={trend} expanded={expanded === trend.id} onPress={() => setExpanded(expanded === trend.id ? null : trend.id)} />)}
        <Text style={[styles.sourceNote, { color: colors.mutedForeground }]}>Only use official channels for verification. This library is curated for education and is not a live incident feed.</Text>
      </View>
    </ScrollView>
  );
}

function TrendCard({ trend, expanded, onPress }: { trend: ScamTrend; expanded: boolean; onPress: () => void }) {
  const colors = useAppColors();
  return (
    <Pressable testID={`trend-${trend.id}`} onPress={onPress} style={({ pressed }) => [styles.trendCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
      <View style={styles.trendHeader}><View style={[styles.trendSeverity, { backgroundColor: trend.severity === "high" ? "rgba(255,107,107,0.12)" : "rgba(245,185,66,0.12)" }]}><Text style={{ color: trend.severity === "high" ? colors.danger : colors.warning, fontSize: 10, fontWeight: "700" }}>{trend.severity === "high" ? "HIGH PRIORITY" : "WATCH"}</Text></View><Feather name={expanded ? "chevron-up" : "chevron-down"} size={17} color={colors.mutedForeground} /></View>
      <Text style={[styles.trendName, { color: colors.foreground }]}>{trend.name}</Text>
      <Text style={[styles.trendSummary, { color: colors.mutedForeground }]}>{trend.summary}</Text>
      {expanded ? <View style={styles.trendDetails}><Text style={[styles.detailLabel, { color: colors.primary }]}>HOW IT WORKS</Text><Text style={[styles.detailText, { color: colors.foreground }]}>{trend.howItWorks}</Text><Text style={[styles.detailLabel, { color: colors.primary }]}>WARNING SIGNS</Text>{trend.warningSigns.map((sign) => <View key={sign} style={styles.bulletRow}><View style={[styles.bullet, { backgroundColor: colors.primary }]} /><Text style={[styles.detailText, { color: colors.foreground }]}>{sign}</Text></View>)}<Text style={[styles.detailLabel, { color: colors.primary }]}>WHAT TO DO</Text><Text style={[styles.detailText, { color: colors.foreground }]}>{trend.whatToDo}</Text></View> : null}
    </Pressable>
  );
}

function HistoryScreen({ onBack }: { onBack: () => void }) {
  const colors = useAppColors();
  const { history, clearHistory } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Scan history" subtitle="Stored only on this device" onBack={onBack} />
      <View style={styles.formBody}>
        {history.length ? <><View style={styles.historyToolbar}><Text style={[styles.metaTitle, { color: colors.foreground }]}>{history.length} {history.length === 1 ? "scan" : "scans"}</Text><Pressable testID="clear-history" onPress={() => Alert.alert("Clear scan history?", "This cannot be undone.", [{ text: "Cancel", style: "cancel" }, { text: "Clear", style: "destructive", onPress: clearHistory }])}><Text style={[styles.clearText, { color: colors.danger }]}>Clear History</Text></Pressable></View>{history.map((item) => <HistoryRow key={item.id} item={item} />)}</> : <View style={styles.emptyHint}><Feather name="clock" size={27} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scans yet</Text><Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Your last 50 link, message, and screenshot scans will appear here.</Text></View>}
      </View>
    </ScrollView>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const colors = useAppColors();
  return (
    <View style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.historyIcon}><Feather name={item.type === "LINK" ? "link-2" : item.type === "MESSAGE" ? "message-square" : "image"} size={16} color={riskColors[item.risk]} /></View><View style={{ flex: 1 }}><View style={styles.historyTop}><Text style={[styles.historyType, { color: colors.foreground }]}>{item.type}</Text><Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{new Date(item.createdAt).toLocaleDateString()}</Text></View><Text numberOfLines={1} style={[styles.historyInput, { color: colors.mutedForeground }]}>{item.input}</Text><Text numberOfLines={1} style={[styles.historyScam, { color: colors.primary }]}>{item.scamType}</Text></View><RiskBadge risk={item.risk} /></View>
  );
}

function GameScreen({ onBack }: { onBack: () => void }) {
  const colors = useAppColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gameWidth = Math.min(width - 32, 430);
  const gameHeight = 430;
  const [birdY, setBirdY] = useState(190);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Array<{ x: number; gapY: number; passed: boolean }>>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const velocityRef = useRef(0);
  const birdRef = useRef(190);
  const pipesRef = useRef<Array<{ x: number; gapY: number; passed: boolean }>>([]);
  const scoreRef = useRef(0);
  useEffect(() => { if (!running) return; const timer = setInterval(() => { const nextVelocity = velocityRef.current + 0.72; const nextBird = birdRef.current + nextVelocity; let nextPipes = pipesRef.current.map((pipe) => ({ ...pipe, x: pipe.x - 3.2 })); if (!nextPipes.length || nextPipes[nextPipes.length - 1].x < gameWidth - 175) nextPipes = [...nextPipes, { x: gameWidth + 30, gapY: 100 + Math.random() * 170, passed: false }]; let nextScore = scoreRef.current; nextPipes = nextPipes.map((pipe) => { if (!pipe.passed && pipe.x + 48 < 48) { nextScore += 1; return { ...pipe, passed: true }; } return pipe; }).filter((pipe) => pipe.x > -80); const hitPipe = nextPipes.some((pipe) => pipe.x < 72 && pipe.x + 48 > 32 && (nextBird < pipe.gapY || nextBird + 28 > pipe.gapY + 128)); if (nextBird < 0 || nextBird + 28 > gameHeight || hitPipe) { setRunning(false); setGameOver(true); setBest((current) => Math.max(current, nextScore)); return; } velocityRef.current = nextVelocity; birdRef.current = nextBird; pipesRef.current = nextPipes; scoreRef.current = nextScore; setVelocity(nextVelocity); setBirdY(nextBird); setPipes(nextPipes); setScore(nextScore); }, 32); return () => clearInterval(timer); }, [gameHeight, gameWidth, running]);
  const start = () => { birdRef.current = 190; velocityRef.current = 0; pipesRef.current = [{ x: gameWidth + 30, gapY: 120, passed: false }]; scoreRef.current = 0; setBirdY(190); setVelocity(0); setPipes(pipesRef.current); setScore(0); setGameOver(false); setRunning(true); };
  const flap = () => { if (!running) { start(); return; } velocityRef.current = -8.5; setVelocity(-8.5); };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: insets.bottom }}>
      <ScreenHeader title="ScamGuard Bird" subtitle="Tap to rise. Stay alert." onBack={onBack} />
      <View style={styles.gameBody}><View style={styles.scoreLine}><View><Text style={[styles.gameScoreLabel, { color: colors.mutedForeground }]}>SCORE</Text><Text style={[styles.gameScore, { color: colors.foreground }]}>{score}</Text></View><View style={{ alignItems: "flex-end" }}><Text style={[styles.gameScoreLabel, { color: colors.mutedForeground }]}>BEST</Text><Text style={[styles.gameScore, { color: colors.primary }]}>{best}</Text></View></View><Pressable testID="game-board" onPress={flap} style={[styles.gameBoard, { width: gameWidth, height: gameHeight, backgroundColor: "#0B2532", borderColor: colors.border }]}><View style={[styles.gameSun, { backgroundColor: colors.warning }]} /><View style={[styles.bird, { top: birdY, backgroundColor: colors.warning, transform: [{ rotate: `${Math.max(-20, Math.min(55, velocity * 3))}deg` }] }]}><View style={styles.birdEye} /><View style={[styles.birdBeak, { borderLeftColor: colors.danger }]} /></View>{pipes.map((pipe) => <React.Fragment key={`${pipe.x}-${pipe.gapY}`}><View style={[styles.pipe, { left: pipe.x, top: 0, height: pipe.gapY, backgroundColor: colors.primary }]} /><View style={[styles.pipeCap, { left: pipe.x - 5, top: pipe.gapY - 16, backgroundColor: colors.primary }]} /><View style={[styles.pipe, { left: pipe.x, top: pipe.gapY + 128, bottom: 0, backgroundColor: colors.primary }]} /><View style={[styles.pipeCap, { left: pipe.x - 5, top: pipe.gapY + 128, backgroundColor: colors.primary }]} /></React.Fragment>)}{!running ? <View style={styles.gameOverlay}><Feather name={gameOver ? "rotate-ccw" : "play"} size={29} color={colors.primary} /><Text style={[styles.gameOverlayTitle, { color: colors.foreground }]}>{gameOver ? "Round over" : "Tap to start"}</Text><Text style={[styles.gameOverlayBody, { color: colors.mutedForeground }]}>{gameOver ? "Tap to try again" : "Avoid the barriers"}</Text></View> : null}</Pressable><Text style={[styles.gameTip, { color: colors.mutedForeground }]}>Original shapes, fully offline. Tap anywhere on the board to flap.</Text>{gameOver ? <PrimaryButton label="Restart game" icon="rotate-ccw" onPress={start} /> : null}</View>
    </View>
  );
}

function EmergencySection() {
  const colors = useAppColors();
  return <View style={[styles.emergencyCard, { backgroundColor: "rgba(255,107,107,0.10)", borderColor: "rgba(255,107,107,0.30)" }]}><View style={styles.emergencyTop}><Feather name="alert-triangle" size={19} color={colors.danger} /><Text style={[styles.emergencyTitle, { color: colors.foreground }]}>Lost money or shared details?</Text></View><Text style={[styles.emergencyBody, { color: colors.mutedForeground }]}>Call the Cyber Crime Helpline at 1930 immediately.</Text><PrimaryButton label="Report Cyber Fraud" icon="external-link" onPress={() => Linking.openURL("https://cybercrime.gov.in/")} secondary /></View>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const colors = useAppColors();
  const { isOffline } = useApp();
  const navigate = (next: Screen) => { Haptics.selectionAsync(); setScreen(next); };
  if (screen === "home") return <><HomeScreen onNavigate={navigate} /><View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border }]}><NavItem icon="home" label="Home" active onPress={() => navigate("home")} /><NavItem icon="activity" label="Trends" onPress={() => navigate("trends")} /><NavItem icon="clock" label="History" onPress={() => navigate("history")} /><NavItem icon="alert-triangle" label="Emergency" onPress={() => Alert.alert("Cyber Crime Helpline", "Call 1930 now, or open the official reporting portal.", [{ text: "Call 1930", onPress: () => Linking.openURL("tel:1930") }, { text: "Open portal", onPress: () => Linking.openURL("https://cybercrime.gov.in/") }, { text: "Cancel", style: "cancel" }])} /></View></>;
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{screen === "link" ? <ScannerScreen kind="link" onBack={() => setScreen("home")} /> : screen === "message" ? <ScannerScreen kind="message" onBack={() => setScreen("home")} /> : screen === "screenshot" ? <ScreenshotScreen onBack={() => setScreen("home")} /> : screen === "trends" ? <TrendsScreen onBack={() => setScreen("home")} /> : screen === "history" ? <HistoryScreen onBack={() => setScreen("home")} /> : <GameScreen onBack={() => setScreen("home")} />}{screen !== "game" ? <EmergencySection /> : null}{isOffline ? <View style={styles.floatingOffline}><OfflinePill offline /></View> : null}</View>;
}

function NavItem({ icon, label, active = false, onPress }: { icon: IconName; label: string; active?: boolean; onPress: () => void }) {
  const colors = useAppColors();
  return <Pressable testID={`nav-${label.toLowerCase()}`} onPress={onPress} style={styles.navItem}><Feather name={icon} size={19} color={active ? colors.primary : colors.mutedForeground} /><Text style={[styles.navLabel, { color: active ? colors.primary : colors.mutedForeground }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  homeContent: { paddingHorizontal: 18 },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  logo: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCompact: { flexDirection: "row", alignItems: "center" },
  logoMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: "rgba(36,214,181,0.14)", alignItems: "center", justifyContent: "center", position: "relative" },
  logoDot: { position: "absolute", width: 5, height: 5, borderRadius: 3, backgroundColor: "#F5B942", right: 8, top: 8 },
  logoText: { fontSize: 18, fontWeight: "700", letterSpacing: -0.5 },
  logoSubtext: { fontSize: 10, marginTop: 2, letterSpacing: 0.4 },
  offlinePill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  offlineText: { fontSize: 11, fontWeight: "700" },
  hero: { marginTop: 28, borderRadius: 24, padding: 22, backgroundColor: "#0E2D3C", minHeight: 192, overflow: "hidden", flexDirection: "row", justifyContent: "space-between" },
  heroCopy: { flex: 1, zIndex: 2 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.3, marginBottom: 11 },
  heroTitle: { fontSize: 38, lineHeight: 42, fontWeight: "700", letterSpacing: -1.4 },
  heroBody: { fontSize: 13, lineHeight: 19, marginTop: 13, maxWidth: 250 },
  heroShield: { width: 100, height: 120, alignItems: "center", justifyContent: "center", marginTop: 12, marginRight: -8, opacity: 0.95 },
  heroShieldRing: { position: "absolute", width: 103, height: 103, borderRadius: 52, borderWidth: 1, borderColor: "rgba(36,214,181,0.25)" },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionHint: { fontSize: 12 },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureTile: { width: "48.3%", minHeight: 133, borderRadius: 18, borderWidth: 1, padding: 14, position: "relative" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  tileIcon: { width: 35, height: 35, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 11 },
  tileLabel: { fontSize: 14, fontWeight: "700", maxWidth: 125 },
  tileCaption: { fontSize: 11, marginTop: 5 },
  tileArrow: { position: "absolute", right: 12, bottom: 13 },
  safetyCard: { marginTop: 16, borderRadius: 17, borderWidth: 1, padding: 15, flexDirection: "row", alignItems: "center", gap: 11 },
  safetyIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: "rgba(36,214,181,0.13)", alignItems: "center", justifyContent: "center" },
  safetyTitle: { fontSize: 13, fontWeight: "700" },
  safetyBody: { fontSize: 11, marginTop: 4 },
  disclaimer: { fontSize: 10, lineHeight: 15, marginTop: 20, textAlign: "center", paddingHorizontal: 5 },
  recentNote: { fontSize: 11, textAlign: "center", marginTop: 12 },
  bottomNav: { position: "absolute", bottom: 0, left: 14, right: 14, height: 69, borderRadius: 22, borderWidth: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: Platform.OS === "web" ? 8 : 2 },
  navItem: { alignItems: "center", justifyContent: "center", minWidth: 62, gap: 4 },
  navLabel: { fontSize: 10, fontWeight: "600" },
  screenHeader: { paddingHorizontal: 18, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#102333", alignItems: "center", justifyContent: "center" },
  screenTitle: { fontSize: 23, fontWeight: "700", letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 12, marginTop: 4 },
  formBody: { paddingHorizontal: 18 },
  tipBanner: { borderRadius: 15, borderWidth: 1, padding: 13, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 22 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  inputLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  textInput: { borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, minHeight: 52, marginBottom: 13 },
  primaryButton: { height: 50, borderRadius: 15, backgroundColor: "#24D6B5", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { fontSize: 14, fontWeight: "700" },
  emptyHint: { alignItems: "center", paddingHorizontal: 28, paddingTop: 52 },
  emptyTitle: { fontSize: 15, fontWeight: "700", marginTop: 14 },
  emptyBody: { fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 6 },
  resultCard: { borderRadius: 19, borderWidth: 1, padding: 17, marginTop: 20 },
  resultTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  riskBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5, alignSelf: "flex-start" },
  riskBadgeLarge: { paddingHorizontal: 11, paddingVertical: 7 },
  riskDot: { width: 6, height: 6, borderRadius: 3 },
  riskBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  riskBadgeTextLarge: { fontSize: 10 },
  resultTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  resultType: { fontSize: 12, fontWeight: "700", marginTop: 5 },
  resultDivider: { height: 1, backgroundColor: "#24465A", marginVertical: 17 },
  resultLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  reasonRow: { flexDirection: "row", gap: 9, marginBottom: 9, alignItems: "flex-start" },
  reasonText: { flex: 1, fontSize: 13, lineHeight: 19 },
  adviceBox: { borderRadius: 13, padding: 12, flexDirection: "row", gap: 9, marginTop: 10, alignItems: "flex-start" },
  adviceText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  uploadBox: { minHeight: 238, borderRadius: 19, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  uploadIcon: { width: 57, height: 57, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 13 },
  uploadTitle: { fontSize: 16, fontWeight: "700" },
  uploadBody: { fontSize: 12, marginTop: 5 },
  previewImage: { width: "100%", height: 238 },
  trendsMeta: { flexDirection: "row", alignItems: "center", marginBottom: 13 },
  metaTitle: { fontSize: 14, fontWeight: "700" },
  metaBody: { fontSize: 11, marginTop: 4 },
  updateMessage: { fontSize: 11, lineHeight: 16, marginTop: 10, marginBottom: 2 },
  trendCard: { borderRadius: 17, borderWidth: 1, padding: 15, marginTop: 11 },
  trendHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trendSeverity: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  trendName: { fontSize: 15, fontWeight: "700", marginTop: 12 },
  trendSummary: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  trendDetails: { borderTopWidth: 1, borderTopColor: "#24465A", marginTop: 14, paddingTop: 14 },
  detailLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 9, marginBottom: 5 },
  detailText: { fontSize: 12, lineHeight: 18 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 6 },
  sourceNote: { fontSize: 10, lineHeight: 15, marginTop: 20, textAlign: "center" },
  historyToolbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  clearText: { fontSize: 12, fontWeight: "700" },
  historyRow: { borderRadius: 15, borderWidth: 1, padding: 12, flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 9 },
  historyIcon: { width: 33, height: 33, borderRadius: 10, backgroundColor: "#142A3A", alignItems: "center", justifyContent: "center" },
  historyTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  historyType: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  historyDate: { fontSize: 10 },
  historyInput: { fontSize: 12, marginTop: 5 },
  historyScam: { fontSize: 10, fontWeight: "600", marginTop: 4 },
  emergencyCard: { margin: 18, borderRadius: 17, borderWidth: 1, padding: 15 },
  emergencyTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  emergencyTitle: { fontSize: 14, fontWeight: "700" },
  emergencyBody: { fontSize: 12, marginTop: 8, marginBottom: 13 },
  floatingOffline: { position: "absolute", top: 56, right: 16 },
  gameBody: { alignItems: "center", paddingHorizontal: 16, flex: 1 },
  scoreLine: { width: "100%", maxWidth: 430, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, marginBottom: 12 },
  gameScoreLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  gameScore: { fontSize: 28, fontWeight: "700", marginTop: 2 },
  gameBoard: { borderRadius: 23, borderWidth: 1, overflow: "hidden", position: "relative" },
  gameSun: { width: 46, height: 46, borderRadius: 23, position: "absolute", top: 26, right: 28, opacity: 0.9 },
  bird: { width: 29, height: 24, borderRadius: 14, position: "absolute", left: 35, zIndex: 5 },
  birdEye: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#07131F", position: "absolute", top: 6, right: 7 },
  birdBeak: { position: "absolute", right: -7, top: 9, width: 0, height: 0, borderTopWidth: 4, borderBottomWidth: 4, borderLeftWidth: 8, borderTopColor: "transparent", borderBottomColor: "transparent" },
  pipe: { width: 38, position: "absolute", borderRadius: 6 },
  pipeCap: { width: 48, height: 16, position: "absolute", borderRadius: 6 },
  gameOverlay: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7,19,31,0.42)" },
  gameOverlayTitle: { fontSize: 20, fontWeight: "700", marginTop: 9 },
  gameOverlayBody: { fontSize: 12, marginTop: 4 },
  gameTip: { fontSize: 11, textAlign: "center", marginVertical: 13 },
});