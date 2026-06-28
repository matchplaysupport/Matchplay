import SwiftUI

final class MatchPlayStore: ObservableObject {
    private enum StorageKeys {
        static let persistedState = "match_play_persisted_state_v1"
    }

    @Published var isSignedIn = false
    @Published var hasCompletedOnboarding = false
    @Published var profile = Profile(
        firstName: "Jackson",
        lastName: "Reed",
        username: "jreed",
        city: "Nashville",
        state: "TN",
        handicapValue: 13.2,
        handicapLabel: "Match Play Estimate",
        reliabilityLabel: "Reliable player",
        proMember: true,
        homeCourse: "Riverbend Commons",
        availability: "Weeknights and Sundays",
        preferredFormats: [MatchFormatOption.matchPlay.rawValue, MatchFormatOption.strokePlay.rawValue],
        discoveryRadiusMiles: 25,
        isDiscoveryVisible: true
    ) { didSet { persist() } }
    @Published var searchText = "Nashville" { didSet { persist() } }
    @Published var selectedSort: TeeTimeSort = .recommended { didSet { persist() } }
    @Published var selectedBooking: Booking?
    @Published var bookingDraft: BookingDraft?
    @Published var selectedTeeTime: TeeTime?
    @Published var selectedRound: RoundSummary?
    @Published var selectedGolfer: DiscoveryGolfer?
    @Published var selectedThread: MessageThread?
    @Published var selectedNotification: NotificationItem?
    @Published var showingCreateGameComposer = false
    @Published var showingEditProfile = false
    @Published var liveHoleDraft = LiveHoleDraft(
        holeNumber: 15,
        par: 4,
        score: 4,
        putts: 2,
        fairway: "Hit",
        gir: true
    )
    @Published var currentHole = 1 { didSet { persist() } }
    @Published var totalScore = 74 { didSet { persist() } }
    @Published var totalPutts = 29 { didSet { persist() } }
    @Published var holesCompleted = 14 { didSet { persist() } }
    @Published var activeFiltersCount = 4 { didSet { persist() } }
    @Published var selectedPartySize: TeeTimePartySize = .twosome { didSet { activeFiltersCount = computedActiveFiltersCount } }
    @Published var filterWalkingOnly = false { didSet { activeFiltersCount = computedActiveFiltersCount } }
    @Published var filterEighteenOnly = false { didSet { activeFiltersCount = computedActiveFiltersCount } }
    @Published var maxPrice = 80.0 { didSet { activeFiltersCount = computedActiveFiltersCount } }
    @Published var notifications: [NotificationItem] = SampleData.notifications
    @Published var teeTimes: [TeeTime] = SampleData.teeTimes
    @Published var bookings: [Booking] = SampleData.bookings { didSet { persist() } }
    @Published var recentRounds: [RoundSummary] = SampleData.recentRounds { didSet { persist() } }
    @Published var discoveryGolfers: [DiscoveryGolfer] = SampleData.discoveryGolfers
    @Published var openGames: [OpenGame] = SampleData.openGames { didSet { persist() } }
    @Published var messageThreads: [MessageThread] = SampleData.messageThreads { didSet { persist() } }
    @Published var leaderboard: [LeaderboardEntry] = SampleData.leaderboard
    @Published var handicapTrend: [TrendPoint] = SampleData.handicapTrend
    @Published var holeSnapshots: [ScoreHole] = SampleData.holeSnapshots
    @Published var tractionMetrics: TractionMetrics = .previewSeed { didSet { persist() } }
    @Published var openGameDraft = CreateOpenGameDraft(
        courseName: "Lake Ash Municipal",
        dateLabel: "Sunday · 7:50 AM",
        holes: 18,
        format: "Competitive skins",
        walking: "Cart included",
        spots: 3,
        approvalRequired: true
    )
    @Published var onboardingDraft = OnboardingDraft(
        city: "Nashville",
        state: "TN",
        homeCourse: "Riverbend Commons",
        availability: "Weeknights and Sundays",
        preferredFormats: [MatchFormatOption.matchPlay.rawValue, MatchFormatOption.strokePlay.rawValue],
        discoveryRadiusMiles: 25,
        isDiscoveryVisible: true
    )
    @Published var profileDraft = ProfileDraft(
        profile: Profile(
            firstName: "Jackson",
            lastName: "Reed",
            username: "jreed",
            city: "Nashville",
            state: "TN",
            handicapValue: 13.2,
            handicapLabel: "Match Play Estimate",
            reliabilityLabel: "Reliable player",
            proMember: true,
            homeCourse: "Riverbend Commons",
            availability: "Weeknights and Sundays",
            preferredFormats: [MatchFormatOption.matchPlay.rawValue, MatchFormatOption.strokePlay.rawValue],
            discoveryRadiusMiles: 25,
            isDiscoveryVisible: true
        )
    )

