// ─── Internationalisation (i18n) ──────────────────────────────────────────────
// Provides translated strings for all UI text in the app.
// Supported languages: English (en), French (fr), Spanish (es), German (de), Chinese (zh).
// The active language is detected automatically from the device locale via expo-localization.
// All screens and components consume translations through the useTranslation() hook.
// Web: use browser locale instead of expo-localization
const getLocales = () => [{ languageTag: navigator.language ?? "en" }]

// Helper function types used in the interface below.
// F1: function that takes one string argument (e.g. category name in a confirm dialog).
// F2: function that takes two string arguments (e.g. block name + time in a delete confirm).
// FN: function that takes a number argument (e.g. streak count for pluralization).
type F1 = (a: string) => string
type F2 = (a: string, b: string) => string
type FN = (n: number) => string

// T is the shape that every language object must satisfy.
// TypeScript will error at compile time if any key is missing from a language object.
interface T {
  // Nav
  back: string
  // Main
  sessionTitlePlaceholder: string
  focusMode: string
  exitFocus: string
  tapToExitFocus: string
  pause: string
  start: string
  next: string
  terminate: string
  // History
  history: string
  noSessionsYet: string
  completeTimerToSee: string
  deleteAction: string
  todayLabel: string
  yesterdayLabel: string
  // Categories
  categories: string
  newCategoryName: string
  addCategory: string
  loading: string
  deleteCategory: string
  deleteConfirm: F1
  cancel: string
  ok: string
  // Quick timers
  quickTimers: string
  labelPlaceholder: string
  durationMinutesPlaceholder: string
  addQuickTimer: string
  deleteTimer: string
  deleteTimerConfirm: F1
  // Settings
  settings: string
  circleStyle: string
  circleThick: string
  stroke: string
  solid: string
  gradient: string
  colorLabel: string
  categoryColor: string
  customColor: string
  backgroundSolid: string
  backgroundGradient: string
  resetToDefaults: string
  // Behaviour settings
  behaviour: string
  notificationsLabel: string
  notificationsDesc: string
  autoStartLabel: string
  autoStartDesc: string
  interruptionLabel: string
  interruptionDesc: string
  interruptionSessionName: string
  notifTimerDoneTitle: string
  notifTimerDoneBody: string
  notifTimerRunningTitle: string
  notifTimerEndsAt: F1
  notifBlockTitle: string
  notifBlockBody: F1
  // Mesh / glow gradient names — keys match MeshKey in lib/backgroundPresets.ts
  backgroundMesh: string
  meshVoid: string
  meshAurora: string
  meshNebula: string
  meshCosmos: string
  meshDusk: string
  meshCrimson: string
  meshBloom: string
  meshPolar: string
  meshGalaxy: string
  // Gradient names — keys match the GradientKey type in settings.tsx
  midnight: string
  deepBlue: string
  purpleNight: string
  forest: string
  ember: string
  ocean: string
  bloodMoon: string
  roseName: string
  sky: string
  blush: string
  lavender: string
  mint: string
  // Schedule
  schedule: string
  day: string
  week: string
  today: string
  noBlocksForDay: string
  addTo: F1
  startTime: string
  titleOptional: string
  add: string
  deleteBlock: string
  deleteBlockConfirm: F2
  deleteBlocksDayConfirm: F1
  fill95: string
  fill95Title: string
  fill95Apply: string
  fill95Empty: string
  noCategorySelected: string
  pleaseSelectCategory: string
  invalidTime: string
  invalidDuration: string
  enterValidDuration: string
  // Days — full names used in schedule headings, short names used in day tabs and dashboard
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string
  mon: string
  tue: string
  wed: string
  thu: string
  fri: string
  sat: string
  sun: string
  todayBadge: string
  // History filters + delete all (app/history.tsx)
  filterSessions: string
  allCategories: string
  clearFilters: string
  deleteAll: string
  deleteAllConfirm: string
  deleteAllFilteredConfirm: string
  noSessionsFilter: string
  // About screen + privacy policy
  about: string
  privacyPolicy: string
  appVersion: string
  // Quick timer confirmation
  stopCurrentTimer: string
  stopCurrentTimerMsg: string
  // Next timer preview
  nextUp: string
  // Schedule block edit
  editBlock: string
  saveChanges: string
  // History export (app/history.tsx) — premium feature
  exportCSV: string
  exportPeriod: string
  exportDone: string
  // Session edit (app/session/[id].tsx)
  editSession: string
  titleField: string
  categoryField: string
  timeSpent: string
  durationField: string
  saving: string
  deleteSession: string
  deleteSessionConfirm: string
  // Burger menu
  signOut: string
  // Login screen
  signIn: string
  createAccount: string
  emailPlaceholder: string
  passwordPlaceholder: string
  alreadyHaveAccount: string
  noAccount: string
  checkEmail: string
  checkEmailMsg: string
  checkSpam: string
  resendEmail: string
  resendEmailSent: string
  errorLabel: string
  continueWithGoogle: string
  orSeparator: string
  continueWithoutAccount: string
  guestBanner: string
  convertAccount: string
  convertAccountDesc: string
  premiumRequiresAccount: string
  premiumRequiresAccountDesc: string
  // Dashboard (app/dashboard.tsx)
  dashboard: string
  timeWorked: string
  thisWeek: string
  thisMonth: string
  byCategory: string
  allTime: string         // full label, not currently used in pills but kept for potential reuse
  completionRate: string
  bestDayLabel: string
  streakLabel: string
  streakDays: FN          // e.g. "3 days" / "3 jours"
  noData: string
  daysUnit: string        // short unit used in period pills: "d" / "j" / "T" / "天"
  allTimeShort: string    // compact "all time" label for the pill: "All" / "Tout"
  customPeriod: string    // label for the custom date range pill: "Custom" / "Perso"
  dateFrom: string        // label for the start date button: "From" / "Du"
  dateTo: string          // label for the end date button: "To" / "Au"
  // Subscription / upgrade (app/upgrade.tsx + app/account.tsx)
  premium: string
  standard: string
  currentPlan: string
  upgradeToPremium: string
  manageSubscription: string
  goPremium: string
  premiumSubtitle: string
  premiumPrice: string
  subscribe: string
  restoreStatus: string
  cancelAnytime: string
  featureSchedule: string
  featurePeriods: string
  featureCategories: string
  featureTimers: string
  featureHistory: string
  historyLimitNote: string
  slotConflict: string
  slotConflictMsg: F1
  premiumFeature: string
  upgradeNow: string
  freeLimitReached: string
  // Help screen (app/help.tsx)
  help: string
  helpTimerDesc: string
  helpDashboardDesc: string
  helpHistoryDesc: string
  helpScheduleDesc: string
  helpCategoriesDesc: string
  helpQuickTimersDesc: string
  helpSettingsDesc: string
  helpAccountDesc: string
  // Account screen (app/account.tsx)
  account: string
  accountInfo: string
  displayName: string
  nameSaved: string
  security: string
  newPassword: string
  confirmPassword: string
  updatePassword: string
  passwordUpdated: string
  passwordsNoMatch: string
  passwordTooShort: string
  googlePasswordNote: string
  dangerZone: string
  deleteAccount: string
  deleteAccountConfirm: string
  deleteAccountNote: string
}

