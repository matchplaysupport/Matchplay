import SwiftUI

struct BookingReviewSheet: View {
    let draft: BookingDraft
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss
    @State private var shareOpenSpots = false
    @State private var priorityWindow = "Prime morning"

    private var updatedDraft: BookingDraft {
        BookingDraft(
            id: draft.id,
            courseName: draft.courseName,
            city: draft.city,
            state: draft.state,
            teeSet: draft.teeSet,
            startLabel: draft.startLabel,
            pricePerPlayer: draft.pricePerPlayer,
            golfers: draft.golfers,
            holes: draft.holes,
            cartIncluded: draft.cartIncluded,
            walkingAllowed: draft.walkingAllowed,
            cancellation: draft.cancellation,
            inventoryLabel: draft.inventoryLabel,
            openSpotsShared: shareOpenSpots ? draft.openSpotsShared : 0,
            notes: draft.notes,
            includesGamesCredit: draft.includesGamesCredit
        )
    }

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Review request")
                            .font(.system(size: 30, weight: .heavy, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                AppBadge(text: draft.inventoryLabel)
                                KeyValueRow(label: "Course", value: draft.courseName)
                                KeyValueRow(label: "Location", value: "\(draft.city), \(draft.state)")
                                KeyValueRow(label: "Start", value: draft.startLabel)
                                KeyValueRow(label: "Tee set", value: draft.teeSet)
                                KeyValueRow(label: "Format", value: "\(draft.holes) holes")
                                KeyValueRow(label: "Party", value: "\(draft.golfers) golfers")
                                KeyValueRow(label: "Price", value: "$\(draft.pricePerPlayer) x \(draft.golfers)")
                                KeyValueRow(label: "Estimated total", value: "$\(draft.pricePerPlayer * draft.golfers)")
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Concierge summary")
                                    .font(.headline)
                                KeyValueRow(label: "Pace window", value: priorityWindow)
                                KeyValueRow(label: "Request value", value: draft.includesGamesCredit ? "Can become an open game" : "Private tee-time request")
                                Toggle("Share extra spots as an open game", isOn: $shareOpenSpots)
                                    .tint(AppPalette.fairway)
                                Text(shareOpenSpots ? "Up to \(draft.openSpotsShared) extra spots will be exposed to nearby players after confirmation." : "This stays private to your group for now.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                                Text(draft.notes)
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                                Text("\(draft.walkingAllowed ? "Walking allowed" : "Cart-first") · \(draft.cartIncluded ? "Cart included" : "Cart not included")")
                                    .foregroundColor(AppPalette.secondaryText)
                                Text(draft.cancellation)
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Request preference")
                                    .font(.headline)
                                Picker("Window", selection: $priorityWindow) {
                                    Text("Prime morning").tag("Prime morning")
                                    Text("Fast twilight").tag("Fast twilight")
                                    Text("Most flexible").tag("Most flexible")
                                }
                                .pickerStyle(SegmentedPickerStyle())
                            }
                        }

                        HStack(spacing: 12) {
                            Button("Back") {
                                dismiss()
                            }
                            .buttonStyle(SecondaryButtonStyle())

                            Button("Send request") {
                                store.confirmBooking(updatedDraft)
                                dismiss()
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        }
                    }
                    .padding(20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct BookingConfirmationSheet: View {
    let booking: Booking
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 18) {
                    Circle()
                        .fill(AppPalette.fairway.opacity(0.14))
                        .frame(width: 82, height: 82)
                        .overlay(
                            Image(systemName: "checkmark")
                                .font(.system(size: 34, weight: .bold))
                                .foregroundColor(AppPalette.fairway)
                        )

                    Text("Request received")
                        .font(.system(size: 30, weight: .bold, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                KeyValueRow(label: "Course", value: booking.courseName)
                                KeyValueRow(label: "When", value: booking.startLabel)
                                KeyValueRow(label: "Tee set", value: booking.teeSet)
                                KeyValueRow(label: "Party", value: "\(booking.golfers) golfers")
                                KeyValueRow(label: "Estimated total", value: "$\(booking.estimatedTotal)")
                                KeyValueRow(label: "Request code", value: booking.confirmationCode)
                                KeyValueRow(label: "Status", value: booking.fulfillmentLabel ?? "Concierge request received")
                                KeyValueRow(label: "Community spots", value: "\(booking.openSpotsShared)")
                                KeyValueRow(label: "Booking note", value: booking.bookingNote)
                            }
                        }

                    Button("Done") {
                        dismiss()
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }
                .padding(24)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct TeeTimeDetailView: View {
    let teeTime: TeeTime
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 28, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [AppPalette.fairway.opacity(0.22), AppPalette.gold.opacity(0.18)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(height: 190)
                            VStack(spacing: 12) {
                                Image(systemName: teeTime.imageSymbol)
                                    .font(.system(size: 44))
                                    .foregroundColor(AppPalette.fairway)
                                Text(teeTime.courseName)
                                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                KeyValueRow(label: "Location", value: "\(teeTime.city), \(teeTime.state)")
                                KeyValueRow(label: "Distance", value: "\(teeTime.distanceMiles) miles")
                                KeyValueRow(label: "Tee set", value: teeTime.teeSet)
                                KeyValueRow(label: "Start", value: teeTime.startLabel)
                                KeyValueRow(label: "Price", value: "$\(teeTime.price) per golfer")
                                KeyValueRow(label: "Availability", value: "\(teeTime.spots) spots")
                                KeyValueRow(label: "Your party", value: "\(store.selectedPartySize.rawValue) golfers")
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Why this round stands out")
                                    .font(.headline)
                                Text(teeTime.description)
                                    .foregroundColor(AppPalette.secondaryText)
                                Text("\(teeTime.walkingAllowed ? "Walking allowed" : "Cart-first") · \(teeTime.cartIncluded ? "Cart included" : "No cart included")")
                                    .foregroundColor(AppPalette.secondaryText)
                                Text(teeTime.cancellation)
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                        }

                        Button("Request this tee time") {
                            store.beginBooking(teeTime, golfers: store.selectedPartySize.rawValue)
                            dismiss()
                        }
                        .buttonStyle(PrimaryButtonStyle())
                    }
                    .padding(20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct RoundDetailView: View {
    let round: RoundSummary

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        Text(round.courseName)
                            .font(.system(size: 32, weight: .heavy, design: .rounded))
                        Text("\(round.dateLabel) · \(round.format) · \(round.teeSet)")
                            .foregroundColor(AppPalette.secondaryText)

                        PremiumCard {
                            HStack(spacing: 18) {
                                MetricCard(title: "Gross", value: "\(round.grossScore)", subtitle: "final score")
                                MetricCard(title: "To Par", value: round.relativeToPar >= 0 ? "+\(round.relativeToPar)" : "\(round.relativeToPar)", subtitle: "relative")
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Round breakdown")
                                    .font(.headline)
                                KeyValueRow(label: "Holes played", value: "\(round.holesPlayed)")
                                KeyValueRow(label: "Fairways hit", value: "\(round.fairwaysHit)")
                                KeyValueRow(label: "Greens in regulation", value: "\(round.greensInRegulation)")
                                KeyValueRow(label: "Total putts", value: "\(round.totalPutts)")
                                KeyValueRow(label: "Best stretch", value: round.bestStretch)
                                KeyValueRow(label: "Verification", value: round.notes)
                            }
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct GolferDetailView: View {
    let golfer: DiscoveryGolfer
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        HStack {
                            Circle()
                                .fill(Color(hex: golfer.accentHex).opacity(0.18))
                                .frame(width: 72, height: 72)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .font(.title2)
                                        .foregroundColor(Color(hex: golfer.accentHex))
                                )
                            VStack(alignment: .leading, spacing: 4) {
                                Text(golfer.name)
                                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                                Text(golfer.location)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                            Spacer()
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                KeyValueRow(label: "Handicap", value: golfer.handicapLabel)
                                KeyValueRow(label: "Availability", value: golfer.availability)
                                KeyValueRow(label: "Match play interest", value: golfer.matchPlayInterest)
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Playing vibe")
                                    .font(.headline)
                                Text(golfer.vibe)
                                    .foregroundColor(AppPalette.secondaryText)
                                Text("Discovery remains privacy-respecting and only uses approximate location.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                        }

                        HStack(spacing: 12) {
                            Button("Interested") {
                                store.markInterested(in: golfer)
                                dismiss()
                            }
                            .buttonStyle(PrimaryButtonStyle())

                            Button("Pass") {
                                store.passOnGolfer(golfer)
                                dismiss()
                            }
                            .buttonStyle(SecondaryButtonStyle())
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct MessageThreadDetailView: View {
    let thread: MessageThread
    @State private var draftMessage = ""
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 16) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 12) {
                            PremiumCard {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(thread.title)
                                        .font(.title3.bold())
                                    Text("Realtime thread ready for match confirmations, open-game coordination, and post-round planning.")
                                        .foregroundColor(AppPalette.secondaryText)
                                }
                            }

                            chatBubble("Maya", "Want to turn Saturday into match play?", accent: AppPalette.fairway.opacity(0.14), alignment: .leading)
                            chatBubble("You", "Yes. Let's make it gross match play from Spruce tees.", accent: AppPalette.gold.opacity(0.16), alignment: .trailing)
                            chatBubble("System", "Group coordination is ready for the concierge request or open game.", accent: Color.white.opacity(0.8), alignment: .leading)
                        }
                        .padding(20)
                    }

                    VStack(spacing: 12) {
                        AppTextField(title: "Message \(thread.title)", text: $draftMessage)
                        Button("Send message") {
                            store.sendMessage(to: thread, body: draftMessage.isEmpty ? "I can make that time. Happy to keep score in Match Play." : draftMessage)
                            draftMessage = ""
                            dismiss()
                        }
                        .buttonStyle(PrimaryButtonStyle())
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct NotificationCenterView: View {
    let initialNotification: NotificationItem
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Notifications")
                            .font(.system(size: 30, weight: .heavy, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(initialNotification.title)
                                    .font(.headline)
                                Text(initialNotification.subtitle)
                                    .foregroundColor(AppPalette.secondaryText)
                                Text(initialNotification.timeLabel)
                                    .font(.caption)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                        }

                        ForEach(store.notifications) { notification in
                            PremiumCard {
                                VStack(alignment: .leading, spacing: 6) {
                                    Text(notification.title)
                                        .font(.headline)
                                    Text(notification.subtitle)
                                        .foregroundColor(AppPalette.secondaryText)
                                    Text(notification.timeLabel)
                                        .font(.caption)
                                        .foregroundColor(AppPalette.secondaryText)
                                }
                            }
                        }
                    }
                    .padding(20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct CreateOpenGameView: View {
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Create open game")
                            .font(.system(size: 30, weight: .heavy, design: .rounded))

                        PremiumCard {
                            VStack(spacing: 12) {
                                AppTextField(title: "Course", text: $store.openGameDraft.courseName)
                                AppTextField(title: "Date and time", text: $store.openGameDraft.dateLabel)
                                AppTextField(title: "Format", text: $store.openGameDraft.format)
                                AppTextField(title: "Walking or cart", text: $store.openGameDraft.walking)

                                HStack {
                                    Stepper("Holes: \(store.openGameDraft.holes)", value: $store.openGameDraft.holes, in: 9...18, step: 9)
                                }
                                HStack {
                                    Stepper("Spots: \(store.openGameDraft.spots)", value: $store.openGameDraft.spots, in: 1...4)
                                }
                                Toggle("Approval required", isOn: $store.openGameDraft.approvalRequired)
                            }
                        }

                        Button("Publish game") {
                            store.createOpenGame()
                            dismiss()
                        }
                        .buttonStyle(PrimaryButtonStyle())
                    }
                    .padding(20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct EditProfileView: View {
    @EnvironmentObject private var store: MatchPlayStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Edit profile")
                            .font(.system(size: 30, weight: .heavy, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                AppTextField(title: "First name", text: $store.profileDraft.firstName)
                                AppTextField(title: "Last name", text: $store.profileDraft.lastName)
                                AppTextField(title: "Username", text: $store.profileDraft.username)
                                AppTextField(title: "City", text: $store.profileDraft.city)
                                AppTextField(title: "State", text: $store.profileDraft.state)
                                AppTextField(title: "Home course", text: $store.profileDraft.homeCourse)
                                AppTextField(title: "Availability", text: $store.profileDraft.availability)
                            }
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Match Play estimate")
                                        .font(.headline)
                                    Text(String(format: "%.1f", store.profileDraft.handicapValue))
                                        .font(.system(size: 34, weight: .heavy, design: .rounded))
                                    Slider(value: $store.profileDraft.handicapValue, in: 0...36, step: 0.1)
                                        .tint(AppPalette.fairway)
                                }

                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Reliability tier")
                                        .font(.headline)
                                    Picker("Reliability", selection: $store.profileDraft.reliabilityLabel) {
                                        Text("Reliable player").tag("Reliable player")
                                        Text("Verified scorer").tag("Verified scorer")
                                        Text("New to network").tag("New to network")
                                    }
                                    .pickerStyle(SegmentedPickerStyle())
                                }

                                VStack(alignment: .leading, spacing: 10) {
                                    Text("Preferred formats")
                                        .font(.headline)
                                    ForEach(MatchFormatOption.allCases, id: \.rawValue) { option in
                                        Button {
                                            store.toggleFormatSelection(option.rawValue, in: &store.profileDraft.preferredFormats)
                                        } label: {
                                            HStack {
                                                Image(systemName: store.profileDraft.preferredFormats.contains(option.rawValue) ? "checkmark.circle.fill" : "circle")
                                                    .foregroundColor(store.profileDraft.preferredFormats.contains(option.rawValue) ? AppPalette.fairway : AppPalette.secondaryText)
                                                Text(option.rawValue)
                                                    .foregroundColor(AppPalette.ink)
                                                Spacer()
                                            }
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 12)
                                            .background(Color.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }

                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Discovery radius")
                                        .font(.headline)
                                    Text("\(Int(store.profileDraft.discoveryRadiusMiles)) miles")
                                        .font(.title3.bold())
                                    Slider(value: $store.profileDraft.discoveryRadiusMiles, in: 5...75, step: 5)
                                        .tint(AppPalette.fairway)
                                }

                                Toggle("Match Play Pro", isOn: $store.profileDraft.proMember)
                                    .tint(AppPalette.fairway)
                                Toggle("Visible in discovery", isOn: $store.profileDraft.isDiscoveryVisible)
                                    .tint(AppPalette.fairway)
                            }
                        }

                        HStack(spacing: 12) {
                            Button("Cancel") {
                                dismiss()
                            }
                            .buttonStyle(SecondaryButtonStyle())

                            Button("Save changes") {
                                store.saveProfileDraft()
                                dismiss()
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        }
                    }
                    .padding(20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

@ViewBuilder
private func chatBubble(_ author: String, _ message: String, accent: Color, alignment: HorizontalAlignment) -> some View {
    VStack(alignment: alignment, spacing: 6) {
        Text(author)
            .font(.caption.bold())
            .foregroundColor(AppPalette.secondaryText)
        Text(message)
            .padding(14)
            .background(accent, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .frame(maxWidth: 280, alignment: alignment == .leading ? .leading : .trailing)
    }
    .frame(maxWidth: .infinity, alignment: alignment == .leading ? .leading : .trailing)
}
