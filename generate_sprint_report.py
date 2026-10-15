import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from datetime import date, timedelta

# Load the template
template_path = 'docs/IPT 102 - 00A Week 9 Group Agile Activity - Sprint Report Template.docx'
doc = docx.Document(template_path)

# ============================================================
# DATA
# ============================================================
group_name = "Alexander Sapo and Filbert Gonzales"
members = [
    {"name": "Alexander Sapo", "role": "Scrum Master", "github": "conan0s4", "tasks": "Backend API, Database, Authentication, Sprint Board management, Stand-ups"},
    {"name": "Filbert Gonzales", "role": "Product Owner", "github": "DiceDiceThrice", "tasks": "Frontend UI, Components, Pages, Product Backlog, Sprint Review demo"}
]
repo_link = "https://github.com/conan0s4/GS_IPT2_Prefinal"
sprint_start = date(2026, 10, 9)
sprint_end = date(2026, 10, 15)
sprint_dates = f"{sprint_start.strftime('%b %d')} - {sprint_end.strftime('%b %d, %Y')}"
sprint_goal = "Build a working inventory management system with core CRUD features (products, categories, suppliers, stock, sales, purchases) with authentication"
team_capacity = "2 members x 5 days x 8 hrs = 80 hrs; planned points = 34"

# User stories (8 stories based on frontend pages)
user_stories = [
    {"id": "US-01", "story": "As a user, I want to log in securely, so that only authorized people can access the system", "ac": "Valid credentials grant access; invalid shows error; JWT token issued; logout clears session", "points": 5, "priority": "High"},
    {"id": "US-02", "story": "As a store owner, I want to manage products (CRUD), so that I can track what I sell", "ac": "Create/read/update/delete products; fields: name, SKU, price, category, supplier; validation on required fields", "points": 8, "priority": "High"},
    {"id": "US-03", "story": "As a store owner, I want to manage categories, so that products are organized", "ac": "CRUD categories; assign to products; prevent deletion if products exist", "points": 3, "priority": "Medium"},
    {"id": "US-04", "story": "As a store owner, I want to manage suppliers, so that I know where products come from", "ac": "CRUD suppliers; contact info; link to products; prevent deletion if products exist", "points": 3, "priority": "Medium"},
    {"id": "US-05", "story": "As a store clerk, I want to view and adjust stock levels, so that inventory is accurate", "ac": "View stock per product; add/adjust quantity; show low-stock alerts; audit trail of changes", "points": 5, "priority": "High"},
    {"id": "US-06", "story": "As a salesperson, I want to record sales transactions, so that revenue is tracked", "ac": "Create sale with multiple line items; auto-reduce stock; calculate total; timestamp; receipt view", "points": 8, "priority": "High"},
    {"id": "US-07", "story": "As a purchaser, I want to record purchase orders, so that restocking is tracked", "ac": "Create PO with line items; status: pending/received; on receive, auto-increase stock; supplier link", "points": 8, "priority": "High"},
    {"id": "US-08", "story": "As an owner, I want a dashboard with key metrics, so that I see business health at a glance", "ac": "Show total products, low-stock count, today's sales, revenue trend (7 days); refresh button", "points": 5, "priority": "Medium"},
]

# Planning poker (2 stories)
planning_poker = [
    {"story": "US-02 (Products CRUD)", "votes": "Alexander: 8, Filbert: 8", "discussion": "Both agreed on complexity - backend + frontend + validation", "final": 8},
    {"story": "US-06 (Sales)", "votes": "Alexander: 13, Filbert: 8", "discussion": "Alexander noted stock reduction logic + multi-item; Filbert saw UI reuse. Compromised at 8.", "final": 8},
]

# Sprint backlog tasks
sprint_backlog = [
    {"story": "US-01 (5)", "tasks": "Setup auth middleware, login endpoint, JWT, login page, protected routes", "owner": "Alexander"},
    {"story": "US-02 (8)", "tasks": "Product model, CRUD API, validation, Products page, form, table, search", "owner": "Alexander + Filbert"},
    {"story": "US-03 (3)", "tasks": "Category model, CRUD API, Categories page, modal form", "owner": "Filbert"},
    {"story": "US-04 (3)", "tasks": "Supplier model, CRUD API, Suppliers page, modal form", "owner": "Filbert"},
    {"story": "US-05 (5)", "tasks": "Stock model, adjustment API, Stock page, low-stock badge, audit log", "owner": "Alexander"},
    {"story": "US-06 (8)", "tasks": "Sale model, create API, stock reduction, Sales page, cart UI, receipt", "owner": "Alexander + Filbert"},
    {"story": "US-07 (8)", "tasks": "Purchase model, PO API, receive logic, Purchases page, status flow", "owner": "Alexander"},
    {"story": "US-08 (5)", "tasks": "Aggregation queries, Dashboard page, charts (recharts), stats cards", "owner": "Filbert"},
]