// ─── English ──────────────────────────────────────────────────────────────────
const en: T = {
  back: "Back",
  sessionTitlePlaceholder: "Session title (optional)",
  focusMode: "Focus mode",
  exitFocus: "Exit focus",
  tapToExitFocus: "Tap here to exit focus",
  pause: "Pause",
  start: "Start",
  next: "Next",
  terminate: "Terminate",
  history: "History",
  noSessionsYet: "No sessions yet.",
  completeTimerToSee: "Complete a timer to see it here.",
  deleteAction: "Delete",
  todayLabel: "Today",
  yesterdayLabel: "Yesterday",
  categories: "Categories",
  newCategoryName: "New category name",
  addCategory: "Add category",
  loading: "Loading...",
  deleteCategory: "Delete category",
  deleteConfirm: (n) => `Are you sure you want to delete "${n}"?`,
  cancel: "Cancel",
  ok: "OK",
  quickTimers: "Quick timers",
  labelPlaceholder: "Label (e.g. Deep focus)",
  durationMinutesPlaceholder: "Duration in minutes (e.g. 25)",
  addQuickTimer: "Add quick timer",
  deleteTimer: "Delete timer",
  deleteTimerConfirm: (l) => `Delete "${l}"?`,
  settings: "Settings",
  circleStyle: "Circle style",
  circleThick: "Thick stroke",
  stroke: "Stroke",
  solid: "Solid",
  gradient: "Gradient",
  colorLabel: "Color",
  categoryColor: "Category color",
  customColor: "Custom color",
  backgroundSolid: "Background — solid",
  backgroundGradient: "Background — gradient",
  resetToDefaults: "Reset to defaults",
  behaviour: "Behaviour",
  notificationsLabel: "Notifications",
  notificationsDesc: "Alert when a timer ends or a scheduled session starts",
  autoStartLabel: "Auto-start scheduled timers",
  autoStartDesc: "Timer starts automatically at the planned time",
  interruptionLabel: "Interruption button",
  interruptionDesc: "Pause the current timer and log an interruption",
  interruptionSessionName: "Interruption",
  notifTimerDoneTitle: "⏱ Timer done",
  notifTimerDoneBody: "Your session is complete!",
  notifTimerRunningTitle: "⏱ Timer running",
  notifTimerEndsAt: (time) => `Ends at ${time}`,
  notifBlockTitle: "📅 Scheduled session",
  notifBlockBody: (name) => `Time to start: ${name}`,
  backgroundMesh: "Background — glow",
  meshVoid: "Void",
  meshAurora: "Aurora",
  meshNebula: "Nebula",
  meshCosmos: "Cosmos",
  meshDusk: "Dusk",
  meshCrimson: "Crimson",
  meshBloom: "Bloom",
  meshPolar: "Polar",
  meshGalaxy: "Galaxy",
  midnight: "Midnight",
  deepBlue: "Deep blue",
  purpleNight: "Purple night",
  forest: "Forest",
  ember: "Ember",
  ocean: "Ocean",
  bloodMoon: "Blood moon",
  roseName: "Rose",
  sky: "Sky",
  blush: "Blush",
  lavender: "Lavender",
  mint: "Mint",
  schedule: "Schedule",
  day: "Day",
  week: "Week",
  today: "Today",
  noBlocksForDay: "No blocks for this day.",
  addTo: (d) => `Add to ${d}`,
  startTime: "Start time",
  titleOptional: "Title (optional)",
  add: "Add",
  deleteBlock: "Delete block",
  deleteBlockConfirm: (n, t) => `Delete "${n}" at ${t}?`,
  deleteBlocksDayConfirm: (day) => `Delete all blocks for ${day}?`,
  fill95: "Fill 9–5",
  fill95Title: "Fill 9 to 5",
  fill95Apply: "Apply",
  fill95Empty: "No gaps to fill between 9:00 and 17:00",
  noCategorySelected: "No category",
  pleaseSelectCategory: "Please select a category.",
  invalidTime: "Invalid time",
  invalidDuration: "Invalid duration",
  enterValidDuration: "Enter a duration in minutes, e.g. 50.",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
  todayBadge: "today",
  filterSessions: "Filter",
  allCategories: "All categories",
  clearFilters: "Clear",
  deleteAll: "Delete all",
  deleteAllConfirm: "Delete all sessions? This action cannot be undone.",
  deleteAllFilteredConfirm: "Delete {n} sessions matching the current filter? This action cannot be undone.",
  noSessionsFilter: "No sessions match this filter.",
  about: "About",
  privacyPolicy: "Privacy Policy",
  appVersion: "Version",
  stopCurrentTimer: "Timer in progress",
  stopCurrentTimerMsg: "Stop current timer and start {label}?",
  nextUp: "Next",
  editBlock: "Edit",
  exportCSV: "Export CSV",
  exportPeriod: "Period",
  exportDone: "File ready to share",
  editSession: "Edit session",
  titleField: "Title",
  categoryField: "Category",
  timeSpent: "Time spent",
  durationField: "Duration",
  saveChanges: "Save changes",
  saving: "Saving...",
  deleteSession: "Delete session",
  deleteSessionConfirm: "Are you sure you want to delete this session?",
  signOut: "Sign out",
  signIn: "Sign in",
  createAccount: "Create account",
  emailPlaceholder: "Email",
  passwordPlaceholder: "Password",
  alreadyHaveAccount: "Already have an account? Sign in",
  noAccount: "No account? Create one",
  checkEmail: "Check your email",
  checkEmailMsg: "We sent you a confirmation link.",
  checkSpam: "If you don't see it, check your spam folder.",
  resendEmail: "Resend email",
  resendEmailSent: "Email sent!",
  errorLabel: "Error",
  continueWithGoogle: "Continue with Google",
  orSeparator: "or",
  continueWithoutAccount: "Continue without account",
  guestBanner: "Create an account to back up your data across devices.",
  convertAccount: "Create an account",
  convertAccountDesc: "Your existing data will be kept.",
  premiumRequiresAccount: "Account required",
  premiumRequiresAccountDesc: "Create an account to unlock Premium. Your current data will be kept.",
  dashboard: "Dashboard",
  timeWorked: "Time worked",
  thisWeek: "This week",
  thisMonth: "This month",
  byCategory: "By category",
  allTime: "All time",
  completionRate: "Completion",
  bestDayLabel: "Best day",
  streakLabel: "Streak",
  streakDays: (n) => `${n} day${n > 1 ? "s" : ""}`,
  noData: "No sessions yet. Start a timer!",
  daysUnit: "d",
  allTimeShort: "All",
  customPeriod: "Custom",
  dateFrom: "From",
  dateTo: "To",
  premium: "Premium",
  standard: "Standard",
  currentPlan: "Current plan",
  upgradeToPremium: "Upgrade to Premium",
  manageSubscription: "Manage subscription",
  goPremium: "Go Premium",
  premiumSubtitle: "Unlock the full FlowPilot experience",
  premiumPrice: "€ 4.99",
  subscribe: "Buy Now",
  restoreStatus: "Already purchased? Refresh",
  cancelAnytime: "Lifetime access · One-time payment",
  featureSchedule: "Weekly schedule planning",
  featurePeriods: "All dashboard time periods",
  featureCategories: "Unlimited categories",
  featureTimers: "Unlimited quick timers",
  featureHistory: "Unlimited history",
  historyLimitNote: "Free plan · last 30 days",
  slotConflict: "Time conflict",
  slotConflictMsg: (name) => `This slot overlaps with "${name}".`,
  premiumFeature: "Premium feature",
  upgradeNow: "Upgrade now",
  freeLimitReached: "Free plan limit reached",
  help: "Help",
  helpTimerDesc: "Set a duration, choose a category, and press Start. The circular arc tracks your progress. Focus mode hides all controls. Press Next to load your next scheduled block, or Terminate to stop and save the session early.",
  helpDashboardDesc: "Overview of your focus time: total minutes, completion rate, best day, and current streak. Filter by week, month, or a custom range. The chart breaks down time by category.",
  helpHistoryDesc: "Every completed or terminated session appears here, grouped by date. Swipe left to delete. Tap to edit the title or category. Premium: unlimited history + CSV export.",
  helpScheduleDesc: "Plan recurring work blocks by day of the week. Each block has a start time, duration, and category. When the time comes, the app pre-fills the timer automatically — and can start it on its own if Auto-start is enabled in Settings.",
  helpCategoriesDesc: "Organise your sessions by topic (Work, Study, Sport…). Each category has a color shown on the arc and in history. Free plan: up to 5 categories. Premium: unlimited.",
  helpQuickTimersDesc: "One-tap duration presets displayed below the timer. Tap one to instantly apply that duration. Free plan: up to 3 presets. Premium: unlimited.",
  helpSettingsDesc: "Customise the circle style and color, the background, and behaviour options: notifications, auto-start for scheduled timers, and the interruption button (Premium).",
  helpAccountDesc: "Manage your profile, change your password, or delete your account. Guest users can create an account here to sync data across devices. Your Premium status is shown here too.",
  account: "Account",
  accountInfo: "Account info",
  displayName: "Display name",
  nameSaved: "Name saved",
  security: "Security",
  newPassword: "New password",
  confirmPassword: "Confirm new password",
  updatePassword: "Update password",
  passwordUpdated: "Password updated",
  passwordsNoMatch: "Passwords do not match",
  passwordTooShort: "Password must be at least 6 characters",
  googlePasswordNote: "Password is managed by your Google account",
  dangerZone: "Danger zone",
  deleteAccount: "Delete my account",
  deleteAccountConfirm: "This will permanently delete all your sessions, categories, timers, schedule, and your account. This cannot be undone.",
  deleteAccountNote: "All your data will be permanently erased.",
}

