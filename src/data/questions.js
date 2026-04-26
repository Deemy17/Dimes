export const questions = [
  {
    id: "position",
    text: "What position do you play?",
    subtitle: "Pick what fits your game best.",
    options: [
      { value: "pg", label: "Point Guard",    desc: "Run the show, create for others",  emoji: "1️⃣" },
      { value: "sg", label: "Shooting Guard", desc: "Score, slash, shoot off screens",  emoji: "2️⃣" },
      { value: "sf", label: "Small Forward",  desc: "Versatile inside-out game",        emoji: "3️⃣" },
      { value: "pf", label: "Power Forward",  desc: "Physical, versatile big",          emoji: "4️⃣" },
      { value: "c",  label: "Center",         desc: "Paint dominance, post game",       emoji: "5️⃣" },
    ],
  },
  {
    id: "sizeProfile",
    text: "What is your height & weight?",
    subtitle: "Helps us match cushion and support to your build.",
    options: [
      { value: "small",   label: "Under 5'10\" / Under 160 lbs",  desc: "Lightweight, quick guard",         emoji: "🐇" },
      { value: "medium",  label: "5'10\"–6'2\" / 160–190 lbs",    desc: "Average build, all-around",        emoji: "🏃" },
      { value: "large",   label: "6'2\"–6'6\" / 190–225 lbs",     desc: "Athletic wing or stretch big",     emoji: "💪" },
      { value: "xlarge",  label: "6'6\"+ / 225+ lbs",             desc: "Big man, high-impact player",      emoji: "🏔️" },
    ],
  },
  {
    id: "playStyle",
    text: "How would you describe your play style?",
    subtitle: "Be honest about your real game.",
    options: [
      { value: "slasher",  label: "Slasher / Cutter",      desc: "Attack the rim with quick changes of direction", emoji: "⚡" },
      { value: "shooter",  label: "Shooter",               desc: "Spot-up, pull-up, and step-back buckets",        emoji: "🎯" },
      { value: "playmaker",label: "Playmaker",             desc: "Handle, pass, and run the offense",              emoji: "🧠" },
      { value: "power",    label: "Physical / Post",       desc: "Bully ball, power moves, interior game",         emoji: "🦏" },
      { value: "twoway",   label: "Two-Way / Versatile",   desc: "Do a little bit of everything",                  emoji: "🔄" },
    ],
  },
  {
    id: "cushionPref",
    text: "What matters more to you underfoot?",
    subtitle: "Both are valid — this is personal.",
    options: [
      { value: "court",    label: "Court feel",         desc: "Feel the floor, maximum control",      emoji: "🦶" },
      { value: "cushion",  label: "Impact protection",  desc: "Cushion for jumps and hard landings",  emoji: "🛡️" },
      { value: "balanced", label: "Balanced",           desc: "A mix of feel and protection",         emoji: "⚖️" },
    ],
  },
  {
    id: "surface",
    text: "Where do you play most?",
    subtitle: "Traction pattern matters a lot here.",
    options: [
      { value: "indoor",  label: "Clean indoor gym",       desc: "Polished hardwood",         emoji: "🏟️" },
      { value: "dusty",   label: "Dusty or dirty courts",  desc: "Inconsistent traction",     emoji: "🌀" },
      { value: "outdoor", label: "Outdoor courts",         desc: "Asphalt or concrete",       emoji: "🌤️" },
    ],
  },
  {
    id: "weightPref",
    text: "What is your preference for shoe weight?",
    subtitle: "Lighter = faster, heavier = more stable.",
    options: [
      { value: "ultralight", label: "Ultra lightweight", desc: "Every ounce counts",     emoji: "🪶" },
      { value: "balanced",   label: "Balanced",          desc: "Speed with stability",   emoji: "⚖️" },
      { value: "heavy",      label: "Doesn't matter",    desc: "Stability first",        emoji: "🏔️" },
    ],
  },
  {
    id: "injury",
    text: "Do you have any injury concerns?",
    subtitle: "This affects which features we prioritize.",
    options: [
      { value: "ankle", label: "Ankles",   desc: "Need extra ankle support",  emoji: "🦵" },
      { value: "knee",  label: "Knees",    desc: "Need extra cushioning",     emoji: "🦴" },
      { value: "plantar", label: "Plantar / Arch", desc: "Need arch support and cushioning", emoji: "🦶" },
      { value: "none",  label: "All good", desc: "Pure performance focus",    emoji: "✅" },
    ],
  },
];