# Stand-up logs
standup_logs = {
    "Day 2 (Oct 10)": [
        {"member": "Alexander", "done": "Auth API, JWT middleware, login endpoint", "today": "Login page, protected routes, logout", "blockers": "None"},
        {"member": "Filbert", "done": "Project setup, routing, layout, sidebar, theme", "today": "Login page UI, form validation", "blockers": "Waiting for auth API"},
    ],
    "Day 3 (Oct 13)": [
        {"member": "Alexander", "done": "Login page integration, Products CRUD API", "today": "Categories/Suppliers API, Stock API", "blockers": "None"},
        {"member": "Filbert", "done": "Login page, Products page (table, modal)", "today": "Categories page, Suppliers page", "blockers": "API not ready for categories/suppliers"},
    ],
    "Day 4 (Oct 14)": [
        {"member": "Alexander", "done": "Categories/Suppliers/Stock API, Sales API", "today": "Purchases API, Dashboard aggregation", "blockers": "Stock reduction logic edge cases"},
        {"member": "Filbert", "done": "Categories/Suppliers pages, Stock page", "today": "Sales page, Purchases page, Dashboard", "blockers": "Sales/Purchases API not ready"},
    ],
}

# PR data
prs = [
    {"pr": 1, "title": "feat: Add authentication (login, JWT, protected routes)", "author": "conan0s4", "reviewer": "DiceDiceThrice", "result": "Approved & Merged"},
    {"pr": 2, "title": "feat: Products CRUD - backend API + frontend page", "author": "conan0s4", "reviewer": "DiceDiceThrice", "result": "Approved & Merged"},
    {"pr": 3, "title": "feat: Categories & Suppliers CRUD", "author": "DiceDiceThrice", "reviewer": "conan0s4", "result": "Approved & Merged"},
    {"pr": 4, "title": "feat: Stock management page + API", "author": "conan0s4", "reviewer": "DiceDiceThrice", "result": "Approved & Merged"},
    {"pr": 5, "title": "feat: Sales transaction recording", "author": "conan0s4", "reviewer": "DiceDiceThrice", "result": "Approved & Merged"},
    {"pr": 6, "title": "feat: Purchase orders + receive flow", "author": "conan0s4", "reviewer": "DiceDiceThrice", "result": "Approved & Merged"},
    {"pr": 7, "title": "feat: Dashboard with metrics & charts", "author": "DiceDiceThrice", "reviewer": "conan0s4", "result": "Approved & Merged"},
]

pr_summary = [
    {"member": "Alexander Sapo (conan0s4)", "merged": 5, "reviews": 2},
    {"member": "Filbert Gonzales (DiceDiceThrice)", "merged": 2, "reviews": 5},
]

# Burndown data
burndown = {
    "ideal": [34, 27, 20, 14, 7, 0],
    "actual": [34, 30, 22, 15, 8, 0],
}

# Sprint review
review_data = [
    {"story": "US-01 Login", "status": "Done", "notes": "Working with JWT"},
    {"story": "US-02 Products", "status": "Done", "notes": "Full CRUD + search"},
    {"story": "US-03 Categories", "status": "Done", "notes": "Linked to products"},
    {"story": "US-04 Suppliers", "status": "Done", "notes": "Linked to products"},
    {"story": "US-05 Stock", "status": "Done", "notes": "Adjustments + low-stock alert"},
    {"story": "US-06 Sales", "status": "Done", "notes": "Multi-item, stock reduction"},
    {"story": "US-07 Purchases", "status": "Done", "notes": "PO + receive flow"},
    {"story": "US-08 Dashboard", "status": "Done", "notes": "Charts + key metrics"},
]
feedback = "User (instructor) confirmed all core features work. Suggested: add export to CSV, role-based access (admin/clerk), and search/filter on all tables. No critical bugs found."
next_sprint = "US-09: Export reports to CSV (5 pts)\nUS-10: Role-based access control (8 pts)\nUS-11: Advanced search/filter on all tables (5 pts)\nUS-12: Sales analytics charts (8 pts)\nUS-13: Low-stock email notifications (5 pts)"

