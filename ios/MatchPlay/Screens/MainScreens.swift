import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Good afternoon")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundColor(AppPalette.tertiaryText)
                                Text(store.profile.firstName)
                                    .font(.system(size: 34, weight: .heavy, design: .rounded))
                                Text("Your next best golf move is lined up.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                            Spacer()
                            Button {
                                if let first = store.notifications.first {
                                    store.selectedNotification = first
                                }
                            } label: {
                                NotificationBell(count: store.notifications.count)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 14) {
                                HStack {
                                    AppBadge(text: store.profile.handicapLabel)
                                    Spacer()
                                    Text(store.profile.proMember ? "PRO" : "FREE")
                                        .font(.caption2.bold())
                                        .foregroundColor(AppPalette.fairway)
                                }

                                HStack(alignment: .top, spacing: 14) {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(String(format: "%.1f", store.profile.handicapValue))
                                            .font(.system(size: 42, weight: .heavy, design: .rounded))
                                        Text("trend improving")
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.fairway)
                                    }
                                    Spacer()
                                    VStack(alignment: .leading, spacing: 8) {
                                        dashboardLine(label: "Home course", value: store.profile.homeCourse)
                                        dashboardLine(label: "Availability", value: store.profile.availability)
                                    }
                                }

                                Text("Clearly labeled as a Match Play estimate. Never represented as an official USGA Handicap Index.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.tertiaryText)

                                TrendChart(points: store.handicapTrend)
                            }
                        }

                        HStack(spacing: 10) {
                            MetricCard(title: "Upcoming", value: "\(store.bookings.count)", subtitle: "tee-time requests")
                            MetricCard(title: "Open Games", value: "\(store.joinedGamesCount)", subtitle: "active requests")
                            MetricCard(title: "Leaderboard", value: "#2", subtitle: "TN monthly")
                        }

                        SectionHeader(title: "This Week", subtitle: "The rounds and matches that matter next")
                        if let booking = store.bookings.first {
                            PremiumCard {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 6) {
                                            Text(booking.courseName)
                                                .font(.headline.bold())
                                            Text("\(booking.startLabel) · \(booking.teeSet) tees")
                                                .font(.subheadline)
                                            Text("\(booking.confirmationCode) · \(booking.fulfillmentLabel ?? "Request in progress")")
                                                .font(.footnote)
                                                .foregroundColor(AppPalette.secondaryText)
                                        }
                                        Spacer()
                                        VStack(alignment: .trailing, spacing: 4) {
                                            Text("$\(booking.estimatedTotal)")
                                                .font(.title3.bold())
                                            Text("\(booking.golfers) golfers")
                                                .font(.footnote)
                                                .foregroundColor(AppPalette.secondaryText)
                                        }
                                    }
                                    if booking.openSpotsShared > 0 {
                                        Text("\(booking.openSpotsShared) community spot open")
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundColor(AppPalette.gold)
                                    }
                                    Text(booking.bookingNote)
                                        .font(.footnote)
                                        .foregroundColor(AppPalette.tertiaryText)
                                }
                            }
                        }

                        if let game = store.nextBestGame {
                            SectionHeader(title: "Recommended Match", subtitle: "A nearby game worth acting on")
                            PremiumCard {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(game.courseName)
                                            .font(.headline.bold())
                                        Spacer()
                                        AppBadge(text: game.approvalRequired ? "Host review" : "Instant join")
                                    }
                                    Text("\(game.dateLabel) · \(game.holes) holes · \(game.format)")
                                        .font(.subheadline)
                                    Text("Hosted by \(game.hostName) · \(game.walking)")
                                        .font(.footnote)
                                        .foregroundColor(AppPalette.secondaryText)
                                    if game.requestState == .requested {
                                        Text("Request pending")
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.gold)
                                    } else if game.requestState == .joined {
                                        Text("You're in this game")
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.fairway)
                                    }
                                }
                            }
                        }

                        SectionHeader(title: "Traction Funnel", subtitle: "Preview route instrumentation")
                        PremiumCard {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(store.tractionSummary)
                                    .font(.headline)
                                Text("Tracked for the investor route: searches, requests, joins, submitted rounds, and messages.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                            }
                        }

                        SectionHeader(title: "Suggested Golfers", subtitle: "Better-fit players for your current availability")
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(store.discoveryGolfers) { golfer in
                                    GolferCard(golfer: golfer)
                                }
                            }
                            .padding(.horizontal, 2)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 20)
                }
            }
            .navigationBarHidden(true)
            .sheet(item: $store.selectedGolfer) { golfer in
                GolferDetailView(golfer: golfer)
            }
            .sheet(item: $store.selectedNotification) { notification in
                NotificationCenterView(initialNotification: notification)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct TeeTimesView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                VStack(spacing: 10) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Tee Times")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                        AppTextField(title: "Search city, ZIP, or course", text: $store.searchText)
                        Button("Search Nashville preview") {
                            store.trackSearch()
                        }
                        .buttonStyle(PrimaryButtonStyle())
                        Picker("Sort", selection: $store.selectedSort) {
                            ForEach(TeeTimeSort.allCases, id: \.self) { option in
                                Text(option.rawValue).tag(option)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                partySizePicker
                                toggleChip(title: "Walking", isOn: $store.filterWalkingOnly)
                                toggleChip(title: "18 holes", isOn: $store.filterEighteenOnly)
                                AppBadge(text: "Under $\(Int(store.maxPrice))")
                            }
                            .padding(.horizontal, 2)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("Max price")
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text("$\(Int(store.maxPrice))")
                                    .font(.subheadline.bold())
                                    .foregroundColor(AppPalette.fairway)
                            }
                            Slider(value: $store.maxPrice, in: 25...120, step: 5)
                                .tint(AppPalette.fairway)
                        }

                        HStack {
                            AppBadge(text: "\(store.activeFiltersCount) active filters")
                            Spacer()
                            Button("Reset filters") {
                                store.resetTeeTimeFilters()
                            }
                            .font(.footnote.bold())
                            .foregroundColor(AppPalette.secondaryText)
                            Text("Concierge supported")
                                .font(.footnote.bold())
                                .foregroundColor(AppPalette.fairway)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)

                    ScrollView {
                        LazyVStack(spacing: 10) {
                            ForEach(store.filteredTeeTimes) { teeTime in
                                TeeTimeCard(teeTime: teeTime)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 18)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(item: $store.bookingDraft) { draft in
                BookingReviewSheet(draft: draft)
            }
            .sheet(item: $store.selectedBooking) { booking in
                BookingConfirmationSheet(booking: booking)
            }
            .sheet(item: $store.selectedTeeTime) { teeTime in
                TeeTimeDetailView(teeTime: teeTime)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

private extension TeeTimesView {
    var partySizePicker: some View {
        Menu {
            ForEach(TeeTimePartySize.allCases, id: \.self) { size in
                Button("\(size.label) golfers") {
                    store.selectedPartySize = size
                }
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "person.2.fill")
                Text("\(store.selectedPartySize.rawValue) golfers")
                    .font(.caption.bold())
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.white.opacity(0.72), in: Capsule())
            .foregroundColor(AppPalette.ink)
        }
    }

    func toggleChip(title: String, isOn: Binding<Bool>) -> some View {
        Button {
            isOn.wrappedValue.toggle()
        } label: {
            Text(title)
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(isOn.wrappedValue ? AppPalette.badge : Color.white.opacity(0.72), in: Capsule())
                .foregroundColor(isOn.wrappedValue ? AppPalette.fairway : AppPalette.ink)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct PlayView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Play")
                            .font(.system(size: 32, weight: .bold, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 16) {
                                HStack {
                                    AppBadge(text: store.holesCompleted < 18 ? "Draft autosaved" : "Profile updates on submit")
                                    Spacer()
                                    Text("Hole \(store.liveHoleDraft.holeNumber)")
                                        .font(.headline)
                                }

                                HStack(spacing: 18) {
                                    VStack(alignment: .leading, spacing: 6) {
                                        Text("Total")
                                            .font(.caption)
                                            .foregroundColor(AppPalette.secondaryText)
                                        Text("\(store.totalScore)")
                                            .font(.system(size: 42, weight: .heavy, design: .rounded))
                                    }
                                    VStack(alignment: .leading, spacing: 6) {
                                        Text("Putts")
                                            .font(.caption)
                                            .foregroundColor(AppPalette.secondaryText)
                                        Text("\(store.totalPutts)")
                                            .font(.system(size: 28, weight: .bold, design: .rounded))
                                    }
                                    VStack(alignment: .leading, spacing: 6) {
                                        Text("Progress")
                                            .font(.caption)
                                            .foregroundColor(AppPalette.secondaryText)
                                        Text("\(store.holesCompleted)/18")
                                            .font(.system(size: 28, weight: .bold, design: .rounded))
                                    }
                                    Spacer()
                                }

                                HStack(spacing: 14) {
                                    MetricCard(title: "To Par", value: store.scoreToPar >= 0 ? "+\(store.scoreToPar)" : "\(store.scoreToPar)", subtitle: "through \(store.holesCompleted)")
                                    MetricCard(title: "FIR / GIR", value: "\(store.fairwaysHitCount) / \(store.girCount)", subtitle: "ball striking")
                                    MetricCard(title: "Avg", value: store.scoringAverageLabel, subtitle: "strokes per hole")
                                }

                                HStack(spacing: 14) {
                                    MetricCard(title: "Next", value: store.nextHoleParLabel, subtitle: "current draft")
                                    MetricCard(title: "Last 3", value: store.lastThreeAverageLabel, subtitle: "scoring trend")
                                    MetricCard(title: "Driving", value: store.drivingAccuracyLabel, subtitle: "accuracy")
                                }

                                ProgressMeter(progress: Double(store.holesCompleted) / 18.0, tint: AppPalette.fairway)

                                Divider()

                                VStack(alignment: .leading, spacing: 14) {
                                    HStack {
                                        Text("Hole editor")
                                            .font(.headline)
                                        Spacer()
                                        AppBadge(text: store.liveHoleDraft.par == 3 ? "Par 3" : (store.liveHoleDraft.par == 4 ? "Par 4" : "Par 5"))
                                    }

                                    HStack(spacing: 12) {
                                        Button {
                                            store.moveDraftHole(by: -1)
                                        } label: {
                                            Image(systemName: "chevron.left")
                                        }
                                        .buttonStyle(SecondaryButtonStyle())

                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Hole \(store.liveHoleDraft.holeNumber)")
                                                .font(.title3.bold())
                                            Text(store.liveHoleDraft.fairway == "N/A" ? "No fairway tracked" : "Fairway tracked")
                                                .font(.footnote)
                                                .foregroundColor(AppPalette.secondaryText)
                                        }
                                        Spacer()

                                        Button {
                                            store.moveDraftHole(by: 1)
                                        } label: {
                                            Image(systemName: "chevron.right")
                                        }
                                        .buttonStyle(SecondaryButtonStyle())
                                    }

                                    HStack(spacing: 12) {
                                        statStepper(title: "Par", value: $store.liveHoleDraft.par, range: 3...5)
                                        statStepper(title: "Score", value: $store.liveHoleDraft.score, range: 1...9)
                                        statStepper(title: "Putts", value: $store.liveHoleDraft.putts, range: 0...4)
                                    }

                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Tee shot")
                                            .font(.subheadline.weight(.semibold))
                                        Picker("Fairway", selection: $store.liveHoleDraft.fairway) {
                                            Text("Hit").tag("Hit")
                                            Text("Miss left").tag("Miss left")
                                            Text("Miss right").tag("Miss right")
                                            Text("N/A").tag("N/A")
                                        }
                                        .pickerStyle(SegmentedPickerStyle())
                                    }

                                    Toggle("Green in regulation", isOn: $store.liveHoleDraft.gir)
                                        .tint(AppPalette.fairway)

                                    HStack(spacing: 12) {
                                        Button(store.holesCompleted < 18 ? "Save hole" : "Update round") {
                                            store.applyLiveHole()
                                        }
                                        .buttonStyle(PrimaryButtonStyle())

                                        Button("Reset") {
                                            store.resetRound()
                                        }
                                        .buttonStyle(SecondaryButtonStyle())
                                    }
                                }

                                Divider()

                                VStack(alignment: .leading, spacing: 10) {
                                    Text("Hole-by-hole scorecard")
                                        .font(.headline)
                                    ForEach(store.holeSnapshots.suffix(6)) { hole in
                                        HStack(alignment: .center, spacing: 12) {
                                            Text("\(hole.holeNumber)")
                                                .font(.subheadline.bold())
                                                .frame(width: 24, height: 24)
                                                .background(AppPalette.badge, in: Circle())
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text("Par \(hole.par) · Score \(hole.score)")
                                                    .font(.subheadline.weight(.semibold))
                                                Text("\(hole.putts) putts · \(hole.fairway) · \(hole.gir ? "GIR" : "No GIR")")
                                                    .font(.footnote)
                                                    .foregroundColor(AppPalette.secondaryText)
                                            }
                                            Spacer()
                                            Text(hole.score - hole.par == 0 ? "E" : (hole.score - hole.par > 0 ? "+\(hole.score - hole.par)" : "\(hole.score - hole.par)"))
                                                .font(.subheadline.bold())
                                                .foregroundColor(hole.score <= hole.par ? AppPalette.fairway : AppPalette.gold)
                                        }
                                        .padding(.vertical, 4)
                                    }
                                    if store.holeSnapshots.count > 6 {
                                        Text("Showing last 6 holes. Full score detail is saved into round history when the round is completed.")
                                            .font(.footnote)
                                            .foregroundColor(AppPalette.secondaryText)
                                    }
                                }
                            }
                        }

                        SectionHeader(title: "Open games nearby", subtitle: "The controllable beachhead: golfer matching before full tee-time supply")
                        ForEach(store.openGames) { game in
                            PremiumCard {
                                VStack(alignment: .leading, spacing: 10) {
                                    HStack {
                                        Text(game.courseName)
                                            .font(.headline)
                                        Spacer()
                                        Text("\(game.remainingSpots) spots")
                                            .font(.subheadline.bold())
                                            .foregroundColor(AppPalette.fairway)
                                    }
                                    Text("Hosted by \(game.hostName)")
                                        .foregroundColor(AppPalette.secondaryText)
                                    Text("\(game.dateLabel) · \(game.holes) holes · \(game.format)")
                                    Text("\(game.walking) · \(game.approvalRequired ? "Approval required" : "Instant join")")
                                        .foregroundColor(AppPalette.secondaryText)
                                    if game.requestState == .requested {
                                        Text("Request sent to host")
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.gold)
                                    } else if game.requestState == .joined {
                                        Text("Joined")
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.fairway)
                                    }
                                    HStack(spacing: 12) {
                                        if game.requestState == .none {
                                            Button(game.approvalRequired ? "Request to join" : "Join now") {
                                                store.requestJoinOpenGame(game)
                                            }
                                            .buttonStyle(PrimaryButtonStyle())
                                        } else {
                                            Button(game.requestState == .requested ? "Cancel request" : "Leave game") {
                                                store.leaveOpenGame(game)
                                            }
                                            .buttonStyle(SecondaryButtonStyle())
                                        }
                                    }
                                }
                            }
                        }

                        Button("Create open game") {
                            store.showingCreateGameComposer = true
                        }
                        .buttonStyle(PrimaryButtonStyle())

                        SectionHeader(title: "Live conversations", subtitle: "Group coordination after a match, join request, or concierge tee time")
                        ForEach(store.messageThreads) { thread in
                            Button {
                                store.selectedThread = thread
                            } label: {
                                MessageThreadRow(thread: thread)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(20)
                }
            }
            .navigationBarHidden(true)
            .sheet(item: $store.selectedThread) { thread in
                MessageThreadDetailView(thread: thread)
            }
            .sheet(isPresented: $store.showingCreateGameComposer) {
                CreateOpenGameView()
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

private struct StatStepper: View {
    let title: String
    @Binding var value: Int
    let range: ClosedRange<Int>

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption.weight(.bold))
                .foregroundColor(AppPalette.secondaryText)
            HStack(spacing: 10) {
                Button {
                    value = max(range.lowerBound, value - 1)
                } label: {
                    Image(systemName: "minus")
                }
                .buttonStyle(SecondaryButtonStyle())

                Text("\(value)")
                    .font(.title3.bold())
                    .frame(maxWidth: .infinity)

                Button {
                    value = min(range.upperBound, value + 1)
                } label: {
                    Image(systemName: "plus")
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
    }
}

private func statStepper(title: String, value: Binding<Int>, range: ClosedRange<Int>) -> some View {
    StatStepper(title: title, value: value, range: range)
}

struct LeaderboardsView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Leaderboards")
                            .font(.system(size: 28, weight: .bold, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 10) {
                                AppBadge(text: "Nashville · Weekly · Match Play points")
                                Text("Participation, verification, and head-to-head wins carry the board.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)
                                HStack(spacing: 10) {
                                    MetricCard(title: "Your Rank", value: "#2", subtitle: "Tennessee")
                                    MetricCard(title: "Delta", value: "+3", subtitle: "this week")
                                }
                            }
                        }

                        ForEach(store.leaderboard) { entry in
                            PremiumCard {
                                HStack(alignment: .center, spacing: 12) {
                                    ZStack {
                                        Circle()
                                            .fill(entry.rank == 1 ? AppPalette.gold.opacity(0.18) : AppPalette.badge)
                                            .frame(width: 34, height: 34)
                                        Text("\(entry.rank)")
                                            .font(.subheadline.bold())
                                    }
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(entry.player)
                                            .font(.headline)
                                        Text(entry.location)
                                            .font(.footnote)
                                            .foregroundColor(AppPalette.secondaryText)
                                        Text(entry.metric)
                                            .font(.footnote.weight(.semibold))
                                            .foregroundColor(AppPalette.ink)
                                    }
                                    Spacer()
                                    VStack(alignment: .trailing, spacing: 4) {
                                        Text("\(entry.points) pts")
                                            .font(.headline.bold())
                                        Text(entry.movement >= 0 ? "+\(entry.movement)" : "\(entry.movement)")
                                            .font(.footnote.bold())
                                            .foregroundColor(entry.movement >= 0 ? AppPalette.fairway : .red)
                                        Text(entry.verified ? "Verified" : "Estimate")
                                            .font(.caption2.bold())
                                            .foregroundColor(entry.verified ? AppPalette.fairway : AppPalette.gold)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 12)
                    .padding(.bottom, 18)
                }
            }
            .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

private extension HomeView {
    func dashboardLine(label: String, value: String) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(label)
                .font(.caption.weight(.bold))
                .foregroundColor(AppPalette.tertiaryText)
            Text(value)
                .font(.caption)
                .foregroundColor(AppPalette.ink)
                .lineLimit(1)
        }
    }
}