    init() {
        restore()
        profileDraft = ProfileDraft(profile: profile)
        syncLiveHoleDraft()
    }

    var filteredTeeTimes: [TeeTime] {
        let trimmed = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        let base = teeTimes.filter { teeTime in
            (trimmed.isEmpty ||
            teeTime.courseName.localizedCaseInsensitiveContains(trimmed) ||
            teeTime.city.localizedCaseInsensitiveContains(trimmed) ||
            teeTime.state.localizedCaseInsensitiveContains(trimmed))
            && teeTime.price <= Int(maxPrice)
            && teeTime.spots >= selectedPartySize.rawValue
            && (!filterWalkingOnly || teeTime.walkingAllowed)
            && (!filterEighteenOnly || teeTime.holes == 18)
        }

        switch selectedSort {
        case .recommended:
            return base.sorted { lhs, rhs in
                if lhs.featured != rhs.featured { return lhs.featured && !rhs.featured }
                return lhs.distanceMiles < rhs.distanceMiles
            }
        case .earliest:
            return base
        case .lowestPrice:
            return base.sorted { $0.price < $1.price }
        }
    }

    func signIn() {
        isSignedIn = true
        persist()
    }

    func finishOnboarding() {
        profile.city = onboardingDraft.city
        profile.state = onboardingDraft.state
        profile.homeCourse = onboardingDraft.homeCourse
        profile.availability = onboardingDraft.availability
        profile.preferredFormats = onboardingDraft.preferredFormats
        profile.discoveryRadiusMiles = Int(onboardingDraft.discoveryRadiusMiles.rounded())
        profile.isDiscoveryVisible = onboardingDraft.isDiscoveryVisible
        hasCompletedOnboarding = true
        recordMetric(.onboardingCompletions)
        persist()
    }

    func beginBooking(_ teeTime: TeeTime, golfers: Int = 2, notes: String = "Concierge will hold the request, confirm operator availability, and keep extra spots private unless you open them to nearby golfers.") {
        let partySize = min(golfers, teeTime.spots)
        bookingDraft = BookingDraft(
            courseName: teeTime.courseName,
            city: teeTime.city,
            state: teeTime.state,
            teeSet: teeTime.teeSet,
            startLabel: teeTime.startLabel,
            pricePerPlayer: teeTime.price,
            golfers: partySize,
            holes: teeTime.holes,
            cartIncluded: teeTime.cartIncluded,
            walkingAllowed: teeTime.walkingAllowed,
            cancellation: teeTime.cancellation,
            inventoryLabel: teeTime.inventoryLabel,
            openSpotsShared: max(0, teeTime.spots - partySize),
            notes: notes,
            includesGamesCredit: teeTime.featured
        )
    }

    func confirmBooking(_ draft: BookingDraft) {
        let booking = Booking(
            courseName: draft.courseName,
            teeSet: draft.teeSet,
            startLabel: draft.startLabel,
            confirmationCode: "MP-\(Int.random(in: 1000...9999))",
            openSpotsShared: draft.openSpotsShared,
            golfers: draft.golfers,
            estimatedTotal: draft.golfers * draft.pricePerPlayer,
            bookingNote: draft.notes,
            status: .requested,
            source: .concierge,
            fulfillmentLabel: "Concierge request received"
        )
        bookings.insert(booking, at: 0)
        recordMetric(.bookingRequests)
        bookingDraft = nil
        selectedBooking = booking
    }

