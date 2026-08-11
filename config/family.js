window.CHAMI_FAMILY = {
  brand: {
    name: "Chami",
    fullName: "Chami Learning Adventure",
    guide: "Chami",
    companion: "Peach"
  },
  children: {
    Aurora: {
      id: "Aurora",
      displayName: "Auro",
      avatar: "assets/auro.png",
      englishStartingLevel: 2,
      ukrainianStartingLevel: 1,
      literacy: {
        englishReadingStage: "fluent_child_reader",
        typingComfort: "comfortable",
        preferAudioSupport: false,
        maxIndependentSentenceWords: 14,
        allowFreeTyping: true
      }
    },
    Teia: {
      id: "Teia",
      displayName: "Teia",
      avatar: "assets/teia.png",
      englishStartingLevel: 1,
      ukrainianStartingLevel: 1,
      literacy: {
        englishReadingStage: "early_reader",
        typingComfort: "developing",
        preferAudioSupport: true,
        maxIndependentSentenceWords: 6,
        allowFreeTyping: false
      }
    }
  },
  characters: {
    Chami: {
      image: "assets/chami.png",
      traits: ["cream coat", "pink nose", "yellow-green eyes"]
    },
    Peach: {
      image: "assets/peach.png"
    }
  },
  learning: {
    maxNewEnglish: 5,
    maxNewUkrainian: 5,
    dadDayNewItems: 0,
    useLearningDaysNotCalendarStreaks: true,
    targetScreenMinutes: 12,
    maxScreenMinutes: 15,
    minimumUsefulMinutes: 7,
    placementSeconds: 18,
    reviewSeconds: 35,
    newWordSeconds: 50,
    challengeSeconds: 55,
    storySeconds: 55,
    rewardSeconds: 25,
    offscreenMissionCountsAgainstScreenBudget: false
  }
,
  ai: {
    enabled: false,
    endpoint: "",
    timeoutMs: 5000,
    allowGeneratedStories: true,
    allowGeneratedExplanations: true,
    allowOpenChat: false,
    sendChildName: false,
    fallbackToLocal: true
  }
};
