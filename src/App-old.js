import { useState, useEffect, useCallback, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { getProgress as fetchProgressFromDb, saveProgress as saveProgressToDb, saveTestResult } from "./supabase";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── GOOGLE FONTS ─────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #F0F4FF; color: #1a1a2e; }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 70% { box-shadow: 0 0 0 10px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    .slide-in { animation: slideIn 0.3s ease forwards; }
    .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
    .btn-primary { transition: all 0.2s ease; }
    .btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .btn-primary:active { transform: translateY(0); }
    .progress-bar { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
    .lock-shake:hover { animation: shake 0.4s ease; }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    .star-burst { animation: countUp 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
    .confetti { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; }
  `}</style>
);

// ─── CURRICULUM DATA ───────────────────────────────────────────────────
import { CURRICULUM, getSubjectById, getLevelById, getTopicById, getSubjectProgress, getNextTopic, isTopicUnlocked, canAccessMockExam } from "./curriculum";
            "Variables represent unknown quantities (x, y, a, b...)",
            "Equations show that two expressions are equal",
            "BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction",
            "Like terms can be added/subtracted; unlike terms cannot",
          ],
          formulas: [
            { name: "Difference of Two Squares", formula: "a² - b² = (a+b)(a-b)" },
            { name: "Perfect Square", formula: "(a+b)² = a² + 2ab + b²" },
            { name: "Quadratic Formula", formula: "x = [-b ± √(b²-4ac)] / 2a" },
          ],
          examples: [
            { q: "Simplify: 3x + 5x - 2x", a: "= 6x (collect like terms)" },
            { q: "Expand: (x+3)(x-2)", a: "= x² - 2x + 3x - 6 = x² + x - 6" },
            { q: "Solve: 2x + 4 = 10", a: "2x = 6, x = 3" },
          ]
        },
        practice: [
          { q: "Simplify: 5x + 3y - 2x + y", options: ["3x + 4y","7x + 4y","3x + 2y","5x + 3y"], answer: 0 },
          { q: "Factorize: x² - 9", options: ["(x-3)(x+3)","(x-3)²","(x+3)²","(x-9)(x+1)"], answer: 0 },
          { q: "Solve for x: 3x - 6 = 9", options: ["x=1","x=3","x=5","x=15"], answer: 2 },
          { q: "Expand (2x + 1)²", options: ["4x² + 1","4x² + 2x + 1","4x² + 4x + 1","2x² + 4x + 1"], answer: 2 },
          { q: "If 2x + 5 = 13, find x", options: ["2","3","4","6"], answer: 2 },
        ],
        test: [
          { q: "Simplify: 4a + 3b - a + 2b", options: ["3a+5b","5a+5b","3a+b","4a+5b"], answer: 0 },
          { q: "Factorize completely: 2x² + 4x", options: ["2x(x+2)","x(2x+4)","2(x²+2x)","x²(2+4)"], answer: 0 },
          { q: "Solve: 5x - 3 = 22", options: ["x=4","x=5","x=19/5","x=7"], answer: 1 },
          { q: "If 3(x - 2) = 12, then x =", options: ["2","6","10/3","14/3"], answer: 1 },
          { q: "Expand: (x - 4)(x + 4)", options: ["x² - 16","x² + 16","x² - 8x + 16","x² - 8"], answer: 0 },
          { q: "Find x if: x/3 + 2 = 5", options: ["x=1","x=3","x=7","x=9"], answer: 3 },
          { q: "Simplify: (a²b³) / (ab)", options: ["a³b²","ab²","a²b²","ab³"], answer: 1 },
          { q: "Solve: 2x + 3 = x - 1", options: ["x=-4","x=4","x=-2","x=2"], answer: 0 },
          { q: "Factorize: x² - 5x + 6", options: ["(x-2)(x-3)","(x+2)(x+3)","(x-6)(x+1)","(x-1)(x-6)"], answer: 0 },
          { q: "If 4y = 20, then 2y - 1 =", options: ["4","9","10","11"], answer: 1 },
          { q: "Simplify: 3(x+2) - 2(x-1)", options: ["x+8","5x+4","x+4","5x+8"], answer: 0 },
          { q: "The value of x in x² = 49 is", options: ["±7","7","±49","49"], answer: 0 },
        ]
      },
      {
        id: "equations", title: "Equations & Inequalities",
        learn: {
          overview: "Equations and inequalities appear heavily in JAMB. Mastering them ensures you can solve most algebra problems quickly.",
          keyPoints: [
            "Linear equations: highest power of x is 1",
            "Quadratic equations: highest power is 2 — solve by factorization or formula",
            "Inequalities: > means greater than, < means less than; flip sign when dividing by negative",
            "Simultaneous equations: two equations, two unknowns — use substitution or elimination",
          ],
          formulas: [
            { name: "Linear Equation", formula: "ax + b = 0 → x = -b/a" },
            { name: "Quadratic Formula", formula: "x = (-b ± √(b²-4ac)) / 2a" },
            { name: "Discriminant", formula: "Δ = b² - 4ac (Δ>0: 2 roots, Δ=0: 1 root, Δ<0: no real roots)" },
          ],
          examples: [
            { q: "Solve simultaneously: x+y=5 and x-y=1", a: "Add: 2x=6, x=3; then y=2" },
            { q: "Solve: x² - 5x + 6 = 0", a: "Factorize: (x-2)(x-3)=0, x=2 or x=3" },
            { q: "Solve: 2x - 1 > 5", a: "2x > 6, x > 3" },
          ]
        },
        practice: [
          { q: "Solve: 3x + 7 = 22", options: ["x=3","x=5","x=7","x=15"], answer: 1 },
          { q: "Solve simultaneously: 2x+y=7, x-y=2", options: ["x=2,y=3","x=3,y=1","x=1,y=5","x=4,y=-1"], answer: 1 },
          { q: "Solve x² - 4 = 0", options: ["x=2","x=±2","x=4","x=±4"], answer: 1 },
          { q: "If 4x - 3 ≥ 9, then:", options: ["x≥1","x≥3","x≤3","x≥6"], answer: 1 },
          { q: "Solve: x² - 7x + 12 = 0", options: ["x=3,4","x=6,2","x=1,12","x=-3,-4"], answer: 0 },
        ],
        test: [
          { q: "Solve for x: 5x - 8 = 22", options: ["x=6","x=3","x=14","x=4"], answer: 0 },
          { q: "Solve x² - 2x - 8 = 0", options: ["x=-2,4","x=2,-4","x=4,-2","x=-4,2"], answer: 0 },
          { q: "Solve simultaneously: x+2y=8, 2x-y=1", options: ["x=2,y=3","x=3,y=2","x=0,y=4","x=4,y=2"], answer: 0 },
          { q: "For what value of k does x²+kx+9=0 have equal roots?", options: ["k=6","k=±6","k=3","k=9"], answer: 1 },
          { q: "Solve: |2x - 3| = 7", options: ["x=5 or x=-2","x=5 or x=2","x=-5 or x=2","x=5 only"], answer: 0 },
          { q: "If 2x - 1 < 7 and x > 0, then:", options: ["0<x<4","0<x<3","x<4","x>0"], answer: 0 },
          { q: "The roots of x²-3x+2=0 are:", options: ["1 and 2","2 and 3","1 and 3","-1 and -2"], answer: 0 },
          { q: "Solve: (x-2)/3 = (x+1)/4", options: ["x=11","x=-11","x=5","x=3"], answer: 0 },
          { q: "If 3x < 15, then:", options: ["x<5","x>5","x≤5","x<45"], answer: 0 },
          { q: "Solve: 2x² - 8 = 0", options: ["x=±2","x=2","x=4","x=±4"], answer: 0 },
          { q: "Solve simultaneously: 3x+y=7, x+3y=5", options: ["x=2,y=1","x=1,y=4","x=2,y=3","x=3,y=0"], answer: 0 },
          { q: "Find x if x² + x - 12 = 0", options: ["x=3,-4","x=-3,4","x=6,-2","x=-6,2"], answer: 0 },
        ]
      },
      {
        id: "indices", title: "Indices & Logarithms",
        learn: {
          overview: "Indices (powers) and logarithms are inverses of each other. These topics appear repeatedly in JAMB Mathematics — master the laws!",
          keyPoints: [
            "aᵐ × aⁿ = aᵐ⁺ⁿ (same base, add exponents)",
            "aᵐ ÷ aⁿ = aᵐ⁻ⁿ (same base, subtract exponents)",
            "a⁰ = 1 for any non-zero a",
            "log_a(xy) = log_a(x) + log_a(y)",
            "log_a(x/y) = log_a(x) - log_a(y)",
            "log_a(xⁿ) = n × log_a(x)",
          ],
          formulas: [
            { name: "Power of Power", formula: "(aᵐ)ⁿ = aᵐⁿ" },
            { name: "Negative Index", formula: "a⁻ⁿ = 1/aⁿ" },
            { name: "Fractional Index", formula: "a^(1/n) = ⁿ√a" },
            { name: "Change of Base", formula: "log_a(b) = log(b)/log(a)" },
          ],
          examples: [
            { q: "Simplify: 2³ × 2⁴", a: "= 2⁷ = 128" },
            { q: "Evaluate: 27^(1/3)", a: "= ³√27 = 3" },
            { q: "If log₂(8) = x, find x", a: "2ˣ = 8 = 2³, so x = 3" },
          ]
        },
        practice: [
          { q: "Simplify: 3⁴ × 3²", options: ["3⁶","3⁸","9⁶","3²"], answer: 0 },
          { q: "Evaluate: 4^(1/2)", options: ["1","2","4","8"], answer: 1 },
          { q: "Simplify: (2³)²", options: ["2⁵","2⁶","4⁶","2⁹"], answer: 1 },
          { q: "log₁₀(100) = ?", options: ["1","2","10","100"], answer: 1 },
          { q: "Simplify: 5⁰", options: ["0","1","5","25"], answer: 1 },
        ],
        test: [
          { q: "Simplify: 2⁵ ÷ 2³", options: ["2","4","2²","2⁸"], answer: 1 },
          { q: "If 3ˣ = 81, find x", options: ["2","3","4","5"], answer: 2 },
          { q: "Evaluate: 8^(2/3)", options: ["2","4","16","64"], answer: 1 },
          { q: "log₂(32) = ?", options: ["4","5","6","8"], answer: 1 },
          { q: "Simplify: (x³y²)²", options: ["x⁵y⁴","x⁶y⁴","x⁶y²","x³y⁴"], answer: 1 },
          { q: "If log 2 = 0.3010, find log 8", options: ["0.6020","0.9030","1.2040","2.4080"], answer: 1 },
          { q: "Simplify: 2⁻³", options: ["8","1/8","-8","1/6"], answer: 1 },
          { q: "Find x: 4ˣ = 64", options: ["x=2","x=3","x=4","x=16"], answer: 1 },
          { q: "log(xy) = ?", options: ["log x - log y","log x × log y","log x + log y","log x / log y"], answer: 2 },
          { q: "Evaluate: (27)^(-1/3)", options: ["-3","1/3","-1/3","3"], answer: 1 },
          { q: "Simplify: (a²b)³ / a³b²", options: ["a³b","ab","a²b²","a³b²"], answer: 0 },
          { q: "If log₅(x) = 2, then x = ?", options: ["10","25","52","5"], answer: 1 },
        ]
      },
      {
        id: "trigonometry", title: "Trigonometry",
        learn: {
          overview: "Trigonometry deals with the relationships between angles and sides of triangles. It's essential for JAMB and covers SOH-CAH-TOA and beyond.",
          keyPoints: [
            "SOH: sin θ = Opposite/Hypotenuse",
            "CAH: cos θ = Adjacent/Hypotenuse",
            "TOA: tan θ = Opposite/Adjacent",
            "sin²θ + cos²θ = 1 (Pythagorean identity)",
            "Angles in a triangle sum to 180°",
          ],
          formulas: [
            { name: "Sine Rule", formula: "a/sin A = b/sin B = c/sin C" },
            { name: "Cosine Rule", formula: "a² = b² + c² - 2bc·cos A" },
            { name: "Area of Triangle", formula: "Area = ½ab·sin C" },
          ],
          examples: [
            { q: "Find sin 30°", a: "sin 30° = 1/2 = 0.5" },
            { q: "If tan θ = 1, find θ", a: "θ = 45° (since tan 45° = 1)" },
            { q: "In a right triangle, if opposite=3 and hypotenuse=5, find sin θ", a: "sin θ = 3/5 = 0.6" },
          ]
        },
        practice: [
          { q: "sin 90° = ?", options: ["0","0.5","1","√2/2"], answer: 2 },
          { q: "cos 60° = ?", options: ["0","0.5","1","√3/2"], answer: 1 },
          { q: "tan 45° = ?", options: ["0","0.5","1","√3"], answer: 2 },
          { q: "In a right triangle, if sin θ = 0.6 and hypotenuse = 10, the opposite = ?", options: ["4","6","8","10"], answer: 1 },
          { q: "sin²30° + cos²30° = ?", options: ["0","0.5","1","2"], answer: 2 },
        ],
        test: [
          { q: "cos 0° = ?", options: ["0","1","-1","0.5"], answer: 1 },
          { q: "sin 45° = ?", options: ["√2/2","√3/2","1/2","1"], answer: 0 },
          { q: "If tan θ = 3/4, find sin θ (right triangle)", options: ["3/5","4/5","3/4","4/3"], answer: 0 },
          { q: "What is sin 60°?", options: ["1/2","√3/2","√2/2","1"], answer: 1 },
          { q: "In triangle ABC, a=5, b=6, c=7, find cos A using cosine rule", options: ["0.714","0.286","0.571","0.476"], answer: 1 },
          { q: "cos 90° = ?", options:["1","0.5","0","-1"], answer: 2 },
          { q: "Find tan 30°", options: ["1/√3","√3","1","1/2"], answer: 0 },
          { q: "Area of triangle with sides 4, 6 and included angle 30°", options: ["6","12","24","3"], answer: 0 },
          { q: "sin 180° = ?", options: ["1","0","-1","0.5"], answer: 1 },
          { q: "Which is the reciprocal of cos θ?", options: ["sin θ","tan θ","sec θ","cosec θ"], answer: 2 },
          { q: "If cos A = 0.5, find angle A", options: ["30°","45°","60°","90°"], answer: 2 },
          { q: "1 + tan²θ = ?", options: ["sec²θ","cosec²θ","cot²θ","1"], answer: 0 },
        ]
      },
      {
        id: "statistics", title: "Statistics",
        learn: {
          overview: "Statistics involves collecting, organizing, and interpreting data. JAMB tests mean, median, mode, range, and probability.",
          keyPoints: [
            "Mean = Sum of all values / Number of values",
            "Median = middle value when data is arranged in order",
            "Mode = most frequently occurring value",
            "Range = Highest value - Lowest value",
            "Probability = Favourable outcomes / Total outcomes",
          ],
          formulas: [
            { name: "Mean", formula: "x̄ = Σx / n" },
            { name: "Probability", formula: "P(E) = n(E) / n(S)" },
            { name: "Standard Deviation", formula: "σ = √[Σ(x-x̄)²/n]" },
          ],
          examples: [
            { q: "Find mean of: 2, 4, 6, 8, 10", a: "Mean = (2+4+6+8+10)/5 = 30/5 = 6" },
            { q: "Find median of: 3, 1, 4, 1, 5, 9, 2", a: "Sorted: 1,1,2,3,4,5,9 → Median = 3" },
            { q: "P(rolling even on a die)", a: "Even numbers: 2,4,6 → P = 3/6 = 1/2" },
          ]
        },
        practice: [
          { q: "Mean of 5, 10, 15, 20, 25 is:", options: ["10","12","15","20"], answer: 2 },
          { q: "Mode of 1, 2, 2, 3, 4, 4, 4 is:", options: ["2","3","4","1"], answer: 2 },
          { q: "Median of 2, 4, 6, 8, 10:", options: ["4","5","6","7"], answer: 2 },
          { q: "Range of 3, 7, 2, 9, 1:", options: ["6","7","8","9"], answer: 2 },
          { q: "P(picking a red card from standard deck):", options: ["1/4","1/2","1/13","1/26"], answer: 1 },
        ],
        test: [
          { q: "Mean of 10, 20, 30, 40, 50 is:", options: ["25","30","35","40"], answer: 1 },
          { q: "In 4, 6, 6, 7, 8, 9, what is the mode?", options: ["4","6","7","8"], answer: 1 },
          { q: "Median of 1, 3, 5, 7, 9, 11:", options: ["5","6","7","8"], answer: 1 },
          { q: "If 5 coins are tossed, P(all heads) =", options: ["1/2","1/16","1/32","1/8"], answer: 2 },
          { q: "A bag has 3 red, 4 blue balls. P(blue) =", options: ["3/7","4/7","1/2","4/3"], answer: 1 },
          { q: "The standard deviation measures:", options: ["Central tendency","Spread of data","Skewness","Frequency"], answer: 1 },
          { q: "Find x if mean of 3,x,7,9 is 6:", options: ["3","5","4","6"], answer: 1 },
          { q: "P(A or B) when mutually exclusive:", options: ["P(A)+P(B)","P(A)×P(B)","P(A)-P(B)","P(A)/P(B)"], answer: 0 },
          { q: "What is the range of 4,4,4,4,4?", options: ["0","4","1","8"], answer: 0 },
          { q: "Median of 3,5,7,9 is:", options: ["5","6","7","8"], answer: 1 },
          { q: "How many ways can 3 items be arranged?", options: ["3","6","9","12"], answer: 1 },
          { q: "A die is rolled twice. P(both 6) =", options: ["1/6","1/12","1/36","1/3"], answer: 2 },
        ]
      }
    ]
  },
  physics: {
    id: "physics", name: "Physics", icon: "⚛", emoji: "⚡",
    color: "#7C3AED", light: "#F5F3FF", border: "#DDD6FE",
    topics: [
      {
        id: "motion", title: "Motion",
        learn: {
          overview: "Motion is one of the most tested topics in JAMB Physics. It covers how objects move through space and time.",
          keyPoints: [
            "Distance is scalar (magnitude only); Displacement is vector (magnitude + direction)",
            "Speed = Distance/Time; Velocity = Displacement/Time",
            "Acceleration = Change in velocity / Time taken",
            "Uniform motion: constant velocity (no acceleration)",
            "Newton's Laws govern all motion",
          ],
          formulas: [
            { name: "Velocity", formula: "v = u + at" },
            { name: "Displacement", formula: "s = ut + ½at²" },
            { name: "Velocity squared", formula: "v² = u² + 2as" },
          ],
          examples: [
            { q: "A car starts from rest and accelerates at 2 m/s² for 5s. Find final velocity.", a: "v = u + at = 0 + 2×5 = 10 m/s" },
            { q: "A ball is dropped from rest. After 3s, find distance fallen (g=10m/s²)", a: "s = ut + ½at² = 0 + ½×10×9 = 45 m" },
          ]
        },
        practice: [
          { q: "A car travels 120km in 2 hours. Its average speed is:", options: ["40km/h","60km/h","80km/h","100km/h"], answer: 1 },
          { q: "A body starts from rest. If acceleration = 5m/s², velocity after 4s is:", options: ["15m/s","20m/s","25m/s","30m/s"], answer: 1 },
          { q: "Distance covered in 1st second of free fall (g=10):", options: ["5m","10m","15m","20m"], answer: 0 },
          { q: "Velocity is a _____ quantity:", options: ["Scalar","Vector","Derived","Fundamental"], answer: 1 },
          { q: "Deceleration means:", options: ["Negative acceleration","Zero velocity","Positive acceleration","Constant speed"], answer: 0 },
        ],
        test: [
          { q: "A car accelerates from 10m/s to 30m/s in 4s. Acceleration =", options: ["5 m/s²","20 m/s²","10 m/s²","8 m/s²"], answer: 0 },
          { q: "In uniform motion, acceleration equals:", options: ["g","9.8","0","v/t"], answer: 2 },
          { q: "s = ut + ½at². What does 's' represent?", options: ["Speed","Distance","Acceleration","Velocity"], answer: 1 },
          { q: "A body at rest has velocity = ?", options: ["1 m/s","0 m/s","−1 m/s","∞"], answer: 1 },
          { q: "Free fall acceleration on Earth ≈", options: ["9.8 m/s²","10 m/s²","Both A & B are approximately correct","5 m/s²"], answer: 2 },
          { q: "A ball thrown upward returns. Total displacement =", options: ["Positive","Negative","Zero","Twice the height"], answer: 2 },
          { q: "v² = u² + 2as. If u=0, a=5, s=20, then v =", options: ["10 m/s","14.14 m/s","200 m/s","20 m/s"], answer: 0 },
          { q: "Velocity-time graph area represents:", options: ["Acceleration","Speed","Distance","Force"], answer: 2 },
          { q: "Slope of distance-time graph gives:", options: ["Acceleration","Speed","Displacement","Momentum"], answer: 1 },
          { q: "A car travels at constant 60km/h. Its acceleration is:", options: ["60 m/s²","1 m/s²","−1 m/s²","0"], answer: 3 },
          { q: "Which equations are called equations of motion?", options: ["Maxwell's","Newton's","Kinematic","Faraday's"], answer: 2 },
          { q: "A stone falls from 80m. Time to reach ground (g=10):", options: ["4s","8s","2s","16s"], answer: 0 },
        ]
      },
      {
        id: "forces", title: "Forces",
        learn: {
          overview: "Forces cause objects to change their state of motion. Newton's Three Laws of Motion are central to this topic.",
          keyPoints: [
            "Newton's 1st Law: A body remains at rest or in uniform motion unless acted upon by a net force",
            "Newton's 2nd Law: F = ma (Force = mass × acceleration)",
            "Newton's 3rd Law: Every action has an equal and opposite reaction",
            "Weight = mg (mass × gravitational acceleration)",
            "Friction opposes motion; coefficient of friction μ = F/N",
          ],
          formulas: [
            { name: "Newton's 2nd Law", formula: "F = ma" },
            { name: "Weight", formula: "W = mg" },
            { name: "Friction Force", formula: "f = μN" },
          ],
          examples: [
            { q: "Find force needed to accelerate 5kg mass at 3m/s²", a: "F = ma = 5 × 3 = 15 N" },
            { q: "Weight of 10kg on Earth (g=10m/s²)", a: "W = mg = 10 × 10 = 100 N" },
          ]
        },
        practice: [
          { q: "Force to accelerate 8kg at 4m/s²:", options: ["2N","32N","12N","4N"], answer: 1 },
          { q: "Weight of 5kg object (g=10m/s²):", options: ["5N","10N","50N","500N"], answer: 2 },
          { q: "Newton's first law describes:", options: ["Inertia","Momentum","Energy","Friction"], answer: 0 },
          { q: "If a body is in equilibrium, net force =", options: ["1N","Maximum","0","Gravity"], answer: 2 },
          { q: "Action and reaction forces act on:", options: ["Same body","Different bodies","Same direction","Opposite direction only"], answer: 1 },
        ],
        test: [
          { q: "A 2kg book rests on a table. Normal force =", options: ["2N","10N","20N","0N"], answer: 2 },
          { q: "If F = 30N and m = 6kg, acceleration =", options: ["180 m/s²","5 m/s²","0.2 m/s²","24 m/s²"], answer: 1 },
          { q: "Mass of object on Moon with weight 60N (g_moon = 1.6m/s²):", options: ["96kg","37.5kg","60kg","96N"], answer: 1 },
          { q: "Which law explains why rockets work?", options: ["1st law","2nd law","3rd law","Law of gravity"], answer: 2 },
          { q: "Friction force depends on:", options: ["Surface area","Velocity only","Normal force and surface type","Height"], answer: 2 },
          { q: "An object with mass 4kg accelerates at 2.5m/s². Net force =", options: ["1.6N","10N","6.5N","8N"], answer: 1 },
          { q: "If μ = 0.3 and N = 50N, friction force =", options: ["167N","15N","5N","0.006N"], answer: 1 },
          { q: "Inertia is the tendency to resist change in:", options: ["Force","Motion state","Temperature","Pressure"], answer: 1 },
          { q: "A car brakes suddenly. Passengers lurch forward due to:", options: ["Gravity","Friction","Inertia","Air resistance"], answer: 2 },
          { q: "Forces that cancel each other are called:", options: ["Balanced forces","Net forces","Contact forces","Normal forces"], answer: 0 },
          { q: "Weight differs from mass because:", options: ["Weight is force; mass is matter","Same thing","Mass is force","Neither is measurable"], answer: 0 },
          { q: "Unit of force is:", options: ["Joule","Pascal","Newton","Watt"], answer: 2 },
        ]
      },
      {
        id: "energy", title: "Energy",
        learn: {
          overview: "Energy is the capacity to do work. It exists in many forms and is always conserved.",
          keyPoints: [
            "Kinetic Energy (KE): energy due to motion",
            "Potential Energy (PE): energy due to position",
            "Law of Conservation of Energy: energy cannot be created or destroyed",
            "Work = Force × Distance × cos θ",
            "Power = Work done / Time",
          ],
          formulas: [
            { name: "Kinetic Energy", formula: "KE = ½mv²" },
            { name: "Gravitational PE", formula: "PE = mgh" },
            { name: "Work Done", formula: "W = Fs cos θ" },
            { name: "Power", formula: "P = W/t" },
          ],
          examples: [
            { q: "KE of 4kg at 10m/s", a: "KE = ½ × 4 × 100 = 200 J" },
            { q: "PE at height 5m, mass 3kg, g=10", a: "PE = mgh = 3×10×5 = 150 J" },
          ]
        },
        practice: [
          { q: "KE of 2kg at 6m/s:", options: ["12J","24J","36J","72J"], answer: 2 },
          { q: "PE of 5kg at 4m (g=10):", options: ["20J","50J","200J","2000J"], answer: 2 },
          { q: "Work done by 20N force over 5m:", options: ["4J","25J","100J","200J"], answer: 2 },
          { q: "Unit of energy:", options: ["Newton","Watt","Joule","Pascal"], answer: 2 },
          { q: "Power of 1000J done in 10s:", options: ["10W","100W","1000W","10kW"], answer: 1 },
        ],
        test: [
          { q: "A 3kg ball moves at 4m/s. Its KE is:", options: ["6J","24J","48J","12J"], answer: 1 },
          { q: "A 10kg box is raised 3m (g=10). PE gained =", options: ["30J","100J","300J","150J"], answer: 2 },
          { q: "Work done lifting 50N weight 2m:", options: ["25J","52J","100J","200J"], answer: 2 },
          { q: "An engine does 5000J in 25s. Power =", options: ["125000W","200W","5025W","4975W"], answer: 1 },
          { q: "At the highest point of a projectile, KE is:", options: ["Maximum","Zero","Minimum (not zero)","Equal to PE"], answer: 2 },
          { q: "Conservation of energy means energy is:", options: ["Created","Destroyed","Transformed","Generated"], answer: 2 },
          { q: "Efficiency = ?", options: ["Output/Input × 100%","Input/Output × 100%","Work/Time","Force × Distance"], answer: 0 },
          { q: "1 kWh = ?", options: ["1000 J","3600 J","3,600,000 J","1 J"], answer: 2 },
          { q: "A machine has 80% efficiency. Input = 500J. Output =", options: ["400J","625J","80J","500J"], answer: 0 },
          { q: "PE at the ground level is:", options: ["Maximum","Minimum","Zero","Negative"], answer: 2 },
          { q: "Horse power (1 HP) equals approximately:", options: ["100W","746W","1000W","500W"], answer: 1 },
          { q: "When KE increases, speed:", options: ["Decreases","Stays same","Increases","Becomes zero"], answer: 2 },
        ]
      },
      {
        id: "electricity", title: "Electricity",
        learn: {
          overview: "Electricity is fundamental to modern life and a major JAMB topic. Covers current, voltage, resistance, and circuits.",
          keyPoints: [
            "Ohm's Law: V = IR (Voltage = Current × Resistance)",
            "Series circuit: total resistance = R₁ + R₂ + R₃...",
            "Parallel circuit: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃...",
            "Power: P = IV = I²R = V²/R",
            "Electric charge unit: Coulomb (C); Current unit: Ampere (A)",
          ],
          formulas: [
            { name: "Ohm's Law", formula: "V = IR" },
            { name: "Power", formula: "P = IV = I²R = V²/R" },
            { name: "Electrical Energy", formula: "E = Pt = VIt" },
          ],
          examples: [
            { q: "If V=12V and R=4Ω, find current", a: "I = V/R = 12/4 = 3 A" },
            { q: "Power of bulb: V=240V, I=0.5A", a: "P = IV = 0.5 × 240 = 120 W" },
          ]
        },
        practice: [
          { q: "V=6V, R=2Ω. Current =", options: ["3A","12A","0.33A","4A"], answer: 0 },
          { q: "Unit of resistance:", options: ["Ampere","Volt","Ohm","Watt"], answer: 2 },
          { q: "3Ω and 6Ω in series. Total R =", options: ["2Ω","4.5Ω","9Ω","18Ω"], answer: 2 },
          { q: "V=220V, R=44Ω. Power consumed =", options: ["220W","1100W","4840W","5W"], answer: 1 },
          { q: "Conventional current flows from:", options: ["Negative to positive","Positive to negative","Both directions","No direction"], answer: 1 },
        ],
        test: [
          { q: "Ohm's Law states that V =", options: ["IR","I/R","R/I","I+R"], answer: 0 },
          { q: "Two 4Ω resistors in parallel. Equivalent R =", options: ["8Ω","2Ω","4Ω","1Ω"], answer: 1 },
          { q: "A 60W bulb on 240V. Current drawn =", options: ["0.25A","14400A","4A","1A"], answer: 0 },
          { q: "Charge Q = It. If I=2A for 5s, Q =", options: ["2.5C","10C","7C","0.4C"], answer: 1 },
          { q: "EMF is measured in:", options: ["Ampere","Ohm","Volt","Coulomb"], answer: 2 },
          { q: "In a series circuit, current is:", options: ["Different in each resistor","Same throughout","Zero","Maximum"], answer: 1 },
          { q: "A 40W, 240V bulb resistance =", options: ["6Ω","1440Ω","9600Ω","6000Ω"], answer: 1 },
          { q: "1 kWh of electricity costs if rate is ₦50/kWh and 2kW for 3h:", options: ["₦300","₦150","₦100","₦600"], answer: 0 },
          { q: "Resistance of conductor increases with:", options: ["Lower temperature","Higher temperature","Constant temperature","Decreased length"], answer: 1 },
          { q: "Short circuit occurs when resistance is:", options: ["Very high","Very low (≈0)","Equal to EMF","1 Ohm"], answer: 1 },
          { q: "Kirchhoff's current law states that sum of currents at a junction =", options: ["Maximum","Minimum","1","0"], answer: 3 },
          { q: "A fuse is designed to:", options: ["Increase current","Decrease voltage","Break circuit on excess current","Store energy"], answer: 2 },
        ]
      },
      {
        id: "waves", title: "Waves",
        learn: {
          overview: "Waves transfer energy without transferring matter. They include mechanical and electromagnetic waves.",
          keyPoints: [
            "Transverse waves: particles vibrate perpendicular to wave direction (light, water)",
            "Longitudinal waves: particles vibrate parallel to wave direction (sound)",
            "Wave speed = frequency × wavelength: v = fλ",
            "Amplitude: maximum displacement from equilibrium",
            "Sound requires a medium; light does not",
          ],
          formulas: [
            { name: "Wave Equation", formula: "v = fλ" },
            { name: "Period & Frequency", formula: "T = 1/f" },
            { name: "Speed of Light", formula: "c = 3 × 10⁸ m/s" },
          ],
          examples: [
            { q: "Wave frequency = 500Hz, wavelength = 0.68m. Speed =", a: "v = fλ = 500 × 0.68 = 340 m/s (speed of sound!)" },
            { q: "Period of wave with f = 50Hz", a: "T = 1/f = 1/50 = 0.02s" },
          ]
        },
        practice: [
          { q: "v = fλ. If f=200Hz, λ=1.5m, then v =", options: ["133m/s","300m/s","201.5m/s","198.5m/s"], answer: 1 },
          { q: "Sound is a ______ wave:", options: ["Transverse","Longitudinal","Electromagnetic","Transverse and longitudinal"], answer: 1 },
          { q: "Light travels at approximately:", options: ["3×10⁶m/s","3×10⁸m/s","3×10¹⁰m/s","340m/s"], answer: 1 },
          { q: "Period of 100Hz wave:", options: ["100s","0.1s","0.01s","10s"], answer: 2 },
          { q: "Amplitude of a wave is its:", options: ["Wavelength","Frequency","Maximum displacement","Speed"], answer: 2 },
        ],
        test: [
          { q: "Frequency of wave with T=0.005s:", options: ["0.005Hz","200Hz","5Hz","500Hz"], answer: 1 },
          { q: "Which waves can travel through vacuum?", options: ["Sound only","Light only","Both sound and light","Electromagnetic waves only"], answer: 3 },
          { q: "Diffraction of waves occurs when:", options: ["Waves speed up","Waves slow down","Waves bend around obstacles","Waves reflect"], answer: 2 },
          { q: "If v=340m/s and λ=0.5m, frequency =", options: ["170Hz","680Hz","340Hz","170kHz"], answer: 1 },
          { q: "Which region of EM spectrum has longest wavelength?", options: ["Gamma rays","X-rays","Radio waves","UV rays"], answer: 2 },
          { q: "Constructive interference occurs when:", options: ["Two waves cancel","Crests meet crests","Troughs meet crests","Wave amplitude = 0"], answer: 1 },
          { q: "Speed of sound in air ≈", options: ["340 m/s","300 m/s","3×10⁸ m/s","1500 m/s"], answer: 0 },
          { q: "Echo is caused by:", options: ["Refraction","Reflection","Diffraction","Absorption"], answer: 1 },
          { q: "The energy of a wave depends on its:", options: ["Speed","Wavelength","Amplitude","Direction"], answer: 2 },
          { q: "Resonance occurs when applied frequency equals:", options: ["Zero","Maximum","Natural frequency","Speed of wave"], answer: 2 },
          { q: "Infrared radiation is used in:", options: ["Gamma scanners","Remote controls","X-ray imaging","Radio broadcasting"], answer: 1 },
          { q: "Nodes in a stationary wave are points of:", options: ["Maximum displacement","Minimum displacement","Zero displacement","Maximum energy"], answer: 2 },
        ]
      }
    ]
  },
  chemistry: {
    id: "chemistry", name: "Chemistry", icon: "⚗", emoji: "🧪",
    color: "#059669", light: "#ECFDF5", border: "#A7F3D0",
    topics: [
      {
        id: "atomic_structure", title: "Atomic Structure",
        learn: {
          overview: "The atom is the basic unit of matter. Understanding its structure is fundamental to all chemistry.",
          keyPoints: [
            "Atom: protons + neutrons (nucleus) + electrons (shells)",
            "Proton number (atomic number) = number of protons",
            "Mass number = protons + neutrons",
            "Isotopes: same protons, different neutrons",
            "Electron configuration: fill shells in order (2, 8, 8, 18...)",
          ],
          formulas: [
            { name: "Neutrons", formula: "Neutrons = Mass number - Atomic number" },
            { name: "Valence electrons", formula: "electrons in the outermost shell" },
          ],
          examples: [
            { q: "Carbon: atomic number 6, mass number 12. Find neutrons.", a: "Neutrons = 12 - 6 = 6" },
            { q: "Electron configuration of Na (atomic no. 11)", a: "2, 8, 1 (Na has 1 valence electron)" },
          ]
        },
        practice: [
          { q: "Atomic number of an element represents:", options: ["Number of neutrons","Number of protons","Mass number","Number of electrons + protons"], answer: 1 },
          { q: "Carbon-12 and Carbon-14 are:", options: ["Isotopes","Isobars","Isomers","Allotropes"], answer: 0 },
          { q: "Electron configuration of Mg (Z=12):", options: ["2,10","2,8,2","2,8,1,1","2,4,6"], answer: 1 },
          { q: "The nucleus contains:", options: ["Electrons and protons","Protons and neutrons","Electrons and neutrons","Only protons"], answer: 1 },
          { q: "Number of neutrons in ₃₅¹⁷Cl:", options: ["17","18","35","52"], answer: 1 },
        ],
        test: [
          { q: "Proton has ______ charge:", options: ["Negative","Positive","Neutral","Variable"], answer: 1 },
          { q: "Atom of Na (Z=11, A=23). Neutrons =", options: ["11","12","23","34"], answer: 1 },
          { q: "Valence electrons of Phosphorus (Z=15):", options: ["3","5","2","15"], answer: 1 },
          { q: "Isotopes have the same:", options: ["Mass number","Number of neutrons","Atomic number","Nuclear mass"], answer: 2 },
          { q: "Which particle has negligible mass?", options: ["Proton","Neutron","Electron","Nucleus"], answer: 2 },
          { q: "Maximum electrons in 2nd shell:", options: ["2","8","18","32"], answer: 1 },
          { q: "Electron configuration of Argon (Z=18):", options: ["2,8,6","2,8,8","2,16","2,8,8,0"], answer: 1 },
          { q: "An ion is formed when an atom:", options: ["Gains/loses electrons","Gains protons","Gains neutrons","Changes nucleus"], answer: 0 },
          { q: "Which is NOT a subatomic particle?", options: ["Proton","Electron","Photon","Neutron"], answer: 2 },
          { q: "Atomic number is unique for each element because:", options: ["Mass varies","Protons define element identity","Neutrons vary","Electrons can be lost"], answer: 1 },
          { q: "If atom has 9 protons and 10 neutrons, mass number =", options: ["1","9","10","19"], answer: 3 },
          { q: "A cation is formed when an atom:", options: ["Gains electrons","Loses electrons","Gains protons","Loses protons"], answer: 1 },
        ]
      },
      {
        id: "periodic_table", title: "Periodic Table",
        learn: {
          overview: "The Periodic Table organizes all known elements by their properties and atomic number — a critical JAMB topic.",
          keyPoints: [
            "Elements arranged in order of increasing atomic number",
            "Periods: horizontal rows (1–7)",
            "Groups: vertical columns (1–18); group = number of valence electrons",
            "Group 1: Alkali metals (very reactive); Group 7: Halogens; Group 0: Noble gases",
            "Atomic radius decreases across a period (left to right)",
          ],
          formulas: [
            { name: "Group number", formula: "= number of valence electrons (for s & p block)" },
            { name: "Period number", formula: "= number of electron shells" },
          ],
          examples: [
            { q: "Na is in Period 3 — how many shells?", a: "3 shells (electron config: 2,8,1)" },
            { q: "F is in Group 7 — how many valence electrons?", a: "7 valence electrons" },
          ]
        },
        practice: [
          { q: "Element in Group 1 is called:", options: ["Noble gas","Halogen","Alkali metal","Transition metal"], answer: 2 },
          { q: "Noble gases are in Group:", options: ["1","2","7","0 or 18"], answer: 3 },
          { q: "How many periods are in the Periodic Table?", options: ["5","6","7","8"], answer: 2 },
          { q: "Atomic radius generally ___ across a period:", options: ["Increases","Decreases","Stays same","Doubles"], answer: 1 },
          { q: "Chlorine (Cl) is in which Group?", options: ["5","6","7","8"], answer: 2 },
        ],
        test: [
          { q: "Mendeleev arranged elements by:", options: ["Atomic number","Atomic mass","Electron config","Reactivity"], answer: 1 },
          { q: "Modern Periodic Table is based on:", options: ["Atomic mass","Reactivity","Atomic number","Valence electrons"], answer: 2 },
          { q: "Elements in the same group have same:", options: ["Mass number","Number of protons","Valence electrons","Period"], answer: 2 },
          { q: "Electronegativity increases from left to right because:", options: ["More protons attract electrons more","Fewer electrons","Bigger nucleus","Smaller mass"], answer: 0 },
          { q: "Sodium (Na) is in:", options: ["Period 2, Group 1","Period 3, Group 1","Period 1, Group 2","Period 3, Group 2"], answer: 1 },
          { q: "Which group are halogens in?", options: ["Group 0","Group 1","Group 2","Group 7"], answer: 3 },
          { q: "Which period contains elements Ne to Ar?", options: ["Period 1","Period 2","Period 3","Period 4"], answer: 2 },
          { q: "Alkali metals react vigorously with:", options: ["Oxygen only","Water","All metals","Noble gases"], answer: 1 },
          { q: "Most electronegative element:", options: ["Chlorine","Oxygen","Fluorine","Nitrogen"], answer: 2 },
          { q: "Transition metals are in:", options: ["Groups 1-2","Groups 3-12","Groups 13-18","Group 0"], answer: 1 },
          { q: "Ionization energy generally ___ across a period:", options: ["Decreases","Increases","Stays same","Becomes zero"], answer: 1 },
          { q: "Noble gases are unreactive because:", options: ["They are metals","Full outer electron shell","No electrons","Very heavy"], answer: 1 },
        ]
      },
      {
        id: "chemical_bonding", title: "Chemical Bonding",
        learn: {
          overview: "Chemical bonds hold atoms together to form compounds. JAMB tests ionic, covalent, and metallic bonding.",
          keyPoints: [
            "Ionic bond: transfer of electrons (metal + non-metal)",
            "Covalent bond: sharing of electrons (non-metal + non-metal)",
            "Metallic bond: sea of delocalized electrons (metal + metal)",
            "Electrovalency: number of electrons gained/lost in ionic bonding",
            "Covalency: number of electron pairs shared",
          ],
          formulas: [
            { name: "Ionic compound formula", formula: "Cross-multiply valencies (e.g., Ca²⁺ + Cl⁻ → CaCl₂)" },
          ],
          examples: [
            { q: "Bond between Na and Cl", a: "Ionic — Na loses 1e⁻, Cl gains 1e⁻ → NaCl" },
            { q: "Bond in H₂O", a: "Covalent — O shares 2 electrons with 2 H atoms" },
          ]
        },
        practice: [
          { q: "NaCl is formed by ______ bonding:", options: ["Covalent","Ionic","Metallic","Hydrogen"], answer: 1 },
          { q: "Covalent bond involves:", options: ["Electron transfer","Electron sharing","Proton sharing","Neutron transfer"], answer: 1 },
          { q: "Formula for calcium chloride (Ca²⁺, Cl⁻):", options: ["CaCl","CaCl₂","Ca₂Cl","Ca₂Cl₃"], answer: 1 },
          { q: "Which compound has covalent bond?", options: ["NaCl","MgO","H₂O","KBr"], answer: 2 },
          { q: "Metallic bonds exist in:", options: ["NaCl","H₂O","Cu","CO₂"], answer: 2 },
        ],
        test: [
          { q: "Ionic bond is formed between:", options: ["Two metals","Two non-metals","Metal and non-metal","Two gases"], answer: 2 },
          { q: "Which has both ionic and covalent bonds?", options: ["NaCl","NH₄Cl","H₂O","CH₄"], answer: 1 },
          { q: "Number of covalent bonds in N₂:", options: ["1","2","3","4"], answer: 2 },
          { q: "Electrovalency of Al (Z=13):", options: ["1","2","3","4"], answer: 2 },
          { q: "H₂ molecule is held together by:", options: ["Ionic bond","Polar covalent","Non-polar covalent","Metallic"], answer: 2 },
          { q: "Which has highest melting point?", options: ["Covalent compound","Ionic compound","Molecular compound","Noble gas"], answer: 1 },
          { q: "Coordinate (dative) bond forms when:", options: ["Both electrons from one atom","One electron each","Electron transferred","No electrons shared"], answer: 0 },
          { q: "MgO formula shows Mg is:", options: ["Mg⁺","Mg²⁺","Mg³⁺","Mg⁻"], answer: 1 },
          { q: "Which conducts electricity when molten?", options: ["Sugar","Glucose","Sodium chloride","Wax"], answer: 2 },
          { q: "Al₂O₃ formula shows Al valency of:", options: ["1","2","3","6"], answer: 2 },
          { q: "Diamond is hard because:", options: ["Ionic bonds","Each C has 4 covalent bonds in 3D","Metallic bonds","Weak bonds"], answer: 1 },
          { q: "CO₂ has _____ bonds:", options: ["Ionic","Covalent","Metallic","Hydrogen"], answer: 1 },
        ]
      },
      {
        id: "mole_concept", title: "Mole Concept",
        learn: {
          overview: "The mole is chemistry's counting unit. One mole = 6.02 × 10²³ particles (Avogadro's number). Essential for calculations!",
          keyPoints: [
            "1 mole = 6.02 × 10²³ particles (Avogadro's Number)",
            "Molar mass = mass in grams of 1 mole of substance",
            "Moles = Mass (g) / Molar Mass (g/mol)",
            "Molar volume at STP = 22.4 L",
            "Concentration = Moles / Volume (in litres)",
          ],
          formulas: [
            { name: "Moles", formula: "n = m/M" },
            { name: "Avogadro's Number", formula: "N = n × 6.02×10²³" },
            { name: "Concentration", formula: "C = n/V" },
          ],
          examples: [
            { q: "Moles in 44g of CO₂ (M=44g/mol)", a: "n = m/M = 44/44 = 1 mole" },
            { q: "Molecules in 2 moles of H₂O", a: "= 2 × 6.02×10²³ = 1.204×10²⁴ molecules" },
          ]
        },
        practice: [
          { q: "Moles in 18g of H₂O (M=18):", options: ["0.5","1","2","18"], answer: 1 },
          { q: "Avogadro's number is:", options: ["6.02×10²²","6.02×10²³","6.02×10²⁴","6.2×10²³"], answer: 1 },
          { q: "Molar mass of NaCl (Na=23, Cl=35):", options: ["23","35","58","70"], answer: 2 },
          { q: "Molar volume of gas at STP:", options: ["22.4L","2.24L","224L","22400L"], answer: 0 },
          { q: "Concentration (mol/L) of 2mol in 4L:", options: ["8","0.5","2","6"], answer: 1 },
        ],
        test: [
          { q: "Mass of 3 moles of H₂O (M=18):", options: ["6g","18g","54g","36g"], answer: 2 },
          { q: "Moles in 28g of CO (M=28):", options: ["0.5","1","2","56"], answer: 1 },
          { q: "Atoms in 0.5 mole of Carbon:", options: ["6.02×10²³","3.01×10²³","1.204×10²⁴","3.01×10²²"], answer: 1 },
          { q: "Volume of 2 moles of gas at STP:", options: ["22.4L","44.8L","11.2L","2.24L"], answer: 1 },
          { q: "Molarity of 4g NaOH (M=40) in 500mL:", options: ["0.1 M","0.2 M","0.4 M","0.8 M"], answer: 1 },
          { q: "Molar mass of H₂SO₄ (H=1,S=32,O=16):", options: ["49","96","98","64"], answer: 2 },
          { q: "1 mole of any gas at STP occupies:", options: ["11.2L","22.4L","44.8L","2.24L"], answer: 1 },
          { q: "Mass of 0.25 mol of CaCO₃ (M=100):", options: ["25g","75g","400g","100g"], answer: 0 },
          { q: "Number of molecules in 2g H₂ (M=2):", options: ["6.02×10²³","1.204×10²⁴","3.01×10²³","12.04×10²³"], answer: 0 },
          { q: "Moles of 9.03×10²³ atoms:", options: ["0.5","1","1.5","3"], answer: 2 },
          { q: "Concentration of 5g NaCl (M=58.5) in 2L:", options: ["0.043 M","0.085 M","2.5 M","85 M"], answer: 0 },
          { q: "STP stands for:", options: ["Standard Temperature and Pressure","Standard Time and Pressure","Simple Temperature and Power","None of above"], answer: 0 },
        ]
      },
      {
        id: "chemical_reactions", title: "Chemical Reactions",
        learn: {
          overview: "Chemical reactions involve the rearrangement of atoms to form new substances. JAMB tests types, balancing, and energy changes.",
          keyPoints: [
            "Reactants → Products",
            "Types: Combination, Decomposition, Displacement, Redox",
            "Balancing: atoms on both sides must be equal",
            "Exothermic: releases heat (ΔH negative)",
            "Endothermic: absorbs heat (ΔH positive)",
            "Rate of reaction depends on concentration, temperature, surface area, catalyst",
          ],
          formulas: [
            { name: "Combustion", formula: "CH₄ + 2O₂ → CO₂ + 2H₂O" },
            { name: "Neutralization", formula: "Acid + Base → Salt + Water" },
          ],
          examples: [
            { q: "Balance: H₂ + O₂ → H₂O", a: "2H₂ + O₂ → 2H₂O" },
            { q: "Type: CuSO₄ + Fe → FeSO₄ + Cu", a: "Displacement reaction (Fe displaces Cu)" },
          ]
        },
        practice: [
          { q: "Acid + Base → ?", options: ["Gas + water","Salt + water","Only water","Salt + gas"], answer: 1 },
          { q: "Exothermic reaction:", options: ["Absorbs heat","Releases heat","No energy change","Absorbs light"], answer: 1 },
          { q: "Balance: Fe + O₂ → Fe₂O₃. Coefficient of Fe =", options: ["2","3","4","6"], answer: 2 },
          { q: "A catalyst in a reaction:", options: ["Is consumed","Increases activation energy","Speeds up reaction","Changes products"], answer: 2 },
          { q: "Burning of magnesium is ______ reaction:", options: ["Decomposition","Displacement","Combination","Neutralization"], answer: 2 },
        ],
        test: [
          { q: "CaCO₃ → CaO + CO₂ is a ______ reaction:", options: ["Combination","Decomposition","Redox","Displacement"], answer: 1 },
          { q: "Oxidation involves:", options: ["Gain of electrons","Loss of electrons","Gain of protons","Loss of protons"], answer: 1 },
          { q: "Reducing agent is:", options: ["Oxidized","Reduced","Neutral","Stable"], answer: 0 },
          { q: "Balanced equation for H₂ + Cl₂ → HCl. Coefficient of HCl =", options: ["1","2","3","4"], answer: 1 },
          { q: "Rate of reaction is increased by:", options: ["Lower temperature","Larger particle size","Higher concentration","Removing catalyst"], answer: 2 },
          { q: "Rusting of iron is example of:", options: ["Combination","Decomposition","Redox","Neutralization"], answer: 2 },
          { q: "Activation energy is:", options: ["Energy released","Minimum energy needed to start reaction","Average kinetic energy","Total bond energy"], answer: 1 },
          { q: "Pb + 2HCl → PbCl₂ + H₂ is ______ reaction:", options: ["Combination","Decomposition","Displacement","Neutralization"], answer: 2 },
          { q: "ΔH < 0 means the reaction is:", options: ["Endothermic","Exothermic","Neither","At equilibrium"], answer: 1 },
          { q: "Le Chatelier's principle applies to:", options: ["Irreversible reactions","Equilibrium reactions","Decomposition only","Ionic reactions"], answer: 1 },
          { q: "Salt + Acid → ?", options: ["Base + H₂","Another salt + another acid","No reaction","Metal + Water"], answer: 1 },
          { q: "Photosynthesis is an ______ reaction:", options: ["Exothermic","Endothermic","Redox only","Neutralization"], answer: 1 },
        ]
      }
    ]
  },
  english: {
    id: "english", name: "English Language", icon: "✏", emoji: "📖",
    color: "#DC2626", light: "#FEF2F2", border: "#FECACA",
    topics: [
      {
        id: "comprehension", title: "Comprehension",
        learn: {
          overview: "Comprehension tests your ability to understand and interpret written passages — always a major part of JAMB English.",
          keyPoints: [
            "Read the passage carefully TWICE before answering",
            "Identify the main idea (topic sentence) of each paragraph",
            "Look for context clues for unfamiliar words",
            "Answer based on what the passage SAYS, not personal knowledge",
            "Inference questions ask you to read between the lines",
          ],
          formulas: [],
          examples: [
            { q: "Technique for 'find the main idea'", a: "Look at the first and last sentences of the passage — these often contain the main idea." },
            { q: "Technique for vocabulary questions", a: "Use context: replace the word with each option and see which makes most sense in context." },
          ]
        },
        practice: [
          { q: "In comprehension, you should base your answers on:", options: ["Personal experience","What the passage states","Common sense","Background knowledge"], answer: 1 },
          { q: "The main idea of a paragraph is usually in the:", options: ["Last sentence","Middle sentence","Topic sentence","Title only"], answer: 2 },
          { q: "An inference is:", options: ["A stated fact","A logical conclusion from evidence","A personal opinion","A definition"], answer: 1 },
          { q: "Context clue means:", options: ["Using a dictionary","Using surrounding words to understand meaning","Guessing","Translating"], answer: 1 },
          { q: "Tone of a passage refers to:", options: ["Speed of reading","Author's attitude/feeling","Topic sentence","Vocabulary level"], answer: 1 },
        ],
        test: [
          { q: "Which skill is MOST important for comprehension?", options: ["Speed","Vocabulary only","Critical reading","Memorizing words"], answer: 2 },
          { q: "'Implicit' information in a passage means:", options: ["Clearly stated","Implied, not directly stated","False information","Uncertain facts"], answer: 1 },
          { q: "Antonym of 'benevolent' is:", options: ["Kind","Malevolent","Generous","Friendly"], answer: 1 },
          { q: "A synonym of 'verbose' is:", options: ["Silent","Wordy","Clear","Brief"], answer: 1 },
          { q: "Passage summary should:", options: ["Copy exact words","Paraphrase main points concisely","Include all details","Be longer than passage"], answer: 1 },
          { q: "'The argument is cogent' means the argument is:", options:["Weak","Convincing","Long","Confusing"], answer: 1 },
          { q: "Which type of question requires you to understand feelings?", options: ["Factual","Vocabulary","Inferential/Interpretive","Summary"], answer: 2 },
          { q: "'Ephemeral' means:", options: ["Lasting forever","Short-lived","Very large","Extremely cold"], answer: 1 },
          { q: "Best approach to unknown word in passage:", options: ["Skip it","Use context","Look in dictionary","Ask someone"], answer: 1 },
          { q: "Author's purpose in a descriptive passage is to:", options: ["Persuade","Inform and describe","Entertain only","Argue a point"], answer: 1 },
          { q: "Denotation of a word is its:", options: ["Figurative meaning","Dictionary/literal meaning","Emotional meaning","Cultural meaning"], answer: 1 },
          { q: "Connotation of 'cheap' is often:", options: ["Affordable (positive)","Negative — low quality","Neutral","Scientific"], answer: 1 },
        ]
      },
      {
        id: "grammar", title: "Grammar",
        learn: {
          overview: "Grammar is the set of rules governing language. JAMB tests parts of speech, tenses, subject-verb agreement, and more.",
          keyPoints: [
            "8 Parts of speech: noun, pronoun, verb, adjective, adverb, preposition, conjunction, interjection",
            "Subject-verb agreement: singular subject → singular verb",
            "Tenses: simple, continuous, perfect, perfect continuous",
            "Active vs. Passive voice",
            "Direct vs. Indirect speech",
          ],
          formulas: [],
          examples: [
            { q: "Identify: 'The tall student runs fast.'", a: "The(art), tall(adj), student(noun/subject), runs(verb), fast(adverb)" },
            { q: "Subject-verb agreement: 'Each of the boys ___ present.'", a: "'is' — 'each' is singular, so use singular verb" },
          ]
        },
        practice: [
          { q: "Which is a conjunction?", options: ["Run","Beautiful","Although","Quickly"], answer: 2 },
          { q: "Subject-verb: 'Neither he nor his friends ___ coming.'", options: ["is","are","was","were"], answer: 1 },
          { q: "Passive of 'John wrote the letter':", options: ["The letter was written by John","John was written","The letter writes John","Written John the letter"], answer: 0 },
          { q: "Identify the preposition: 'She sat under the tree.'", options: ["sat","tree","under","She"], answer: 2 },
          { q: "Which is correct? 'The team ___ playing well.'", options: ["are","is","were","will"], answer: 1 },
        ],
        test: [
          { q: "Which sentence is correct?", options: ["He don't know","He doesn't know","He not know","He do not knows"], answer: 1 },
          { q: "Parts of speech of 'quickly':", options: ["Adjective","Noun","Adverb","Verb"], answer: 2 },
          { q: "Reported speech of: He said, 'I am tired.'", options: ["He said he is tired","He said he was tired","He says he is tired","He said I am tired"], answer: 1 },
          { q: "Correct form: 'If I were rich, I ___ travel the world.'", options: ["will","would","should","shall"], answer: 1 },
          { q: "'The children plays' — error is:", options: ["No error","children should be child","plays should be play","The should be removed"], answer: 2 },
          { q: "Which sentence uses present perfect tense?", options: ["I eat rice","I ate rice","I have eaten rice","I was eating rice"], answer: 2 },
          { q: "Identify the object: 'She gave him a book.'", options: ["She","gave","him","a book (direct object)"], answer: 3 },
          { q: "Collective noun for a group of birds:", options: ["Pack","Flock","Swarm","Herd"], answer: 1 },
          { q: "Gerund is a verb form that acts as a:", options: ["Adjective","Adverb","Noun","Conjunction"], answer: 2 },
          { q: "'Despite the rain, they went out.' — 'Despite' is a:", options: ["Conjunction","Preposition","Adverb","Adjective"], answer: 1 },
          { q: "Which is an abstract noun?", options: ["Table","Dog","Beauty","River"], answer: 2 },
          { q: "Correct comparative: 'She is ___ than her sister.'", options: ["more tall","taller","tallest","most tall"], answer: 1 },
        ]
      },
      {
        id: "vocabulary", title: "Vocabulary",
        learn: {
          overview: "A rich vocabulary is essential for JAMB English. You'll be tested on meanings, antonyms, synonyms, idioms, and phrasal verbs.",
          keyPoints: [
            "Synonym: word with similar meaning",
            "Antonym: word with opposite meaning",
            "Idiom: phrase with figurative meaning (e.g., 'kick the bucket' = die)",
            "Phrasal verbs: verb + preposition/adverb (e.g., 'give up' = stop)",
            "Connotation: emotional association of a word",
          ],
          formulas: [],
          examples: [
            { q: "Synonym of 'happy'", a: "Joyful, elated, content, cheerful" },
            { q: "Antonym of 'generous'", a: "Stingy, miserly, selfish" },
            { q: "Idiom: 'It's raining cats and dogs'", a: "Meaning: It's raining very heavily" },
          ]
        },
        practice: [
          { q: "Synonym of 'diligent':", options: ["Lazy","Hardworking","Careless","Slow"], answer: 1 },
          { q: "Antonym of 'courage':", options: ["Bravery","Fear","Cowardice","Boldness"], answer: 2 },
          { q: "'Under the weather' means:", options: ["Outside","Feeling ill","Very happy","Rainy day"], answer: 1 },
          { q: "'Give up' means:", options: ["Start again","Continue","Stop trying","Give away"], answer: 2 },
          { q: "Synonym of 'enormous':", options: ["Tiny","Small","Huge","Narrow"], answer: 2 },
        ],
        test: [
          { q: "Antonym of 'meticulous':", options: ["Careful","Careless","Detailed","Thorough"], answer: 1 },
          { q: "'Bite the bullet' means:", options: ["Shoot something","Endure a painful situation","Eat fast","Give up"], answer: 1 },
          { q: "Synonym of 'loquacious':", options: ["Silent","Talkative","Angry","Shy"], answer: 1 },
          { q: "'Break a leg' means:", options: ["Cause injury","Good luck","Go away","Work hard"], answer: 1 },
          { q: "Antonym of 'indigenous':", options: ["Native","Local","Foreign","Original"], answer: 2 },
          { q: "'Put off' means:", options: ["Remove","Postpone","Accept","Start"], answer: 1 },
          { q: "Synonym of 'ambiguous':", options: ["Clear","Vague","Obvious","Definite"], answer: 1 },
          { q: "'Once in a blue moon' means:", options: ["At night","Very rarely","Every month","On moonlit nights"], answer: 1 },
          { q: "Antonym of 'benign':", options: ["Gentle","Harmless","Malignant","Kind"], answer: 2 },
          { q: "Synonym of 'candid':", options: ["Dishonest","Frank/Honest","Sneaky","Complicated"], answer: 1 },
          { q: "'Look up to' means:", options: ["Search above","Admire","Look upward","Investigate"], answer: 1 },
          { q: "Antonym of 'prolific':", options: ["Productive","Fertile","Unproductive","Creative"], answer: 2 },
        ]
      },
      {
        id: "sentence_correction", title: "Sentence Correction",
        learn: {
          overview: "Sentence correction tests your ability to identify and fix grammatical errors. Common in JAMB's Use of English section.",
          keyPoints: [
            "Check subject-verb agreement first",
            "Watch for pronoun errors (I vs me, who vs whom)",
            "Avoid double negatives",
            "Parallelism: items in a list must use the same grammatical form",
            "Dangling modifiers: modifier must clearly refer to the right noun",
          ],
          formulas: [],
          examples: [
            { q: "Wrong: 'Everyone should bring their own lunch.'", a: "Correct: 'Everyone should bring his or her own lunch.' (or keep 'their' — modern usage accepts this)" },
            { q: "Wrong: 'Neither the boys nor the girl are here.'", a: "Correct: 'Neither the boys nor the girl is here.' (verb agrees with nearest subject)" },
          ]
        },
        practice: [
          { q: "Identify error: 'She is more prettier than her sister.'", options: ["No error","more prettier","her sister","She is"], answer: 1 },
          { q: "Correct: 'The news ___ not good.'", options: ["are","were","is","were going"], answer: 2 },
          { q: "Parallel structure error: 'I like swimming, to run, and cycling.'", options: ["swimming","to run","cycling","no error"], answer: 1 },
          { q: "Correct pronoun: 'Between you and ___, it is wrong.'", options: ["I","me","my","myself"], answer: 1 },
          { q: "Error: 'I didn't see nobody at the party.'", options: ["didn't see","nobody","at the party","No error — double negative"], answer: 1 },
        ],
        test: [
          { q: "Which sentence is correct?", options: ["The flock of birds are flying","The flock of birds is flying","Birds flock are flying","A flock birds flying"], answer: 1 },
          { q: "Error: 'This is the girl which I told you about.'", options: ["This","which (should be 'who')","I told","No error"], answer: 1 },
          { q: "Correct form: 'He is one of those students who ___ always late.'", options: ["is","are","was","were"], answer: 1 },
          { q: "Identify the error: 'Having finished the work, the bell rang.'", options: ["Having finished","the work","the bell rang (dangling modifier)","No error"], answer: 2 },
          { q: "'Less' should be used with:", options: ["Countable nouns","Uncountable nouns","Plural nouns","All nouns"], answer: 1 },
          { q: "Error: 'The data shows a clear pattern.'", options: ["The","data (should be 'data show')","a clear","pattern"], answer: 1 },
          { q: "Correct: 'It was ___ who called.'", options: ["him","he","his","himself"], answer: 1 },
          { q: "Which is correct?", options: ["More better","Most highest","The tallest","More strongest"], answer: 2 },
          { q: "Identify error: 'She works more harder than him.'", options: ["She works","more harder","than","him"], answer: 1 },
          { q: "Pronoun error: 'Everyone raised their hand.' Formal correction:", options: ["Everyone raised its hand","Everyone raised his or her hand","Everyone raised hands","No correction needed (modern)"], answer: 1 },
          { q: "Correct: 'Neither of the answers ___ correct.'", options: ["are","were","is","will"], answer: 2 },
          { q: "Error: 'She couldn't hardly speak.'", options: ["She","couldn't","hardly (double negative)","speak"], answer: 2 },
        ]
      }
    ]
  }
};

// ─── MOCK EXAM QUESTIONS ───────────────────────────────────────────────────────
const MOCK_QUESTIONS = [
  // Maths
  { subject: "Mathematics", q: "Simplify: 5x + 3y - 2x + y", options: ["3x+4y","7x+4y","3x+2y","5x+3y"], answer: 0 },
  { subject: "Mathematics", q: "Solve x² - 9 = 0", options: ["x=3","x=-3","x=±3","x=9"], answer: 2 },
  { subject: "Mathematics", q: "If log₂(8) = x, x = ?", options: ["2","3","4","8"], answer: 1 },
  { subject: "Mathematics", q: "sin²θ + cos²θ = ?", options: ["0","1","2","tan²θ"], answer: 1 },
  { subject: "Mathematics", q: "Mean of 2,4,6,8,10:", options: ["5","6","7","8"], answer: 1 },
  { subject: "Mathematics", q: "Solve 2x + 3 = x - 1", options: ["x=-4","x=4","x=2","x=-2"], answer: 0 },
  { subject: "Mathematics", q: "Evaluate 8^(2/3):", options: ["2","4","16","24"], answer: 1 },
  { subject: "Mathematics", q: "What is cos 60°?", options: ["0","0.5","1","√3/2"], answer: 1 },
  { subject: "Mathematics", q: "P(rolling a 4 on a die):", options: ["1/2","1/4","1/6","1/3"], answer: 2 },
  { subject: "Mathematics", q: "Expand (x+3)(x-3):", options: ["x²-9","x²+9","x²-6x+9","x²+6x-9"], answer: 0 },
  { subject: "Mathematics", q: "Solve simultaneously: x+y=5, x-y=1", options: ["x=3,y=2","x=2,y=3","x=4,y=1","x=1,y=4"], answer: 0 },
  { subject: "Mathematics", q: "Simplify: 3² × 3³", options: ["3⁵","3⁶","9⁶","3⁹"], answer: 0 },
  { subject: "Mathematics", q: "Mode of 1,2,2,3,3,3,4:", options: ["1","2","3","4"], answer: 2 },
  { subject: "Mathematics", q: "tan 45° = ?", options: ["0","0.5","1","√3"], answer: 2 },
  { subject: "Mathematics", q: "If 2x - 1 > 7, then:", options: ["x>4","x<4","x>3","x<3"], answer: 0 },
  // Physics
  { subject: "Physics", q: "v = u + at. If u=0, a=5, t=4; v = ?", options: ["5m/s","9m/s","20m/s","40m/s"], answer: 2 },
  { subject: "Physics", q: "F = ma. If m=3kg, a=4m/s², F = ?", options: ["0.75N","7N","12N","24N"], answer: 2 },
  { subject: "Physics", q: "KE = ? for 2kg at 3m/s", options: ["3J","6J","9J","18J"], answer: 2 },
  { subject: "Physics", q: "Ohm's Law: V=IR. If I=3A, R=5Ω, V=?", options: ["8V","15V","1.67V","2V"], answer: 1 },
  { subject: "Physics", q: "v = fλ. If f=50Hz, λ=6m, v=?", options: ["56m/s","44m/s","300m/s","8.33m/s"], answer: 2 },
  { subject: "Physics", q: "Weight of 8kg (g=10):", options: ["8N","10N","80N","800N"], answer: 2 },
  { subject: "Physics", q: "Sound is a ___ wave:", options: ["Transverse","Longitudinal","EM","Light"], answer: 1 },
  { subject: "Physics", q: "PE = mgh. m=2kg,g=10,h=5: PE=?", options: ["17J","17kg","100J","25J"], answer: 2 },
  { subject: "Physics", q: "Two 6Ω resistors in parallel =", options: ["12Ω","3Ω","6Ω","1Ω"], answer: 1 },
  { subject: "Physics", q: "Newton's 3rd Law states:", options: ["F=ma","v=u+at","Action=Reaction","F=mv"], answer: 2 },
  { subject: "Physics", q: "Speed of light ≈", options: ["340m/s","3×10⁶m/s","3×10⁸m/s","3×10¹⁰m/s"], answer: 2 },
  { subject: "Physics", q: "Acceleration = 0 means:", options: ["Body at rest","Uniform motion","Both A & B","Deceleration"], answer: 2 },
  { subject: "Physics", q: "P = W/t. W=1000J, t=5s; P=?", options: ["5000W","200W","995W","500W"], answer: 1 },
  { subject: "Physics", q: "Frequency is measured in:", options: ["Hertz","Metre","Newton","Joule"], answer: 0 },
  { subject: "Physics", q: "Inertia depends on:", options: ["Speed","Velocity","Mass","Force"], answer: 2 },
  // Chemistry
  { subject: "Chemistry", q: "Atomic number of Carbon:", options: ["6","12","14","8"], answer: 0 },
  { subject: "Chemistry", q: "NaCl is formed by ___ bonding:", options: ["Covalent","Ionic","Metallic","Dative"], answer: 1 },
  { subject: "Chemistry", q: "Moles of 44g CO₂ (M=44):", options: ["0.5","1","2","44"], answer: 1 },
  { subject: "Chemistry", q: "Group 1 elements are called:", options: ["Halogens","Noble gases","Alkali metals","Lanthanides"], answer: 2 },
  { subject: "Chemistry", q: "Oxidation is:", options: ["Gain of electrons","Loss of electrons","Gain of protons","Loss of protons"], answer: 1 },
  { subject: "Chemistry", q: "Avogadro's number =", options: ["6.02×10²²","6.02×10²³","6.02×10²⁴","6.23×10²³"], answer: 1 },
  { subject: "Chemistry", q: "Acid + Base → ?", options: ["Oxide + water","Salt + water","Salt + gas","Base + acid"], answer: 1 },
  { subject: "Chemistry", q: "Isotopes have same ___ but different ___:", options: ["Mass number; atomic number","Atomic number; mass number","Neutrons; protons","Electrons; protons"], answer: 1 },
  { subject: "Chemistry", q: "Electron config of Na (Z=11):", options: ["2,9","2,8,1","2,8,2","11"], answer: 1 },
  { subject: "Chemistry", q: "Modern periodic table is arranged by:", options: ["Atomic mass","Atomic number","Reactivity","Valency"], answer: 1 },
  { subject: "Chemistry", q: "Molar volume at STP:", options: ["22.4L","2.24L","224L","44.8L"], answer: 0 },
  { subject: "Chemistry", q: "Exothermic reaction ___:", options: ["Absorbs heat","Releases heat","No heat change","Absorbs light"], answer: 1 },
  { subject: "Chemistry", q: "H₂O has ___ bonding:", options: ["Ionic","Covalent","Metallic","No bond"], answer: 1 },
  { subject: "Chemistry", q: "Neutrons in ₁₂⁶C:", options: ["6","12","18","0"], answer: 0 },
  { subject: "Chemistry", q: "Catalyst ___ activation energy:", options: ["Increases","Decreases","Has no effect on","Removes"], answer: 1 },
  // English
  { subject: "English", q: "Synonym of 'diligent':", options: ["Lazy","Hardworking","Careless","Slow"], answer: 1 },
  { subject: "English", q: "Antonym of 'courage':", options: ["Bravery","Fear","Cowardice","Boldness"], answer: 2 },
  { subject: "English", q: "'Under the weather' means:", options: ["Outdoors","Feeling ill","Very happy","It's raining"], answer: 1 },
  { subject: "English", q: "Subject-verb: 'The team ___ playing well.'", options: ["are","is","were","would"], answer: 1 },
  { subject: "English", q: "Passive of 'John wrote a letter':", options: ["A letter was written by John","John was written","Writing by John","A letter writes John"], answer: 0 },
  { subject: "English", q: "Which is an adverb?", options: ["Beautiful","Run","Quickly","Happiness"], answer: 2 },
  { subject: "English", q: "'Break a leg' means:", options: ["Cause injury","Good luck","Go away","Start running"], answer: 1 },
  { subject: "English", q: "Error in: 'She is more prettier than her sister.'", options: ["She is","more prettier","than","her sister"], answer: 1 },
  { subject: "English", q: "Direct speech: He said, 'I am tired.' Reported:", options: ["He said he is tired","He said he was tired","He says he is tired","He said I am tired"], answer: 1 },
  { subject: "English", q: "Gerund acts as a:", options: ["Verb","Adjective","Noun","Adverb"], answer: 2 },
  { subject: "English", q: "Synonym of 'loquacious':", options: ["Silent","Talkative","Shy","Angry"], answer: 1 },
  { subject: "English", q: "Main idea in a passage is in the:", options: ["Last line","Topic sentence","Middle always","Nowhere"], answer: 1 },
  { subject: "English", q: "Collective noun for birds:", options: ["Pack","Herd","Flock","Swarm"], answer: 2 },
  { subject: "English", q: "Correct pronoun: 'Between you and ___'", options: ["I","me","my","myself"], answer: 1 },
  { subject: "English", q: "'Give up' means:", options: ["Start again","Continue","Surrender/Stop","Give away"], answer: 2 },
];

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const STORAGE_KEY = "jamb_progress_v2";
const STREAK_KEY = "jamb_streak_v2";

function buildDefaultProgress() {
  const init = {};
  Object.keys(CURRICULUM).forEach((sid) => {
    init[sid] = {};
    CURRICULUM[sid].topics.forEach((t, i) => {
      init[sid][t.id] = { status: i === 0 ? "available" : "locked", score: null, attempts: 0 };
    });
  });
  return init;
}

function loadLocalProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return buildDefaultProgress();
}

function saveLocalProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

function makeLessonId(subjectId, topicId) {
  return `${subjectId}.${topicId}`;
}

function normalizeProgressData(dbProgressRows) {
  const state = buildDefaultProgress();

  dbProgressRows.forEach((row) => {
    if (!row.lesson_id) return;
    const [subjectId, topicId] = row.lesson_id.split('.');
    if (!subjectId || !topicId) return;
    if (!state[subjectId]) return;
    state[subjectId][topicId] = {
      ...state[subjectId][topicId],
      status: row.completed ? 'passed' : 'failed',
      score: row.completed ? 100 : null,
      attempts: row.completed ? 1 : 1,
    };
  });

  Object.keys(CURRICULUM).forEach((subject) => {
    CURRICULUM[subject].topics.forEach((topic, index) => {
      const current = state[subject][topic.id];
      if (index === 0 && current.status === 'locked') {
        current.status = 'available';
      } else if (current.status === 'locked') {
        const prevTopic = CURRICULUM[subject].topics[index - 1];
        if (prevTopic && state[subject][prevTopic.id]?.status === 'passed') {
          current.status = 'available';
        }
      }
      state[subject][topic.id] = current;
    });
  });

  return state;
}

function getTopicLevel(subjectId, topicId) {
  const subj = CURRICULUM[subjectId];
  if (!subj) return 1;
  const index = subj.topics.findIndex((t) => t.id === topicId);
  if (index < 0) return 1;
  const position = subj.topics.length > 1 ? index / (subj.topics.length - 1) : 0;
  return Math.min(4, Math.max(1, Math.round(position * 3) + 1));
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const { streak, lastDate } = JSON.parse(raw);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === today) return streak;
      if (lastDate === yesterday) return streak;
      return 0;
    }
  } catch {}
  return 0;
}

function updateStreak() {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const { streak, lastDate } = JSON.parse(raw);
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === today) return streak;
      const newStreak = lastDate === yesterday ? streak + 1 : 1;
      localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: newStreak, lastDate: today }));
      return newStreak;
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify({ streak: 1, lastDate: today }));
    return 1;
  } catch { return 1; }
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Lock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  Star: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Play: () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Book: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Arrow: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Trophy: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4v6a5 5 0 0010 0V4"/><path d="M7 4H4a1 1 0 00-1 1v2a4 4 0 004 4h1"/><path d="M17 4h3a1 1 0 011 1v2a4 4 0 01-4 4h-1"/></svg>,
  Timer: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>,
  Flame: () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c-4.97 0-9-4.03-9-9 0-4.17 3.36-7.24 5-8.5 0 2.5 1.5 3.5 3 3.5-.5-1.5.5-3 2-4 0 3 2.5 5 2.5 7 .5-1 .5-2.5 1-3.5 1.5 2 2.5 4 2.5 5.5 0 4.42-3.13 9-7 9z"/></svg>,
  YouTube: () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 001.95-1.97A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
  Back: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Retry: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
};

// ─── CONFETTI COMPONENT ────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: ["#2563EB","#F59E0B","#10B981","#EF4444","#8B5CF6","#F97316"][i % 6],
    size: `${Math.random() * 8 + 6}px`,
  }));
  return (
    <div className="confetti">
      <style>{`
        @keyframes confFall { 0% { transform: translateY(-20px) rotate(0deg); opacity:1; } 100% { transform: translateY(100vh) rotate(720deg); opacity:0; } }
      `}</style>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:"absolute", left:p.left, top:"-20px",
          width:p.size, height:p.size, background:p.color, borderRadius:"2px",
          animation:`confFall ${Math.random()*2+2}s ${p.delay} ease-in forwards`
        }}/>
      ))}
    </div>
  );
}

// ─── PROGRESS BAR COMPONENT ───────────────────────────────────────────────────
function ProgressBar({ value, color = "#2563EB", height = 8, label }) {
  return (
    <div>
      {label && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:13, color:"#64748b" }}>
        <span>{label}</span><span style={{ fontWeight:600, color }}>{Math.round(value)}%</span>
      </div>}
      <div style={{ background:"#e2e8f0", borderRadius:999, height, overflow:"hidden" }}>
        <div className="progress-bar" style={{ width:`${value}%`, height:"100%", background:color, borderRadius:999, transition:"width 0.8s ease" }}/>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState("home");
  const [progress, setProgress] = useState(loadLocalProgress);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicStep, setTopicStep] = useState("learn"); // learn | practice | test | result
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [testAnswers, setTestAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);
  const [testTimer, setTestTimer] = useState(null);
  const [mockMode, setMockMode] = useState(false);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockTimeLeft, setMockTimeLeft] = useState(120 * 60);
  const [mockShuffled, setMockShuffled] = useState([]);

  useEffect(() => {
    setStreak(updateStreak());
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;

    const loadDbProgress = async () => {
      try {
        const { data, error } = await fetchProgressFromDb(user.id);
        if (error) throw error;
        if (!mounted) return;
        const merged = normalizeProgressData(data);
        setProgress(merged);
        saveLocalProgress(merged);
      } catch (error) {
        console.error('Error loading Supabase progress:', error);
      }
    };

    loadDbProgress();
    return () => { mounted = false; };
  }, [user?.id]);

  useEffect(() => {
    saveLocalProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (mockMode && !mockSubmitted) {
      const interval = setInterval(() => {
        setMockTimeLeft(t => {
          if (t <= 1) { clearInterval(interval); setMockSubmitted(true); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mockMode, mockSubmitted]);

  const getSubjectProgress = useCallback((sid) => {
    const subj = CURRICULUM[sid];
    const total = subj.topics.length;
    const passed = subj.topics.filter(t => progress[sid]?.[t.id]?.status === "passed").length;
    return Math.round((passed / total) * 100);
  }, [progress]);

  const overallProgress = useMemo(() => {
    const subjects = Object.keys(CURRICULUM);
    return Math.round(subjects.reduce((sum, sid) => sum + getSubjectProgress(sid), 0) / subjects.length);
  }, [getSubjectProgress]);

  const allSubjectsComplete = useMemo(() => {
    return Object.keys(CURRICULUM).every(sid => getSubjectProgress(sid) === 100);
  }, [getSubjectProgress]);

  const unlockNextTopic = useCallback((sid, topicId) => {
    const subj = CURRICULUM[sid];
    const idx = subj.topics.findIndex(t => t.id === topicId);
    if (idx < subj.topics.length - 1) {
      const nextId = subj.topics[idx + 1].id;
      setProgress(prev => {
        const updated = { ...prev, [sid]: { ...prev[sid], [nextId]: { ...prev[sid][nextId], status: "available" } } };
        return updated;
      });
    }
  }, []);

  const handleTestSubmit = useCallback(async () => {
    const topic = CURRICULUM[selectedSubject].topics.find((t) => t.id === selectedTopic);
    const questions = topic.test;
    let correct = 0;
    questions.forEach((q, i) => { if (testAnswers[i] === q.answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 70;
    const status = passed ? 'passed' : 'failed';
    const lessonId = makeLessonId(selectedSubject, selectedTopic);

    setProgress((prev) => {
      const attempts = (prev[selectedSubject]?.[selectedTopic]?.attempts || 0) + 1;
      return {
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          [selectedTopic]: { status, score, attempts },
        },
      };
    });

    if (user?.id) {
      saveTestResult(user.id, selectedSubject, selectedTopic, score, passed)
        .catch((error) => console.error('Failed to save test result:', error));
      saveProgressToDb({
        userId: user.id,
        lessonId,
        completed: passed,
      }).catch((error) => console.error('Failed to save progress:', error));
    }

    if (passed) {
      unlockNextTopic(selectedSubject, selectedTopic);
      setTimeout(() => setShowConfetti(true), 200);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setTestSubmitted(true);
  }, [selectedSubject, selectedTopic, testAnswers, unlockNextTopic, user]);

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden", fontFamily:"'DM Sans', sans-serif" }}>
      <FontLoader/>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .float-anim { animation: float 4s ease-in-out infinite; }
        .btn-glow { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); animation: pulse-ring 2s infinite; }
      `}</style>
      {/* BG shapes */}
      {[...Array(6)].map((_,i)=>(
        <div key={i} style={{ position:"absolute", width:`${120+i*40}px`, height:`${120+i*40}px`, borderRadius:"50%", background:"rgba(255,255,255,0.03)", left:`${[5,70,20,60,10,80][i]}%`, top:`${[10,5,70,80,40,50][i]}%`, transform:"translate(-50%,-50%)" }}/>
      ))}

      <div className="fade-in" style={{ textAlign:"center", maxWidth:480, zIndex:1 }}>
        <div className="float-anim" style={{ fontSize:72, marginBottom:16 }}>🎓</div>
        <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px,6vw,48px)", fontWeight:800, color:"#fff", lineHeight:1.15, marginBottom:12 }}>
          JAMB <span style={{ color:"#FCD34D" }}>Success</span> Guide
        </h1>
        <p style={{ fontSize:"clamp(14px,3vw,18px)", color:"rgba(255,255,255,0.75)", marginBottom:8, fontWeight:500 }}>
          Learn. Test. Pass. Progress to <span style={{ color:"#34D399", fontWeight:700 }}>300+</span>
        </p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.55)", marginBottom:32, lineHeight:1.6 }}>
          A structured JAMB prep system — you must study, pass a topic test, and only then unlock the next. No shortcuts. No skipping.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:32 }}>
          {[
            { icon:"📚", title:"Structured Learning", desc:"Step-by-step topics" },
            { icon:"🔐", title:"Gated Progress", desc:"Pass tests to unlock" },
            { icon:"⚡", title:"Instant Feedback", desc:"Know your weak areas" },
            { icon:"🏆", title:"Mock Exam", desc:"Full JAMB simulation" },
          ].map((f,i) => (
            <div key={i} className="fade-in" style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", borderRadius:14, padding:"14px 12px", border:"1px solid rgba(255,255,255,0.12)", animationDelay:`${i*0.1}s` }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{f.icon}</div>
              <div style={{ color:"#fff", fontWeight:600, fontSize:13 }}>{f.title}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <button className="btn-primary btn-glow" onClick={() => setScreen("dashboard")} style={{ background:"linear-gradient(135deg, #F59E0B, #EF4444)", color:"#fff", border:"none", borderRadius:50, padding:"16px 48px", fontSize:17, fontWeight:700, cursor:"pointer", fontFamily:"'Sora',sans-serif", width:"100%", marginBottom:12 }}>
          🚀 Start Your Journey
        </button>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>Your progress is saved automatically</p>
      </div>
    </div>
  );

  // ── MOCK EXAM ──────────────────────────────────────────────────────────────
  if (mockMode) {
    const questions = mockShuffled;
    if (mockSubmitted) {
      const bySubject = {};
      Object.keys(CURRICULUM).forEach(sid => { bySubject[CURRICULUM[sid].name] = { correct:0, total:0 }; });
      questions.forEach((q, i) => {
        bySubject[q.subject].total++;
        if (mockAnswers[i] === q.answer) bySubject[q.subject].correct++;
      });
      const totalCorrect = Object.values(bySubject).reduce((s,b) => s+b.correct, 0);
      const scorePercent = Math.round((totalCorrect / questions.length) * 100);
      const estimatedScore = Math.round(scorePercent * 4);
      return (
        <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
          <FontLoader/>
          {showConfetti && <Confetti/>}
          <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>
            <div className="fade-in" style={{ background:"#fff", borderRadius:20, padding:"32px 24px", textAlign:"center", marginBottom:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize:64, marginBottom:12 }}>{scorePercent >= 70 ? "🏆" : "📊"}</div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:28, fontWeight:800, marginBottom:4 }}>Mock Exam Complete!</h2>
              <div style={{ fontSize:48, fontWeight:800, color: scorePercent>=70?"#10B981":"#EF4444", marginBottom:4 }}>{scorePercent}%</div>
              <p style={{ color:"#64748b", marginBottom:8 }}>Estimated JAMB Score: <strong style={{color:"#2563EB"}}>{estimatedScore}/400</strong></p>
              <p style={{ fontSize:14, color:"#94a3b8" }}>{totalCorrect}/{questions.length} questions correct</p>
            </div>
            <div style={{ background:"#fff", borderRadius:20, padding:24, marginBottom:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, marginBottom:16 }}>Performance by Subject</h3>
              {Object.entries(bySubject).map(([name, data]) => {
                const pct = Math.round((data.correct/data.total)*100);
                const subj = Object.values(CURRICULUM).find(s => s.name === name);
                return (
                  <div key={name} style={{ marginBottom:16 }}>
                    <ProgressBar value={pct} color={subj?.color} label={`${name}: ${data.correct}/${data.total}`}/>
                  </div>
                );
              })}
            </div>
            <button className="btn-primary" onClick={() => { setMockMode(false); setMockSubmitted(false); setMockAnswers({}); setMockTimeLeft(120*60); }} style={{ background:"linear-gradient(135deg,#2563EB,#7C3AED)", color:"#fff", border:"none", borderRadius:50, padding:"14px 32px", fontSize:15, fontWeight:700, cursor:"pointer", width:"100%" }}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    const mm = Math.floor(mockTimeLeft/60), ss = mockTimeLeft%60;
    const answered = Object.keys(mockAnswers).length;
    return (
      <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ background:"#0f172a", color:"#fff", padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700 }}>🏆 Mock JAMB Exam</span>
          <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:14 }}>
            <span style={{ color:"#94a3b8" }}>{answered}/{questions.length}</span>
            <span style={{ background: mm<10?"#EF4444":"#2563EB", padding:"4px 12px", borderRadius:999, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <Icon.Timer/> {mm}:{ss.toString().padStart(2,"0")}
            </span>
          </div>
        </div>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
          {questions.map((q, i) => (
            <div key={i} className="fade-in" style={{ background:"#fff", borderRadius:16, padding:"20px", marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", animationDelay:`${Math.min(i*0.02,0.3)}s` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ background: Object.values(CURRICULUM).find(s=>s.name===q.subject)?.light, color: Object.values(CURRICULUM).find(s=>s.name===q.subject)?.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>{q.subject}</span>
                <span style={{ fontSize:13, color:"#64748b", fontWeight:600 }}>Q{i+1}</span>
              </div>
              <p style={{ fontWeight:600, marginBottom:12, lineHeight:1.5 }}>{q.q}</p>
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => setMockAnswers(prev => ({...prev,[i]:oi}))} style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 14px", marginBottom:8, borderRadius:10, border:`2px solid ${mockAnswers[i]===oi?"#2563EB":"#e2e8f0"}`, background:mockAnswers[i]===oi?"#EFF6FF":"#f8fafc", cursor:"pointer", fontSize:14, fontWeight: mockAnswers[i]===oi?600:400, color: mockAnswers[i]===oi?"#2563EB":"#374151", transition:"all 0.15s" }}>
                  <span style={{ fontWeight:700, marginRight:8 }}>{["A","B","C","D"][oi]}.</span>{opt}
                </button>
              ))}
            </div>
          ))}
          <button className="btn-primary" onClick={() => { setMockSubmitted(true); if(overallProgress>=70) { setShowConfetti(true); setTimeout(()=>setShowConfetti(false),3000); } }} style={{ background:"linear-gradient(135deg,#2563EB,#7C3AED)", color:"#fff", border:"none", borderRadius:50, padding:"16px 32px", fontSize:16, fontWeight:700, cursor:"pointer", width:"100%", marginTop:8 }}>
            Submit Exam ({answered}/{questions.length} answered)
          </button>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  if (screen === "dashboard" && !selectedSubject) {
    const subjList = Object.values(CURRICULUM);
    const today = new Date().toLocaleDateString("en-NG", { weekday:"long", month:"long", day:"numeric" });
    return (
      <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
        <FontLoader/>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#0f172a,#1e3a8a)", padding:"20px 20px 24px", color:"#fff" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", marginBottom:2 }}>{today}</p>
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800 }}>Welcome back! {user?.user_metadata?.name || user?.email || "Student"}! </h1>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ textAlign:"center", background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, color:"#F59E0B" }}><Icon.Flame/><span style={{ fontWeight:800, fontSize:20 }}>{streak}</span></div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>day streak</div>
                </div>
                <button 
                  onClick={logout}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => e.target.style.background = "rgba(239, 68, 68, 0.3)"}
                  onMouseOut={(e) => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
                >
                  Logout
                </button>
              </div>
            </div>
            <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:14, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Overall Progress</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#34D399" }}>{overallProgress}%</span>
              </div>
              <ProgressBar value={overallProgress} color="#34D399" height={10}/>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:8 }}>Target: 300+ | Keep going! 🎯</p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
          {/* Subjects */}
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, marginBottom:14 }}>Your Subjects</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, marginBottom:24 }}>
            {subjList.map(subj => {
              const pct = getSubjectProgress(subj.id);
              const topics = subj.topics;
              const nextTopic = topics.find(t => progress[subj.id]?.[t.id]?.status === "available");
              const inProgressTopic = topics.find(t => progress[subj.id]?.[t.id]?.status === "in_progress");
              const activeTopic = inProgressTopic || nextTopic;
              return (
                <div key={subj.id} className="card-hover" onClick={() => setSelectedSubject(subj.id)} style={{ background:"#fff", borderRadius:18, padding:20, cursor:"pointer", boxShadow:"0 2px 16px rgba(0,0,0,0.06)", border:`1px solid ${subj.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:subj.light, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{subj.emoji}</div>
                    <div>
                      <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:"#1a1a2e" }}>{subj.name}</h3>
                      <p style={{ fontSize:12, color:"#94a3b8" }}>{topics.filter(t=>progress[subj.id]?.[t.id]?.status==="passed").length}/{topics.length} topics passed</p>
                    </div>
                  </div>
                  <ProgressBar value={pct} color={subj.color} height={6}/>
                  {activeTopic && (
                    <div style={{ marginTop:12, background:subj.light, borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:12, color:subj.color, fontWeight:600 }}>Next: {activeTopic.title}</span>
                      <Icon.Arrow/>
                    </div>
                  )}
                  {pct === 100 && (
                    <div style={{ marginTop:12, background:"#D1FAE5", borderRadius:10, padding:"8px 12px", display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ color:"#059669" }}><Icon.Check/></span>
                      <span style={{ fontSize:12, color:"#059669", fontWeight:700 }}>Subject Complete! 🎉</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mock exam */}
          <div className="card-hover" style={{ background:"linear-gradient(135deg,#0f172a,#1e3a8a)", borderRadius:18, padding:24, color:"#fff", cursor: allSubjectsComplete?"pointer":"default", opacity: allSubjectsComplete?1:0.7, boxShadow:"0 4px 20px rgba(0,0,0,0.2)" }} onClick={() => {
            if (!allSubjectsComplete) return;
            const shuffled = [...MOCK_QUESTIONS].sort(()=>Math.random()-0.5);
            setMockShuffled(shuffled);
            setMockAnswers({}); setMockSubmitted(false); setMockTimeLeft(120*60);
            setMockMode(true);
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:40 }}>🏆</div>
              <div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18, marginBottom:4 }}>Mock JAMB Exam</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.7)", lineHeight:1.5 }}>{allSubjectsComplete ? "60 questions • 2-hour timer • Full simulation" : "Complete all subject topics to unlock the mock exam"}</p>
              </div>
              {allSubjectsComplete && <div style={{ marginLeft:"auto" }}><Icon.Arrow/></div>}
            </div>
            {!allSubjectsComplete && (
              <div style={{ marginTop:12, background:"rgba(255,255,255,0.1)", borderRadius:999, overflow:"hidden", height:4 }}>
                <div style={{ width:`${overallProgress}%`, height:"100%", background:"#F59E0B", borderRadius:999, transition:"width 0.8s" }}/>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SUBJECT VIEW ──────────────────────────────────────────────────────────
  if (screen === "dashboard" && selectedSubject && !selectedTopic) {
    const subj = CURRICULUM[selectedSubject];
    return (
      <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ background:`linear-gradient(135deg,${subj.color}dd,${subj.color})`, padding:"20px 20px 28px", color:"#fff" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <button onClick={() => setSelectedSubject(null)} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:50, padding:"8px 16px", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:16, fontSize:14 }}>
              <Icon.Back/> Dashboard
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:40 }}>{subj.emoji}</div>
              <div>
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800 }}>{subj.name}</h1>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>{subj.topics.filter(t=>progress[subj.id]?.[t.id]?.status==="passed").length}/{subj.topics.length} topics passed</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, marginBottom:14 }}>Topics</h2>
          {subj.topics.map((topic, i) => {
            const topicProgress = progress[subj.id]?.[topic.id];
            const status = topicProgress?.status || "locked";
            const isLocked = status === "locked";
            const isPassed = status === "passed";
            const isFailed = status === "failed";
            const isAvailable = status === "available" || status === "in_progress";
            const score = topicProgress?.score;
            return (
              <div key={topic.id} className={isLocked ? "lock-shake" : "card-hover"} onClick={() => {
                if (!isLocked) {
                  setSelectedTopic(topic.id);
                  setTopicStep("learn");
                  setPracticeAnswers({});
                  setTestAnswers({});
                  setShowFeedback({});
                  setTestSubmitted(false);
                  setProgress(prev => ({
                    ...prev,
                    [selectedSubject]: {
                      ...prev[selectedSubject],
                      [topic.id]: { ...prev[selectedSubject][topic.id], status: isPassed ? "passed" : "in_progress" }
                    }
                  }));
                }
              }} style={{ background:"#fff", borderRadius:16, padding:"16px 20px", marginBottom:12, cursor:isLocked?"not-allowed":"pointer", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", border:`2px solid ${isPassed?"#A7F3D0":isFailed?"#FECACA":isAvailable?subj.border:"#e2e8f0"}`, opacity:isLocked?0.6:1, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:isPassed?"#D1FAE5":isFailed?"#FEE2E2":isAvailable?subj.light:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:isPassed?"#059669":isFailed?"#EF4444":isAvailable?subj.color:"#94a3b8" }}>
                  {isPassed ? <Icon.Check/> : isLocked ? <Icon.Lock/> : <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:18 }}>{i+1}</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:isLocked?"#94a3b8":"#1a1a2e" }}>{topic.title}</h3>
                    {isPassed && <span style={{ background:"#D1FAE5", color:"#059669", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>PASSED</span>}
                    {isFailed && <span style={{ background:"#FEE2E2", color:"#EF4444", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:999 }}>RETRY</span>}
                    {isLocked && <span style={{ background:"#F1F5F9", color:"#94a3b8", fontSize:11, padding:"2px 8px", borderRadius:999 }}>LOCKED</span>}
                  </div>
                  {score !== null && <p style={{ fontSize:12, color:"#64748b", marginTop:2 }}>Last score: {score}% {isPassed?"✅":"❌"}</p>}
                  {isLocked && i>0 && <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Pass "{subj.topics[i-1].title}" to unlock</p>}
                </div>
                {!isLocked && <div style={{ color:subj.color, flexShrink:0 }}><Icon.Arrow/></div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── TOPIC VIEW ────────────────────────────────────────────────────────────
  if (screen === "dashboard" && selectedSubject && selectedTopic) {
    const subj = CURRICULUM[selectedSubject];
    const topic = subj.topics.find(t => t.id === selectedTopic);
    const topicProg = progress[selectedSubject]?.[selectedTopic];
    const ytQuery = `JAMB+${subj.name}+${topic.title}`.replace(/ /g, "+");
    const ytUrl = `https://www.youtube.com/results?search_query=${ytQuery}`;
    const steps = ["learn", "practice", "test"];
    const stepLabels = ["📖 Learn", "✏️ Practice", "📝 Test"];

    const handleBack = () => {
      setSelectedTopic(null);
      setTopicStep("learn");
    };

    // ── LEARN STEP ──
    if (topicStep === "learn") return (
      <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ background:`linear-gradient(135deg,${subj.color}dd,${subj.color})`, padding:"20px 20px 24px", color:"#fff" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <button onClick={handleBack} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:50, padding:"8px 16px", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:14, fontSize:14 }}>
              <Icon.Back/> {subj.name}
            </button>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, marginBottom:4 }}>{topic.title}</h1>
            <div style={{ display:"flex", gap:6 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ flex:1, height:4, borderRadius:999, background: i===0?"#fff":i<steps.indexOf(topicStep)?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.3)" }}/>
              ))}
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:8 }}>Step 1 of 3 — Study the material below</p>
          </div>
        </div>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
          <div className="fade-in" style={{ background:"#fff", borderRadius:18, padding:24, marginBottom:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:18, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}><Icon.Book/> Overview</h2>
            <p style={{ color:"#374151", lineHeight:1.7, fontSize:15 }}>{topic.learn.overview}</p>
          </div>
          <div className="fade-in" style={{ background:"#fff", borderRadius:18, padding:24, marginBottom:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", animationDelay:"0.1s" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, marginBottom:14 }}>🎯 Key Points</h2>
            {topic.learn.keyPoints.map((kp, i) => (
              <div key={i} style={{ display:"flex", gap:12, marginBottom:10, padding:"10px 14px", background:subj.light, borderRadius:12, borderLeft:`4px solid ${subj.color}` }}>
                <span style={{ color:subj.color, fontWeight:800, fontSize:14, flexShrink:0 }}>{i+1}.</span>
                <p style={{ fontSize:14, color:"#374151", lineHeight:1.5 }}>{kp}</p>
              </div>
            ))}
          </div>
          {topic.learn.formulas.length > 0 && (
            <div className="fade-in" style={{ background:"#1a1a2e", borderRadius:18, padding:24, marginBottom:16, boxShadow:"0 4px 20px rgba(0,0,0,0.15)", animationDelay:"0.15s" }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:"#fff", marginBottom:14 }}>⚡ Key Formulas</h2>
              {topic.learn.formulas.map((f, i) => (
                <div key={i} style={{ marginBottom:12, padding:"12px 16px", background:"rgba(255,255,255,0.08)", borderRadius:12 }}>
                  <p style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>{f.name}</p>
                  <p style={{ fontFamily:"'Sora',monospace", color:"#FCD34D", fontWeight:700, fontSize:15 }}>{f.formula}</p>
                </div>
              ))}
            </div>
          )}
          <div className="fade-in" style={{ background:"#fff", borderRadius:18, padding:24, marginBottom:16, boxShadow:"0 2px 16px rgba(0,0,0,0.06)", animationDelay:"0.2s" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, marginBottom:14 }}>💡 Worked Examples</h2>
            {topic.learn.examples.map((ex, i) => (
              <div key={i} style={{ marginBottom:14, padding:16, background:"#F8FAFC", borderRadius:12 }}>
                <p style={{ fontWeight:600, color:"#374151", marginBottom:8, fontSize:14 }}>Q: {ex.q}</p>
                <p style={{ color:subj.color, fontWeight:600, fontSize:14 }}>→ {ex.a}</p>
              </div>
            ))}
          </div>
          <a href={ytUrl} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:12, background:"#EF4444", color:"#fff", borderRadius:14, padding:"16px 20px", textDecoration:"none", marginBottom:20, boxShadow:"0 4px 16px rgba(239,68,68,0.3)" }}>
            <Icon.YouTube/><div><div style={{ fontWeight:700, fontSize:14 }}>Watch on YouTube</div><div style={{ fontSize:12, opacity:0.8 }}>JAMB {subj.name} — {topic.title} tutorials</div></div>
            <div style={{ marginLeft:"auto" }}><Icon.Arrow/></div>
          </a>
          <button className="btn-primary" onClick={() => setTopicStep("practice")} style={{ width:"100%", background:`linear-gradient(135deg,${subj.color},${subj.color}aa)`, color:"#fff", border:"none", borderRadius:50, padding:"16px", fontSize:16, fontWeight:700, cursor:"pointer" }}>
            ✏️ Start Practice →
          </button>
        </div>
      </div>
    );

    // ── PRACTICE STEP ──
    if (topicStep === "practice") return (
      <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
        <FontLoader/>
        <div style={{ background:`linear-gradient(135deg,${subj.color}dd,${subj.color})`, padding:"20px 20px 24px", color:"#fff" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <button onClick={() => setTopicStep("learn")} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:50, padding:"8px 16px", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:14, fontSize:14 }}>
              <Icon.Back/> Back to Learn
            </button>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, marginBottom:4 }}>{topic.title} — Practice</h1>
            <div style={{ display:"flex", gap:6 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ flex:1, height:4, borderRadius:999, background: i<=1?"#fff":"rgba(255,255,255,0.3)" }}/>
              ))}
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:8 }}>Step 2 of 3 — Get instant feedback on each answer</p>
          </div>
        </div>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
          {topic.practice.map((q, qi) => {
            const selected = practiceAnswers[qi];
            const revealed = showFeedback[qi];
            const isCorrect = selected === q.answer;
            return (
              <div key={qi} className="fade-in" style={{ background:"#fff", borderRadius:18, padding:20, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", animationDelay:`${qi*0.08}s` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ background:subj.light, color:subj.color, fontWeight:800, fontSize:13, padding:"3px 10px", borderRadius:999 }}>Q{qi+1}</span>
                  {revealed && <span style={{ color:isCorrect?"#059669":"#EF4444", fontWeight:700, fontSize:13 }}>{isCorrect?"✅ Correct!":"❌ Incorrect"}</span>}
                </div>
                <p style={{ fontWeight:600, marginBottom:12, lineHeight:1.5, fontSize:15 }}>{q.q}</p>
                {q.options.map((opt, oi) => {
                  let bg = "#F8FAFC", border = "#e2e8f0", color = "#374151";
                  if (revealed) {
                    if (oi === q.answer) { bg="#D1FAE5"; border="#059669"; color="#059669"; }
                    else if (oi === selected && oi !== q.answer) { bg="#FEE2E2"; border="#EF4444"; color="#EF4444"; }
                  } else if (selected === oi) { bg=subj.light; border=subj.color; color=subj.color; }
                  return (
                    <button key={oi} onClick={() => { if(!revealed) setPracticeAnswers(p=>({...p,[qi]:oi})); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 14px", marginBottom:8, borderRadius:10, border:`2px solid ${border}`, background:bg, cursor:revealed?"default":"pointer", fontSize:14, fontWeight:selected===oi||oi===q.answer?600:400, color, transition:"all 0.15s" }}>
                      <span style={{ fontWeight:700, marginRight:8 }}>{["A","B","C","D"][oi]}.</span>{opt}
                    </button>
                  );
                })}
                {selected !== undefined && !revealed && (
                  <button onClick={() => setShowFeedback(p=>({...p,[qi]:true}))} style={{ background:subj.color, color:"#fff", border:"none", borderRadius:50, padding:"8px 20px", cursor:"pointer", fontSize:13, fontWeight:700, marginTop:4 }}>
                    Check Answer
                  </button>
                )}
                {revealed && !isCorrect && (
                  <div style={{ background:"#EFF6FF", borderRadius:10, padding:"10px 14px", marginTop:8 }}>
                    <p style={{ fontSize:13, color:"#2563EB", fontWeight:600 }}>💡 Correct answer: {["A","B","C","D"][q.answer]}. {q.options[q.answer]}</p>
                  </div>
                )}
              </div>
            );
          })}
          <button className="btn-primary" onClick={() => setTopicStep("test")} style={{ width:"100%", background:`linear-gradient(135deg,${subj.color},${subj.color}aa)`, color:"#fff", border:"none", borderRadius:50, padding:"16px", fontSize:16, fontWeight:700, cursor:"pointer", marginTop:8 }}>
            📝 Take the Test →
          </button>
        </div>
      </div>
    );

    // ── TEST STEP ──
    if (topicStep === "test" && !testSubmitted) {
      const totalAnswered = Object.keys(testAnswers).length;
      const totalQ = topic.test.length;
      return (
        <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
          <FontLoader/>
          <div style={{ background:"linear-gradient(135deg,#1a1a2e,#0f172a)", padding:"20px 20px 24px", color:"#fff" }}>
            <div style={{ maxWidth:720, margin:"0 auto" }}>
              <button onClick={() => setTopicStep("practice")} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:50, padding:"8px 16px", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:6, marginBottom:14, fontSize:14 }}>
                <Icon.Back/> Back to Practice
              </button>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800 }}>{topic.title} — Test</h1>
                <span style={{ background:"rgba(255,255,255,0.1)", padding:"4px 12px", borderRadius:999, fontSize:13, fontWeight:600 }}>{totalAnswered}/{totalQ}</span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ flex:1, height:4, borderRadius:999, background:"#fff" }}/>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Step 3 of 3 — Pass 70% to unlock next topic</p>
                <p style={{ fontSize:12, color:"#FCD34D", fontWeight:600 }}>Pass mark: 70%</p>
              </div>
            </div>
          </div>
          <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
            {topic.test.map((q, qi) => (
              <div key={qi} className="fade-in" style={{ background:"#fff", borderRadius:18, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", animationDelay:`${qi*0.04}s`, border:`2px solid ${testAnswers[qi]!==undefined?subj.border:"#e2e8f0"}` }}>
                <p style={{ fontWeight:600, marginBottom:4, fontSize:13, color:"#64748b" }}>Question {qi+1}</p>
                <p style={{ fontWeight:600, marginBottom:14, fontSize:15, lineHeight:1.5 }}>{q.q}</p>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setTestAnswers(p=>({...p,[qi]:oi}))} style={{ display:"block", width:"100%", textAlign:"left", padding:"11px 14px", marginBottom:8, borderRadius:10, border:`2px solid ${testAnswers[qi]===oi?subj.color:"#e2e8f0"}`, background:testAnswers[qi]===oi?subj.light:"#f8fafc", cursor:"pointer", fontSize:14, fontWeight:testAnswers[qi]===oi?600:400, color:testAnswers[qi]===oi?subj.color:"#374151", transition:"all 0.15s" }}>
                    <span style={{ fontWeight:700, marginRight:8 }}>{["A","B","C","D"][oi]}.</span>{opt}
                  </button>
                ))}
              </div>
            ))}
            <div style={{ background:"#fff", borderRadius:18, padding:20, marginBottom:20, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:12 }}>Answered: <strong>{totalAnswered}/{totalQ}</strong> {totalAnswered < totalQ && `(${totalQ-totalAnswered} remaining)`}</p>
              {totalAnswered < totalQ && <p style={{ color:"#F59E0B", fontSize:13, fontWeight:600, marginBottom:12 }}>⚠️ Answer all questions before submitting!</p>}
              <button className="btn-primary" disabled={totalAnswered < totalQ} onClick={handleTestSubmit} style={{ width:"100%", background: totalAnswered>=totalQ?`linear-gradient(135deg,#1a1a2e,${subj.color})`:"#e2e8f0", color: totalAnswered>=totalQ?"#fff":"#94a3b8", border:"none", borderRadius:50, padding:"16px", fontSize:16, fontWeight:700, cursor: totalAnswered>=totalQ?"pointer":"not-allowed" }}>
                🎯 Submit Test
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── TEST RESULT ──
    if (topicStep === "test" && testSubmitted) {
      const topicResult = progress[selectedSubject]?.[selectedTopic];
      const score = topicResult?.score || 0;
      const passed = score >= 70;
      const subj_topics = CURRICULUM[selectedSubject].topics;
      const topicIdx = subj_topics.findIndex(t => t.id === selectedTopic);
      const nextTopic = topicIdx < subj_topics.length-1 ? subj_topics[topicIdx+1] : null;
      const correct = Math.round(score * topic.test.length / 100);
      return (
        <div style={{ minHeight:"100vh", background:"#F0F4FF", fontFamily:"'DM Sans', sans-serif" }}>
          <FontLoader/>
          {passed && showConfetti && <Confetti/>}
          <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>
            {/* Score card */}
            <div className="fade-in" style={{ background: passed?"linear-gradient(135deg,#059669,#10B981)":"linear-gradient(135deg,#DC2626,#EF4444)", borderRadius:24, padding:"32px 24px", textAlign:"center", color:"#fff", marginBottom:20, boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="star-burst" style={{ fontSize:64, marginBottom:8 }}>{passed?"🏆":"📚"}</div>
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:800, marginBottom:4 }}>{passed?"Test Passed!":"Not Yet — Keep Going!"}</h2>
              <div style={{ fontSize:56, fontWeight:800, marginBottom:4 }}>{score}%</div>
              <p style={{ color:"rgba(255,255,255,0.85)", fontSize:14 }}>{correct}/{topic.test.length} correct • Pass mark: 70%</p>
              {passed && <p style={{ marginTop:8, fontSize:13, color:"rgba(255,255,255,0.8)" }}>🔓 Next topic unlocked!</p>}
            </div>

            {/* Review answers */}
            <div style={{ background:"#fff", borderRadius:18, padding:20, marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, marginBottom:14, fontSize:16 }}>📋 Answer Review</h3>
              {topic.test.map((q, qi) => {
                const selected = testAnswers[qi];
                const isCorrect = selected === q.answer;
                return (
                  <div key={qi} style={{ padding:"12px", marginBottom:10, borderRadius:12, background:isCorrect?"#D1FAE5":"#FEE2E2", borderLeft:`4px solid ${isCorrect?"#059669":"#EF4444"}` }}>
                    <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                      <span style={{ color:isCorrect?"#059669":"#EF4444", flexShrink:0 }}>{isCorrect?"✅":"❌"}</span>
                      <p style={{ fontSize:13, color:"#374151", fontWeight:500, lineHeight:1.4 }}>{q.q}</p>
                    </div>
                    {!isCorrect && <p style={{ fontSize:12, color:"#059669", fontWeight:600, paddingLeft:20 }}>Correct: {["A","B","C","D"][q.answer]}. {q.options[q.answer]}</p>}
                  </div>
                );
              })}
            </div>

            {!passed && (
              <div style={{ background:"#FFFBEB", borderRadius:16, padding:16, marginBottom:16, border:"2px solid #FCD34D" }}>
                <p style={{ fontWeight:700, color:"#92400E", marginBottom:8 }}>💡 Recommended Actions</p>
                <p style={{ fontSize:14, color:"#78350F", lineHeight:1.6 }}>Review the Learn section again, focusing on the questions you got wrong. Watch the YouTube video for additional explanations, then retake the test.</p>
              </div>
            )}

            <div style={{ display:"grid", gap:12 }}>
              {!passed && (
                <>
                  <button className="btn-primary" onClick={() => setTopicStep("learn")} style={{ background:`linear-gradient(135deg,${subj.color},${subj.color}bb)`, color:"#fff", border:"none", borderRadius:50, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <Icon.Book/> Review Material
                  </button>
                  <button className="btn-primary" onClick={() => { setTestAnswers({}); setTestSubmitted(false); }} style={{ background:"linear-gradient(135deg,#1a1a2e,#374151)", color:"#fff", border:"none", borderRadius:50, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <Icon.Retry/> Retake Test
                  </button>
                </>
              )}
              {passed && nextTopic && (
                <button className="btn-primary" onClick={() => {
                  setSelectedTopic(nextTopic.id);
                  setTopicStep("learn");
                  setPracticeAnswers({});
                  setTestAnswers({});
                  setShowFeedback({});
                  setTestSubmitted(false);
                }} style={{ background:"linear-gradient(135deg,#059669,#10B981)", color:"#fff", border:"none", borderRadius:50, padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  🚀 Next Topic: {nextTopic.title} →
                </button>
              )}
              <button onClick={handleBack} style={{ background:"#fff", color:"#374151", border:"2px solid #e2e8f0", borderRadius:50, padding:"14px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
                ← Back to {subj.name}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}

// Main App wrapper with authentication and routing
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </Router>
  );
}

// App component that uses authentication
function AppWithAuth() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} 
      />
    </Routes>
  );
}