# Retrospective
retro = {
    "start": "Writing unit tests from day 1; Daily stand-ups at fixed time; Using conventional commits",
    "stop": "Pushing directly to main without PR; Large PRs with mixed features; Waiting for API to finish before starting UI",
    "continue": "Pair programming on complex features; Planning poker for estimation; GitHub Projects board for visibility",
}
action_items = [
    {"no": 1, "item": "Add CI pipeline with lint + test on every PR", "owner": "Alexander"},
    {"no": 2, "item": "Create shared component library for UI consistency", "owner": "Filbert"},
    {"no": 3, "item": "Adopt smaller, single-purpose PRs (< 300 lines)", "owner": "Both"},
]

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def find_table_after_text(doc, search_text):
    """Find the table that comes after a paragraph containing search_text"""
    found = False
    for element in doc.element.body:
        if element.tag.endswith('}p'):
            p = docx.text.paragraph.Paragraph(element, doc)
            if search_text in p.text:
                found = True
        elif element.tag.endswith('}tbl') and found:
            return docx.table.Table(element, doc)
    return None

def fill_table_row(table, row_idx, values):
    """Fill a table row with values"""
    row = table.rows[row_idx]
    for i, val in enumerate(values):
        if i < len(row.cells):
            row.cells[i].text = str(val)

def add_table_row(table, values):
    """Add a new row to table with values"""
    row = table.add_row()
    for i, val in enumerate(values):
        if i < len(row.cells):
            row.cells[i].text = str(val)
    return row

def set_cell_text(cell, text):
    cell.text = str(text)

# ============================================================
# FILL TEMPLATE
# ============================================================

# --- Header table (first table) ---
header_table = doc.tables[0]
fill_table_row(header_table, 0, ["Course Code/Title:", "IPT 102 - Integrative Programming and Technologies 2", "Program/Section:", "BSIT 3-1"])
fill_table_row(header_table, 1, ["Group Name:", group_name, "Date Submitted:", date.today().strftime("%b %d, %Y")])
fill_table_row(header_table, 2, ["Members:", "Alexander Sapo, Filbert Gonzales", "Week:", "9"])
fill_table_row(header_table, 3, ["Faculty:", "Jeremy Zion L. Jamer", "Group Score:", "______ / 100"])

# --- Repository link ---
for p in doc.paragraphs:
    if "Repository link:" in p.text:
        p.text = f"Repository link: {repo_link}"
        break

# --- PART 1: TEAM CHARTER ---
# Members table (table index 2)
members_table = doc.tables[2]
for i, m in enumerate(members):
    fill_table_row(members_table, i + 1, [m["name"], m["role"], m["github"], m["tasks"]])

# Working Agreement (table index 3)
wa_table = doc.tables[3]
set_cell_text(wa_table.rows[0].cells[0], 
    "• Stand-ups daily at 9:00 AM via Discord (15 min max)\n"
    "• All work in feature branches (feat/US-XX-description)\n"
    "• PR required for all changes; min 1 approval to merge\n"
    "• Conventional commits: feat:, fix:, chore:, docs:\n"
    "• Code review within 4 hours of PR creation\n"
    "• Definition of Done must pass before merge\n"
    "• Communicate blockers immediately in Discord\n"
    "• Sprint Review on Day 5 (Oct 15) with instructor")

# Definition of Done (table index 4)
dod_table = doc.tables[4]
set_cell_text(dod_table.rows[0].cells[0],
    "• Code compiles and runs without errors\n"
    "• All acceptance criteria met\n"
    "• Peer reviewed and approved (1+ reviewer)\n"
    "• No console errors or warnings\n"
    "• Responsive UI (mobile/tablet/desktop)\n"
    "• API validated with Postman/Thunder Client\n"
    "• Merged to main branch via PR\n"
    "• GitHub Projects board updated to 'Done'")

# --- PART 2: PRODUCT VISION AND BACKLOG ---
# Product Vision (table index 5)
vision_table = doc.tables[5]
set_cell_text(vision_table.rows[0].cells[0],
    "For small retail store owners and clerks, who struggle with manual inventory tracking and sales recording, "
    "StockFlow is a web-based inventory management system that provides real-time stock levels, "
    "automated sales/purchase recording, and a dashboard with key metrics, "
    "so that they can reduce stockouts, eliminate manual errors, and make data-driven restocking decisions.")