    func trackSearch() {
        recordMetric(.searches)
    }

    func resetTeeTimeFilters() {
        selectedPartySize = .twosome
        filterWalkingOnly = false
        filterEighteenOnly = false
        maxPrice = 80
        activeFiltersCount = computedActiveFiltersCount
    }

    func applyLiveHole() {
        guard holesCompleted < 18 else { return }

        let snapshot = ScoreHole(
            holeNumber: liveHoleDraft.holeNumber,
            par: liveHoleDraft.par,
            score: liveHoleDraft.score,
            putts: liveHoleDraft.putts,
            fairway: liveHoleDraft.fairway,
            gir: liveHoleDraft.gir
        )

        if let existingIndex = holeSnapshots.firstIndex(where: { $0.holeNumber == snapshot.holeNumber }) {
            holeSnapshots[existingIndex] = snapshot
        } else {
            holeSnapshots.append(snapshot)
            holeSnapshots.sort { $0.holeNumber < $1.holeNumber }
        }

        recalculateRoundState()

        if holesCompleted >= 18 {
            completeRoundIfNeeded()
        } else {
            liveHoleDraft = defaultDraft(for: currentHole)
        }
        persist()
    }

    func moveDraftHole(by delta: Int) {
        let next = min(18, max(1, liveHoleDraft.holeNumber + delta))
        liveHoleDraft = draftForHole(next)
    }

    func selectDraftHole(_ holeNumber: Int) {
        liveHoleDraft = draftForHole(holeNumber)
    }

    func resetRound() {
        currentHole = 1
        holesCompleted = 0
        totalScore = 0
        totalPutts = 0
        holeSnapshots = []
        liveHoleDraft = defaultDraft(for: 1)
        persist()
    }

    func createOpenGame() {
        openGames.insert(
            OpenGame(
                hostName: "\(profile.firstName) \(profile.lastName)",
                courseName: openGameDraft.courseName,
                dateLabel: openGameDraft.dateLabel,
                holes: openGameDraft.holes,
                format: openGameDraft.format,
                walking: openGameDraft.walking,
                remainingSpots: openGameDraft.spots,
                approvalRequired: openGameDraft.approvalRequired
            ),
            at: 0
        )
        recordMetric(.openGameCreations)
        showingCreateGameComposer = false
    }

    func toggleFormatSelection(_ format: String, in formats: inout [String]) {
        if let index = formats.firstIndex(of: format) {
            formats.remove(at: index)
        } else {
            formats.append(format)
        }
    }

    func requestJoinOpenGame(_ game: OpenGame) {
        guard let index = openGames.firstIndex(where: { $0.id == game.id }) else { return }
        if openGames[index].approvalRequired {
            openGames[index].requestState = .requested
        } else if openGames[index].remainingSpots > 0 {
            openGames[index].remainingSpots -= 1
            openGames[index].requestState = .joined
        }
        recordMetric(.joinRequests)
        persist()
    }

    func markInterested(in golfer: DiscoveryGolfer) {
        recordMetric(.interestedActions)
        messageThreads.insert(
            MessageThread(
                title: golfer.name,
                lastMessage: "Match unlocked. \(golfer.name.components(separatedBy: " ").first ?? "They") can see your availability.",
                timeLabel: "Now",
                unreadCount: 0
            ),
            at: 0
        )
    }

    func passOnGolfer(_ golfer: DiscoveryGolfer) {
        recordMetric(.passActions)
        discoveryGolfers.removeAll { $0.id == golfer.id }
    }

    func sendMessage(to thread: MessageThread, body: String) {
        let trimmed = body.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        guard let index = messageThreads.firstIndex(where: { $0.id == thread.id }) else { return }
        messageThreads[index].lastMessage = trimmed
        messageThreads[index].timeLabel = "Now"
        messageThreads[index].unreadCount = 0
        selectedThread = messageThreads[index]
        recordMetric(.messagesSent)
    }

