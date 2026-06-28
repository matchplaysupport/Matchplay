import SwiftUI

struct Profile: Codable {
    var firstName: String
    var lastName: String
    var username: String
    var city: String
    var state: String
    var handicapValue: Double
    var handicapLabel: String
    var reliabilityLabel: String
    var proMember: Bool
    var homeCourse: String
    var availability: String
    var preferredFormats: [String]
    var discoveryRadiusMiles: Int
    var isDiscoveryVisible: Bool

    private enum CodingKeys: String, CodingKey {
        case firstName, lastName, username, city, state, handicapValue, handicapLabel, reliabilityLabel, proMember
        case homeCourse, availability, preferredFormats, discoveryRadiusMiles, isDiscoveryVisible
    }

    init(
        firstName: String,
        lastName: String,
        username: String,
        city: String,
        state: String,
        handicapValue: Double,
        handicapLabel: String,
        reliabilityLabel: String,
        proMember: Bool,
        homeCourse: String,
        availability: String,
        preferredFormats: [String],
        discoveryRadiusMiles: Int,
        isDiscoveryVisible: Bool
    ) {
        self.firstName = firstName
        self.lastName = lastName
        self.username = username
        self.city = city
        self.state = state
        self.handicapValue = handicapValue
        self.handicapLabel = handicapLabel
        self.reliabilityLabel = reliabilityLabel
        self.proMember = proMember
        self.homeCourse = homeCourse
        self.availability = availability
        self.preferredFormats = preferredFormats
        self.discoveryRadiusMiles = discoveryRadiusMiles
        self.isDiscoveryVisible = isDiscoveryVisible
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        firstName = try container.decode(String.self, forKey: .firstName)
        lastName = try container.decode(String.self, forKey: .lastName)
        username = try container.decode(String.self, forKey: .username)
        city = try container.decode(String.self, forKey: .city)
        state = try container.decode(String.self, forKey: .state)
        handicapValue = try container.decode(Double.self, forKey: .handicapValue)
        handicapLabel = try container.decode(String.self, forKey: .handicapLabel)
        reliabilityLabel = try container.decode(String.self, forKey: .reliabilityLabel)
        proMember = try container.decode(Bool.self, forKey: .proMember)
        homeCourse = try container.decodeIfPresent(String.self, forKey: .homeCourse) ?? "Riverbend Commons"
        availability = try container.decodeIfPresent(String.self, forKey: .availability) ?? "Weeknights and Sundays"
        preferredFormats = try container.decodeIfPresent([String].self, forKey: .preferredFormats) ?? [MatchFormatOption.matchPlay.rawValue]
        discoveryRadiusMiles = try container.decodeIfPresent(Int.self, forKey: .discoveryRadiusMiles) ?? 25
        isDiscoveryVisible = try container.decodeIfPresent(Bool.self, forKey: .isDiscoveryVisible) ?? true
    }
}

struct TrendPoint: Identifiable, Codable {
    let id: UUID
    let label: String
    let value: Double

    init(id: UUID = UUID(), label: String, value: Double) {
        self.id = id
        self.label = label
        self.value = value
    }
}

struct TeeTime: Identifiable, Codable, Hashable {
    let id: UUID
    let courseName: String
    let city: String
    let state: String
    let distanceMiles: Int
    let teeSet: String
    let startLabel: String
    let price: Int
    let spots: Int
    let holes: Int
    let walkingAllowed: Bool
    let cartIncluded: Bool
    let courseRating: Double
    let cancellation: String
    let imageSymbol: String
    let inventoryLabel: String
    let featured: Bool
    let description: String

    init(
        id: UUID = UUID(),
        courseName: String,
        city: String,
        state: String,
        distanceMiles: Int,
        teeSet: String,
        startLabel: String,
        price: Int,
        spots: Int,
        holes: Int,
        walkingAllowed: Bool,
        cartIncluded: Bool,
        courseRating: Double,
        cancellation: String,
        imageSymbol: String,
        inventoryLabel: String,
        featured: Bool,
        description: String
    ) {
        self.id = id
        self.courseName = courseName
        self.city = city
        self.state = state
        self.distanceMiles = distanceMiles
        self.teeSet = teeSet
        self.startLabel = startLabel
        self.price = price
        self.spots = spots
        self.holes = holes
        self.walkingAllowed = walkingAllowed
        self.cartIncluded = cartIncluded
        self.courseRating = courseRating
        self.cancellation = cancellation
        self.imageSymbol = imageSymbol
        self.inventoryLabel = inventoryLabel
        self.featured = featured
        self.description = description
    }
}

