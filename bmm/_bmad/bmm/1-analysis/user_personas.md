# User Personas - Investment Advisor

## Persona 1: John - The Diligent Saver

**Demographics:**
- Age: 35
- Income: $120,000/year
- Occupation: Software Engineer
- Location: San Francisco, CA

**Background:**
- Married with 1 child
- Have $250,000 in savings across multiple accounts
- Started investing 5 years ago
- Self-directed investor (uses Vanguard, E*TRADE)

**Goals:**
- Build $100,000 emergency fund
- Save for down payment on second home ($150,000)
- Retire by age 55 (20 years)
- Minimize tax liability

**Pain Points:**
- Savings scattered across accounts - hard to track
- Unsure if current allocation matches risk tolerance
- Manually calculates taxes on investments (time-consuming)
- Worried about portfolio drift over time
- Wants personalized recommendations but doesn't trust generic advice

**How They Use Investment Advisor:**
1. Uploads all savings & portfolio data via CSV
2. Runs tax optimization report (saves ~$2,000/year)
3. Reviews rebalancing recommendations quarterly
4. Tracks progress toward 3 major goals
5. Checks dashboard every 2 weeks

**Success Metrics:**
- "Saved 20 hours/year on manual tracking"
- "Identified $15,000 in tax savings"
- "Feels confident about portfolio allocation"

---

## Persona 2: Jane - The Goal-Oriented Planner

**Demographics:**
- Age: 28
- Income: $95,000/year
- Occupation: Marketing Manager
- Location: Austin, TX

**Background:**
- Single, no kids
- Recent graduate (3 years ago)
- $45,000 in savings
- Novice investor (just started last year)

**Goals:**
- Down payment on first home ($80,000 in 3 years)
- Emergency fund (6 months living expenses)
- Build wealth for long-term security
- Understand personal finance better

**Pain Points:**
- Overwhelmed by investment options
- Doesn't know if she's on track for home purchase
- Concerned about making wrong decisions
- Wants simple, actionable guidance
- Limited time to research investments

**How They Use Investment Advisor:**
1. Creates goal: "Home Down Payment - $80K in 3 years"
2. Sees required monthly savings ($2,222)
3. Checks if current contributions are on track
4. Reviews recommended portfolio allocation
5. Gets alerts when savings rate falls behind

**Success Metrics:**
- "Know exactly what I need to save monthly"
- "Made confident investment decisions"
- "On track to reach my home purchase goal"

---

## Persona 3: Michael - The Risk-Averse Conservative

**Demographics:**
- Age: 58
- Income: $140,000/year
- Occupation: Senior Manager
- Location: Boston, MA

**Background:**
- Married with 2 adult children
- $600,000 in retirement accounts
- Approaching retirement (7 years)
- Burned by 2008 financial crisis

**Goals:**
- Preserve capital near retirement
- Generate steady income
- Pass wealth to children
- Minimize portfolio risk

**Pain Points:**
- Portfolio still has too much risk exposure
- Worried about market downturns before retirement
- Wants to move to safer assets gradually
- Concerned about inflation eroding savings

**How They Use Investment Advisor:**
1. Sets risk tolerance to "Conservative"
2. Reviews portfolio risk assessment (sees high volatility)
3. Gets recommendations to shift to bonds/stable funds
4. Tracks rebalancing suggestions
5. Models different retirement scenarios

**Success Metrics:**
- "Portfolio now matches my risk tolerance"
- "Sleep better knowing I'm more conservative"
- "Understand my exposure to market risk"

---

## Persona 4: Alex - The Busy Professional

**Demographics:**
- Age: 45
- Income: $180,000/year
- Occupation: Consultant
- Location: Chicago, IL

**Background:**
- Divorced, 1 teenage child
- $320,000 in investments
- Very busy (travel 50% of time)
- Wants passive management

**Goals:**
- Automatic portfolio rebalancing
- Tax-efficient investing
- Minimize time spent on finances
- Grow wealth without active trading

**Pain Points:**
- No time to manage investments
- Worried portfolio is out of balance
- Wants tax harvesting but can't track it manually
- Needs set-and-forget solution

**How They Use Investment Advisor:**
1. Uploads portfolio once
2. Sets up quarterly rebalancing automation
3. Receives monthly tax alerts
4. Reviews annual summary (5 minutes)
5. Lets system handle recommendations

**Success Metrics:**
- "Saved 10+ hours per year on portfolio management"
- "Portfolio stays balanced automatically"
- "Received $8,000 in tax optimization alerts"

---

## Persona 5: Sarah - The Goal Stacker

**Demographics:**
- Age: 32
- Income: $110,000/year
- Occupation: Doctor (Resident)
- Location: New York, NY

**Background:**
- Recently finished medical residency
- Starting attending position (higher income)
- $80,000 in student loans
- Just started saving aggressively

**Goals:**
- Pay off student loans in 5 years
- Build emergency fund
- Buy house in 4 years
- Save for retirement

**Pain Points:**
- Multiple conflicting goals
- Unsure how to prioritize
- Not sure if her aggressive savings plan is realistic
- Wants to know which goals are achievable

**How They Use Investment Advisor:**
1. Creates 4 goals (loans, emergency, house, retirement)
2. Sets priorities (loans high, retirement medium)
3. Sees recommended monthly savings per goal
4. Gets alert: "Cannot achieve all goals with current savings"
5. Adjusts goal dates based on recommendations

**Success Metrics:**
- "Know which goals are realistic"
- "Have clear action plan for all goals"
- "Adjusted timeline based on financial reality"

---

## User Persona Usage in Sprint 1

These personas inform:
- **Feature Priority:** John's tax optimization needs → Story 1.4 is HIGH priority
- **UI/UX Design:** Jane is novice → Simple, guided workflows
- **API Design:** Alex wants automation → Rebalancing endpoint needed
- **Testing Scenarios:** Use persona data for test cases
- **Documentation:** Write guides for different user types

---

## Persona-to-Story Mapping

| Persona | Story 1.1 | Story 1.2 | Story 1.4 | Story 1.6 | Story 1.10 |
|---------|-----------|-----------|-----------|-----------|-----------|
| John    | ✅ Heavy | ✅ Heavy | ✅✅ CRITICAL | ✅ | ✅ |
| Jane    | ✅ | ✅ Medium | ✗ | ✅✅ CRITICAL | ✅ |
| Michael | ✅ Medium | ✅ Heavy | ✅ | ✅ Heavy | ✅ |
| Alex    | ✗ | ✅ Medium | ✅ Medium | ✗ | ✅ |
| Sarah   | ✅ Heavy | ✅ Light | ✗ | ✅✅ CRITICAL | ✅ |

**Legend:**
- ✅✅ = Critical feature for this persona
- ✅ = Important feature
- ✅ Light = Nice to have
- ✗ = Not relevant

---

*Created: 2026-05-08*  
*For: Investment Advisor MVP - Sprint 1*