// ─── French ───────────────────────────────────────────────────────────────────
const fr: T = {
  back: "Retour",
  sessionTitlePlaceholder: "Titre de session (optionnel)",
  focusMode: "Mode focus",
  exitFocus: "Quitter le focus",
  tapToExitFocus: "Appuyer pour quitter le focus",
  pause: "Pause",
  start: "Démarrer",
  next: "Suivant",
  terminate: "Terminer",
  history: "Historique",
  noSessionsYet: "Aucune session pour l'instant.",
  completeTimerToSee: "Complétez un timer pour le voir ici.",
  deleteAction: "Supprimer",
  todayLabel: "Aujourd'hui",
  yesterdayLabel: "Hier",
  categories: "Catégories",
  newCategoryName: "Nom de la nouvelle catégorie",
  addCategory: "Ajouter une catégorie",
  loading: "Chargement…",
  deleteCategory: "Supprimer la catégorie",
  deleteConfirm: (n) => `Voulez-vous vraiment supprimer « ${n} » ?`,
  cancel: "Annuler",
  ok: "OK",
  quickTimers: "Timers rapides",
  labelPlaceholder: "Nom (ex. Focus profond)",
  durationMinutesPlaceholder: "Durée en minutes (ex. 25)",
  addQuickTimer: "Ajouter un timer rapide",
  deleteTimer: "Supprimer le timer",
  deleteTimerConfirm: (l) => `Supprimer « ${l} » ?`,
  settings: "Paramètres",
  circleStyle: "Style du cercle",
  circleThick: "Trait épais",
  stroke: "Trait",
  solid: "Plein",
  gradient: "Dégradé",
  colorLabel: "Couleur",
  categoryColor: "Couleur de catégorie",
  customColor: "Couleur personnalisée",
  backgroundSolid: "Fond — uni",
  backgroundGradient: "Fond — dégradé",
  resetToDefaults: "Réinitialiser",
  behaviour: "Comportement",
  notificationsLabel: "Notifications",
  notificationsDesc: "Alerte à la fin du timer et au démarrage des sessions planifiées",
  autoStartLabel: "Démarrer automatiquement les timers planifiés",
  autoStartDesc: "Le timer se lance seul à l'heure prévue",
  interruptionLabel: "Bouton d'interruption",
  interruptionDesc: "Met en pause le timer et enregistre une interruption",
  interruptionSessionName: "Interruption",
  notifTimerDoneTitle: "⏱ Timer terminé",
  notifTimerDoneBody: "Ta session est terminée !",
  notifTimerRunningTitle: "⏱ Timer en cours",
  notifTimerEndsAt: (time) => `Se termine à ${time}`,
  notifBlockTitle: "📅 Session planifiée",
  notifBlockBody: (name) => `C'est l'heure : ${name}`,
  backgroundMesh: "Fond — lueur",
  meshVoid: "Vide",
  meshAurora: "Aurore",
  meshNebula: "Nébuleuse",
  meshCosmos: "Cosmos",
  meshDusk: "Crépuscule",
  meshCrimson: "Cramoisi",
  meshBloom: "Floraison",
  meshPolar: "Polaire",
  meshGalaxy: "Galaxie",
  midnight: "Minuit",
  deepBlue: "Bleu profond",
  purpleNight: "Nuit violette",
  forest: "Forêt",
  ember: "Braise",
  ocean: "Océan",
  bloodMoon: "Lune de sang",
  roseName: "Rose",
  sky: "Ciel",
  blush: "Blush",
  lavender: "Lavande",
  mint: "Menthe",
  schedule: "Planning",
  day: "Jour",
  week: "Semaine",
  today: "Aujourd'hui",
  noBlocksForDay: "Aucun bloc pour ce jour.",
  addTo: (d) => `Ajouter — ${d}`,
  startTime: "Heure",
  titleOptional: "Titre (optionnel)",
  add: "Ajouter",
  deleteBlock: "Supprimer le bloc",
  deleteBlockConfirm: (n, time) => `Supprimer « ${n} » à ${time} ?`,
  deleteBlocksDayConfirm: (day) => `Supprimer tous les blocs de ${day} ?`,
  fill95: "Remplir 9–17",
  fill95Title: "Remplir 9h–17h",
  fill95Apply: "Appliquer",
  fill95Empty: "Aucun créneau disponible entre 9h et 17h",
  noCategorySelected: "Aucune catégorie",
  pleaseSelectCategory: "Veuillez sélectionner une catégorie.",
  invalidTime: "Heure invalide",
  invalidDuration: "Durée invalide",
  enterValidDuration: "Entrez une durée en minutes, ex. 50.",
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
  mon: "Lun",
  tue: "Mar",
  wed: "Mer",
  thu: "Jeu",
  fri: "Ven",
  sat: "Sam",
  sun: "Dim",
  todayBadge: "aujourd'hui",
  filterSessions: "Filtrer",
  allCategories: "Toutes les catégories",
  clearFilters: "Effacer",
  deleteAll: "Tout supprimer",
  deleteAllConfirm: "Supprimer toutes les sessions ? Cette action est irréversible.",
  deleteAllFilteredConfirm: "Supprimer {n} sessions correspondant au filtre actif ? Cette action est irréversible.",
  noSessionsFilter: "Aucune session ne correspond au filtre.",
  about: "À propos",
  privacyPolicy: "Politique de confidentialité",
  appVersion: "Version",
  stopCurrentTimer: "Timer en cours",
  stopCurrentTimerMsg: "Arrêter le timer en cours et lancer {label} ?",
  nextUp: "Suivant",
  editBlock: "Modifier",
  exportCSV: "Exporter CSV",
  exportPeriod: "Période",
  exportDone: "Fichier prêt à partager",
  editSession: "Modifier la session",
  titleField: "Titre",
  categoryField: "Catégorie",
  timeSpent: "Temps passé",
  durationField: "Durée",
  saveChanges: "Enregistrer",
  saving: "Enregistrement…",
  deleteSession: "Supprimer la session",
  deleteSessionConfirm: "Voulez-vous vraiment supprimer cette session ?",
  signOut: "Déconnexion",
  signIn: "Se connecter",
  createAccount: "Créer un compte",
  emailPlaceholder: "E-mail",
  passwordPlaceholder: "Mot de passe",
  alreadyHaveAccount: "Déjà un compte ? Se connecter",
  noAccount: "Pas de compte ? En créer un",
  checkEmail: "Vérifiez vos e-mails",
  checkEmailMsg: "Nous vous avons envoyé un lien de confirmation.",
  checkSpam: "Si vous ne le voyez pas, vérifiez vos spams.",
  resendEmail: "Renvoyer l'email",
  resendEmailSent: "Email envoyé !",
  errorLabel: "Erreur",
  continueWithGoogle: "Continuer avec Google",
  orSeparator: "ou",
  continueWithoutAccount: "Continuer sans compte",
  guestBanner: "Créez un compte pour sauvegarder vos données sur tous vos appareils.",
  convertAccount: "Créer un compte",
  convertAccountDesc: "Vos données actuelles seront conservées.",
  premiumRequiresAccount: "Compte requis",
  premiumRequiresAccountDesc: "Créez un compte pour accéder au Premium. Vos données actuelles seront conservées.",
  dashboard: "Tableau de bord",
  timeWorked: "Temps travaillé",
  thisWeek: "Cette semaine",
  thisMonth: "Ce mois",
  byCategory: "Par catégorie",
  allTime: "Depuis le début",
  completionRate: "Complétion",
  bestDayLabel: "Meilleur jour",
  streakLabel: "Série",
  streakDays: (n) => `${n} jour${n > 1 ? "s" : ""}`,
  noData: "Aucune session. Lancez un timer !",
  daysUnit: "j",
  allTimeShort: "Tout",
  customPeriod: "Perso",
  dateFrom: "Du",
  dateTo: "Au",
  premium: "Premium",
  standard: "Standard",
  currentPlan: "Abonnement actuel",
  upgradeToPremium: "Passer à Premium",
  manageSubscription: "Gérer l'abonnement",
  goPremium: "Passer Premium",
  premiumSubtitle: "Profitez de FlowPilot sans limites",
  premiumPrice: "4,99 €",
  subscribe: "Acheter",
  restoreStatus: "Déjà acheté ? Actualiser",
  cancelAnytime: "Accès à vie · Paiement unique",
  featureSchedule: "Planning hebdomadaire complet",
  featurePeriods: "Toutes les périodes du dashboard",
  featureCategories: "Catégories illimitées",
  featureTimers: "Timers rapides illimités",
  featureHistory: "Historique illimité",
  historyLimitNote: "Plan gratuit · 30 derniers jours",
  slotConflict: "Conflit d'horaire",
  slotConflictMsg: (name) => `Ce créneau est déjà occupé par « ${name} ».`,
  premiumFeature: "Fonctionnalité Premium",
  upgradeNow: "Mettre à niveau",
  freeLimitReached: "Limite du plan gratuit atteinte",
  help: "Aide",
  helpTimerDesc: "Choisissez une durée, sélectionnez une catégorie et appuyez sur Démarrer. L'arc circulaire suit votre progression. Le mode focus masque les contrôles. Appuyez sur Suivant pour charger le bloc planifié suivant, ou sur Terminer pour arrêter et enregistrer la session.",
  helpDashboardDesc: "Vue d'ensemble de votre focus : minutes totales, taux de complétion, meilleur jour et série en cours. Filtrez par semaine, mois ou période personnalisée. Le graphique montre la répartition par catégorie.",
  helpHistoryDesc: "Chaque session terminée ou interrompue apparaît ici, groupée par date. Glissez à gauche pour supprimer. Appuyez pour modifier le titre ou la catégorie. Premium : historique illimité + export CSV.",
  helpScheduleDesc: "Planifiez des blocs récurrents par jour de la semaine. Chaque bloc a une heure, une durée et une catégorie. Quand l'heure arrive, l'app pré-remplit le timer automatiquement — et peut le démarrer seul si le démarrage auto est activé dans les Paramètres.",
  helpCategoriesDesc: "Organisez vos sessions par thème (Travail, Étude, Sport…). Chaque catégorie a une couleur visible sur l'arc et dans l'historique. Plan gratuit : 5 catégories max. Premium : illimité.",
  helpQuickTimersDesc: "Préréglages de durée en un tap, affichés sous le timer. Appuyez pour appliquer instantanément cette durée. Plan gratuit : 3 préréglages max. Premium : illimité.",
  helpSettingsDesc: "Personnalisez le style et la couleur du cercle, l'arrière-plan et les options de comportement : notifications, démarrage automatique des timers planifiés, bouton d'interruption (Premium).",
  helpAccountDesc: "Gérez votre profil, changez votre mot de passe ou supprimez votre compte. Les utilisateurs anonymes peuvent créer un compte ici pour synchroniser leurs données. Le statut Premium est également affiché.",
  account: "Compte",
  accountInfo: "Informations",
  displayName: "Nom affiché",
  nameSaved: "Nom enregistré",
  security: "Sécurité",
  newPassword: "Nouveau mot de passe",
  confirmPassword: "Confirmer le mot de passe",
  updatePassword: "Mettre à jour",
  passwordUpdated: "Mot de passe mis à jour",
  passwordsNoMatch: "Les mots de passe ne correspondent pas",
  passwordTooShort: "Au moins 6 caractères requis",
  googlePasswordNote: "Le mot de passe est géré par votre compte Google",
  dangerZone: "Zone dangereuse",
  deleteAccount: "Supprimer mon compte",
  deleteAccountConfirm: "Cela supprimera définitivement toutes vos sessions, catégories, timers, planning et votre compte. Cette action est irréversible.",
  deleteAccountNote: "Toutes vos données seront effacées définitivement.",
}