struct Booking: Identifiable, Codable {
    let id: UUID
    let courseName: String
    let teeSet: String
    let startLabel: String
    let confirmationCode: String
    let openSpotsShared: Int
    let golfers: Int
    let estimatedTotal: Int
    let bookingNote: String
    let status: BookingStatus?
    let source: BookingSource?
    let fulfillmentLabel: String?

    init(
        id: UUID = UUID(),
        courseName: String,
        teeSet: String,
        startLabel: String,
        confirmationCode: String,
        openSpotsShared: Int,
        golfers: Int = 2,
        estimatedTotal: Int = 0,
        bookingNote: String = "Concierge request",
        status: BookingStatus? = .requested,
        source: BookingSource? = .concierge,
        fulfillmentLabel: String? = "Concierge request received"
    ) {
        self.id = id
        self.courseName = courseName
        self.teeSet = teeSet
        self.startLabel = startLabel
        self.confirmationCode = confirmationCode
        self.openSpotsShared = openSpotsShared
        self.golfers = golfers
        self.estimatedTotal = estimatedTotal
        self.bookingNote = bookingNote
        self.status = status
        self.source = source
        self.fulfillmentLabel = fulfillmentLabel
    }
}

enum BookingStatus: String, Codable {
    case requested
    case confirmed
    case fulfilled
}

enum BookingSource: String, Codable {
    case concierge
    case operatorPilot
}

struct BookingDraft: Identifiable, Codable {
    let id: UUID
    let courseName: String
    let city: String
    let state: String
    let teeSet: String
    let startLabel: String
    let pricePerPlayer: Int
    let golfers: Int
    let holes: Int
    let cartIncluded: Bool
    let walkingAllowed: Bool
    let cancellation: String
    let inventoryLabel: String
    let openSpotsShared: Int
    let notes: String
    let includesGamesCredit: Bool

    init(
        id: UUID = UUID(),
        courseName: String,
        city: String,
        state: String,
        teeSet: String,
        startLabel: String,
        pricePerPlayer: Int,
        golfers: Int,
        holes: Int,
        cartIncluded: Bool,
        walkingAllowed: Bool,
        cancellation: String,
        inventoryLabel: String,
        openSpotsShared: Int,
        notes: String,
        includesGamesCredit: Bool
    ) {
        self.id = id
        self.courseName = courseName
        self.city = city
        self.state = state
        self.teeSet = teeSet
        self.startLabel = startLabel
        self.pricePerPlayer = pricePerPlayer
        self.golfers = golfers
        self.holes = holes
        self.cartIncluded = cartIncluded
        self.walkingAllowed = walkingAllowed
        self.cancellation = cancellation
        self.inventoryLabel = inventoryLabel
        self.openSpotsShared = openSpotsShared
        self.notes = notes
        self.includesGamesCredit = includesGamesCredit
    }
}

struct RoundSummary: Identifiable, Codable {
    let id: UUID
    let courseName: String
    let format: String
    let teeSet: String
    let grossScore: Int
    let relativeToPar: Int
    let fairwaysHit: Int
    let greensInRegulation: Int
    let totalPutts: Int
    let dateLabel: String
    let holesPlayed: Int
    let bestStretch: String
    let notes: String

    private enum CodingKeys: String, CodingKey {
        case id, courseName, format, teeSet, grossScore, relativeToPar, fairwaysHit, greensInRegulation, totalPutts, dateLabel
        case holesPlayed, bestStretch, notes
    }