struct ProfileView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        Text("Profile")
                            .font(.system(size: 32, weight: .bold, design: .rounded))

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    ZStack {
                                        Circle()
                                            .fill(AppPalette.fairway.opacity(0.15))
                                            .frame(width: 58, height: 58)
                                        Text(String(store.profile.firstName.prefix(1) + store.profile.lastName.prefix(1)))
                                            .font(.title3.bold())
                                            .foregroundColor(AppPalette.fairway)
                                    }
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("\(store.profile.firstName) \(store.profile.lastName)")
                                            .font(.title3.bold())
                                        Text("@\(store.profile.username)")
                                            .foregroundColor(AppPalette.secondaryText)
                                    }
                                    Spacer()
                                    AppBadge(text: store.profile.reliabilityLabel)
                                }
                                Divider()
                                KeyValueRow(label: "Location", value: "\(store.profile.city), \(store.profile.state)")
                                KeyValueRow(label: "Home course", value: store.profile.homeCourse)
                                KeyValueRow(label: "Handicap", value: "\(String(format: "%.1f", store.profile.handicapValue)) · \(store.profile.handicapLabel)")
                                KeyValueRow(label: "Plan", value: store.profile.proMember ? "Match Play Pro" : "Free")
                                KeyValueRow(label: "Availability", value: store.profile.availability)
                                KeyValueRow(label: "Discovery", value: store.profile.isDiscoveryVisible ? "\(store.profile.discoveryRadiusMiles) mi radius" : "Hidden from discovery")
                                KeyValueRow(label: "Notifications", value: "\(store.notifications.count) active")
                                KeyValueRow(label: "Preview funnel", value: store.tractionSummary)
                                Button("Edit profile and settings") {
                                    store.startEditingProfile()
                                }
                                .buttonStyle(SecondaryButtonStyle())
                            }
                        }

                        if !store.profile.preferredFormats.isEmpty {
                            SectionHeader(title: "Preferred formats", subtitle: "How your profile currently shows up")
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(store.profile.preferredFormats, id: \.self) { format in
                                        AppBadge(text: format)
                                    }
                                }
                                .padding(.horizontal, 2)
                            }
                        }

                        SectionHeader(title: "Recent rounds", subtitle: "Score quality and momentum in one glance")
                        ForEach(store.recentRounds) { round in
                            Button {
                                store.selectedRound = round
                            } label: {
                                PremiumCard {
                                    VStack(alignment: .leading, spacing: 12) {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text(round.courseName)
                                                    .font(.headline)
                                                    .foregroundColor(AppPalette.ink)
                                                Text("\(round.dateLabel) · \(round.format) · \(round.teeSet)")
                                                    .foregroundColor(AppPalette.secondaryText)
                                            }
                                            Spacer()
                                            VStack(alignment: .trailing, spacing: 4) {
                                                Text("\(round.grossScore)")
                                                    .font(.title3.bold())
                                                    .foregroundColor(AppPalette.ink)
                                                Text(round.relativeToPar >= 0 ? "+\(round.relativeToPar)" : "\(round.relativeToPar)")
                                                    .foregroundColor(round.relativeToPar <= 0 ? AppPalette.fairway : AppPalette.gold)
                                            }
                                        }

                                        HStack {
                                            StatChip(label: "Fairways", value: "\(round.fairwaysHit)")
                                            StatChip(label: "GIR", value: "\(round.greensInRegulation)")
                                            StatChip(label: "Putts", value: "\(round.totalPutts)")
                                        }
                                    }
                                }
                            }
                            .buttonStyle(PlainButtonStyle())
                        }

                        Button("Log out") {
                            store.logout()
                        }
                        .buttonStyle(SecondaryButtonStyle())
                    }
                    .padding(20)
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $store.showingEditProfile) {
                EditProfileView()
            }
            .sheet(item: $store.selectedRound) { round in
                RoundDetailView(round: round)
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}