// ─── Spanish ──────────────────────────────────────────────────────────────────
const es: T = {
  back: "Volver",
  sessionTitlePlaceholder: "Título de sesión (opcional)",
  focusMode: "Modo enfoque",
  exitFocus: "Salir del enfoque",
  tapToExitFocus: "Toca para salir del enfoque",
  pause: "Pausa",
  start: "Iniciar",
  next: "Siguiente",
  terminate: "Terminar",
  history: "Historial",
  noSessionsYet: "Sin sesiones aún.",
  completeTimerToSee: "Completa un temporizador para verlo aquí.",
  deleteAction: "Eliminar",
  todayLabel: "Hoy",
  yesterdayLabel: "Ayer",
  categories: "Categorías",
  newCategoryName: "Nombre de nueva categoría",
  addCategory: "Agregar categoría",
  loading: "Cargando…",
  deleteCategory: "Eliminar categoría",
  deleteConfirm: (n) => `¿Eliminar "${n}"?`,
  cancel: "Cancelar",
  ok: "OK",
  quickTimers: "Temporizadores rápidos",
  labelPlaceholder: "Nombre (ej. Enfoque profundo)",
  durationMinutesPlaceholder: "Duración en minutos (ej. 25)",
  addQuickTimer: "Agregar temporizador rápido",
  deleteTimer: "Eliminar temporizador",
  deleteTimerConfirm: (l) => `¿Eliminar "${l}"?`,
  settings: "Ajustes",
  circleStyle: "Estilo del círculo",
  circleThick: "Trazo grueso",
  stroke: "Trazo",
  solid: "Sólido",
  gradient: "Degradado",
  colorLabel: "Color",
  categoryColor: "Color de categoría",
  customColor: "Color personalizado",
  backgroundSolid: "Fondo — sólido",
  backgroundGradient: "Fondo — degradado",
  resetToDefaults: "Restablecer",
  behaviour: "Comportamiento",
  notificationsLabel: "Notificaciones",
  notificationsDesc: "Alerta al finalizar el timer y al iniciar sesiones programadas",
  autoStartLabel: "Iniciar automáticamente los timers programados",
  autoStartDesc: "El timer arranca solo a la hora prevista",
  interruptionLabel: "Botón de interrupción",
  interruptionDesc: "Pausa el timer actual y registra una interrupción",
  interruptionSessionName: "Interrupción",
  notifTimerDoneTitle: "⏱ Timer finalizado",
  notifTimerDoneBody: "¡Tu sesión ha terminado!",
  notifTimerRunningTitle: "⏱ Timer en marcha",
  notifTimerEndsAt: (time) => `Termina a las ${time}`,
  notifBlockTitle: "📅 Sesión programada",
  notifBlockBody: (name) => `Es la hora: ${name}`,
  backgroundMesh: "Fondo — resplandor",
  meshVoid: "Vacío",
  meshAurora: "Aurora",
  meshNebula: "Nebulosa",
  meshCosmos: "Cosmos",
  meshDusk: "Anochecer",
  meshCrimson: "Carmesí",
  meshBloom: "Flor",
  meshPolar: "Polar",
  meshGalaxy: "Galaxia",
  midnight: "Medianoche",
  deepBlue: "Azul profundo",
  purpleNight: "Noche violeta",
  forest: "Bosque",
  ember: "Brasa",
  ocean: "Océano",
  bloodMoon: "Luna de sangre",
  roseName: "Rosa",
  sky: "Cielo",
  blush: "Rubor",
  lavender: "Lavanda",
  mint: "Menta",
  schedule: "Horario",
  day: "Día",
  week: "Semana",
  today: "Hoy",
  noBlocksForDay: "Sin bloques para este día.",
  addTo: (d) => `Agregar a ${d}`,
  startTime: "Hora",
  titleOptional: "Título (opcional)",
  add: "Agregar",
  deleteBlock: "Eliminar bloque",
  deleteBlockConfirm: (n, t) => `¿Eliminar "${n}" a las ${t}?`,
  deleteBlocksDayConfirm: (day) => `¿Eliminar todos los bloques de ${day}?`,
  fill95: "Rellenar 9–17",
  fill95Title: "Rellenar 9 a 17",
  fill95Apply: "Aplicar",
  fill95Empty: "Sin huecos disponibles entre las 9:00 y las 17:00",
  noCategorySelected: "Sin categoría",
  pleaseSelectCategory: "Por favor selecciona una categoría.",
  invalidTime: "Hora inválida",
  invalidDuration: "Duración inválida",
  enterValidDuration: "Ingresa una duración en minutos, ej. 50.",
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
  mon: "Lun",
  tue: "Mar",
  wed: "Mié",
  thu: "Jue",
  fri: "Vie",
  sat: "Sáb",
  sun: "Dom",
  todayBadge: "hoy",
  filterSessions: "Filtrar",
  allCategories: "Todas las categorías",
  clearFilters: "Limpiar",
  deleteAll: "Eliminar todo",
  deleteAllConfirm: "¿Eliminar todas las sesiones? Esta acción no se puede deshacer.",
  deleteAllFilteredConfirm: "¿Eliminar {n} sesiones que coinciden con el filtro actual? Esta acción no se puede deshacer.",
  noSessionsFilter: "Ninguna sesión coincide con este filtro.",
  about: "Acerca de",
  privacyPolicy: "Política de privacidad",
  appVersion: "Versión",
  stopCurrentTimer: "Temporizador en curso",
  stopCurrentTimerMsg: "¿Detener el temporizador actual e iniciar {label}?",
  nextUp: "Siguiente",
  editBlock: "Editar",
  exportCSV: "Exportar CSV",
  exportPeriod: "Período",
  exportDone: "Archivo listo para compartir",
  editSession: "Editar sesión",
  titleField: "Título",
  categoryField: "Categoría",
  timeSpent: "Tiempo invertido",
  durationField: "Duración",
  saveChanges: "Guardar cambios",
  saving: "Guardando…",
  deleteSession: "Eliminar sesión",
  deleteSessionConfirm: "¿Eliminar esta sesión?",
  signOut: "Cerrar sesión",
  signIn: "Iniciar sesión",
  createAccount: "Crear cuenta",
  emailPlaceholder: "Correo electrónico",
  passwordPlaceholder: "Contraseña",
  alreadyHaveAccount: "¿Ya tienes cuenta? Iniciar sesión",
  noAccount: "¿Sin cuenta? Crear una",
  checkEmail: "Revisa tu correo",
  checkEmailMsg: "Te enviamos un enlace de confirmación.",
  checkSpam: "Si no lo ves, revisa tu carpeta de spam.",
  resendEmail: "Reenviar correo",
  resendEmailSent: "¡Correo enviado!",
  errorLabel: "Error",
  continueWithGoogle: "Continuar con Google",
  orSeparator: "o",
  continueWithoutAccount: "Continuar sin cuenta",
  guestBanner: "Crea una cuenta para guardar tus datos en todos tus dispositivos.",
  convertAccount: "Crear una cuenta",
  convertAccountDesc: "Tus datos actuales se conservarán.",
  premiumRequiresAccount: "Cuenta requerida",
  premiumRequiresAccountDesc: "Crea una cuenta para acceder al Premium. Tus datos actuales se conservarán.",
  dashboard: "Panel",
  timeWorked: "Tiempo trabajado",
  thisWeek: "Esta semana",
  thisMonth: "Este mes",
  byCategory: "Por categoría",
  allTime: "Todo el tiempo",
  completionRate: "Completadas",
  bestDayLabel: "Mejor día",
  streakLabel: "Racha",
  streakDays: (n) => `${n} día${n > 1 ? "s" : ""}`,
  noData: "Sin sesiones. ¡Inicia un temporizador!",
  daysUnit: "d",
  allTimeShort: "Todo",
  customPeriod: "Pers.",
  dateFrom: "Desde",
  dateTo: "Hasta",
  premium: "Premium",
  standard: "Estándar",
  currentPlan: "Plan actual",
  upgradeToPremium: "Actualizar a Premium",
  manageSubscription: "Gestionar suscripción",
  goPremium: "Ir Premium",
  premiumSubtitle: "Desbloquea la experiencia completa de FlowPilot",
  premiumPrice: "4,99 €",
  subscribe: "Comprar",
  restoreStatus: "¿Ya compraste? Actualizar",
  cancelAnytime: "Acceso de por vida · Pago único",
  featureSchedule: "Planificación semanal completa",
  featurePeriods: "Todos los periodos del panel",
  featureCategories: "Categorías ilimitadas",
  featureTimers: "Temporizadores rápidos ilimitados",
  featureHistory: "Historial ilimitado",
  historyLimitNote: "Plan gratuito · últimos 30 días",
  slotConflict: "Conflicto de horario",
  slotConflictMsg: (name) => `Este horario ya está ocupado por "${name}".`,
  premiumFeature: "Función Premium",
  upgradeNow: "Actualizar ahora",
  freeLimitReached: "Límite del plan gratuito alcanzado",
  help: "Ayuda",
  helpTimerDesc: "Elige una duración, selecciona una categoría y pulsa Iniciar. El arco circular muestra tu progreso. El modo enfoque oculta los controles. Pulsa Siguiente para cargar el siguiente bloque programado, o Terminar para detener y guardar la sesión.",
  helpDashboardDesc: "Resumen de tu tiempo de enfoque: minutos totales, tasa de finalización, mejor día y racha actual. Filtra por semana, mes o rango personalizado. El gráfico muestra el tiempo por categoría.",
  helpHistoryDesc: "Cada sesión completada o interrumpida aparece aquí, agrupada por fecha. Desliza a la izquierda para eliminar. Toca para editar el título o la categoría. Premium: historial ilimitado + exportar CSV.",
  helpScheduleDesc: "Planifica bloques recurrentes por día de la semana. Cada bloque tiene hora, duración y categoría. Cuando llega la hora, la app rellena el temporizador automáticamente — y puede iniciarlo solo si el inicio automático está activado en Ajustes.",
  helpCategoriesDesc: "Organiza tus sesiones por tema (Trabajo, Estudio, Deporte…). Cada categoría tiene un color visible en el arco y en el historial. Plan gratuito: hasta 5 categorías. Premium: ilimitado.",
  helpQuickTimersDesc: "Preajustes de duración con un toque, mostrados bajo el temporizador. Toca uno para aplicar esa duración al instante. Plan gratuito: hasta 3 preajustes. Premium: ilimitado.",
  helpSettingsDesc: "Personaliza el estilo y color del círculo, el fondo y las opciones de comportamiento: notificaciones, inicio automático de temporizadores programados y botón de interrupción (Premium).",
  helpAccountDesc: "Gestiona tu perfil, cambia tu contraseña o elimina tu cuenta. Los usuarios anónimos pueden crear una cuenta aquí para sincronizar datos. El estado Premium también se muestra aquí.",
  account: "Cuenta",
  accountInfo: "Información",
  displayName: "Nombre visible",
  nameSaved: "Nombre guardado",
  security: "Seguridad",
  newPassword: "Nueva contraseña",
  confirmPassword: "Confirmar contraseña",
  updatePassword: "Actualizar",
  passwordUpdated: "Contraseña actualizada",
  passwordsNoMatch: "Las contraseñas no coinciden",
  passwordTooShort: "Mínimo 6 caracteres",
  googlePasswordNote: "La contraseña está gestionada por Google",
  dangerZone: "Zona de riesgo",
  deleteAccount: "Eliminar mi cuenta",
  deleteAccountConfirm: "Esto eliminará permanentemente todas tus sesiones, categorías, temporizadores, horario y tu cuenta. Esta acción no se puede deshacer.",
  deleteAccountNote: "Todos tus datos serán borrados permanentemente.",
}