    init(
        id: UUID = UUID(),
        courseName: String,
        format: String,
        teeSet: String,
        grossScore: Int,
        relativeToPar: Int,
        fairwaysHit: Int,
        greensInRegulation: Int,
        totalPutts: Int,
        dateLabel: String,
        holesPlayed: Int = 18,
        bestStretch: String = "Steady round",
        notes: String = "Self-reported preview round"
    ) {
        self.id = id
        self.courseName = courseName
        self.format = format
        self.teeSet = teeSet
        self.grossScore = grossScore
        self.relativeToPar = relativeToPar
        self.fairwaysHit = fairwaysHit
        self.greensInRegulation = greensInRegulation
        self.totalPutts = totalPutts
        self.dateLabel = dateLabel
        self.holesPlayed = holesPlayed
        self.bestStretch = bestStretch
        self.notes = notes
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        courseName = try container.decode(String.self, forKey: .courseName)
        format = try container.decode(String.self, forKey: .format)
        teeSet = try container.decode(String.self, forKey: .teeSet)
        grossScore = try container.decode(Int.self, forKey: .grossScore)
        relativeToPar = try container.decode(Int.self, forKey: .relativeToPar)
        fairwaysHit = try container.decode(Int.self, forKey: .fairwaysHit)
        greensInRegulation = try container.decode(Int.self, forKey: .greensInRegulation)
        totalPutts = try container.decode(Int.self, forKey: .totalPutts)
        dateLabel = try container.decode(String.self, forKey: .dateLabel)
        holesPlayed = try container.decodeIfPresent(Int.self, forKey: .holesPlayed) ?? 18
        bestStretch = try container.decodeIfPresent(String.self, forKey: .bestStretch) ?? "Steady round"
        notes = try container.decodeIfPresent(String.self, forKey: .notes) ?? "Self-reported preview round"
    }
}

struct DiscoveryGolfer: Identifiable, Hashable {
    let id: UUID
    let name: String
    let location: String
    let handicapLabel: String
    let vibe: String
    let availability: String
    let matchPlayInterest: String
    let accentHex: String

    init(
        id: UUID = UUID(),
        name: String,
        location: String,
        handicapLabel: String,
        vibe: String,
        availability: String,
        matchPlayInterest: String,
        accentHex: String
    ) {
        self.id = id
        self.name = name
        self.location = location
        self.handicapLabel = handicapLabel
        self.vibe = vibe
        self.availability = availability
        self.matchPlayInterest = matchPlayInterest
        self.accentHex = accentHex
    }
}

struct OpenGame: Identifiable, Codable {
    let id: UUID
    let hostName: String
    let courseName: String
    let dateLabel: String
    let holes: Int
    let format: String
    let walking: String
    var remainingSpots: Int
    let approvalRequired: Bool
    var requestState: OpenGameRequestState

    init(
        id: UUID = UUID(),
        hostName: String,
        courseName: String,
        dateLabel: String,
        holes: Int,
        format: String,
        walking: String,
        remainingSpots: Int,
        approvalRequired: Bool,
        requestState: OpenGameRequestState = .none
    ) {
        self.id = id
        self.hostName = hostName
        self.courseName = courseName
        self.dateLabel = dateLabel
        self.holes = holes
        self.format = format
        self.walking = walking
        self.remainingSpots = remainingSpots
        self.approvalRequired = approvalRequired
        self.requestState = requestState
    }
}

enum OpenGameRequestState: String, Codable {
    case none
    case requested
    case joined
}

struct MessageThread: Identifiable, Codable {
    let id: UUID
    let title: String
    var lastMessage: String
    var timeLabel: String
    var unreadCount: Int

    init(id: UUID = UUID(), title: String, lastMessage: String, timeLabel: String, unreadCount: Int) {
        self.id = id
        self.title = title
        self.lastMessage = lastMessage
        self.timeLabel = timeLabel
        self.unreadCount = unreadCount
    }
}

struct TractionMetrics: Codable {
    var onboardingCompletions: Int
    var searches: Int
    var bookingRequests: Int
    var interestedActions: Int
    var passActions: Int
    var openGameCreations: Int
    var joinRequests: Int
    var roundsSubmitted: Int
    var messagesSent: Int
    var returningSessions: Int

    static let previewSeed = TractionMetrics(
        onboardingCompletions: 0,
        searches: 0,
        bookingRequests: 0,
        interestedActions: 0,
        passActions: 0,
        openGameCreations: 0,
        joinRequests: 0,
        roundsSubmitted: 0,
        messagesSent: 0,
        returningSessions: 0
    )
}