    func leaveOpenGame(_ game: OpenGame) {
        guard let index = openGames.firstIndex(where: { $0.id == game.id }) else { return }
        if openGames[index].requestState == .joined {
            openGames[index].remainingSpots += 1
        }
        openGames[index].requestState = .none
        persist()
    }

    func startEditingProfile() {
        profileDraft = ProfileDraft(profile: profile)
        showingEditProfile = true
    }

    func saveProfileDraft() {
        profile = Profile(
            firstName: profileDraft.firstName,
            lastName: profileDraft.lastName,
            username: profileDraft.username,
            city: profileDraft.city,
            state: profileDraft.state,
            handicapValue: profileDraft.handicapValue,
            handicapLabel: profile.handicapLabel,
            reliabilityLabel: profileDraft.reliabilityLabel,
            proMember: profileDraft.proMember,
            homeCourse: profileDraft.homeCourse,
            availability: profileDraft.availability,
            preferredFormats: profileDraft.preferredFormats,
            discoveryRadiusMiles: Int(profileDraft.discoveryRadiusMiles.rounded()),
            isDiscoveryVisible: profileDraft.isDiscoveryVisible
        )
        showingEditProfile = false
    }

    var nextBestGame: OpenGame? {
        openGames.first(where: { $0.requestState != .joined }) ?? openGames.first
    }

    var joinedGamesCount: Int {
        openGames.filter { $0.requestState == .joined || $0.requestState == .requested }.count
    }

    var tractionSummary: String {
        "\(tractionMetrics.searches) searches · \(tractionMetrics.bookingRequests) requests · \(tractionMetrics.joinRequests) joins · \(tractionMetrics.messagesSent) messages"
    }

    var computedActiveFiltersCount: Int {
        var count = 1
        if filterWalkingOnly { count += 1 }
        if filterEighteenOnly { count += 1 }
        if maxPrice < 80 { count += 1 }
        if selectedPartySize != .twosome { count += 1 }
        return count
    }

    var scoreToPar: Int {
        totalScore - parThroughCurrentProgress
    }

    var parThroughCurrentProgress: Int {
        holeSnapshots.reduce(0) { $0 + $1.par }
    }

    var fairwaysHitCount: Int {
        holeSnapshots.filter { $0.fairway == "Hit" }.count
    }

    var girCount: Int {
        holeSnapshots.filter(\.gir).count
    }

    var lastThreeAverageLabel: String {
        let recent = holeSnapshots.suffix(3)
        guard !recent.isEmpty else { return "--" }
        let total = recent.reduce(0) { $0 + $1.score }
        return String(format: "%.1f", Double(total) / Double(recent.count))
    }

    var nextHoleParLabel: String {
        "Par \(liveHoleDraft.par)"
    }

    var drivingAccuracyLabel: String {
        let tracked = holeSnapshots.filter { $0.fairway != "N/A" }
        guard !tracked.isEmpty else { return "--" }
        let hit = tracked.filter { $0.fairway == "Hit" }.count
        return "\(Int((Double(hit) / Double(tracked.count) * 100).rounded()))%"
    }

    var scoringAverageLabel: String {
        guard holesCompleted > 0 else { return "--" }
        return String(format: "%.1f", Double(totalScore) / Double(holesCompleted))
    }

    func logout() {
        isSignedIn = false
        hasCompletedOnboarding = false
        persist()
    }

    private func persist() {
        let state = PersistedState(
            isSignedIn: isSignedIn,
            hasCompletedOnboarding: hasCompletedOnboarding,
            profile: profile,
            searchText: searchText,
            selectedSort: selectedSort,
            currentHole: currentHole,
            totalScore: totalScore,
            totalPutts: totalPutts,
            holesCompleted: holesCompleted,
            activeFiltersCount: activeFiltersCount,
            bookings: bookings,
            recentRounds: recentRounds,
            openGames: openGames,
            messageThreads: messageThreads,
            tractionMetrics: tractionMetrics
        )

        if let encoded = try? JSONEncoder().encode(state) {
            UserDefaults.standard.set(encoded, forKey: StorageKeys.persistedState)
        }
    }