// ─── German ───────────────────────────────────────────────────────────────────
const de: T = {
  back: "Zurück",
  sessionTitlePlaceholder: "Sitzungstitel (optional)",
  focusMode: "Fokusmodus",
  exitFocus: "Fokus beenden",
  tapToExitFocus: "Tippen um Fokus zu beenden",
  pause: "Pause",
  start: "Start",
  next: "Weiter",
  terminate: "Abbrechen",
  history: "Verlauf",
  noSessionsYet: "Noch keine Sitzungen.",
  completeTimerToSee: "Schließe einen Timer ab, um ihn hier zu sehen.",
  deleteAction: "Löschen",
  todayLabel: "Heute",
  yesterdayLabel: "Gestern",
  categories: "Kategorien",
  newCategoryName: "Name der neuen Kategorie",
  addCategory: "Kategorie hinzufügen",
  loading: "Laden…",
  deleteCategory: "Kategorie löschen",
  deleteConfirm: (n) => `"${n}" wirklich löschen?`,
  cancel: "Abbrechen",
  ok: "OK",
  quickTimers: "Schnelltimer",
  labelPlaceholder: "Name (z. B. Tiefe Arbeit)",
  durationMinutesPlaceholder: "Dauer in Minuten (z. B. 25)",
  addQuickTimer: "Schnelltimer hinzufügen",
  deleteTimer: "Timer löschen",
  deleteTimerConfirm: (l) => `"${l}" löschen?`,
  settings: "Einstellungen",
  circleStyle: "Kreisstil",
  circleThick: "Dicker Strich",
  stroke: "Linie",
  solid: "Einfarbig",
  gradient: "Verlauf",
  colorLabel: "Farbe",
  categoryColor: "Kategoriefarbe",
  customColor: "Benutzerdefinierte Farbe",
  backgroundSolid: "Hintergrund — einfarbig",
  backgroundGradient: "Hintergrund — Verlauf",
  resetToDefaults: "Zurücksetzen",
  behaviour: "Verhalten",
  notificationsLabel: "Benachrichtigungen",
  notificationsDesc: "Benachrichtigung bei Timer-Ende und geplanten Sitzungen",
  autoStartLabel: "Geplante Timer automatisch starten",
  autoStartDesc: "Der Timer startet automatisch zur geplanten Zeit",
  interruptionLabel: "Unterbrechungsschaltfläche",
  interruptionDesc: "Pausiert den Timer und protokolliert eine Unterbrechung",
  interruptionSessionName: "Unterbrechung",
  notifTimerDoneTitle: "⏱ Timer beendet",
  notifTimerDoneBody: "Deine Sitzung ist abgeschlossen!",
  notifTimerRunningTitle: "⏱ Timer läuft",
  notifTimerEndsAt: (time) => `Endet um ${time}`,
  notifBlockTitle: "📅 Geplante Sitzung",
  notifBlockBody: (name) => `Es ist Zeit: ${name}`,
  backgroundMesh: "Hintergrund — Leuchten",
  meshVoid: "Leere",
  meshAurora: "Aurora",
  meshNebula: "Nebel",
  meshCosmos: "Kosmos",
  meshDusk: "Dämmerung",
  meshCrimson: "Karmesin",
  meshBloom: "Blüte",
  meshPolar: "Polar",
  meshGalaxy: "Galaxie",
  midnight: "Mitternacht",
  deepBlue: "Tiefblau",
  purpleNight: "Violette Nacht",
  forest: "Wald",
  ember: "Glut",
  ocean: "Ozean",
  bloodMoon: "Blutmond",
  roseName: "Rose",
  sky: "Himmel",
  blush: "Erröten",
  lavender: "Lavendel",
  mint: "Minze",
  schedule: "Zeitplan",
  day: "Tag",
  week: "Woche",
  today: "Heute",
  noBlocksForDay: "Keine Blöcke für diesen Tag.",
  addTo: (d) => `Zu ${d} hinzufügen`,
  startTime: "Uhrzeit",
  titleOptional: "Titel (optional)",
  add: "Hinzufügen",
  deleteBlock: "Block löschen",
  deleteBlockConfirm: (n, t) => `"${n}" um ${t} löschen?`,
  deleteBlocksDayConfirm: (day) => `Alle Blöcke für ${day} löschen?`,
  fill95: "Ausfüllen 9–17",
  fill95Title: "9 bis 17 Uhr füllen",
  fill95Apply: "Anwenden",
  fill95Empty: "Keine freien Slots zwischen 9:00 und 17:00",
  noCategorySelected: "Keine Kategorie",
  pleaseSelectCategory: "Bitte wähle eine Kategorie aus.",
  invalidTime: "Ungültige Uhrzeit",
  invalidDuration: "Ungültige Dauer",
  enterValidDuration: "Gib eine Dauer in Minuten ein, z. B. 50.",
  monday: "Montag",
  tuesday: "Dienstag",
  wednesday: "Mittwoch",
  thursday: "Donnerstag",
  friday: "Freitag",
  saturday: "Samstag",
  sunday: "Sonntag",
  mon: "Mo",
  tue: "Di",
  wed: "Mi",
  thu: "Do",
  fri: "Fr",
  sat: "Sa",
  sun: "So",
  todayBadge: "heute",
  filterSessions: "Filtern",
  allCategories: "Alle Kategorien",
  clearFilters: "Zurücksetzen",
  deleteAll: "Alles löschen",
  deleteAllConfirm: "Alle Sitzungen löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  deleteAllFilteredConfirm: "{n} Sitzungen löschen, die dem aktuellen Filter entsprechen? Diese Aktion kann nicht rückgängig gemacht werden.",
  noSessionsFilter: "Keine Sitzungen entsprechen diesem Filter.",
  about: "Über die App",
  privacyPolicy: "Datenschutzerklärung",
  appVersion: "Version",
  stopCurrentTimer: "Timer läuft",
  stopCurrentTimerMsg: "Aktuellen Timer stoppen und {label} starten?",
  nextUp: "Weiter",
  editBlock: "Bearbeiten",
  exportCSV: "CSV exportieren",
  exportPeriod: "Zeitraum",
  exportDone: "Datei bereit zum Teilen",
  editSession: "Sitzung bearbeiten",
  titleField: "Titel",
  categoryField: "Kategorie",
  timeSpent: "Aufgewendete Zeit",
  durationField: "Dauer",
  saveChanges: "Änderungen speichern",
  saving: "Speichern…",
  deleteSession: "Sitzung löschen",
  deleteSessionConfirm: "Diese Sitzung wirklich löschen?",
  signOut: "Abmelden",
  signIn: "Anmelden",
  createAccount: "Konto erstellen",
  emailPlaceholder: "E-Mail",
  passwordPlaceholder: "Passwort",
  alreadyHaveAccount: "Bereits ein Konto? Anmelden",
  noAccount: "Kein Konto? Eines erstellen",
  checkEmail: "Überprüfe deine E-Mails",
  checkEmailMsg: "Wir haben dir einen Bestätigungslink gesendet.",
  checkSpam: "Falls du sie nicht siehst, überprüfe deinen Spam-Ordner.",
  resendEmail: "E-Mail erneut senden",
  resendEmailSent: "E-Mail gesendet!",
  errorLabel: "Fehler",
  continueWithGoogle: "Mit Google fortfahren",
  orSeparator: "oder",
  continueWithoutAccount: "Ohne Konto fortfahren",
  guestBanner: "Erstelle ein Konto, um deine Daten geräteübergreifend zu sichern.",
  convertAccount: "Konto erstellen",
  convertAccountDesc: "Deine vorhandenen Daten bleiben erhalten.",
  premiumRequiresAccount: "Konto erforderlich",
  premiumRequiresAccountDesc: "Erstelle ein Konto, um Premium freizuschalten. Deine Daten bleiben erhalten.",
  dashboard: "Dashboard",
  timeWorked: "Arbeitszeit",
  thisWeek: "Diese Woche",
  thisMonth: "Diesen Monat",
  byCategory: "Nach Kategorie",
  allTime: "Gesamt",
  completionRate: "Abschlussrate",
  bestDayLabel: "Bester Tag",
  streakLabel: "Serie",
  streakDays: (n) => `${n} Tag${n > 1 ? "e" : ""}`,
  noData: "Noch keine Sitzungen. Starte einen Timer!",
  daysUnit: "T",
  allTimeShort: "Alle",
  customPeriod: "Eig.",
  dateFrom: "Von",
  dateTo: "Bis",
  premium: "Premium",
  standard: "Standard",
  currentPlan: "Aktueller Plan",
  upgradeToPremium: "Auf Premium upgraden",
  manageSubscription: "Abonnement verwalten",
  goPremium: "Premium werden",
  premiumSubtitle: "Das volle FlowPilot-Erlebnis freischalten",
  premiumPrice: "4,99 €",
  subscribe: "Kaufen",
  restoreStatus: "Bereits gekauft? Aktualisieren",
  cancelAnytime: "Lebenslanger Zugang · Einmalige Zahlung",
  featureSchedule: "Vollständige Wochenplanung",
  featurePeriods: "Alle Dashboard-Zeiträume",
  featureCategories: "Unbegrenzte Kategorien",
  featureTimers: "Unbegrenzte Schnelltimer",
  featureHistory: "Unbegrenzte Chronik",
  historyLimitNote: "Kostenloser Plan · letzte 30 Tage",
  slotConflict: "Zeitkonflikt",
  slotConflictMsg: (name) => `Dieser Slot überschneidet sich mit "${name}".`,
  premiumFeature: "Premium-Funktion",
  upgradeNow: "Jetzt upgraden",
  freeLimitReached: "Limit des kostenlosen Plans erreicht",
  help: "Hilfe",
  helpTimerDesc: "Wähle eine Dauer, eine Kategorie und drücke Start. Der kreisförmige Bogen zeigt deinen Fortschritt. Der Fokusmodus blendet Steuerelemente aus. Drücke Weiter für den nächsten geplanten Block, oder Abbrechen zum vorzeitigen Beenden.",
  helpDashboardDesc: "Übersicht deiner Fokuszeit: Gesamtminuten, Abschlussrate, bester Tag und aktuelle Serie. Filtere nach Woche, Monat oder benutzerdefiniertem Zeitraum. Das Diagramm zeigt die Zeit nach Kategorie.",
  helpHistoryDesc: "Jede abgeschlossene oder abgebrochene Sitzung erscheint hier, nach Datum gruppiert. Nach links wischen zum Löschen. Tippen zum Bearbeiten von Titel oder Kategorie. Premium: unbegrenzte Chronik + CSV-Export.",
  helpScheduleDesc: "Plane wiederkehrende Arbeitsblöcke nach Wochentag. Jeder Block hat Startzeit, Dauer und Kategorie. Wenn die Zeit kommt, füllt die App den Timer automatisch aus — und kann ihn starten, wenn Auto-Start in den Einstellungen aktiviert ist.",
  helpCategoriesDesc: "Organisiere Sitzungen nach Themen (Arbeit, Lernen, Sport…). Jede Kategorie hat eine Farbe am Bogen und im Verlauf. Kostenloser Plan: bis zu 5 Kategorien. Premium: unbegrenzt.",
  helpQuickTimersDesc: "Dauer-Voreinstellungen mit einem Tippen, unterhalb des Timers. Tippe, um diese Dauer sofort zu setzen. Kostenloser Plan: bis zu 3 Voreinstellungen. Premium: unbegrenzt.",
  helpSettingsDesc: "Passe Kreisstil, Farbe, Hintergrund und Verhaltensoptionen an: Benachrichtigungen, automatischen Start geplanter Timer und Unterbrechungsschaltfläche (Premium).",
  helpAccountDesc: "Verwalte dein Profil, ändere dein Passwort oder lösche dein Konto. Anonyme Nutzer können hier ein Konto erstellen, um Daten geräteübergreifend zu synchronisieren. Der Premium-Status wird ebenfalls angezeigt.",
  account: "Konto",
  accountInfo: "Kontodaten",
  displayName: "Anzeigename",
  nameSaved: "Name gespeichert",
  security: "Sicherheit",
  newPassword: "Neues Passwort",
  confirmPassword: "Passwort bestätigen",
  updatePassword: "Aktualisieren",
  passwordUpdated: "Passwort aktualisiert",
  passwordsNoMatch: "Passwörter stimmen nicht überein",
  passwordTooShort: "Mindestens 6 Zeichen erforderlich",
  googlePasswordNote: "Das Passwort wird von Google verwaltet",
  dangerZone: "Gefahrenzone",
  deleteAccount: "Konto löschen",
  deleteAccountConfirm: "Dadurch werden alle deine Sitzungen, Kategorien, Timer, Zeitplan und dein Konto dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
  deleteAccountNote: "Alle deine Daten werden dauerhaft gelöscht.",
}

