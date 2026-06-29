import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import {
  colors,
  fontSizes,
  fontWeights,
  radii,
  shadows,
  spacing,
  type ColorPalette,
} from "./theme";

// ─── Theme context ────────────────────────────────────────────────────────────

const ThemeCtx = createContext<ColorPalette>(colors.light);

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return <ThemeCtx.Provider value={palette}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);

// ─── Layout ───────────────────────────────────────────────────────────────────

export function Screen({
  children,
  style,
  noPadding,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; noPadding?: boolean }>) {
  const p = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: p.background,
          paddingHorizontal: noPadding ? 0 : spacing.lg,
          paddingTop: noPadding ? 0 : spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Row({
  children,
  style,
  align = "flex-start",
  gap = spacing.sm,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  align?: ViewStyle["justifyContent"];
  gap?: number;
}>) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", justifyContent: align, gap }, style]}
    >
      {children}
    </View>
  );
}

export function Spacer({ size = spacing.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const p = useTheme();
  return (
    <View
      style={[{ height: StyleSheet.hairlineWidth, backgroundColor: p.border }, style]}
    />
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────

export function DisplayTitle({ children, style }: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  const p = useTheme();
  return (
    <Text style={[{ fontSize: fontSizes.display, fontWeight: fontWeights.heavy, color: p.text, letterSpacing: -0.5 }, style]}>
      {children}
    </Text>
  );
}

export function Title({ children, style, color }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string }>) {
  const p = useTheme();
  return (
    <Text style={[{ fontSize: fontSizes.title, fontWeight: fontWeights.heavy, color: color ?? p.text, letterSpacing: -0.3 }, style]}>
      {children}
    </Text>
  );
}

export function Heading({ children, style, color }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string }>) {
  const p = useTheme();
  return (
    <Text style={[{ fontSize: fontSizes.heading, fontWeight: fontWeights.bold, color: color ?? p.text }, style]}>
      {children}
    </Text>
  );
}

export function Subheading({ children, style, color, numberOfLines }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string; numberOfLines?: number }>) {
  const p = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: fontSizes.subheading, fontWeight: fontWeights.semibold, color: color ?? p.text }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, color, numberOfLines }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string; numberOfLines?: number }>) {
  const p = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: fontSizes.body, fontWeight: fontWeights.regular, color: color ?? p.text, lineHeight: 22 }, style]}>
      {children}
    </Text>
  );
}

export function Muted({ children, style, numberOfLines }: PropsWithChildren<{ style?: StyleProp<TextStyle>; numberOfLines?: number }>) {
  const p = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: fontSizes.small, fontWeight: fontWeights.regular, color: p.muted, lineHeight: 18 }, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, style, color }: PropsWithChildren<{ style?: StyleProp<TextStyle>; color?: string }>) {
  const p = useTheme();
  return (
    <Text style={[{ fontSize: fontSizes.micro, fontWeight: fontWeights.heavy, color: color ?? p.muted, letterSpacing: 1, textTransform: "uppercase" }, style]}>
      {children}
    </Text>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  onPress,
  elevated = false,
}: PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
}>) {
  const p = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: p.surface,
    borderRadius: radii.lg,
    padding: spacing.lg + 2,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: p.border,
    ...(elevated ? shadows.md : shadows.xs),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.94, transform: [{ scale: 0.995 }] },
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useTheme();

  const heights: Record<string, number> = { sm: 38, md: 48, lg: 54 };
  const fontSizeMap: Record<string, number> = { sm: fontSizes.small, md: fontSizes.body, lg: fontSizes.subheading };

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: p.primary, text: p.primaryText },
    secondary: { bg: p.surfaceAlt, text: p.text, border: p.border },
    ghost: { bg: "transparent", text: p.primary },
    danger: { bg: p.danger, text: "#FFFFFF" },
    accent: { bg: p.accent, text: "#FFFFFF" },
  };

  const vs = variantStyles[variant] ?? variantStyles.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: heights[size] ?? 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          borderRadius: radii.full,
          backgroundColor: vs.bg,
          borderWidth: vs.border ? 1 : 0,
          borderColor: vs.border,
          paddingHorizontal: spacing.xl,
          opacity: pressed ? 0.82 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color: vs.text,
              fontWeight: fontWeights.semibold,
              fontSize: fontSizeMap[size] ?? fontSizes.body,
              letterSpacing: 0.1,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────