enum TractionMetric {
    case onboardingCompletions
    case searches
    case bookingRequests
    case interestedActions
    case passActions
    case openGameCreations
    case joinRequests
    case roundsSubmitted
    case messagesSent
    case returningSessions
}

struct LeaderboardEntry: Identifiable, Codable {
    let id: UUID
    let rank: Int
    let player: String
    let location: String
    let metric: String
    let points: Int
    let movement: Int
    let verified: Bool

    init(id: UUID = UUID(), rank: Int, player: String, location: String, metric: String, points: Int, movement: Int, verified: Bool) {
        self.id = id
        self.rank = rank
        self.player = player
        self.location = location
        self.metric = metric
        self.points = points
        self.movement = movement
        self.verified = verified
    }
}

struct NotificationItem: Identifiable, Codable {
    let id: UUID
    let title: String
    let subtitle: String
    let timeLabel: String

    init(id: UUID = UUID(), title: String, subtitle: String, timeLabel: String) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.timeLabel = timeLabel
    }
}

struct ScoreHole: Identifiable, Codable {
    let id: UUID
    let holeNumber: Int
    let par: Int
    let score: Int
    let putts: Int
    let fairway: String
    let gir: Bool

    init(id: UUID = UUID(), holeNumber: Int, par: Int, score: Int, putts: Int, fairway: String, gir: Bool) {
        self.id = id
        self.holeNumber = holeNumber
        self.par = par
        self.score = score
        self.putts = putts
        self.fairway = fairway
        self.gir = gir
    }
}

struct LiveHoleDraft: Codable {
    var holeNumber: Int
    var par: Int
    var score: Int
    var putts: Int
    var fairway: String
    var gir: Bool
}

enum TeeTimePartySize: Int, CaseIterable, Codable {
    case solo = 1
    case twosome = 2
    case threesome = 3
    case foursome = 4

    var label: String {
        switch self {
        case .solo: return "1"
        case .twosome: return "2"
        case .threesome: return "3"
        case .foursome: return "4"
        }
    }
}

struct CreateOpenGameDraft {
    var courseName: String
    var dateLabel: String
    var holes: Int
    var format: String
    var walking: String
    var spots: Int
    var approvalRequired: Bool
}

struct ProfileDraft {
    var firstName: String
    var lastName: String
    var username: String
    var city: String
    var state: String
    var handicapValue: Double
    var reliabilityLabel: String
    var proMember: Bool
    var homeCourse: String
    var availability: String
    var preferredFormats: [String]
    var discoveryRadiusMiles: Double
    var isDiscoveryVisible: Bool

    init(profile: Profile) {
        firstName = profile.firstName
        lastName = profile.lastName
        username = profile.username
        city = profile.city
        state = profile.state
        handicapValue = profile.handicapValue
        reliabilityLabel = profile.reliabilityLabel
        proMember = profile.proMember
        homeCourse = profile.homeCourse
        availability = profile.availability
        preferredFormats = profile.preferredFormats
        discoveryRadiusMiles = Double(profile.discoveryRadiusMiles)
        isDiscoveryVisible = profile.isDiscoveryVisible
    }
}

struct OnboardingDraft {
    var city: String
    var state: String
    var homeCourse: String
    var availability: String
    var preferredFormats: [String]
    var discoveryRadiusMiles: Double
    var isDiscoveryVisible: Bool
}

enum TeeTimeSort: String, CaseIterable, Codable {
    case recommended = "Recommended"
    case earliest = "Earliest"
    case lowestPrice = "Lowest Price"
}

struct PersistedState: Codable {
    var isSignedIn: Bool
    var hasCompletedOnboarding: Bool
    var profile: Profile
    var searchText: String
    var selectedSort: TeeTimeSort
    var currentHole: Int
    var totalScore: Int
    var totalPutts: Int
    var holesCompleted: Int
    var activeFiltersCount: Int
    var bookings: [Booking]
    var recentRounds: [RoundSummary]
    var openGames: [OpenGame]
    var messageThreads: [MessageThread]?
    var tractionMetrics: TractionMetrics?
}

enum MatchFormatOption: String, CaseIterable {
    case matchPlay = "Match Play"
    case strokePlay = "Stroke Play"
    case skins = "Skins"
    case casual = "Casual"
    case practice = "Practice"
}