    private func restore() {
        guard
            let data = UserDefaults.standard.data(forKey: StorageKeys.persistedState),
            let decoded = try? JSONDecoder().decode(PersistedState.self, from: data)
        else { return }

        isSignedIn = decoded.isSignedIn
        hasCompletedOnboarding = decoded.hasCompletedOnboarding
        profile = decoded.profile
        onboardingDraft = OnboardingDraft(
            city: decoded.profile.city,
            state: decoded.profile.state,
            homeCourse: decoded.profile.homeCourse,
            availability: decoded.profile.availability,
            preferredFormats: decoded.profile.preferredFormats,
            discoveryRadiusMiles: Double(decoded.profile.discoveryRadiusMiles),
            isDiscoveryVisible: decoded.profile.isDiscoveryVisible
        )
        profileDraft = ProfileDraft(profile: decoded.profile)
        searchText = decoded.searchText
        selectedSort = decoded.selectedSort
        currentHole = decoded.currentHole
        totalScore = decoded.totalScore
        totalPutts = decoded.totalPutts
        holesCompleted = decoded.holesCompleted
        activeFiltersCount = decoded.activeFiltersCount
        bookings = decoded.bookings
        recentRounds = decoded.recentRounds
        openGames = decoded.openGames
        messageThreads = decoded.messageThreads ?? SampleData.messageThreads
        tractionMetrics = decoded.tractionMetrics ?? .previewSeed
        syncLiveHoleDraft()
    }

    private func recalculateRoundState() {
        holesCompleted = holeSnapshots.count
        totalScore = holeSnapshots.reduce(0) { $0 + $1.score }
        totalPutts = holeSnapshots.reduce(0) { $0 + $1.putts }
        currentHole = min(18, holesCompleted + 1)
    }

    private func completeRoundIfNeeded() {
        guard !holeSnapshots.isEmpty else { return }
        let fairways = holeSnapshots.filter { $0.fairway == "Hit" }.count
        let gir = holeSnapshots.filter(\.gir).count
        let finalRound = RoundSummary(
            courseName: "Riverbend Commons",
            format: "Stroke Play",
            teeSet: "Spruce",
            grossScore: totalScore,
            relativeToPar: scoreToPar,
            fairwaysHit: fairways,
            greensInRegulation: gir,
            totalPutts: totalPutts,
            dateLabel: "Today",
            holesPlayed: holeSnapshots.count,
            bestStretch: bestStretchLabel(),
            notes: "Saved from the native score entry flow with live hole-by-hole stats."
        )

        if recentRounds.first?.dateLabel == "Today" && recentRounds.first?.holesPlayed == holeSnapshots.count {
            recentRounds[0] = finalRound
        } else {
            recentRounds.insert(finalRound, at: 0)
        }
        profile.handicapValue = max(0, profile.handicapValue - 0.4)
        profile.reliabilityLabel = "Highly reliable"
        leaderboard = refreshedLeaderboardAfterRound()
        recordMetric(.roundsSubmitted)
    }

    private func recordMetric(_ metric: TractionMetric) {
        switch metric {
        case .onboardingCompletions:
            tractionMetrics.onboardingCompletions += 1
        case .searches:
            tractionMetrics.searches += 1
        case .bookingRequests:
            tractionMetrics.bookingRequests += 1
        case .interestedActions:
            tractionMetrics.interestedActions += 1
        case .passActions:
            tractionMetrics.passActions += 1
        case .openGameCreations:
            tractionMetrics.openGameCreations += 1
        case .joinRequests:
            tractionMetrics.joinRequests += 1
        case .roundsSubmitted:
            tractionMetrics.roundsSubmitted += 1
        case .messagesSent:
            tractionMetrics.messagesSent += 1
        case .returningSessions:
            tractionMetrics.returningSessions += 1
        }
    }