export function IconButton({
  children,
  onPress,
  size = 44,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radii.full,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function Field({
  label,
  error,
  style,
  ...props
}: TextInputProps & { label?: string; error?: string }) {
  const p = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text style={{ fontSize: fontSizes.small, fontWeight: fontWeights.semibold, color: p.textSecondary }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={p.mutedLight}
        {...props}
        style={[
          {
            minHeight: 50,
            borderRadius: radii.md,
            borderWidth: 1.5,
            borderColor: error ? p.danger : p.border,
            backgroundColor: p.surface,
            color: p.text,
            paddingHorizontal: spacing.md,
            fontSize: fontSizes.body,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={{ fontSize: fontSizes.tiny, color: p.danger }}>{error}</Text>
      ) : null}
    </View>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

type ChipVariant = "default" | "primary" | "accent" | "success" | "warning" | "danger" | "muted";

export function Chip({
  label,
  variant = "default",
  size = "sm",
}: {
  label: string;
  variant?: ChipVariant;
  size?: "xs" | "sm" | "md";
}) {
  const p = useTheme();

  const variantColors: Record<ChipVariant, { bg: string; text: string }> = {
    default: { bg: p.surfaceHigh, text: p.textSecondary },
    primary: { bg: p.successLight, text: p.primary },
    accent: { bg: p.accentBg, text: p.accentText },
    success: { bg: p.successLight, text: p.success },
    warning: { bg: p.warningLight, text: p.warning },
    danger: { bg: p.dangerLight, text: p.danger },
    muted: { bg: p.backgroundAlt, text: p.muted },
  };

  const vc = variantColors[variant] ?? variantColors.default;
  const padH: Record<string, number> = { xs: 7, sm: 9, md: 11 };
  const padV: Record<string, number> = { xs: 3, sm: 4, md: 6 };
  const fs: Record<string, number> = { xs: fontSizes.micro, sm: fontSizes.tiny, md: fontSizes.small };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: radii.full,
        backgroundColor: vc.bg,
        paddingHorizontal: padH[size] ?? 8,
        paddingVertical: padV[size] ?? 3,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: `${vc.text}22`,
      }}
    >
      <Text style={{ color: vc.text, fontWeight: fontWeights.semibold, fontSize: fs[size] ?? fontSizes.tiny, letterSpacing: 0.1 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ count }: { count: number }) {
  const p = useTheme();
  if (count <= 0) return null;
  return (
    <View
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: radii.full,
        backgroundColor: p.danger,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      <Text style={{ color: "#FFF", fontSize: fontSizes.micro, fontWeight: fontWeights.heavy }}>
        {count > 99 ? "99+" : String(count)}
      </Text>
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS: [string, string][] = [
  ["#1A6B40", "#FFFFFF"],
  ["#2C5F8A", "#FFFFFF"],
  ["#7A3B8A", "#FFFFFF"],
  ["#C8981E", "#FFFFFF"],
  ["#AE2119", "#FFFFFF"],
  ["#2A7A6A", "#FFFFFF"],
];

function getAvatarColor(name: string): [string, string] {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] ?? ["#1A6B40", "#FFFFFF"];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

export function Avatar({
  name,
  size = 40,
  style,
}: {
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [bg, fg] = getAvatarColor(name);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radii.full,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.72)",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: fg,
          fontWeight: fontWeights.bold,
          fontSize: Math.round(size * 0.38),
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const p = useTheme();
  return (
    <Row align="space-between" style={{ paddingVertical: spacing.xs }}>
      <Label>{title}</Label>
      {action && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: p.primary }}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </Row>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────

export function StatItem({
  value,
  label,
  style,
  valueColor,
}: {
  value: string;
  label: string;
  style?: StyleProp<ViewStyle>;
  valueColor?: string;
}) {
  const p = useTheme();
  return (
    <View style={[{ alignItems: "center", gap: 2 }, style]}>
      <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.heavy, color: valueColor ?? p.text }}>
        {value}
      </Text>
      <Text style={{ fontSize: fontSizes.micro, fontWeight: fontWeights.medium, color: p.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── List Item ────────────────────────────────────────────────────────────────

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  style,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useTheme();

  const content = (
    <Row align="space-between" style={[{ paddingVertical: spacing.md, gap: spacing.md }, style]}>
      {leading ? <View style={{ flexShrink: 0 }}>{leading}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.medium, color: p.text }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: fontSizes.small, color: p.muted }}>{subtitle}</Text>
        ) : null}
      </View>
      {trailing ? <View style={{ flexShrink: 0 }}>{trailing}</View> : null}
    </Row>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const p = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xxxl, gap: spacing.md }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radii.full,
          backgroundColor: p.surfaceAlt,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <Text style={{ fontSize: fontSizes.subheading, fontWeight: fontWeights.bold, color: p.text, textAlign: "center" }}>
        {title}
      </Text>
      <Text style={{ fontSize: fontSizes.body, color: p.muted, textAlign: "center", maxWidth: 280, lineHeight: 22 }}>
        {body}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}

// ─── Score Descriptor ─────────────────────────────────────────────────────────

export function ScoreDescriptor({
  score,
  par,
}: {
  score: number;
  par: number;
}) {
  const p = useTheme();
  const diff = score - par;
  let label = "PAR";
  let color = p.scorePar;

  if (diff <= -2) { label = "EAGLE"; color = p.scoreEagle; }
  else if (diff === -1) { label = "BIRDIE"; color = p.scoreBirdie; }
  else if (diff === 1) { label = "BOGEY"; color = p.scoreBogey; }
  else if (diff === 2) { label = "DOUBLE"; color = p.scoreDouble; }
  else if (diff >= 3) { label = "+3 OR WORSE"; color = p.scoreDouble; }

  const sign = diff > 0 ? "+" : "";

  return (
    <View style={{ alignItems: "center", gap: 4 }}>
      {diff !== 0 && (
        <Text style={{ fontSize: fontSizes.body, fontWeight: fontWeights.bold, color }}>
          {sign}{diff}
        </Text>
      )}
      <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.heavy, color, letterSpacing: 1.5, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export function ProgressBar({
  progress,
  color,
  height = 6,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const p = useTheme();
  return (
    <View style={{ height, borderRadius: radii.full, backgroundColor: p.backgroundAlt, overflow: "hidden" }}>
      <View
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          borderRadius: radii.full,
          backgroundColor: color ?? p.primary,
        }}
      />
    </View>
  );
}

// ─── Pressable Row ────────────────────────────────────────────────────────────

export function PressableRow({
  children,
  onPress,
  style,
}: PropsWithChildren<{ onPress: () => void; style?: StyleProp<ViewStyle> }>) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: "row", alignItems: "center", gap: spacing.md, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

export function LoadingSpinner({ size = "large" }: { size?: "small" | "large" }) {
  const p = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={size} color={p.primary} />
    </View>
  );
}

// ─── Score Input Control ──────────────────────────────────────────────────────

export function ScoreControl({
  value,
  onDecrement,
  onIncrement,
  minValue = 1,
  maxValue = 15,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minValue?: number;
  maxValue?: number;
}) {
  const p = useTheme();
  return (
    <Row align="center" gap={spacing.xl} style={{ justifyContent: "center" }}>
      <Pressable
        onPress={onDecrement}
        disabled={value <= minValue}
        style={({ pressed }) => ({
          width: 72,
          height: 72,
          borderRadius: radii.full,
          backgroundColor: value <= minValue ? p.backgroundAlt : p.surfaceHigh,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
          ...shadows.sm,
        })}
      >
        <Text style={{ fontSize: 32, fontWeight: fontWeights.bold, color: value <= minValue ? p.mutedLight : p.text, lineHeight: 40 }}>
          −
        </Text>
      </Pressable>

      <Text style={{ fontSize: fontSizes.score, fontWeight: fontWeights.heavy, color: p.text, minWidth: 100, textAlign: "center", lineHeight: fontSizes.score + 12 }}>
        {value}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={value >= maxValue}
        style={({ pressed }) => ({
          width: 72,
          height: 72,
          borderRadius: radii.full,
          backgroundColor: value >= maxValue ? p.backgroundAlt : p.primary,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
          ...shadows.sm,
        })}
      >
        <Text style={{ fontSize: 32, fontWeight: fontWeights.bold, color: value >= maxValue ? p.mutedLight : p.primaryText, lineHeight: 40 }}>
          +
        </Text>
      </Pressable>
    </Row>
  );
}

// ─── Handicap Label ───────────────────────────────────────────────────────────

export function HandicapLabel({
  value,
  source,
  style,
}: {
  value?: number;
  source: "official_unverified" | "match_play_estimate" | "none";
  style?: StyleProp<ViewStyle>;
}) {
  const p = useTheme();
  if (source === "none" || value == null) {
    return (
      <View style={[{ gap: 2 }, style]}>
        <Text style={{ fontSize: fontSizes.heading, fontWeight: fontWeights.heavy, color: p.muted }}>—</Text>
        <Text style={{ fontSize: fontSizes.tiny, color: p.muted }}>No handicap yet</Text>
      </View>
    );
  }

  const isEstimate = source === "match_play_estimate";
  return (
    <View style={[{ gap: 2 }, style]}>
      <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.heavy, color: p.text }}>
        {value.toFixed(1)}
      </Text>
      <Chip
        label={isEstimate ? "Clubhouse Est." : "Self-reported"}
        variant={isEstimate ? "accent" : "primary"}
        size="xs"
      />
    </View>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────

export function SectionSeparator({ label }: { label?: string }) {
  const p = useTheme();
  return (
    <Row align="center" gap={spacing.sm} style={{ paddingVertical: spacing.xs }}>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: p.border }} />
      {label ? (
        <Text style={{ fontSize: fontSizes.tiny, fontWeight: fontWeights.semibold, color: p.mutedLight, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </Text>
      ) : null}
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: p.border }} />
    </Row>
  );
}

// ─── Pill Selector ────────────────────────────────────────────────────────────

export function PillSelector<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  const p = useTheme();
  return (
    <Row gap={spacing.xs}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs + 2,
              borderRadius: radii.full,
              backgroundColor: active ? p.primary : p.surface,
              borderWidth: 1,
              borderColor: active ? p.primary : p.border,
            }}
          >
            <Text
              style={{
                fontSize: fontSizes.small,
                fontWeight: fontWeights.semibold,
                color: active ? p.primaryText : p.muted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </Row>
  );
}
