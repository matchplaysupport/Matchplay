import SwiftUI

@main
struct MatchPlayApp: App {
    @StateObject private var store = MatchPlayStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
    }
}
