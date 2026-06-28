import SwiftUI

enum AppPalette {
    static let fairway = Color(red: 0.12, green: 0.43, blue: 0.26)
    static let fairwayDark = Color(red: 0.08, green: 0.31, blue: 0.19)
    static let gold = Color(red: 0.84, green: 0.63, blue: 0.24)
    static let ink = Color(red: 0.09, green: 0.13, blue: 0.12)
    static let secondaryText = Color(red: 0.34, green: 0.40, blue: 0.38)
    static let tertiaryText = Color(red: 0.45, green: 0.50, blue: 0.48)
    static let badge = Color(red: 0.88, green: 0.94, blue: 0.87)
    static let line = Color.black.opacity(0.06)
    static let panel = Color.white.opacity(0.74)
    static let backgroundGradient = LinearGradient(
        colors: [
            Color(red: 0.97, green: 0.98, blue: 0.95),
            Color(red: 0.93, green: 0.95, blue: 0.92),
            Color(red: 0.90, green: 0.93, blue: 0.89)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