    private func refreshedLeaderboardAfterRound() -> [LeaderboardEntry] {
        [
            LeaderboardEntry(rank: 1, player: "\(profile.firstName) \(profile.lastName)", location: "\(profile.city), \(profile.state)", metric: "618 pts", points: 618, movement: 3, verified: false),
            LeaderboardEntry(rank: 2, player: "Maya Brooks", location: "Franklin, TN", metric: "642 pts", points: 642, movement: 1, verified: true),
            LeaderboardEntry(rank: 3, player: "Avery Sloan", location: "Knoxville, TN", metric: "534 pts", points: 534, movement: -1, verified: false)
        ]
    }

    private func bestStretchLabel() -> String {
        let best = holeSnapshots.sorted { ($0.score - $0.par) < ($1.score - $1.par) }.prefix(3).map(\.holeNumber)
        guard !best.isEmpty else { return "Steady round" }
        return "Best holes: " + best.map(String.init).joined(separator: ", ")
    }

    private func syncLiveHoleDraft() {
        liveHoleDraft = draftForHole(min(max(currentHole, 1), 18))
    }

    private func draftForHole(_ holeNumber: Int) -> LiveHoleDraft {
        if let snapshot = holeSnapshots.first(where: { $0.holeNumber == holeNumber }) {
            return LiveHoleDraft(
                holeNumber: snapshot.holeNumber,
                par: snapshot.par,
                score: snapshot.score,
                putts: snapshot.putts,
                fairway: snapshot.fairway,
                gir: snapshot.gir
            )
        }
        return defaultDraft(for: holeNumber)
    }

    private func defaultDraft(for holeNumber: Int) -> LiveHoleDraft {
        let par = holeNumber.isMultiple(of: 3) ? 3 : (holeNumber.isMultiple(of: 2) ? 4 : 5)
        return LiveHoleDraft(
            holeNumber: holeNumber,
            par: par,
            score: par,
            putts: min(2, par - 1),
            fairway: par == 3 ? "N/A" : "Hit",
            gir: true
        )
    }
}

enum SampleData {
    static let notifications: [NotificationItem] = [
        NotificationItem(title: "Open game request", subtitle: "Maya asked to join your Riverbend foursome.", timeLabel: "2m ago"),
        NotificationItem(title: "Leaderboard movement", subtitle: "You moved up 3 spots in Tennessee monthly points.", timeLabel: "1h ago"),
        NotificationItem(title: "Concierge request", subtitle: "Copper Hill Nine is being coordinated for Saturday 8:02 AM.", timeLabel: "Yesterday")
    ]

    static let teeTimes: [TeeTime] = [
        TeeTime(courseName: "Riverbend Commons", city: "Nashville", state: "TN", distanceMiles: 11, teeSet: "Spruce", startLabel: "Today · 7:18 AM", price: 54, spots: 3, holes: 18, walkingAllowed: true, cartIncluded: true, courseRating: 4.8, cancellation: "Concierge confirms operator availability before payment.", imageSymbol: "sun.max.fill", inventoryLabel: "Concierge available", featured: true, description: "Wide fairways, a strong range setup, and a walkable front nine make this a smooth early-round option."),
        TeeTime(courseName: "Copper Hill Nine", city: "Knoxville", state: "TN", distanceMiles: 23, teeSet: "Maple", startLabel: "Tomorrow · 8:02 AM", price: 32, spots: 2, holes: 9, walkingAllowed: true, cartIncluded: false, courseRating: 4.5, cancellation: "Flexible concierge request window.", imageSymbol: "leaf.fill", inventoryLabel: "Operator pilot", featured: false, description: "Twilight-friendly nine with quick greens and a simple in-and-out loop for fast scoring sessions."),
        TeeTime(courseName: "Lake Ash Municipal", city: "Madison", state: "WI", distanceMiles: 5, teeSet: "White", startLabel: "Saturday · 9:10 AM", price: 61, spots: 4, holes: 18, walkingAllowed: false, cartIncluded: true, courseRating: 4.7, cancellation: "Concierge can coordinate the group before noon prior day.", imageSymbol: "drop.fill", inventoryLabel: "Concierge available", featured: true, description: "Balanced public-course setup with good pace, full practice area, and enough room for a social foursome.")
    ]

