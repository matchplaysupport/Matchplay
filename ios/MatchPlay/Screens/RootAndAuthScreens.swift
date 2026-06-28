import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        Group {
            if !store.isSignedIn {
                LoginView()
            } else if !store.hasCompletedOnboarding {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
        .preferredColorScheme(.light)
    }
}

struct LoginView: View {
    @EnvironmentObject private var store: MatchPlayStore
    @State private var email = "preview@matchplay.test"

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 28) {
                        VStack(alignment: .leading, spacing: 14) {
                            AppBadge(text: "Native iPhone build")
                            Text("Match Play")
                                .font(.system(size: 42, weight: .heavy, design: .rounded))
                            Text("Find compatible golfers, request a tee time, score the round, and keep the group moving.")
                                .font(.title3)
                                .foregroundColor(AppPalette.secondaryText)
                        }

                        PremiumCard {
                            VStack(spacing: 14) {
                                AppTextField(title: "Email", text: $email)
                                AppSecureField(title: "Password")
                                Button("Continue") {
                                    store.signIn()
                                }
                                .buttonStyle(PrimaryButtonStyle())
                                HStack {
                                    featurePill("Concierge")
                                    featurePill("Scoring")
                                    featurePill("Games")
                                }
                            }
                        }
                    }
                    .padding(20)
                    .padding(.top, 40)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct OnboardingView: View {
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        NavigationView {
            ZStack {
                AppPalette.backgroundGradient.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        Text("Set up your golfer profile")
                            .font(.system(size: 34, weight: .bold, design: .rounded))
                        Text("Confirm the essentials Match Play uses to recommend groups, courses, and scoring context.")
                            .foregroundColor(AppPalette.secondaryText)

                        PremiumCard {
                            VStack(alignment: .leading, spacing: 16) {
                                AppTextField(title: "City", text: $store.onboardingDraft.city)
                                AppTextField(title: "State", text: $store.onboardingDraft.state)
                                AppTextField(title: "Home course", text: $store.onboardingDraft.homeCourse)
                                AppTextField(title: "Availability", text: $store.onboardingDraft.availability)
                                VStack(alignment: .leading, spacing: 10) {
                                    Text("Preferred formats")
                                        .font(.headline)
                                    formatSelectionGrid(selection: $store.onboardingDraft.preferredFormats)
                                }
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Discovery radius")
                                        .font(.headline)
                                    Text("\(Int(store.onboardingDraft.discoveryRadiusMiles)) miles")
                                        .font(.title3.bold())
                                    Slider(value: $store.onboardingDraft.discoveryRadiusMiles, in: 5...75, step: 5)
                                        .tint(AppPalette.fairway)
                                }
                                Toggle("Show me in player discovery", isOn: $store.onboardingDraft.isDiscoveryVisible)
                                    .tint(AppPalette.fairway)
                                Text("Exact home coordinates stay private. Discovery uses approximate location only.")
                                    .font(.footnote)
                                    .foregroundColor(AppPalette.secondaryText)

                                Button("Complete onboarding") {
                                    store.finishOnboarding()
                                }
                                .buttonStyle(PrimaryButtonStyle())
                            }
                        }
                    }
                    .padding(20)
                    .padding(.top, 20)
                }
            }
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

private struct FormatSelectionGrid: View {
    @Binding var selection: [String]
    @EnvironmentObject private var store: MatchPlayStore

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(MatchFormatOption.allCases, id: \.rawValue) { option in
                Button {
                    store.toggleFormatSelection(option.rawValue, in: &selection)
                } label: {
                    HStack {
                        Image(systemName: selection.contains(option.rawValue) ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(selection.contains(option.rawValue) ? AppPalette.fairway : AppPalette.secondaryText)
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
    }
}

private func formatSelectionGrid(selection: Binding<[String]>) -> some View {
    FormatSelectionGrid(selection: selection)
}

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Home", systemImage: "house.fill") }
            TeeTimesView()
                .tabItem { Label("Tee Times", systemImage: "calendar") }
            PlayView()
                .tabItem { Label("Play", systemImage: "figure.golf") }
            LeaderboardsView()
                .tabItem { Label("Leaders", systemImage: "list.number") }
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.fill") }
        }
        .accentColor(AppPalette.fairway)
    }
}