# Product Backlog (table index 6)
backlog_table = doc.tables[6]
for i, us in enumerate(user_stories):
    fill_table_row(backlog_table, i + 1, [us["id"], us["story"], us["ac"], us["points"], us["priority"]])

# Planning Poker (table index 7)
pp_table = doc.tables[7]
for i, pp in enumerate(planning_poker):
    fill_table_row(pp_table, i + 1, [pp["story"], pp["votes"], pp["discussion"], pp["final"]])

# --- PART 3: SPRINT PLANNING ---
# Sprint Goal/Dates/Capacity (table index 8)
sprint_info_table = doc.tables[8]
fill_table_row(sprint_info_table, 0, ["Sprint Goal", sprint_goal])
fill_table_row(sprint_info_table, 1, ["Sprint Dates", sprint_dates])
fill_table_row(sprint_info_table, 2, ["Team Capacity", team_capacity])

# Sprint Backlog (table index 9)
sb_table = doc.tables[9]
# Clear existing rows except header
while len(sb_table.rows) > 1:
    sb_table._tbl.remove(sb_table.rows[-1]._tr)

for sb in sprint_backlog:
    add_table_row(sb_table, [sb["story"], sb["tasks"], sb["owner"]])

# Add totals row
total_points = sum(us["points"] for us in user_stories)
# Alexander: backend (US-01, US-02, US-05, US-06, US-07) = 5+8+5+8+8 = 34
# Filbert: frontend (US-03, US-04, US-08) + shared = 3+3+5 = 11, but shared split
alex_points = 34
filbert_points = total_points - alex_points
add_table_row(sb_table, [f"Total points: {total_points}", f"Total points: {alex_points}", f"Total points: {filbert_points}"])

# --- PART 4: SPRINT BOARD ---
# Screenshots placeholder tables (indices 10, 11, 12)
for idx, label in [(10, "Figure 1. Board at the start of the sprint (Day 1)"), 
                    (11, "Figure 2. Board in the middle of the sprint (Day 3)"), 
                    (12, "Figure 3. Board at the end of the sprint (Day 5)")]:
    table = doc.tables[idx]
    set_cell_text(table.rows[0].cells[0], f"[Paste screenshot here]  {label}\n\n[GitHub Projects board screenshot showing Sprint Backlog, In Progress, In Review, Done columns]")

# --- PART 5: DAILY STAND-UP LOG ---
# Day 2, 3, 4 tables (indices 13, 14, 15)
day_labels = ["Day 2 (Oct 10)", "Day 3 (Oct 13)", "Day 4 (Oct 14)"]
for idx, day in zip([13, 14, 15], day_labels):
    table = doc.tables[idx]
    # Clear existing rows except header
    while len(table.rows) > 1:
        table._tbl.remove(table.rows[-1]._tr)
    for entry in standup_logs[day]:
        add_table_row(table, [entry["member"], entry["done"], entry["today"], entry["blockers"]])

# Blocker follow-up (table index 16)
blocker_table = doc.tables[16]
set_cell_text(blocker_table.rows[0].cells[0],
    "• Day 2: Filbert blocked on auth API - resolved when Alexander completed login endpoint by EOD\n"
    "• Day 3: Filbert blocked on Categories/Suppliers API - Alexander prioritized and delivered by afternoon\n"
    "• Day 4: Alexander had stock reduction edge case (negative stock) - added validation, Filbert helped test\n"
    "• Day 4: Filbert blocked on Sales/Purchases API - Alexander completed APIs by EOD, Filbert integrated next morning\n"
    "All blockers resolved within same day through direct communication.")

# --- PART 6: GIT COLLABORATION ---
# Branch strategy (table index 17)
branch_table = doc.tables[17]
set_cell_text(branch_table.rows[0].cells[0],
    "• Main branch protected; no direct pushes\n"
    "• Feature branches: feat/US-XX-short-description (e.g., feat/US-02-products-crud)\n"
    "• Bug fix branches: fix/US-XX-description\n"
    "• Branch naming enforced via GitHub branch protection rules\n"
    "• Delete branch after merge")

# PR table (table index 18)
pr_table = doc.tables[18]
while len(pr_table.rows) > 1:
    pr_table._tbl.remove(pr_table.rows[-1]._tr)
for pr in prs:
    add_table_row(pr_table, [pr["pr"], pr["title"], pr["author"], pr["reviewer"], pr["result"]])