// ─── Chinese (Simplified) ─────────────────────────────────────────────────────
const zh: T = {
  back: "返回",
  sessionTitlePlaceholder: "会话标题（可选）",
  focusMode: "专注模式",
  exitFocus: "退出专注",
  tapToExitFocus: "点击退出专注模式",
  pause: "暂停",
  start: "开始",
  next: "下一个",
  terminate: "终止",
  history: "历史记录",
  noSessionsYet: "暂无会话。",
  completeTimerToSee: "完成计时后在此查看。",
  deleteAction: "删除",
  todayLabel: "今天",
  yesterdayLabel: "昨天",
  categories: "类别",
  newCategoryName: "新类别名称",
  addCategory: "添加类别",
  loading: "加载中…",
  deleteCategory: "删除类别",
  deleteConfirm: (n) => `确定要删除"${n}"吗？`,
  cancel: "取消",
  ok: "确定",
  quickTimers: "快速计时",
  labelPlaceholder: "名称（如：深度专注）",
  durationMinutesPlaceholder: "时长（分钟，如：25）",
  addQuickTimer: "添加快速计时",
  deleteTimer: "删除计时器",
  deleteTimerConfirm: (l) => `删除"${l}"？`,
  settings: "设置",
  circleStyle: "圆圈样式",
  circleThick: "粗笔划",
  stroke: "线条",
  solid: "实线",
  gradient: "渐变",
  colorLabel: "颜色",
  categoryColor: "类别颜色",
  customColor: "自定义颜色",
  backgroundSolid: "背景 — 纯色",
  backgroundGradient: "背景 — 渐变",
  resetToDefaults: "恢复默认",
  behaviour: "行为",
  notificationsLabel: "通知",
  notificationsDesc: "计时结束或计划会话开始时发出提醒",
  autoStartLabel: "自动启动计划计时器",
  autoStartDesc: "计时器在预定时间自动启动",
  interruptionLabel: "中断按钮",
  interruptionDesc: "暂停当前计时器并记录一次中断",
  interruptionSessionName: "中断",
  notifTimerDoneTitle: "⏱ 计时完成",
  notifTimerDoneBody: "你的专注时间结束了！",
  notifTimerRunningTitle: "⏱ 计时中",
  notifTimerEndsAt: (time) => `结束时间：${time}`,
  notifBlockTitle: "📅 计划会话",
  notifBlockBody: (name) => `开始时间到：${name}`,
  backgroundMesh: "背景 — 光晕",
  meshVoid: "虚空",
  meshAurora: "极光",
  meshNebula: "星云",
  meshCosmos: "宇宙",
  meshDusk: "黄昏",
  meshCrimson: "深红",
  meshBloom: "绽放",
  meshPolar: "极地",
  meshGalaxy: "星系",
  midnight: "午夜",
  deepBlue: "深蓝",
  purpleNight: "紫色夜晚",
  forest: "森林",
  ember: "余烬",
  ocean: "海洋",
  bloodMoon: "血月",
  roseName: "玫瑰",
  sky: "天空",
  blush: "腮红",
  lavender: "薰衣草",
  mint: "薄荷",
  schedule: "日程",
  day: "日",
  week: "周",
  today: "今天",
  noBlocksForDay: "今天没有安排。",
  addTo: (d) => `添加到 ${d}`,
  startTime: "时间",
  titleOptional: "标题（可选）",
  add: "添加",
  deleteBlock: "删除块",
  deleteBlockConfirm: (n, t) => `删除"${n}"（${t}）？`,
  deleteBlocksDayConfirm: (day) => `删除 ${day} 的所有时间块？`,
  fill95: "填满 9–17",
  fill95Title: "填满 9 到 17 时",
  fill95Apply: "应用",
  fill95Empty: "9:00 到 17:00 之间没有可填充的空位",
  noCategorySelected: "未选择类别",
  pleaseSelectCategory: "请选择一个类别。",
  invalidTime: "时间无效",
  invalidDuration: "时长无效",
  enterValidDuration: "请输入分钟数，如 50。",
  monday: "星期一",
  tuesday: "星期二",
  wednesday: "星期三",
  thursday: "星期四",
  friday: "星期五",
  saturday: "星期六",
  sunday: "星期日",
  mon: "周一",
  tue: "周二",
  wed: "周三",
  thu: "周四",
  fri: "周五",
  sat: "周六",
  sun: "周日",
  todayBadge: "今天",
  filterSessions: "筛选",
  allCategories: "所有类别",
  clearFilters: "清除",
  deleteAll: "全部删除",
  deleteAllConfirm: "删除所有会话？此操作无法撤消。",
  deleteAllFilteredConfirm: "删除与当前筛选条件匹配的 {n} 个会话？此操作无法撤消。",
  noSessionsFilter: "没有符合此筛选条件的会话。",
  about: "关于",
  privacyPolicy: "隐私政策",
  appVersion: "版本",
  stopCurrentTimer: "计时器进行中",
  stopCurrentTimerMsg: "停止当前计时器并启动 {label}？",
  nextUp: "下一个",
  editBlock: "编辑",
  exportCSV: "导出 CSV",
  exportPeriod: "时间段",
  exportDone: "文件已准备好分享",
  editSession: "编辑会话",
  titleField: "标题",
  categoryField: "类别",
  timeSpent: "已用时间",
  durationField: "时长",
  saveChanges: "保存更改",
  saving: "保存中…",
  deleteSession: "删除会话",
  deleteSessionConfirm: "确定要删除此会话吗？",
  signOut: "退出登录",
  signIn: "登录",
  createAccount: "创建账户",
  emailPlaceholder: "电子邮件",
  passwordPlaceholder: "密码",
  alreadyHaveAccount: "已有账户？登录",
  noAccount: "没有账户？立即注册",
  checkEmail: "请查看您的邮件",
  checkEmailMsg: "我们已向您发送确认链接。",
  checkSpam: "如果没有收到，请检查垃圾邮件文件夹。",
  resendEmail: "重新发送邮件",
  resendEmailSent: "邮件已发送！",
  errorLabel: "错误",
  continueWithGoogle: "使用 Google 继续",
  orSeparator: "或",
  continueWithoutAccount: "无需账号继续",
  guestBanner: "创建账号以在所有设备上备份您的数据。",
  convertAccount: "创建账号",
  convertAccountDesc: "您现有的数据将被保留。",
  premiumRequiresAccount: "需要账号",
  premiumRequiresAccountDesc: "创建账号以解锁高级版。您的数据将被保留。",
  dashboard: "仪表板",
  timeWorked: "工作时间",
  thisWeek: "本周",
  thisMonth: "本月",
  byCategory: "按类别",
  allTime: "全部时间",
  completionRate: "完成率",
  bestDayLabel: "最佳日",
  streakLabel: "连续天数",
  streakDays: (n) => `${n} 天`,
  noData: "暂无会话。开始计时吧！",
  daysUnit: "天",
  allTimeShort: "全部",
  customPeriod: "自定",
  dateFrom: "从",
  dateTo: "至",
  premium: "高级版",
  standard: "标准版",
  currentPlan: "当前套餐",
  upgradeToPremium: "升级到高级版",
  manageSubscription: "管理订阅",
  goPremium: "升级高级版",
  premiumSubtitle: "解锁完整的 FlowPilot 体验",
  premiumPrice: "€4.99",
  subscribe: "购买",
  restoreStatus: "已购买？刷新状态",
  cancelAnytime: "终身访问 · 一次性付款",
  featureSchedule: "完整周计划",
  featurePeriods: "所有仪表板时间段",
  featureCategories: "无限类别",
  featureTimers: "无限快速计时器",
  featureHistory: "无限历史记录",
  historyLimitNote: "免费计划 · 仅保留30天",
  slotConflict: "时间冲突",
  slotConflictMsg: (name) => `此时段已被"${name}"占用。`,
  premiumFeature: "高级功能",
  upgradeNow: "立即升级",
  freeLimitReached: "已达到免费计划限制",
  help: "帮助",
  helpTimerDesc: "选择时长和类别，点击开始。圆弧显示进度。专注模式隐藏所有控件。点击下一个加载下一计划块，或点击终止提前结束并保存。",
  helpDashboardDesc: "专注时间总览：总分钟数、完成率、最佳日期和当前连续天数。按周、月或自定义范围筛选。图表按类别显示时间分配。",
  helpHistoryDesc: "所有完成或中断的会话按日期分组显示。向左滑动删除，点击编辑标题或类别。高级版：无限历史记录 + CSV 导出。",
  helpScheduleDesc: "按星期规划重复工作块。每个块有开始时间、时长和类别。时间到时，应用自动填充计时器——若在设置中开启自动启动，可自动开始。",
  helpCategoriesDesc: "按主题组织会话（工作、学习、运动…）。每个类别有颜色，显示在圆弧和历史记录中。免费版：最多 5 个类别。高级版：无限制。",
  helpQuickTimersDesc: "显示在计时器下方的一键时长预设。点击即可立即应用该时长。免费版：最多 3 个预设。高级版：无限制。",
  helpSettingsDesc: "自定义计时器样式和颜色、背景以及行为选项：通知、自动启动计划计时器和中断按钮（高级功能）。",
  helpAccountDesc: "管理个人资料、更改密码或删除账户。匿名用户可在此创建账户以跨设备同步数据。高级版状态也显示于此。",
  account: "账户",
  accountInfo: "账户信息",
  displayName: "显示名称",
  nameSaved: "名称已保存",
  security: "安全",
  newPassword: "新密码",
  confirmPassword: "确认新密码",
  updatePassword: "更新密码",
  passwordUpdated: "密码已更新",
  passwordsNoMatch: "密码不匹配",
  passwordTooShort: "密码至少需要6个字符",
  googlePasswordNote: "密码由您的 Google 账户管理",
  dangerZone: "危险区域",
  deleteAccount: "删除我的账户",
  deleteAccountConfirm: "这将永久删除您所有的会话、类别、计时器、日程和账户。此操作无法撤销。",
  deleteAccountNote: "您的所有数据将被永久清除。",
}

// ─── Language resolution ──────────────────────────────────────────────────────

// Map of language code → translation object.
// To add a new language: create a new const above and add it here.
const translations: Record<string, T> = { en, fr, es, de, zh }

// useTranslation hook — returns the translation object for the device locale.
// Falls back to English for any unsupported language tag.
// Used by every screen and component that displays text.
export function useTranslation() {
  const locale = getLocales()[0]?.languageTag ?? "en"
  const lang = locale.startsWith("fr") ? "fr"
             : locale.startsWith("es") ? "es"
             : locale.startsWith("de") ? "de"
             : locale.startsWith("zh") ? "zh"
             : "en"
  return { t: translations[lang], lang }
}