    static let bookings: [Booking] = [
        Booking(courseName: "Copper Hill Nine", teeSet: "Maple", startLabel: "Saturday · 8:02 AM", confirmationCode: "MP-4821", openSpotsShared: 1)
    ]

    static let recentRounds: [RoundSummary] = [
        RoundSummary(courseName: "Riverbend Commons", format: "Stroke Play", teeSet: "Spruce", grossScore: 82, relativeToPar: 10, fairwaysHit: 9, greensInRegulation: 7, totalPutts: 31, dateLabel: "Jun 22"),
        RoundSummary(courseName: "Copper Hill Nine", format: "Match Play", teeSet: "Maple", grossScore: 39, relativeToPar: 4, fairwaysHit: 4, greensInRegulation: 3, totalPutts: 15, dateLabel: "Jun 18")
    ]

    static let discoveryGolfers: [DiscoveryGolfer] = [
        DiscoveryGolfer(name: "Maya Brooks", location: "Franklin, TN", handicapLabel: "6.4 unverified official", vibe: "Competitive but welcoming", availability: "Weeknights + Sundays", matchPlayInterest: "Loves head-to-head", accentHex: "#E38B2C"),
        DiscoveryGolfer(name: "Avery Sloan", location: "Knoxville, TN", handicapLabel: "11.8 Match Play Estimate", vibe: "Walking-focused, fast pace", availability: "Saturdays before 10", matchPlayInterest: "Open to casual matches", accentHex: "#1A8E89")
    ]

    static let openGames: [OpenGame] = [
        OpenGame(hostName: "Maya Brooks", courseName: "Riverbend Commons", dateLabel: "Tomorrow · 8:30 AM", holes: 18, format: "Casual Nassau", walking: "Cart optional", remainingSpots: 2, approvalRequired: true, requestState: .requested),
        OpenGame(hostName: "Avery Sloan", courseName: "Copper Hill Nine", dateLabel: "Saturday · 5:40 PM", holes: 9, format: "Twilight practice", walking: "Walking only", remainingSpots: 1, approvalRequired: false)
    ]

    static let messageThreads: [MessageThread] = [
        MessageThread(title: "Maya Brooks", lastMessage: "Want to turn the Saturday round into match play?", timeLabel: "Now", unreadCount: 1),
        MessageThread(title: "Riverbend Saturday Group", lastMessage: "Host approved Jordan's join request.", timeLabel: "18m", unreadCount: 0)
    ]

    static let leaderboard: [LeaderboardEntry] = [
        LeaderboardEntry(rank: 1, player: "Maya Brooks", location: "Franklin, TN", metric: "642 pts", points: 642, movement: 2, verified: true),
        LeaderboardEntry(rank: 2, player: "Jackson Reed", location: "Nashville, TN", metric: "588 pts", points: 588, movement: 3, verified: true),
        LeaderboardEntry(rank: 3, player: "Avery Sloan", location: "Knoxville, TN", metric: "534 pts", points: 534, movement: -1, verified: false)
    ]

    static let handicapTrend: [TrendPoint] = [
        TrendPoint(label: "May", value: 16.1),
        TrendPoint(label: "Jun 1", value: 15.0),
        TrendPoint(label: "Jun 10", value: 14.4),
        TrendPoint(label: "Now", value: 13.2)
    ]

    static let holeSnapshots: [ScoreHole] = [
        ScoreHole(holeNumber: 1, par: 4, score: 5, putts: 2, fairway: "Hit", gir: false),
        ScoreHole(holeNumber: 2, par: 5, score: 5, putts: 2, fairway: "Miss right", gir: true),
        ScoreHole(holeNumber: 3, par: 3, score: 3, putts: 1, fairway: "N/A", gir: true),
        ScoreHole(holeNumber: 4, par: 4, score: 5, putts: 3, fairway: "Hit", gir: false)
    ]
}