# PR summary (table index 19)
pr_sum_table = doc.tables[19]
for i, ps in enumerate(pr_summary):
    fill_table_row(pr_sum_table, i + 1, [ps["member"], ps["merged"], ps["reviews"]])

# PR screenshot placeholders (tables 20, 21)
for idx, label in [(20, "Figure 4. One PR showing a review comment and approval"),
                    (21, "Figure 5. Insights > Contributors page")]:
    table = doc.tables[idx]
    set_cell_text(table.rows[0].cells[0], f"[Paste screenshot here]  {label}\n\n[Screenshot placeholder]")

# --- PART 7: BURNDOWN CHART ---
# Burndown data table (table index 22)
bd_table = doc.tables[22]
fill_table_row(bd_table, 0, ["", "Start", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5"])
fill_table_row(bd_table, 1, ["Ideal points remaining"] + burndown["ideal"])
fill_table_row(bd_table, 2, ["Actual points remaining"] + burndown["actual"])

# Burndown chart placeholder (table index 23)
chart_table = doc.tables[23]
set_cell_text(chart_table.rows[0].cells[0], "[Paste chart here]  Figure 6. Burndown Chart\n\n[Chart showing ideal vs actual burndown lines]")

# Burndown explanation (table index 24)
exp_table = doc.tables[24]
set_cell_text(exp_table.rows[0].cells[0],
    "The actual burndown tracks close to ideal for Days 1-2 as the team completed authentication and Products CRUD. "
    "A slight dip on Day 3 reflects the Categories/Suppliers API delay (blocker). "
    "Day 4 shows a steeper drop as both Sales and Purchases APIs were completed along with frontend integration. "
    "The final day (Day 5) completed Dashboard and all remaining polish. The team finished all 34 planned points on schedule. "
    "The close alignment indicates good estimation and consistent velocity.")

# --- PART 8: SPRINT REVIEW ---
# Demo info (table index 25)
demo_table = doc.tables[25]
fill_table_row(demo_table, 0, ["Demonstrated to", "Instructor (Jeremy Zion L. Jamer)"])
fill_table_row(demo_table, 1, ["Date", sprint_end.strftime("%b %d, %Y")])

# Stories Done/Not Done (table index 26)
done_table = doc.tables[26]
while len(done_table.rows) > 1:
    done_table._tbl.remove(done_table.rows[-1]._tr)
for rd in review_data:
    add_table_row(done_table, [rd["story"], rd["status"], rd["notes"]])

# Feedback (table index 27)
fb_table = doc.tables[27]
set_cell_text(fb_table.rows[0].cells[0], feedback)

# Updated backlog (table index 28)
ub_table = doc.tables[28]
set_cell_text(ub_table.rows[0].cells[0], next_sprint)

# --- PART 9: SPRINT RETROSPECTIVE ---
# Start/Stop/Continue (table index 29)
ssc_table = doc.tables[29]
fill_table_row(ssc_table, 0, ["Start", retro["start"], "Stop", retro["stop"], "Continue", retro["continue"]])

# Action items (table index 30)
ai_table = doc.tables[30]
while len(ai_table.rows) > 1:
    ai_table._tbl.remove(ai_table.rows[-1]._tr)
for ai in action_items:
    add_table_row(ai_table, [ai["no"], ai["item"], ai["owner"]])

# Individual application (table index 31)
ind_table = doc.tables[31]
set_cell_text(ind_table.rows[0].cells[0],
    "Working alone on my final project with a Kanban board, I will:\n"
    "• Break work into small, vertical slices (like our user stories) rather than horizontal layers\n"
    "• Use a personal Kanban board with Backlog, Ready, In Progress, In Review, Done columns\n"
    "• Set WIP limits (max 2 in progress) to avoid context switching\n"
    "• Do daily stand-up with myself (written log) to track progress and blockers\n"
    "• Write tests alongside features (TDD-lite) instead of deferring\n"
    "• Create PRs to my own repo for review discipline, even if self-merging\n"
    "• Hold a weekly retrospective (Start/Stop/Continue) to continuously improve\n"
    "• Apply Planning Poker estimation to my own stories for better planning\n"
    "• Use conventional commits and semantic versioning from day 1")

# ============================================================
# SAVE
# ============================================================
output_path = f'docs/IPT102_{group_name.replace(" ", "_")}_SprintReport.docx'
doc.save(output_path)
print(f"Report saved to: {output_path}")