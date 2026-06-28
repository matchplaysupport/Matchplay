import SwiftUI

struct PremiumCard<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.94), Color.white.opacity(0.84)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(AppPalette.line, lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.06), radius: 14, x: 0, y: 8)
    }
}

struct AppBadge: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.weight(.bold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(AppPalette.badge, in: Capsule())
            .foregroundColor(AppPalette.fairway)
    }
}

struct StatChip: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased())
                .font(.caption2.weight(.bold))
                .foregroundColor(AppPalette.secondaryText)
            Text(value)
                .font(.subheadline.weight(.bold))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 9)
        .background(AppPalette.panel, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let subtitle: String

    var body: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.caption.weight(.bold))
                    .foregroundColor(AppPalette.secondaryText)
                Text(value)
                    .font(.title3.weight(.heavy))
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(AppPalette.tertiaryText)
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.headline.bold())
            Text(subtitle)
                .font(.footnote)
                .foregroundColor(AppPalette.tertiaryText)
        }
    }
}

struct KeyValueRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label)
                .foregroundColor(AppPalette.secondaryText)
            Spacer()
            Text(value)
                .multilineTextAlignment(.trailing)
                .font(.body.weight(.semibold))
                .foregroundColor(AppPalette.ink)
        }
    }
}

struct AppTextField: View {
    let title: String
    @Binding var text: String

    var body: some View {
            TextField(title, text: $text)
            .textInputAutocapitalization(.never)
            .disableAutocorrection(true)
            .padding(13)
            .background(AppPalette.panel, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(AppPalette.line, lineWidth: 1)
            )
    }
}

struct AppSecureField: View {
    let title: String

    var body: some View {
            SecureField(title, text: .constant("preview"))
            .padding(13)
            .background(AppPalette.panel, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(AppPalette.line, lineWidth: 1)
            )
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(
                LinearGradient(
                    colors: [AppPalette.fairway, AppPalette.fairwayDark],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
            )
            .foregroundColor(.white)
            .scaleEffect(configuration.isPressed ? 0.985 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.bold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(AppPalette.panel, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(AppPalette.line, lineWidth: 1)
            )
            .foregroundColor(AppPalette.ink)
            .scaleEffect(configuration.isPressed ? 0.985 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
    }
}

struct TrendChart: View {
    let points: [TrendPoint]

    private var maxValue: Double { points.map(\.value).max() ?? 1 }
    private var minValue: Double { points.map(\.value).min() ?? 0 }

    var body: some View {
        HStack(alignment: .bottom, spacing: 14) {
            ForEach(points) { point in
                VStack(spacing: 8) {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [AppPalette.gold, AppPalette.fairway],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: max(16, CGFloat((maxValue - point.value) / max(1, maxValue - minValue)) * 90 + 30))
                    Text(point.label)
                        .font(.caption2.bold())
                        .foregroundColor(AppPalette.secondaryText)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.top, 6)
    }
}

struct ProgressMeter: View {
    let progress: Double
    let tint: Color

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.6))
                Capsule().fill(tint).frame(width: geometry.size.width * CGFloat(min(max(progress, 0), 1)))
            }
        }
        .frame(height: 12)
    }
}

struct NotificationBell: View {
    let count: Int

    var body: some View {
        ZStack(alignment: .topTrailing) {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(AppPalette.panel)
                .frame(width: 44, height: 44)
            Image(systemName: "bell.fill")
                .foregroundColor(AppPalette.ink)
            if count > 0 {
                Text("\(count)")
                    .font(.caption2.bold())
                    .foregroundColor(.white)
                    .padding(6)
                    .background(AppPalette.gold, in: Circle())
                    .offset(x: 8, y: -8)
            }
        }
    }
}

struct TeeTimeCard: View {
    @EnvironmentObject private var store: MatchPlayStore
    let teeTime: TeeTime

    var body: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) {
                        AppBadge(text: teeTime.inventoryLabel)
                        Text(teeTime.courseName)
                            .font(.title3.bold())
                        Text("\(teeTime.city), \(teeTime.state) · \(teeTime.distanceMiles) mi")
                            .foregroundColor(AppPalette.secondaryText)
                    }
                    Spacer()
                    ZStack {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(AppPalette.fairway.opacity(0.12))
                            .frame(width: 52, height: 52)
                        Image(systemName: teeTime.imageSymbol)
                            .font(.title2)
                            .foregroundColor(AppPalette.fairway)
                    }
                }

                HStack(spacing: 12) {
                    StatChip(label: "Time", value: teeTime.startLabel)
                    StatChip(label: "Price", value: "$\(teeTime.price)")
                }

                HStack(spacing: 12) {
                    StatChip(label: "Spots", value: "\(teeTime.spots)")
                    StatChip(label: "Format", value: "\(teeTime.holes) holes")
                }

                Text("\(teeTime.walkingAllowed ? "Walking allowed" : "Cart-first") · \(teeTime.cartIncluded ? "Cart included" : "No cart included") · \(String(format: "%.1f", teeTime.courseRating)) rating")
                    .foregroundColor(AppPalette.secondaryText)

                Text(teeTime.cancellation)
                    .font(.footnote)
                    .foregroundColor(AppPalette.secondaryText)

                HStack(spacing: 12) {
                    Button("Details") {
                        store.selectedTeeTime = teeTime
                    }
                    .buttonStyle(SecondaryButtonStyle())

                    Button("Request tee time") {
                        store.beginBooking(teeTime, golfers: store.selectedPartySize.rawValue)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }
            }
        }
    }
}

struct GolferCard: View {
    @EnvironmentObject private var store: MatchPlayStore
    let golfer: DiscoveryGolfer

    var body: some View {
        Button {
            store.selectedGolfer = golfer
        } label: {
            PremiumCard {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Circle()
                            .fill(Color(hex: golfer.accentHex).opacity(0.2))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .foregroundColor(Color(hex: golfer.accentHex))
                            )
                        Spacer()
                        AppBadge(text: golfer.handicapLabel)
                    }
                    Text(golfer.name)
                        .font(.headline)
                        .foregroundColor(AppPalette.ink)
                    Text(golfer.location)
                        .foregroundColor(AppPalette.secondaryText)
                    Text(golfer.vibe)
                        .font(.subheadline.weight(.semibold))
                        .foregroundColor(AppPalette.ink)
                    Text("\(golfer.availability) · \(golfer.matchPlayInterest)")
                        .font(.footnote)
                        .foregroundColor(AppPalette.secondaryText)
                }
                .frame(width: 228, alignment: .leading)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct MessageThreadRow: View {
    let thread: MessageThread

    var body: some View {
        PremiumCard {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(thread.title)
                        .font(.headline)
                    Text(thread.lastMessage)
                        .foregroundColor(AppPalette.secondaryText)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 6) {
                    Text(thread.timeLabel)
                        .font(.caption.bold())
                        .foregroundColor(AppPalette.secondaryText)
                    if thread.unreadCount > 0 {
                        Text("\(thread.unreadCount)")
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(AppPalette.fairway, in: Capsule())
                            .foregroundColor(.white)
                    }
                }
            }
        }
    }
}

func featurePill(_ text: String) -> some View {
    Text(text)
        .font(.caption.weight(.bold))
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(Color.white.opacity(0.72), in: Capsule())
        .foregroundColor(AppPalette.secondaryText)
}
